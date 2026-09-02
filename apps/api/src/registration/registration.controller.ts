import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import * as express from 'express';
import { RegistrationService } from './registration.service.js';
import { CreateRegistrationDto } from './dto/create-registration.dto.js';
import { SubmitEvidenceDto } from './dto/submit-evidence.dto.js';
import { ReviewPaymentDto } from './dto/review-payment.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

@Controller()
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  /**
   * POST /api/v1/tournaments/:tournamentId/registrations
   * Initiates a tournament registration for the authenticated user.
   */
  @Post('tournaments/:tournamentId/registrations')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createRegistration(
    @CurrentUser('id') userId: string,
    @Param('tournamentId') tournamentId: string,
    @Body() dto: CreateRegistrationDto,
    @Req() req: express.Request
  ) {
    const ip = (req.ip || req.headers['x-forwarded-for'] || '0.0.0.0') as string;
    return this.registrationService.createRegistration(userId, tournamentId, dto, ip);
  }

  /**
   * POST /api/v1/registrations/:id/evidence
   * Submits payment voucher for a pending registration.
   */
  @Post('registrations/:id/evidence')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async submitPaymentEvidence(
    @CurrentUser('id') userId: string,
    @Param('id') registrationId: string,
    @Body() dto: SubmitEvidenceDto
  ) {
    return this.registrationService.submitPaymentEvidence(userId, registrationId, dto);
  }

  /**
   * GET /api/v1/registrations/me
   * Returns all registrations of the authenticated user.
   */
  @Get('registrations/me')
  @UseGuards(JwtAuthGuard)
  async getMyRegistrations(@CurrentUser('id') userId: string) {
    return this.registrationService.getMyRegistrations(userId);
  }

  /**
   * GET /api/v1/tournaments/:tournamentId/participants
   * Returns confirmed participants list for a tournament.
   */
  @Get('tournaments/:tournamentId/participants')
  async getTournamentRegistrations(@Param('tournamentId') tournamentId: string) {
    return this.registrationService.getTournamentRegistrations(tournamentId);
  }

  /**
   * POST /api/v1/payments/:id/approve
   * Approves a payment and confirms slot allocation (Organizers / Admins).
   */
  @Post('payments/:id/approve')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async approvePayment(
    @CurrentUser('id') reviewerId: string,
    @Param('id') paymentId: string,
    @Body() dto: ReviewPaymentDto
  ) {
    return this.registrationService.approvePayment(reviewerId, paymentId, dto);
  }

  /**
   * POST /api/v1/payments/:id/reject
   * Rejects payment or requests correction.
   */
  @Post('payments/:id/reject')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async rejectPayment(
    @CurrentUser('id') reviewerId: string,
    @Param('id') paymentId: string,
    @Body() dto: ReviewPaymentDto
  ) {
    return this.registrationService.rejectPayment(reviewerId, paymentId, dto);
  }
}
