import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTournamentDto } from './dto/create-tournament.dto.js';
import { QueryTournamentDto, TournamentStatusFilter } from './dto/query-tournament.dto.js';

@Injectable()
export class TournamentService {
  constructor(private readonly prisma: PrismaService) {}

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
   * PATCH /tournaments/:id
   * Updates tournament fields or status.
   */
  async update(id: string, dto: any) {
    const tournament = await this.prisma.tournament.findUnique({ where: { id } });
    if (!tournament) {
      throw new NotFoundException('Torneo no encontrado.');
    }

    const data: any = { ...dto };
    if (dto.registration_open_at) data.registration_open_at = new Date(dto.registration_open_at);
    if (dto.registration_close_at) data.registration_close_at = new Date(dto.registration_close_at);
    if (dto.tournament_start_at) data.tournament_start_at = new Date(dto.tournament_start_at);

    return this.prisma.tournament.update({
      where: { id },
      data,
    });
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
