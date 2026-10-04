import { Controller, Get, Query, UseGuards, Header } from '@nestjs/common';
import { RankingService } from './ranking.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller()
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  /**
   * GET /api/v1/ranking
   * Public institutional leaderboard by game.
   */
  @Get('ranking')
  @Header('Cache-Control', 'public, max-age=30, stale-while-revalidate=90')
  async getLeaderboard(@Query('game_code') gameCode?: string) {
    return this.rankingService.getLeaderboard(gameCode);
  }

  /**
   * GET /api/v1/admin/payments/pending
   * Organizer inbox of pending vouchers for review.
   */
  @Get('admin/payments/pending')
  @UseGuards(JwtAuthGuard)
  async getPendingPayments() {
    return this.rankingService.getPendingPayments();
  }
}
