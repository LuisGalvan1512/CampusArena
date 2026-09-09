import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TournamentService } from './tournament.service.js';
import { CreateTournamentDto } from './dto/create-tournament.dto.js';
import { QueryTournamentDto } from './dto/query-tournament.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';

@Controller('tournaments')
export class TournamentController {
  constructor(private readonly tournamentService: TournamentService) {}

  /**
   * GET /api/v1/tournaments
   * Returns a list of tournaments with optional filters.
   */
  @Get()
  async findAll(@Query() query: QueryTournamentDto) {
    return this.tournamentService.findAll(query);
  }

  /**
   * GET /api/v1/tournaments/:slug
   * Returns complete tournament information by unique slug.
   */
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.tournamentService.findBySlug(slug);
  }

  /**
   * POST /api/v1/tournaments
   * Creates a new tournament (Organizers / Admins only).
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ORGANIZER')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateTournamentDto) {
    return this.tournamentService.create(dto);
  }

  /**
   * POST /api/v1/tournaments/:id/publish
   * Publishes a draft tournament (Organizers / Admins only).
   */
  @Post(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ORGANIZER')
  @HttpCode(HttpStatus.OK)
  async publish(@Param('id') id: string) {
    return this.tournamentService.publish(id);
  }

  /**
   * PATCH /api/v1/tournaments/:id
   * Updates tournament data or status (Organizers / Admins only).
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ORGANIZER')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.tournamentService.update(id, dto);
  }

  /**
   * DELETE /api/v1/tournaments/:id
   * Deletes tournament and cascade clears competition/registrations (Organizers / Admins only).
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ORGANIZER')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return this.tournamentService.remove(id);
  }
}
