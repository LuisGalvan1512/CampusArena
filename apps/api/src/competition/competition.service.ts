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

import { NotificationsService } from '../notifications/notifications.service.js';
import { MailService } from '../mail/mail.service.js';

@Injectable()
export class CompetitionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly mail: MailService,
  ) {}

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

    // Prepare participants list from confirmed registrations
    let participants: SeedParticipant[] = tournament.registrations.map((r) => {
      const isTeam = (tournament.team_size && tournament.team_size > 1) && !!r.team_name;
      return {
        name: isTeam ? r.team_name! : `${r.competitor.first_name} ${r.competitor.last_name}`,
        tag: isTeam ? `[Cap: ${r.game_profile.player_tag}]` : r.game_profile.player_tag,
        trophies: r.game_profile.trophies,
      };
    });

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

    const tournamentName = tournament.name;
    const tournamentSlug = tournament.slug;
    const confirmedUserIds = tournament.registrations.map((r) => r.competitor_id);

    // Create Competition, Rounds, and Matchups in Transaction
    const result = await this.prisma.$transaction(async (tx) => {
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
          const pA = participants[i * 2];
          const pB = participants[i * 2 + 1];
          const hasA = Boolean(pA);
          const hasB = Boolean(pB);

          let status: any = 'READY';
          let winnerName: string | null = null;
          let winnerTag: string | null = null;
          let scoreA = 0;
          let scoreB = 0;

          if (hasA && !hasB) {
            status = 'WALKOVER';
            winnerName = pA.name;
            winnerTag = pA.tag;
            scoreA = 1;
          } else if (!hasA && hasB) {
            status = 'WALKOVER';
            winnerName = pB.name;
            winnerTag = pB.tag;
            scoreB = 1;
          } else if (!hasA && !hasB) {
            status = 'PENDING';
          }

          await tx.matchup.create({
            data: {
              round_id: rOctavos.id,
              position: i + 1,
              participant_a_name: pA?.name || 'TBD',
              participant_a_tag: pA?.tag || '#TBD',
              participant_b_name: hasA && !hasB ? 'BYE (Pase directo)' : (pB?.name || 'TBD'),
              participant_b_tag: hasA && !hasB ? '#BYE' : (pB?.tag || '#TBD'),
              next_matchup_id: octavosNext[i],
              status,
              score_a: scoreA,
              score_b: scoreB,
              winner_name: winnerName,
              winner_tag: winnerTag,
            },
          });

          // Advance BYE winner to Cuartos de Final immediately
          if (winnerName && winnerTag) {
            const isSlotA = (i + 1) % 2 !== 0;
            await tx.matchup.update({
              where: { id: octavosNext[i] },
              data: isSlotA
                ? { participant_a_name: winnerName, participant_a_tag: winnerTag }
                : { participant_b_name: winnerName, participant_b_tag: winnerTag },
            });
          }
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
          const pA = participants[i * 2];
          const pB = participants[i * 2 + 1];
          const hasA = Boolean(pA);
          const hasB = Boolean(pB);

          let status: any = 'READY';
          let winnerName: string | null = null;
          let winnerTag: string | null = null;
          let scoreA = 0;
          let scoreB = 0;

          if (hasA && !hasB) {
            status = 'WALKOVER';
            winnerName = pA.name;
            winnerTag = pA.tag;
            scoreA = 1;
          } else if (!hasA && hasB) {
            status = 'WALKOVER';
            winnerName = pB.name;
            winnerTag = pB.tag;
            scoreB = 1;
          } else if (!hasA && !hasB) {
            status = 'PENDING';
          }

          await tx.matchup.create({
            data: {
              round_id: rCuartos.id,
              position: i + 1,
              participant_a_name: pA?.name || 'TBD',
              participant_a_tag: pA?.tag || '#TBD',
              participant_b_name: hasA && !hasB ? 'BYE (Pase directo)' : (pB?.name || 'TBD'),
              participant_b_tag: hasA && !hasB ? '#BYE' : (pB?.tag || '#TBD'),
              next_matchup_id: cuartosNext[i],
              status,
              score_a: scoreA,
              score_b: scoreB,
              winner_name: winnerName,
              winner_tag: winnerTag,
            },
          });

          // Advance BYE winner to Semifinales immediately
          if (winnerName && winnerTag) {
            const isSlotA = (i + 1) % 2 !== 0;
            await tx.matchup.update({
              where: { id: cuartosNext[i] },
              data: isSlotA
                ? { participant_a_name: winnerName, participant_a_tag: winnerTag }
                : { participant_b_name: winnerName, participant_b_tag: winnerTag },
            });
          }
        }
      }

      return {
        message: `Bracket de ${bracketSize} competidores generado exitosamente.`,
        competition_id: competition.id,
        status: competition.status,
        bracket_size: bracketSize,
      };
    });

    // Notify all confirmed participants (In-App + Email)
    try {
      for (const reg of tournament.registrations) {
        if (reg.competitor_id) {
          await this.notifications.create({
            user_id: reg.competitor_id,
            type: 'MATCH_CALL',
            title: '⚔️ ¡Bracket Oficial Generado!',
            message: `Las llaves del torneo "${tournamentName}" han sido publicadas. ¡Revisa tu llave y tu rival!`,
            link: `/tournaments/${tournamentSlug}`,
            link_label: 'Ver mi llave en Brackets',
          });
        }
        if (reg.competitor?.email) {
          await this.mail.sendMatchReadyEmail({
            email: reg.competitor.email,
            firstName: reg.competitor.first_name,
            tournamentName,
            roundName: 'Ronda Inicial (Brackets)',
            opponentName: 'Rival Asignado en Llaves',
            matchPosition: 1,
            slug: tournamentSlug,
          });
        }
      }
    } catch (e) {
      console.error('Error enviando notificaciones de bracket:', e);
    }

    return result;
  }

  /**
   * GET /tournaments/:tournamentId/bracket
   * Returns complete hierarchy of rounds and matchups for the tournament.
   */
  async getBracket(tournamentId: string) {
    return this.prisma.competition.findUnique({
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

    const result = await this.prisma.$transaction(async (tx) => {
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

    // Notify winner in real-time
    try {
      const tournament = matchup?.round?.competition?.tournament;
      if (tournament && winnerTag) {
        const winnerRegistration = await this.prisma.registration.findFirst({
          where: {
            tournament_id: tournament.id,
            game_profile: { player_tag: winnerTag },
          },
          include: { competitor: true },
        });

        if (winnerRegistration) {
          await this.notifications.create({
            user_id: winnerRegistration.competitor_id,
            type: result.is_championship ? 'TOURNAMENT' : 'MATCH_CALL',
            title: result.is_championship ? '🏆 ¡ERES EL CAMPEÓN DEL TORNEO!' : '🎉 ¡Victoria en el Bracket!',
            message: result.is_championship
              ? `¡Felicitaciones! Has ganado la Gran Final de "${tournament.name}". Tu medalla de Oro ya está registrada en tu perfil de honor.`
              : `¡Has vencido en tu enfrentamiento de "${tournament.name}" (${result.score})! Tu siguiente partida ya está programada.`,
            link: `/tournaments/${tournament.slug}`,
            link_label: result.is_championship ? 'Ver Torneo' : 'Ver Bracket',
          });

          if (winnerRegistration.competitor?.email && !result.is_championship) {
            await this.mail.sendMatchReadyEmail({
              email: winnerRegistration.competitor.email,
              firstName: winnerRegistration.competitor.first_name,
              tournamentName: tournament.name,
              roundName: 'Siguiente Ronda de Brackets',
              opponentName: 'Próximo Rival en Llaves',
              matchPosition: matchup.position,
              slug: tournament.slug,
            });
          }
        }
      }
    } catch (e) {
      console.error('Error enviando notificación de victoria en bracket:', e);
    }

    return result;
  }
}
