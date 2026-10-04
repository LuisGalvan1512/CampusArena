import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class RankingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns institutional leaderboard ranked strictly by tournament trophies/medals:
   * 1st Place (Gold / Champion), 2nd Place (Silver / Runner-up), 3rd Place (Bronze / 3rd).
   */
  async getLeaderboard(gameCode?: string) {
    // 1. Fetch all active users with profile info
    const users = await this.prisma.user.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        avatar_url: true,
        profile: {
          select: {
            nickname: true,
            career: true,
            cycle: true,
            campus: true,
            avatar_url: true,
          },
        },
      },
    });

    // 2. Fetch all confirmed registrations in finished tournaments
    const tournamentFilter: any = {
      status: 'FINISHED',
      deleted_at: null,
    };
    if (gameCode && gameCode !== 'ALL') {
      tournamentFilter.game_code = gameCode;
    }

    const finishedRegistrations = await this.prisma.registration.findMany({
      where: {
        status: 'CONFIRMED',
        tournament: tournamentFilter,
      },
      include: {
        game_profile: true,
        tournament: {
          include: {
            competition: {
              include: {
                rounds: {
                  orderBy: { round_number: 'desc' },
                  include: {
                    matchups: {
                      orderBy: { position: 'asc' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    // 3. Aggregate medal counts per user (1st place Gold, 2nd place Silver, 3rd place Bronze)
    const userStats = new Map<string, { gold: number; silver: number; bronze: number; played: number }>();

    for (const reg of finishedRegistrations) {
      const uId = reg.competitor_id;
      if (!userStats.has(uId)) {
        userStats.set(uId, { gold: 0, silver: 0, bronze: 0, played: 0 });
      }
      const st = userStats.get(uId)!;
      st.played += 1;

      const comp = reg.tournament.competition;
      const playerTag = reg.game_profile?.player_tag;
      const teamName = reg.team_name;

      if (!comp || !comp.rounds || comp.rounds.length === 0) continue;

      const matchesPlayer = (tag?: string | null, name?: string | null) => {
        if (!tag && !name) return false;
        if (playerTag && tag && (tag === playerTag || tag.includes(playerTag))) return true;
        if (teamName && name && (name === teamName || name.includes(teamName))) return true;
        return false;
      };

      const finalRound = comp.rounds[0];
      const semiRound = comp.rounds.length > 1 ? comp.rounds[1] : null;

      let awarded = false;
      if (finalRound && finalRound.matchups && finalRound.matchups.length > 0) {
        const finalMatch = finalRound.matchups[0];
        const isFinalWinner = matchesPlayer(finalMatch.winner_tag, finalMatch.winner_name);
        const isInFinal = matchesPlayer(finalMatch.participant_a_tag, finalMatch.participant_a_name) ||
                          matchesPlayer(finalMatch.participant_b_tag, finalMatch.participant_b_name);

        if (isFinalWinner) {
          st.gold += 1;
          awarded = true;
        } else if (isInFinal) {
          st.silver += 1;
          awarded = true;
        }
      }

      if (!awarded && semiRound && semiRound.matchups) {
        const playedInSemis = semiRound.matchups.some((m) =>
          matchesPlayer(m.participant_a_tag, m.participant_a_name) ||
          matchesPlayer(m.participant_b_tag, m.participant_b_name)
        );
        if (playedInSemis) {
          st.bronze += 1;
        }
      }
    }

    // 4. Construct leaderboard
    const leaderboard = users.map((u) => {
      const stats = userStats.get(u.id) || { gold: 0, silver: 0, bronze: 0, played: 0 };
      const totalMedals = stats.gold + stats.silver + stats.bronze;
      const points = (stats.gold * 100) + (stats.silver * 50) + (stats.bronze * 25) + (stats.played * 5);

      return {
        id: u.id,
        user_id: u.id,
        rank: 0,
        nickname: u.profile?.nickname || u.first_name,
        player_name: `${u.first_name} ${u.last_name}`,
        campus: u.profile?.campus || 'Lima',
        career: u.profile?.career || 'Diseño y Desarrollo de Software',
        cycle: u.profile?.cycle || 1,
        avatar_url: u.profile?.avatar_url || u.avatar_url,
        gold_medals: stats.gold,
        silver_medals: stats.silver,
        bronze_medals: stats.bronze,
        total_medals: totalMedals,
        tournaments_played: stats.played,
        points,
      };
    });

    // 5. Sort: Gold desc, Silver desc, Bronze desc, Played desc, Points desc, then alphabetically
    leaderboard.sort((a, b) => {
      if (b.gold_medals !== a.gold_medals) return b.gold_medals - a.gold_medals;
      if (b.silver_medals !== a.silver_medals) return b.silver_medals - a.silver_medals;
      if (b.bronze_medals !== a.bronze_medals) return b.bronze_medals - a.bronze_medals;
      if (b.tournaments_played !== a.tournaments_played) return b.tournaments_played - a.tournaments_played;
      return a.player_name.localeCompare(b.player_name);
    });

    leaderboard.forEach((p, idx) => {
      p.rank = idx + 1;
    });

    return {
      game_code: gameCode || 'ALL',
      organization: 'Tecsup',
      total_competitors: leaderboard.length,
      top_podium: leaderboard.slice(0, 3),
      leaderboard,
    };
  }

  /**
   * Returns pending vouchers for the organizer dashboard.
   */
  async getPendingPayments() {
    const payments = await this.prisma.payment.findMany({
      where: {
        status: { in: ['UNDER_REVIEW', 'PENDING'] },
      },
      include: {
        registration: {
          include: {
            tournament: true,
            competitor: {
              include: { profile: true },
            },
            game_profile: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return payments.map((p) => ({
      payment_id: p.id,
      registration_id: p.registration_id,
      tournament_id: p.registration.tournament_id,
      tournament_name: p.registration.tournament.name,
      tournament_slug: p.registration.tournament.slug,
      game_code: p.registration.tournament.game_code,
      competitor_name: `${p.registration.competitor.first_name} ${p.registration.competitor.last_name}`,
      competitor_email: p.registration.competitor.email,
      in_game_name: p.registration.game_profile.in_game_name,
      player_tag: p.registration.game_profile.player_tag,
      career: p.registration.competitor.profile?.career || 'Diseño y Desarrollo de Software',
      cycle: p.registration.competitor.profile?.cycle || 4,
      amount: Number(p.amount),
      currency: p.currency,
      method: p.method,
      status: p.status,
      operation_reference: p.operation_reference,
      evidence_url: p.evidence_url,
      submitted_at: p.submitted_at || p.created_at,
    }));
  }
}
