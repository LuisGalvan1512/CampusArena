import { Controller, Get, Query, UseGuards } from '@nestjs/common';
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
  async getLeaderboard(@Query('game_code') gameCode: 'CLASH_ROYALE' | 'BRAWL_STARS') {
    return this.rankingService.getLeaderboard(gameCode || 'CLASH_ROYALE');
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
