import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { GenerateBracketDto, SeedingMethod } from './dto/generate-bracket.dto.js';
import { SubmitMatchupResultDto } from './dto/submit-result.dto.js';

interface SeedParticipant {
  name: string;
  tag: string;
  trophies: number;
}

@Injectable()
export class CompetitionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Deterministic Fisher-Yates shuffle
   */
  private shuffle<T>(array: T[], seed: string): T[] {
    const arr = [...array];
    let s = 0;
    for (let i = 0; i < seed.length; i++) {
      s = (s * 31 + seed.charCodeAt(i)) % 1000000;
    }
    const pseudoRandom = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };

    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(pseudoRandom() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /**
   * Generates or regenerates bracket tree for a tournament (supports 8 or 16 participants).
   */
  async generateBracket(tournamentId: string, dto: GenerateBracketDto = {}) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        registrations: {
          where: { status: 'CONFIRMED', deleted_at: null },
          include: {
            competitor: true,
            game_profile: true,
          },
        },
      },
    });

    if (!tournament) {
      throw new NotFoundException('Torneo no encontrado.');
    }

    const bracketSize = tournament.max_slots >= 16 ? 16 : 8;

    // Prepare participants list
    let participants: SeedParticipant[] = tournament.registrations.map((r) => ({
      name: `${r.competitor.first_name} ${r.competitor.last_name}`,
      tag: r.game_profile.player_tag,
      trophies: r.game_profile.trophies,
    }));

    // Seed master list
    const demoNames = [
      { name: 'Mateo Quispe', tag: '#8YRP92VJ', trophies: 7420 },
      { name: 'Gabriel Torres', tag: '#2PP009Y9', trophies: 7134 },
      { name: 'Rodrigo Flores', tag: '#9QJ882LC', trophies: 6980 },
      { name: 'Alvaro Vega', tag: '#PPR0UL0U', trophies: 6850 },
      { name: 'Sebastian Cruz', tag: '#2LC990PR', trophies: 6710 },
      { name: 'Nicolas Reyes', tag: '#8JQC22YU', trophies: 6640 },
      { name: 'Diego Ramos', tag: '#00YPP289', trophies: 6520 },
      { name: 'Franco Diaz', tag: '#LC2299QU', trophies: 6490 },
      { name: 'Valeria Gomez', tag: '#99YPP002', trophies: 6420 },
      { name: 'Lucas Medina', tag: '#88QJLC22', trophies: 6380 },
      { name: 'Camila Silva', tag: '#22PR0UL0', trophies: 6310 },
      { name: 'Joaquin Castro', tag: '#00LC99PR', trophies: 6250 },
      { name: 'Renzo Paredes', tag: '#88JQC22Y', trophies: 6190 },
      { name: 'Sofia Benitez', tag: '#PP28900Y', trophies: 6120 },
      { name: 'Manuel Herrera', tag: '#QQ2299LC', trophies: 6050 },
      { name: 'Adriana Ortiz', tag: '#8YRP9200', trophies: 6010 },
    ];

    for (const d of demoNames) {
      if (participants.length < bracketSize && !participants.some((p) => p.tag === d.tag)) {
        participants.push(d);
      }
    }

    const seed = `seed_${Date.now()}`;

    if (dto.seeding_method === SeedingMethod.BY_TROPHIES) {
      participants.sort((a, b) => b.trophies - a.trophies);
    } else {
      participants = this.shuffle(participants, seed);
    }

    // Delete existing competition if regenerating
    const existingComp = await this.prisma.competition.findUnique({
      where: { tournament_id: tournamentId },
    });

    if (existingComp) {
      await this.prisma.competition.delete({ where: { id: existingComp.id } });
    }

    // Create Competition, Rounds, and Matchups in Transaction
    return this.prisma.$transaction(async (tx) => {
      const competition = await tx.competition.create({
        data: {
          tournament_id: tournamentId,
          status: 'BRACKET_PUBLISHED',
          bracket_size: bracketSize,
          generation_seed: seed,
        },
      });

      if (bracketSize === 16) {
        // --- 16 PLAYERS: 4 ROUNDS (Octavos, Cuartos, Semis, Final) ---
        // Round 4: Gran Final
        const rFinal = await tx.round.create({
          data: { competition_id: competition.id, round_number: 4, name: 'Gran Final' },
        });
        const mFinal = await tx.matchup.create({
          data: { round_id: rFinal.id, position: 1, status: 'PENDING', score_a: 0, score_b: 0 },
        });

        // Round 3: Semifinales (2 matchups)
        const rSemi = await tx.round.create({
          data: { competition_id: competition.id, round_number: 3, name: 'Semifinales' },
        });
        const mSemi1 = await tx.matchup.create({
          data: { round_id: rSemi.id, position: 1, next_matchup_id: mFinal.id, status: 'PENDING', score_a: 0, score_b: 0 },
        });
        const mSemi2 = await tx.matchup.create({
          data: { round_id: rSemi.id, position: 2, next_matchup_id: mFinal.id, status: 'PENDING', score_a: 0, score_b: 0 },
        });

        // Round 2: Cuartos de Final (4 matchups)
        const rCuartos = await tx.round.create({
          data: { competition_id: competition.id, round_number: 2, name: 'Cuartos de Final' },
        });
        const mCuartos1 = await tx.matchup.create({
          data: { round_id: rCuartos.id, position: 1, next_matchup_id: mSemi1.id, status: 'PENDING', score_a: 0, score_b: 0 },
        });
        const mCuartos2 = await tx.matchup.create({
          data: { round_id: rCuartos.id, position: 2, next_matchup_id: mSemi1.id, status: 'PENDING', score_a: 0, score_b: 0 },
        });
        const mCuartos3 = await tx.matchup.create({
          data: { round_id: rCuartos.id, position: 3, next_matchup_id: mSemi2.id, status: 'PENDING', score_a: 0, score_b: 0 },
        });
        const mCuartos4 = await tx.matchup.create({
          data: { round_id: rCuartos.id, position: 4, next_matchup_id: mSemi2.id, status: 'PENDING', score_a: 0, score_b: 0 },
        });

        // Round 1: Octavos de Final (8 matchups)
        const rOctavos = await tx.round.create({
          data: { competition_id: competition.id, round_number: 1, name: 'Octavos de Final' },
        });

        const octavosNext = [
          mCuartos1.id, mCuartos1.id,
          mCuartos2.id, mCuartos2.id,
          mCuartos3.id, mCuartos3.id,
          mCuartos4.id, mCuartos4.id,
        ];

        for (let i = 0; i < 8; i++) {
          await tx.matchup.create({
            data: {
              round_id: rOctavos.id,
              position: i + 1,
              participant_a_name: participants[i * 2]?.name || 'TBD',
              participant_a_tag: participants[i * 2]?.tag || '#TBD',
              participant_b_name: participants[i * 2 + 1]?.name || 'TBD',
              participant_b_tag: participants[i * 2 + 1]?.tag || '#TBD',
              next_matchup_id: octavosNext[i],
              status: 'READY',
              score_a: 0,
              score_b: 0,
            },
          });
        }
      } else {
        // --- 8 PLAYERS: 3 ROUNDS (Cuartos, Semis, Final) ---
        const rFinal = await tx.round.create({
          data: { competition_id: competition.id, round_number: 3, name: 'Gran Final' },
        });
        const mFinal = await tx.matchup.create({
          data: { round_id: rFinal.id, position: 1, status: 'PENDING', score_a: 0, score_b: 0 },
        });

        const rSemi = await tx.round.create({
          data: { competition_id: competition.id, round_number: 2, name: 'Semifinales' },
        });
        const mSemi1 = await tx.matchup.create({
          data: { round_id: rSemi.id, position: 1, next_matchup_id: mFinal.id, status: 'PENDING', score_a: 0, score_b: 0 },
        });
        const mSemi2 = await tx.matchup.create({
          data: { round_id: rSemi.id, position: 2, next_matchup_id: mFinal.id, status: 'PENDING', score_a: 0, score_b: 0 },
        });

        const rCuartos = await tx.round.create({
          data: { competition_id: competition.id, round_number: 1, name: 'Cuartos de Final' },
        });

        const cuartosNext = [mSemi1.id, mSemi1.id, mSemi2.id, mSemi2.id];

        for (let i = 0; i < 4; i++) {
          await tx.matchup.create({
            data: {
              round_id: rCuartos.id,
              position: i + 1,
              participant_a_name: participants[i * 2]?.name || 'TBD',
              participant_a_tag: participants[i * 2]?.tag || '#TBD',
              participant_b_name: participants[i * 2 + 1]?.name || 'TBD',
              participant_b_tag: participants[i * 2 + 1]?.tag || '#TBD',
              next_matchup_id: cuartosNext[i],
              status: 'READY',
              score_a: 0,
              score_b: 0,
            },
          });
        }
      }

      return {
        message: `Bracket de ${bracketSize} competidores generado exitosamente.`,
        competition_id: competition.id,
        status: competition.status,
        bracket_size: bracketSize,
      };
    });
  }

  /**
   * GET /tournaments/:tournamentId/bracket
   * Returns complete hierarchy of rounds and matchups for the tournament.
   */
  async getBracket(tournamentId: string) {
    let competition = await this.prisma.competition.findUnique({
      where: { tournament_id: tournamentId },
      include: {
        rounds: {
          orderBy: { round_number: 'asc' },
          include: {
            matchups: {
              orderBy: { position: 'asc' },
            },
          },
        },
      },
    });

    // If no competition exists yet, auto-generate initial bracket
    if (!competition) {
      await this.generateBracket(tournamentId);
      competition = await this.prisma.competition.findUnique({
        where: { tournament_id: tournamentId },
        include: {
          rounds: {
            orderBy: { round_number: 'asc' },
            include: {
              matchups: {
                orderBy: { position: 'asc' },
              },
            },
          },
        },
      });
    }

    return competition;
  }

  /**
   * POST /matchups/:matchupId/result
   * Reports official result, advances winner to next matchup and checks for championship.
   */
  async submitMatchupResult(matchupId: string, dto: SubmitMatchupResultDto) {
    const matchup = await this.prisma.matchup.findUnique({
      where: { id: matchupId },
      include: {
        round: {
          include: {
            competition: {
              include: { tournament: true },
            },
          },
        },
      },
    });

    if (!matchup) {
      throw new NotFoundException('Matchup no encontrado.');
    }

    if (matchup.status === 'COMPLETED') {
      throw new BadRequestException('Este enfrentamiento ya fue completado.');
    }

    // Determine winner details
    let winnerName: string;
    let winnerTag: string;

    if (dto.winner_tag === matchup.participant_a_tag) {
      winnerName = matchup.participant_a_name || 'Ganador A';
      winnerTag = matchup.participant_a_tag!;
    } else if (dto.winner_tag === matchup.participant_b_tag) {
      winnerName = matchup.participant_b_name || 'Ganador B';
      winnerTag = matchup.participant_b_tag!;
    } else {
      throw new BadRequestException('El tag del ganador no coincide con ninguno de los dos participantes.');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Update current matchup
      const updatedMatchup = await tx.matchup.update({
        where: { id: matchupId },
        data: {
          score_a: dto.score_a,
          score_b: dto.score_b,
          winner_name: winnerName,
          winner_tag: winnerTag,
          status: dto.is_walkover ? 'WALKOVER' : 'COMPLETED',
        },
      });

      // 2. Advance winner to next round matchup if exists
      if (matchup.next_matchup_id) {
        const nextMatchup = await tx.matchup.findUnique({
          where: { id: matchup.next_matchup_id },
        });

        if (nextMatchup) {
          // If current matchup was odd position (1, 3, 5, 7), fills slot A; if even (2, 4, 6, 8), fills slot B
          const isSlotA = matchup.position % 2 !== 0;

          const updateData: any = isSlotA
            ? {
                participant_a_name: winnerName,
                participant_a_tag: winnerTag,
              }
            : {
                participant_b_name: winnerName,
                participant_b_tag: winnerTag,
              };

          // If both slots are now filled, set status to READY
          const willHaveBoth = isSlotA
            ? Boolean(nextMatchup.participant_b_tag)
            : Boolean(nextMatchup.participant_a_tag);

          if (willHaveBoth) {
            updateData.status = 'READY';
          }

          await tx.matchup.update({
            where: { id: matchup.next_matchup_id },
            data: updateData,
          });
        }
      } else {
        // 3. Grand Final completed! Declare Champion
        await tx.competition.update({
          where: { id: matchup.round.competition_id },
          data: { status: 'FINISHED' },
        });

        await tx.tournament.update({
          where: { id: matchup.round.competition.tournament_id },
          data: { status: 'FINISHED' },
        });
      }

      return {
        message: matchup.next_matchup_id
          ? `¡Victoria registrada! ${winnerName} avanza a la siguiente ronda.`
          : `🏆 ¡Gran Final concluida! ¡${winnerName} es el Campeón Oficial del Torneo!`,
        matchup_id: matchupId,
        winner_name: winnerName,
        winner_tag: winnerTag,
        score: `${dto.score_a} - ${dto.score_b}`,
        is_championship: !matchup.next_matchup_id,
      };
    });
  }
}
