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

    const leaderboard = realProfiles.map((gp, idx) => ({
      id: gp.id,
      rank: idx + 1,
      player_name: `${gp.user.first_name} ${gp.user.last_name}`,
      in_game_name: gp.in_game_name,
      player_tag: gp.player_tag,
      game_code: gp.game_code,
      trophies: gp.trophies,
      level: gp.level,
      career: gp.user.profile?.career || 'Diseño y Desarrollo de Software',
      cycle: gp.user.profile?.cycle || 4,
      tournaments_won: idx === 0 ? 3 : idx === 1 ? 2 : 1,
      winrate: Math.min(88, Math.max(52, 75 - idx * 3)),
      is_online: idx < 3,
    }));

    // Seed master ranking players to always display a competitive Top 10
    const seedCR = [
      { name: 'Mateo Quispe', tag: '#8YRP92VJ', ign: 'Mateo_King', trophies: 7850, career: 'Redes y Comunicaciones', cycle: 5, won: 4, winrate: 78 },
      { name: 'Gabriel Torres', tag: '#2PP009Y9', ign: 'Gabo_Pro', trophies: 7420, career: 'Diseño y Desarrollo de Software', cycle: 4, won: 3, winrate: 74 },
      { name: 'Rodrigo Flores', tag: '#9QJ882LC', ign: 'RodriCR', trophies: 7180, career: 'Mecatrónica Industrial', cycle: 6, won: 2, winrate: 69 },
      { name: 'Alvaro Vega', tag: '#PPR0UL0U', ign: 'PekkaVega', trophies: 6950, career: 'Administración y Sistemas', cycle: 3, won: 2, winrate: 66 },
      { name: 'Valeria Gomez', tag: '#99YPP002', ign: 'ValeGamer', trophies: 6810, career: 'Diseño y Desarrollo de Software', cycle: 2, won: 1, winrate: 64 },
      { name: 'Lucas Medina', tag: '#88QJLC22', ign: 'Lucas_CR', trophies: 6690, career: 'Operaciones Mineras', cycle: 5, won: 1, winrate: 61 },
      { name: 'Camila Silva', tag: '#22PR0UL0', ign: 'Cami Royale', trophies: 6540, career: 'Gestión de Seguridad', cycle: 4, won: 0, winrate: 59 },
      { name: 'Joaquin Castro', tag: '#00LC99PR', ign: 'Joaqz_99', trophies: 6420, career: 'Electrónica y Automatización', cycle: 6, won: 0, winrate: 57 },
      { name: 'Renzo Paredes', tag: '#88JQC22Y', ign: 'RenzoCR', trophies: 6310, career: 'Diseño y Desarrollo de Software', cycle: 3, won: 0, winrate: 55 },
      { name: 'Sofia Benitez', tag: '#PP28900Y', ign: 'Sofi_Pro', trophies: 6180, career: 'Producción y Gestión', cycle: 2, won: 0, winrate: 53 },
    ];

    const seedBS = [
      { name: 'Luis Galvan', tag: '#2PP009Y9', ign: 'Luis_Brawl', trophies: 28450, career: 'Diseño y Desarrollo de Software', cycle: 4, won: 4, winrate: 82 },
      { name: 'Sebastian Cruz', tag: '#2LC990PR', ign: 'Seba_Brawl', trophies: 26120, career: 'Redes y Comunicaciones', cycle: 5, won: 3, winrate: 76 },
      { name: 'Nicolas Reyes', tag: '#8JQC22YU', ign: 'NicoStars', trophies: 24800, career: 'Mecatrónica Industrial', cycle: 6, won: 2, winrate: 72 },
      { name: 'Franco Diaz', tag: '#LC2299QU', ign: 'Franco_BS', trophies: 23410, career: 'Administración y Sistemas', cycle: 3, won: 2, winrate: 68 },
      { name: 'Diego Ramos', tag: '#00YPP289', ign: 'Diego_Crow', trophies: 22100, career: 'Diseño y Desarrollo de Software', cycle: 2, won: 1, winrate: 65 },
      { name: 'Manuel Herrera', tag: '#QQ2299LC', ign: 'Manu_Mortis', trophies: 21350, career: 'Operaciones Mineras', cycle: 5, won: 1, winrate: 63 },
      { name: 'Adriana Ortiz', tag: '#8YRP9200', ign: 'Adri_Piper', trophies: 20490, career: 'Gestión de Seguridad', cycle: 4, won: 0, winrate: 60 },
    ];

    const pool = gameCode === 'CLASH_ROYALE' ? seedCR : seedBS;

    for (const s of pool) {
      if (!leaderboard.some((p) => p.player_tag === s.tag)) {
        leaderboard.push({
          id: `seed-${s.tag}`,
          rank: leaderboard.length + 1,
          player_name: s.name,
          in_game_name: s.ign,
          player_tag: s.tag,
          game_code: gameCode,
          trophies: s.trophies,
          level: gameCode === 'CLASH_ROYALE' ? 14 : 11,
          career: s.career,
          cycle: s.cycle,
          tournaments_won: s.won,
          winrate: s.winrate,
          is_online: false,
        });
      }
    }

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
