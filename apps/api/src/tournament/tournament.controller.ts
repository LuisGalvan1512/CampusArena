import {
  Controller,
  Get,
  Post,
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
   * Creates a new tournament (Organizers / Admins).
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateTournamentDto) {
    return this.tournamentService.create(dto);
  }

  /**
   * POST /api/v1/tournaments/:id/publish
   * Publishes a draft tournament.
   */
  @Post(':id/publish')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async publish(@Param('id') id: string) {
    return this.tournamentService.publish(id);
  }
}
