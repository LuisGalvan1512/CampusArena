import {
  Injectable,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTournamentDto } from './dto/create-tournament.dto.js';
import { QueryTournamentDto, TournamentStatusFilter } from './dto/query-tournament.dto.js';

@Injectable()
export class TournamentService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedInitialTournaments();
  }

  /**
   * Generates a URL-friendly slug from tournament name.
   */
  private generateSlug(name: string): string {
    const baseSlug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    return baseSlug;
  }

  /**
   * GET /tournaments
   * Returns filtered tournaments list.
   */
  async findAll(query: QueryTournamentDto) {
    const { game_code, status, search, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      deleted_at: null,
    };

    if (game_code) {
      where.game_code = game_code;
    }

    if (status && status !== TournamentStatusFilter.ALL) {
      where.status = status;
    }

    if (search && search.trim() !== '') {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description_short: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.tournament.count({ where }),
      this.prisma.tournament.findMany({
        where,
        orderBy: { tournament_start_at: 'asc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  /**
   * GET /tournaments/:slug
   * Returns tournament details by unique slug.
   */
  async findBySlug(slug: string) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { slug },
    });

    if (!tournament || tournament.deleted_at) {
      throw new NotFoundException(`El torneo "${slug}" no fue encontrado.`);
    }

    return tournament;
  }

  /**
   * POST /tournaments
   * Creates a new tournament.
   */
  async create(dto: CreateTournamentDto) {
    // Validate dates consistency
    const openAt = new Date(dto.registration_open_at);
    const closeAt = new Date(dto.registration_close_at);
    const startAt = new Date(dto.tournament_start_at);

    if (closeAt <= openAt) {
      throw new BadRequestException('La fecha de cierre de inscripciones debe ser posterior a la fecha de apertura.');
    }

    if (startAt < closeAt) {
      throw new BadRequestException('La fecha de inicio del torneo debe ser posterior o igual al cierre de inscripciones.');
    }

    // Generate unique slug
    let slug = this.generateSlug(dto.name);
    const existing = await this.prisma.tournament.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const tournament = await this.prisma.tournament.create({
      data: {
        name: dto.name,
        slug,
        game_code: dto.game_code,
        organization_name: dto.organization_name || 'Tecsup',
        campus_name: dto.campus_name || 'Lima',
        description_short: dto.description_short,
        description_full: dto.description_full,
        banner_url: dto.banner_url,
        rules_text: dto.rules_text,
        max_slots: dto.max_slots,
        min_slots: dto.min_slots || 8,
        cost: dto.cost || 0.0,
        currency: dto.currency || 'PEN',
        prize_pool: dto.prize_pool,
        format: dto.format || '1 vs 1 (BO3 / BO5)',
        registration_open_at: openAt,
        registration_close_at: closeAt,
        tournament_start_at: startAt,
        is_online: dto.is_online !== undefined ? dto.is_online : true,
        contact_email: dto.contact_email,
      },
    });

    return tournament;
  }

  /**
   * POST /tournaments/:id/publish
   * Transitions tournament to PUBLISHED / REGISTRATION_OPEN.
   */
  async publish(id: string) {
    const tournament = await this.prisma.tournament.findUnique({ where: { id } });
    if (!tournament) {
      throw new NotFoundException('Torneo no encontrado.');
    }

    const updated = await this.prisma.tournament.update({
      where: { id },
      data: { status: 'REGISTRATION_OPEN' },
    });

    return updated;
  }

  /**
   * Seeds demo tournaments if the database is empty.
   */
  private async seedInitialTournaments() {
    const count = await this.prisma.tournament.count();
    if (count > 0) return;

    const demoTournaments = [
      {
        name: 'Copa Tecsup Clash Royale 2026',
        slug: 'copa-tecsup-clash-royale-2026',
        game_code: 'CLASH_ROYALE',
        organization_name: 'Tecsup',
        campus_name: 'Lima • Sede Central',
        description_short: 'El torneo oficial 1vs1 de Clash Royale para alumnos de Tecsup.',
        description_full: 'Participa en la primera edición anual de la Copa Tecsup Clash Royale. Demuestra tus mejores mazos en formato eliminación doble al mejor de 3 (BO3) y finales al mejor de 5 (BO5). Los participantes acumularán puntos oficiales para el ranking institucional y medallas de honor.',
        banner_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
        rules_text: `1. Formato de Juego:
- Fase de Brackets: Eliminación Doble 1vs1 al Mejor de 3 partidas (BO3).
- Gran Final: Al Mejor de 5 partidas (BO5) con ventaja de ganador.
- Nivel de cartas y torres igualadas a nivel competitivo oficial de torneo (Nivel 11).

2. Elección de Mazos y Baneo:
- Baneo de 1 carta por competidor antes de cada serie.
- No se permite cambiar de mazo dentro de la misma partida una vez comenzada.

3. Desconexiones y Fair Play:
- Si un competidor se desconecta pasados 30 segundos, la partida continúa normalmente.
- Conducta antideportiva o insultos en el chat resultará en descalificación inmediata.`,
        status: 'REGISTRATION_OPEN' as any,
        max_slots: 32,
        min_slots: 8,
        current_participants: 18,
        cost: 0.0,
        currency: 'PEN',
        prize_pool: 'S/ 500 en efectivo + Medalla de Oro Tecsup + 2,500 Gemas',
        format: '1 vs 1 Eliminación Doble (BO3 / BO5)',
        registration_open_at: new Date('2026-08-01T00:00:00Z'),
        registration_close_at: new Date('2026-09-15T23:59:59Z'),
        tournament_start_at: new Date('2026-09-18T16:00:00Z'),
        is_online: true,
        contact_email: 'esports@tecsup.edu.pe',
      },
      {
        name: 'Torneo Inter-Sedes Brawl Stars 2026',
        slug: 'torneo-inter-sedes-brawl-stars-2026',
        game_code: 'BRAWL_STARS',
        organization_name: 'Tecsup',
        campus_name: 'Inter-Sedes (Lima, Arequipa, Trujillo)',
        description_short: 'Competencia inter-sedes en modalidades Atrapagemas y Balón Brawl.',
        description_full: 'La máxima competencia de Brawl Stars entre sedes de Tecsup. Enfréntate a los mejores brawlers de Lima, Arequipa y Trujillo en partidas llenas de estrategia y adrenalina.',
        banner_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
        rules_text: `1. Modalidades de Juego:
- Set 1: Atrapagemas (Mina Rocosa).
- Set 2: Balón Brawl (Centro de Campo).
- Set 3: Noqueo (Roca de la Muerte).

2. Restricciones:
- Baneo de 1 Brawler por serie por mutuo acuerdo.
- Brawlers lanzados en los últimos 7 días están automáticamente prohibidos.

3. Puntuación y Reporte:
- Cada victoria otorga 3 puntos a la sede representativa.`,
        status: 'REGISTRATION_OPEN' as any,
        max_slots: 16,
        min_slots: 8,
        current_participants: 12,
        cost: 0.0,
        currency: 'PEN',
        prize_pool: 'S/ 600 en premios + Trofeo Inter-Sedes + Medallas',
        format: 'Duelos 1 vs 1 Multimodalidad (BO3)',
        registration_open_at: new Date('2026-08-10T00:00:00Z'),
        registration_close_at: new Date('2026-09-20T23:59:59Z'),
        tournament_start_at: new Date('2026-09-22T17:00:00Z'),
        is_online: true,
        contact_email: 'esports@tecsup.edu.pe',
      },
      {
        name: 'Liga Relámpago Clash Royale — Noche de Mazos',
        slug: 'liga-relampago-clash-royale-noche-de-mazos',
        game_code: 'CLASH_ROYALE',
        organization_name: 'Tecsup',
        campus_name: 'Lima',
        description_short: 'Torneo rápido de una sola noche con mazos aleatorios y reglas especiales.',
        description_full: '¿Crees dominar todas las cartas del juego? Demuéstralo en la Liga Relámpago con reglas sorpresa por ronda. Torneo ágil de 1 día de duración.',
        banner_url: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?auto=format&fit=crop&w=1200&q=80',
        rules_text: `1. Formato:
- Eliminación simple (Single Elimination) al mejor de 3 (BO3).
- Tiempo de espera entre rondas: 5 minutos máximo.`,
        status: 'PUBLISHED' as any,
        max_slots: 64,
        min_slots: 16,
        current_participants: 5,
        cost: 0.0,
        currency: 'PEN',
        prize_pool: 'S/ 250 + Pase Royale Oficial',
        format: '1 vs 1 Eliminación Directa',
        registration_open_at: new Date('2026-09-01T00:00:00Z'),
        registration_close_at: new Date('2026-09-28T23:59:59Z'),
        tournament_start_at: new Date('2026-09-30T19:00:00Z'),
        is_online: true,
        contact_email: 'esports@tecsup.edu.pe',
      },
    ];

    for (const t of demoTournaments) {
      await this.prisma.tournament.create({ data: t });
    }
  }
}
