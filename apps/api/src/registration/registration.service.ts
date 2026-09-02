import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateRegistrationDto } from './dto/create-registration.dto.js';
import { SubmitEvidenceDto } from './dto/submit-evidence.dto.js';
import { ReviewPaymentDto, ReviewDecision } from './dto/review-payment.dto.js';

@Injectable()
export class RegistrationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * POST /tournaments/:tournamentId/registrations
   * Initiates a registration and creates the corresponding payment obligation.
   */
  async createRegistration(
    userId: string,
    tournamentId: string,
    dto: CreateRegistrationDto,
    ip: string
  ) {
    // 1. Verify tournament exists and is open for registration
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
    });

    if (!tournament || tournament.deleted_at) {
      throw new NotFoundException('Torneo no encontrado.');
    }

    if (tournament.status !== 'REGISTRATION_OPEN') {
      throw new BadRequestException('Las inscripciones para este torneo no se encuentran abiertas.');
    }

    const now = new Date();
    if (now < tournament.registration_open_at || now > tournament.registration_close_at) {
      throw new BadRequestException('El periodo de inscripción para este torneo ha finalizado o aún no comienza.');
    }

    // 2. Verify Game Profile belongs to user and matches tournament game
    const gameProfile = await this.prisma.gameProfile.findUnique({
      where: { id: dto.game_profile_id },
    });

    if (!gameProfile || gameProfile.user_id !== userId) {
      throw new BadRequestException('La cuenta de juego seleccionada no pertenece a tu perfil.');
    }

    if (gameProfile.game_code !== tournament.game_code) {
      throw new BadRequestException(
        `Este torneo es de ${tournament.game_code === 'CLASH_ROYALE' ? 'Clash Royale' : 'Brawl Stars'}, pero seleccionaste una cuenta de otro juego.`
      );
    }

    // 3. Check for existing active registration (Rule: 1 active registration per competitor per tournament)
    const existingRegistration = await this.prisma.registration.findFirst({
      where: {
        tournament_id: tournamentId,
        competitor_id: userId,
        status: {
          notIn: ['CANCELLED', 'REJECTED'],
        },
        deleted_at: null,
      },
    });

    if (existingRegistration) {
      throw new ConflictException('Ya posees una solicitud de inscripción activa para este torneo.');
    }

    // 4. Create Registration and Payment in transaction
    const isFree = Number(tournament.cost) === 0;

    return this.prisma.$transaction(async (tx) => {
      const registration = await tx.registration.create({
        data: {
          tournament_id: tournamentId,
          competitor_id: userId,
          game_profile_id: dto.game_profile_id,
          status: isFree ? 'CONFIRMED' : 'PENDING_PAYMENT',
          rules_version: dto.rules_version || 'v1.0',
          rules_acceptance_ip: ip,
          confirmed_at: isFree ? new Date() : null,
        },
      });

      const payment = await tx.payment.create({
        data: {
          registration_id: registration.id,
          amount: tournament.cost,
          currency: tournament.currency,
          method: dto.payment_method as any,
          status: isFree ? 'APPROVED' : 'PENDING',
          reviewed_at: isFree ? new Date() : null,
        },
      });

      // If free, increment current participants
      if (isFree) {
        await tx.tournament.update({
          where: { id: tournamentId },
          data: { current_participants: { increment: 1 } },
        });
      }

      return {
        registration_id: registration.id,
        tournament_name: tournament.name,
        game_name: tournament.game_code === 'CLASH_ROYALE' ? 'Clash Royale' : 'Brawl Stars',
        player_tag: gameProfile.player_tag,
        in_game_name: gameProfile.in_game_name,
        amount: Number(tournament.cost),
        currency: tournament.currency,
        status: registration.status,
        payment_id: payment.id,
        is_free: isFree,
      };
    });
  }

  /**
   * POST /registrations/:id/evidence
   * Submits payment voucher / proof of transfer.
   */
  async submitPaymentEvidence(
    userId: string,
    registrationId: string,
    dto: SubmitEvidenceDto
  ) {
    const registration = await this.prisma.registration.findUnique({
      where: { id: registrationId },
      include: { payment: true, tournament: true },
    });

    if (!registration || registration.deleted_at) {
      throw new NotFoundException('Inscripción no encontrada.');
    }

    if (registration.competitor_id !== userId) {
      throw new ForbiddenException('No tienes permisos para modificar esta inscripción.');
    }

    if (!registration.payment) {
      throw new BadRequestException('No existe una obligación de pago asociada a esta inscripción.');
    }

    if (['CONFIRMED', 'CANCELLED', 'REJECTED'].includes(registration.status)) {
      throw new BadRequestException(`No se puede subir comprobante en estado ${registration.status}.`);
    }

    // Update payment and registration status
    return this.prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: registration.payment!.id },
        data: {
          evidence_url: dto.evidence_url,
          operation_reference: dto.operation_reference,
          submitted_at: new Date(),
          status: 'UNDER_REVIEW',
        },
      });

      const updatedRegistration = await tx.registration.update({
        where: { id: registrationId },
        data: {
          status: 'PAYMENT_UNDER_REVIEW',
        },
      });

      return {
        message: 'Comprobante de pago recibido exitosamente. Tu solicitud está en revisión por el organizador.',
        registration_status: updatedRegistration.status,
        payment_status: updatedPayment.status,
        operation_reference: updatedPayment.operation_reference,
      };
    });
  }

  /**
   * GET /registrations/me
   * Returns all registrations for the authenticated user.
   */
  async getMyRegistrations(userId: string) {
    const registrations = await this.prisma.registration.findMany({
      where: {
        competitor_id: userId,
        deleted_at: null,
      },
      include: {
        tournament: {
          select: {
            id: true,
            name: true,
            slug: true,
            game_code: true,
            banner_url: true,
            tournament_start_at: true,
            prize_pool: true,
          },
        },
        game_profile: {
          select: {
            player_tag: true,
            in_game_name: true,
            trophies: true,
          },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            currency: true,
            method: true,
            status: true,
            operation_reference: true,
            evidence_url: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return registrations.map((r) => ({
      id: r.id,
      tournament_id: r.tournament.id,
      tournament_name: r.tournament.name,
      tournament_slug: r.tournament.slug,
      game_code: r.tournament.game_code,
      banner_url: r.tournament.banner_url,
      tournament_start_at: r.tournament.tournament_start_at,
      prize_pool: r.tournament.prize_pool,
      player_tag: r.game_profile.player_tag,
      in_game_name: r.game_profile.in_game_name,
      status: r.status,
      payment: r.payment
        ? {
            id: r.payment.id,
            amount: Number(r.payment.amount),
            currency: r.payment.currency,
            method: r.payment.method,
            status: r.payment.status,
            operation_reference: r.payment.operation_reference,
            evidence_url: r.payment.evidence_url,
          }
        : null,
      created_at: r.created_at,
      confirmed_at: r.confirmed_at,
      waitlisted_at: r.waitlisted_at,
    }));
  }

  /**
   * GET /tournaments/:tournamentId/registrations
   * Lists confirmed participants of a tournament.
   */
  async getTournamentRegistrations(tournamentId: string) {
    const registrations = await this.prisma.registration.findMany({
      where: {
        tournament_id: tournamentId,
        status: { in: ['CONFIRMED', 'WAITLISTED'] },
        deleted_at: null,
      },
      include: {
        competitor: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
        game_profile: {
          select: {
            player_tag: true,
            in_game_name: true,
            trophies: true,
            level: true,
          },
        },
      },
      orderBy: { confirmed_at: 'asc' },
    });

    return registrations.map((r) => ({
      id: r.id,
      competitor_name: `${r.competitor.first_name} ${r.competitor.last_name}`,
      in_game_name: r.game_profile.in_game_name,
      player_tag: r.game_profile.player_tag,
      trophies: r.game_profile.trophies,
      level: r.game_profile.level,
      status: r.status,
      confirmed_at: r.confirmed_at,
    }));
  }

  /**
   * POST /payments/:id/approve
   * Approves payment with ACID slot reservation and waiting list logic.
   */
  async approvePayment(
    reviewerId: string,
    paymentId: string,
    dto: ReviewPaymentDto
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        registration: {
          include: { tournament: true },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Pago no encontrado.');
    }

    const { registration } = payment;
    const { tournament } = registration;

    return this.prisma.$transaction(async (tx) => {
      // 1. Lock and count confirmed slots
      const confirmedCount = await tx.registration.count({
        where: {
          tournament_id: tournament.id,
          status: 'CONFIRMED',
          deleted_at: null,
        },
      });

      const hasSlot = confirmedCount < tournament.max_slots;
      const targetRegistrationStatus = hasSlot ? 'CONFIRMED' : 'WAITLISTED';

      // 2. Update Payment
      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: 'APPROVED',
          reviewed_at: new Date(),
        },
      });

      // 3. Update Registration
      const updatedRegistration = await tx.registration.update({
        where: { id: registration.id },
        data: {
          status: targetRegistrationStatus,
          confirmed_at: hasSlot ? new Date() : null,
          waitlisted_at: hasSlot ? null : new Date(),
        },
      });

      // 4. Update Tournament slots counter if confirmed
      if (hasSlot) {
        await tx.tournament.update({
          where: { id: tournament.id },
          data: { current_participants: { increment: 1 } },
        });
      }

      // 5. Create Review record
      await tx.paymentReview.create({
        data: {
          payment_id: paymentId,
          reviewer_id: reviewerId,
          decision: 'APPROVE',
          public_observation: dto.public_observation,
          internal_observation: dto.internal_observation,
        },
      });

      return {
        message: hasSlot
          ? 'Pago aprobado exitosamente. Cupo confirmado en el torneo.'
          : 'Pago aprobado. El cupo directo estaba lleno, el competidor fue agregado a la lista de espera.',
        registration_status: updatedRegistration.status,
        payment_status: updatedPayment.status,
      };
    });
  }

  /**
   * POST /payments/:id/reject
   * Rejects payment or requests correction.
   */
  async rejectPayment(
    reviewerId: string,
    paymentId: string,
    dto: ReviewPaymentDto
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { registration: true },
    });

    if (!payment) {
      throw new NotFoundException('Pago no encontrado.');
    }

    const isCorrection = dto.decision === ReviewDecision.REQUEST_CORRECTION;
    const targetRegistrationStatus = isCorrection ? 'CORRECTION_REQUIRED' : 'REJECTED';
    const targetPaymentStatus = isCorrection ? 'CORRECTION_REQUIRED' : 'REJECTED';

    return this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: targetPaymentStatus as any,
          reviewed_at: new Date(),
        },
      });

      await tx.registration.update({
        where: { id: payment.registration_id },
        data: {
          status: targetRegistrationStatus as any,
        },
      });

      await tx.paymentReview.create({
        data: {
          payment_id: paymentId,
          reviewer_id: reviewerId,
          decision: dto.decision,
          public_observation: dto.public_observation,
          internal_observation: dto.internal_observation,
        },
      });

      return {
        message: isCorrection
          ? 'Se ha solicitado corrección de comprobante al competidor.'
          : 'Pago rechazado.',
        decision: dto.decision,
      };
    });
  }
}
