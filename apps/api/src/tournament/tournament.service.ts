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
    try {
      await this.prisma.$executeRawUnsafe(`ALTER TABLE tournament.tournaments ADD COLUMN IF NOT EXISTS prize_distribution JSONB;`);
    } catch (err) {}
    try {
      await this.prisma.$executeRawUnsafe(`ALTER TABLE tournament.tournaments ADD COLUMN IF NOT EXISTS event_modality VARCHAR(50) DEFAULT 'PRESENTIAL';`);
    } catch (err) {}
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

    let extra: any = {};
    try {
      const rows: any[] = await this.prisma.$queryRawUnsafe(
        `SELECT prize_distribution, event_modality FROM tournament.tournaments WHERE id = $1::uuid LIMIT 1`,
        tournament.id
      );
      if (rows.length > 0) {
        extra.prize_distribution = rows[0].prize_distribution;
        extra.event_modality = rows[0].event_modality;
      }
    } catch (err) {}

    return {
      ...tournament,
      event_modality: extra.event_modality || (tournament.is_online ? 'ONLINE' : 'PRESENTIAL'),
      prize_distribution: extra.prize_distribution || null,
    };
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

    const { prize_distribution, event_modality, ...restDto } = dto;
    const isOnline = event_modality === 'ONLINE' ? true : event_modality === 'PRESENTIAL' ? false : (restDto.is_online ?? false);

    const tournament = await this.prisma.tournament.create({
      data: {
        name: restDto.name,
        slug,
        game_code: restDto.game_code,
        organization_name: restDto.organization_name || 'Tecsup',
        campus_name: restDto.campus_name || 'Lima',
        description_short: restDto.description_short,
        description_full: restDto.description_full,
        banner_url: restDto.banner_url,
        rules_text: restDto.rules_text,
        max_slots: restDto.max_slots,
        min_slots: restDto.min_slots || 8,
        cost: restDto.cost || 0.0,
        currency: restDto.currency || 'PEN',
        prize_pool: restDto.prize_pool,
        format: restDto.format || (restDto.team_size && restDto.team_size > 1 ? `${restDto.team_size} vs ${restDto.team_size} (BO3 / BO5)` : '1 vs 1 (BO3 / BO5)'),
        team_size: restDto.team_size || 1,
        stream_url: restDto.stream_url || null,
        stream_platform: restDto.stream_platform || 'KICK',
        registration_open_at: openAt,
        registration_close_at: closeAt,
        tournament_start_at: startAt,
        is_online: isOnline,
        contact_email: restDto.contact_email,
      },
    });

    if (prize_distribution !== undefined || event_modality !== undefined) {
      try {
        await this.prisma.$executeRawUnsafe(
          `UPDATE tournament.tournaments SET prize_distribution = $1::jsonb, event_modality = $2 WHERE id = $3::uuid`,
          prize_distribution ? JSON.stringify(prize_distribution) : null,
          event_modality || (isOnline ? 'ONLINE' : 'PRESENTIAL'),
          tournament.id
        );
      } catch (err) {}
    }

    return {
      ...tournament,
      is_online: isOnline,
      event_modality: event_modality || (isOnline ? 'ONLINE' : 'PRESENTIAL'),
      prize_distribution: prize_distribution || null,
    };
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
   * PATCH /tournaments/:id
   * Updates tournament fields or status.
   */
  async update(id: string, dto: any) {
    const tournament = await this.prisma.tournament.findUnique({ where: { id } });
    if (!tournament) {
      throw new NotFoundException('Torneo no encontrado.');
    }

    const { prize_distribution, event_modality, prize_1, prize_2, prize_3, ...restDto } = dto;

    const allowedFields = [
      'name',
      'game_code',
      'organization_name',
      'campus_name',
      'description_short',
      'description_full',
      'banner_url',
      'rules_text',
      'status',
      'max_slots',
      'min_slots',
      'cost',
      'currency',
      'prize_pool',
      'format',
      'team_size',
      'stream_url',
      'stream_platform',
      'is_online',
      'contact_email',
    ];

    const data: any = {};
    for (const key of allowedFields) {
      if (restDto[key] !== undefined) {
        data[key] = restDto[key];
      }
    }

    if (event_modality !== undefined) {
      data.is_online = event_modality === 'ONLINE';
    }

    if (restDto.registration_open_at) {
      const d = new Date(restDto.registration_open_at);
      if (!isNaN(d.getTime())) data.registration_open_at = d;
    }
    if (restDto.registration_close_at) {
      const d = new Date(restDto.registration_close_at);
      if (!isNaN(d.getTime())) data.registration_close_at = d;
    }
    if (restDto.tournament_start_at) {
      const d = new Date(restDto.tournament_start_at);
      if (!isNaN(d.getTime())) data.tournament_start_at = d;
    }

    if (data.cost !== undefined) data.cost = Number(data.cost);
    if (data.max_slots !== undefined) data.max_slots = Number(data.max_slots);
    if (data.min_slots !== undefined) data.min_slots = Number(data.min_slots);
    if (data.team_size !== undefined) data.team_size = Number(data.team_size);

    const updated = await this.prisma.tournament.update({
      where: { id },
      data,
    });

    if (prize_distribution !== undefined && event_modality !== undefined) {
      try {
        await this.prisma.$executeRawUnsafe(
          `UPDATE tournament.tournaments SET prize_distribution = $1::jsonb, event_modality = $2 WHERE id = $3::uuid`,
          JSON.stringify(prize_distribution),
          event_modality,
          id
        );
      } catch (err) {
        console.error('[TournamentService update prize & modality error]:', err);
      }
    } else if (prize_distribution !== undefined) {
      try {
        await this.prisma.$executeRawUnsafe(
          `UPDATE tournament.tournaments SET prize_distribution = $1::jsonb WHERE id = $2::uuid`,
          JSON.stringify(prize_distribution),
          id
        );
      } catch (err) {
        console.error('[TournamentService update prize error]:', err);
      }
    } else if (event_modality !== undefined) {
      try {
        await this.prisma.$executeRawUnsafe(
          `UPDATE tournament.tournaments SET event_modality = $1 WHERE id = $2::uuid`,
          event_modality,
          id
        );
      } catch (err) {
        console.error('[TournamentService update modality error]:', err);
      }
    }

    return this.findBySlug(updated.slug);
  }

  /**
   * DELETE /tournaments/:id
   * Deletes tournament and cascades its registrations/brackets.
   */
  async remove(id: string) {
    const tournament = await this.prisma.tournament.findUnique({ where: { id } });
    if (!tournament) {
      throw new NotFoundException('Torneo no encontrado.');
    }

    await this.prisma.$transaction(async (tx) => {
      const comp = await tx.competition.findUnique({ where: { tournament_id: id } });
      if (comp) {
        await tx.competition.delete({ where: { id: comp.id } });
      }

      await tx.registration.deleteMany({ where: { tournament_id: id } });
      await tx.tournament.delete({ where: { id } });
    });

    return { message: 'Torneo eliminado exitosamente.' };
  }
}
