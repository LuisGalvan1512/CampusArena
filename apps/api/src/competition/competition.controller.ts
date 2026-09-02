import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CompetitionService } from './competition.service.js';
import { GenerateBracketDto } from './dto/generate-bracket.dto.js';
import { SubmitMatchupResultDto } from './dto/submit-result.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller()
export class CompetitionController {
  constructor(private readonly competitionService: CompetitionService) {}

  /**
   * GET /api/v1/tournaments/:tournamentId/bracket
   * Returns tournament bracket tree.
   */
  @Get('tournaments/:tournamentId/bracket')
  async getBracket(@Param('tournamentId') tournamentId: string) {
    return this.competitionService.getBracket(tournamentId);
  }

  /**
   * POST /api/v1/tournaments/:tournamentId/generate-bracket
   * Generates bracket tree for tournament.
   */
  @Post('tournaments/:tournamentId/generate-bracket')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async generateBracket(
    @Param('tournamentId') tournamentId: string,
    @Body() dto: GenerateBracketDto
  ) {
    return this.competitionService.generateBracket(tournamentId, dto);
  }

  /**
   * POST /api/v1/matchups/:matchupId/result
   * Submits match result and advances winner.
   */
  @Post('matchups/:matchupId/result')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async submitMatchupResult(
    @Param('matchupId') matchupId: string,
    @Body() dto: SubmitMatchupResultDto
  ) {
    return this.competitionService.submitMatchupResult(matchupId, dto);
  }
}
