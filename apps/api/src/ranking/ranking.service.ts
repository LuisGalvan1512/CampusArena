import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class RankingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns institutional leaderboard by game.
   */
  async getLeaderboard(gameCode: 'CLASH_ROYALE' | 'BRAWL_STARS' = 'CLASH_ROYALE') {
    // 1. Get real profiles from DB
    const realProfiles = await this.prisma.gameProfile.findMany({
      where: { game_code: gameCode },
      include: {
        user: {
          include: { profile: true },
        },
      },
      orderBy: { trophies: 'desc' },
    });

    const userIds = realProfiles.map((gp) => gp.user.id);
    const nicknamesMap: Record<string, string> = {};
    if (userIds.length > 0) {
      try {
        const rows: any[] = await this.prisma.$queryRawUnsafe(
          `SELECT user_id, nickname FROM profile.user_profiles WHERE user_id = ANY($1::uuid[]) AND nickname IS NOT NULL`,
          userIds
        );
        for (const r of rows) {
          if (r.nickname) nicknamesMap[r.user_id] = r.nickname;
        }
      } catch (err) {}
    }

    const leaderboard = realProfiles.map((gp, idx) => ({
      id: gp.id,
      user_id: gp.user.id,
      rank: idx + 1,
      nickname: nicknamesMap[gp.user.id] || gp.in_game_name || gp.user.first_name,
      player_name: `${gp.user.first_name} ${gp.user.last_name}`,
      in_game_name: gp.in_game_name,
      player_tag: gp.player_tag,
      game_code: gp.game_code,
      trophies: gp.trophies,
      level: gp.level,
      career: gp.user.profile?.career || 'Diseño y Desarrollo de Software',
      cycle: gp.user.profile?.cycle || 4,
      tournaments_won: 0,
      winrate: Math.min(88, Math.max(52, 75 - idx * 3)),
      is_online: idx < 3,
    }));

    // Sort by trophies
    leaderboard.sort((a, b) => b.trophies - a.trophies);
    leaderboard.forEach((p, idx) => {
      p.rank = idx + 1;
    });

    return {
      game_code: gameCode,
      organization: 'Tecsup — Sede Lima',
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
