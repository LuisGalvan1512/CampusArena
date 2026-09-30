import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UserRole } from '@prisma/client';
import { CreateSanctionDto, RevokeSanctionDto } from './dto/create-sanction.dto.js';
import { ReviewAppealDto } from './dto/review-appeal.dto.js';

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * GET /admin/users
   * Returns paginated list of users with search, role filter, nicknames, and active sanctions.
   */
  async findAll(search?: string, role?: UserRole, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (role) {
      where.role = role;
    }

    if (search && search.trim().length > 0) {
      const q = search.trim();
      where.OR = [
        { email: { contains: q, mode: 'insensitive' } },
        { first_name: { contains: q, mode: 'insensitive' } },
        { last_name: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [total, rawUsers] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          role: true,
          status: true,
          avatar_url: true,
          created_at: true,
          last_login_at: true,
          profile: {
            select: {
              career: true,
              cycle: true,
            },
          },
          _count: {
            select: {
              registrations: true,
            },
          },
        },
        orderBy: [{ role: 'asc' }, { created_at: 'desc' }],
        skip,
        take: limit,
      }),
    ]);

    const userIds = rawUsers.map((u) => u.id);
    const nicknamesMap: Record<string, string> = {};
    const sanctionsMap: Record<string, any> = {};

    if (userIds.length > 0) {
      try {
        const [nicks, sanctions] = await Promise.all([
          this.prisma.$queryRawUnsafe<any[]>(
            `SELECT user_id, nickname FROM profile.user_profiles WHERE user_id = ANY($1::uuid[]) AND nickname IS NOT NULL`,
            userIds
          ),
          this.prisma.$queryRawUnsafe<any[]>(
            `SELECT 
               s.id, s.user_id, s.type, s.reason, s.starts_at, s.ends_at, s.status, s.created_at,
               (SELECT COUNT(*)::int FROM identity.sanction_appeals a WHERE a.sanction_id = s.id AND a.status = 'PENDING') as pending_appeals_count
             FROM identity.user_sanctions s
             WHERE s.user_id = ANY($1::uuid[]) 
               AND s.status = 'ACTIVE' 
               AND (s.ends_at IS NULL OR s.ends_at > NOW())
             ORDER BY s.created_at DESC`,
            userIds
          ),
        ]);

        for (const n of nicks) {
          if (n.nickname) nicknamesMap[n.user_id] = n.nickname;
        }

        for (const s of sanctions) {
          // Keep the latest active sanction per user
          if (!sanctionsMap[s.user_id]) {
            sanctionsMap[s.user_id] = s;
          }
        }
      } catch (err) {
        // Fallback gracefully if raw queries fail
      }
    }

    const users = rawUsers.map((u) => ({
      ...u,
      profile: {
        ...u.profile,
        nickname: nicknamesMap[u.id] || null,
      },
      active_sanction: sanctionsMap[u.id] || null,
    }));

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * PATCH /admin/users/:id/role
   * Updates user role (STUDENT, ORGANIZER, ADMIN).
   */
  async updateUserRole(id: string, newRole: UserRole, currentAdminId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    if (user.email === 'luis.galvan@tecsup.edu.pe' && newRole !== 'ADMIN') {
      throw new BadRequestException('El Super Administrador principal no puede ser degradado.');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { role: newRole },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
      },
    });

    return {
      message: `Rol del usuario ${updated.first_name} ${updated.last_name} actualizado a ${newRole}.`,
      user: updated,
    };
  }

  /**
   * POST /admin/users/:id/sanctions
   * Applies MUTE, BAN_TEMPORARY, or BAN_PERMANENT.
   */
  async createSanction(targetUserId: string, dto: CreateSanctionDto, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    if (user.email === 'luis.galvan@tecsup.edu.pe') {
      throw new BadRequestException('El Super Administrador principal no puede ser sancionado.');
    }

    if (user.id === adminId) {
      throw new BadRequestException('No puedes sancionar tu propia cuenta.');
    }

    // 1. Calculate expiration
    let endsAt: Date | null = null;
    if (dto.duration_days && dto.type !== 'BAN_PERMANENT') {
      endsAt = new Date();
      endsAt.setDate(endsAt.getDate() + dto.duration_days);
    }

    // 2. Revoke any previous active sanction
    await this.prisma.$executeRawUnsafe(
      `UPDATE identity.user_sanctions 
       SET status = 'REVOKED', revoked_at = NOW(), revoke_reason = 'Reemplazada por nueva sanción'
       WHERE user_id = $1::uuid AND status = 'ACTIVE'`,
      targetUserId
    );

    // 3. Insert new sanction
    const result: any[] = await this.prisma.$queryRawUnsafe(
      `INSERT INTO identity.user_sanctions (id, user_id, admin_id, type, reason, status, starts_at, ends_at, created_at)
       VALUES (gen_random_uuid(), $1::uuid, $2::uuid, $3, $4, 'ACTIVE', NOW(), $5, NOW())
       RETURNING *`,
      targetUserId,
      adminId,
      dto.type,
      dto.reason,
      endsAt
    );

    // 4. Update user status in identity.users if it's a ban
    if (dto.type === 'BAN_TEMPORARY' || dto.type === 'BAN_PERMANENT') {
      await this.prisma.user.update({
        where: { id: targetUserId },
        data: { status: 'SUSPENDED' },
      });
    }

    // 5. Notify the user
    try {
      const typeLabel = dto.type === 'MUTE' ? 'Silencio comunitario' : 'Suspensión de cuenta';
      const durationLabel = endsAt ? `hasta el ${endsAt.toLocaleDateString()}` : 'permanente';
      await this.prisma.$executeRawUnsafe(
        `INSERT INTO identity.notifications (id, user_id, type, title, message, link, link_label, is_read, created_at)
         VALUES (gen_random_uuid(), $1::uuid, 'SANCTION', 'Aviso de Sanción Disciplinaria', $2, '/profile', 'Ver Estado', false, NOW())`,
        targetUserId,
        `Se ha aplicado una sanción de ${typeLabel} (${durationLabel}). Motivo: ${dto.reason}. Tienes derecho a enviar una apelación si consideras que es un error.`
      );
    } catch (err) {}

    return {
      message: `Sanción (${dto.type}) aplicada correctamente a ${user.first_name} ${user.last_name}.`,
      sanction: result[0],
    };
  }

  /**
   * POST /admin/users/sanctions/:sanctionId/revoke
   * Revokes an active sanction.
   */
  async revokeSanction(sanctionId: string, dto: RevokeSanctionDto, adminId: string) {
    const sanctions: any[] = await this.prisma.$queryRawUnsafe(
      `SELECT * FROM identity.user_sanctions WHERE id = $1::uuid`,
      sanctionId
    );

    if (!sanctions || sanctions.length === 0) {
      throw new NotFoundException('Sanción no encontrada.');
    }

    const sanction = sanctions[0];

    // Revoke sanction
    await this.prisma.$executeRawUnsafe(
      `UPDATE identity.user_sanctions 
       SET status = 'REVOKED', revoked_at = NOW(), revoked_by = $1::uuid, revoke_reason = $2
       WHERE id = $3::uuid`,
      adminId,
      dto.revoke_reason || 'Levantada por decisión administrativa',
      sanctionId
    );

    // Restore user status if no other active bans exist
    const otherBans: any[] = await this.prisma.$queryRawUnsafe(
      `SELECT id FROM identity.user_sanctions 
       WHERE user_id = $1::uuid AND status = 'ACTIVE' AND type IN ('BAN_TEMPORARY', 'BAN_PERMANENT') AND (ends_at IS NULL OR ends_at > NOW())`,
      sanction.user_id
    );

    if (otherBans.length === 0) {
      await this.prisma.user.update({
        where: { id: sanction.user_id },
        data: { status: 'ACTIVE' },
      });
    }

    // Notify user
    try {
      await this.prisma.$executeRawUnsafe(
        `INSERT INTO identity.notifications (id, user_id, type, title, message, link, link_label, is_read, created_at)
         VALUES (gen_random_uuid(), $1::uuid, 'SANCTION_REVOKED', 'Sanción Levantada', $2, '/profile', 'Ver Perfil', false, NOW())`,
        sanction.user_id,
        `Tu sanción previa (${sanction.type}) ha sido levantada por el equipo administrativo. ¡Bienvenido de vuelta!`
      );
    } catch (err) {}

    return { message: 'Sanción revocada exitosamente.' };
  }

  /**
   * DELETE /admin/users/:id
   * Soft-deletes / deactivates a user.
   */
  async softDeleteUser(targetUserId: string, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) throw new NotFoundException('Usuario no encontrado.');

    if (user.email === 'luis.galvan@tecsup.edu.pe') {
      throw new BadRequestException('El Super Administrador principal no puede ser eliminado.');
    }

    if (user.id === adminId) {
      throw new BadRequestException('No puedes desactivar tu propia cuenta.');
    }

    await this.prisma.$executeRawUnsafe(
      `UPDATE identity.users SET status = 'INACTIVE', deleted_at = NOW() WHERE id = $1::uuid`,
      targetUserId
    );

    return { message: `La cuenta de ${user.first_name} ${user.last_name} ha sido desactivada.` };
  }

  /**
   * POST /admin/users/:id/restore
   * Restores a soft-deleted / inactive user.
   */
  async restoreUser(targetUserId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) throw new NotFoundException('Usuario no encontrado.');

    await this.prisma.$executeRawUnsafe(
      `UPDATE identity.users SET status = 'ACTIVE', deleted_at = NULL WHERE id = $1::uuid`,
      targetUserId
    );

    return { message: `La cuenta de ${user.first_name} ${user.last_name} ha sido reactivada.` };
  }

  /**
   * GET /admin/moderation/appeals
   * Returns list of appeals.
   */
  async findAllAppeals(status?: string) {
    const appeals: any[] = await this.prisma.$queryRawUnsafe(
      `SELECT 
         a.id, a.sanction_id, a.user_id, a.appeal_text, a.status, a.admin_response, a.reviewed_at, a.created_at,
         u.first_name, u.last_name, u.email,
         s.type as sanction_type, s.reason as sanction_reason, s.starts_at as sanction_starts_at, s.ends_at as sanction_ends_at, s.status as sanction_status,
         p.nickname
       FROM identity.sanction_appeals a
       JOIN identity.users u ON a.user_id = u.id
       JOIN identity.user_sanctions s ON a.sanction_id = s.id
       LEFT JOIN profile.user_profiles p ON a.user_id = p.user_id
       WHERE ($1::varchar IS NULL OR a.status = $1)
       ORDER BY a.created_at DESC`,
      status || null
    );

    return appeals;
  }

  /**
   * PATCH /admin/moderation/appeals/:id
   * Reviews and resolves a student's sanction appeal.
   */
  async reviewAppeal(appealId: string, dto: ReviewAppealDto, adminId: string) {
    const appeals: any[] = await this.prisma.$queryRawUnsafe(
      `SELECT a.*, s.user_id as sanction_user_id, s.id as actual_sanction_id
       FROM identity.sanction_appeals a
       JOIN identity.user_sanctions s ON a.sanction_id = s.id
       WHERE a.id = $1::uuid`,
      appealId
    );

    if (!appeals || appeals.length === 0) {
      throw new NotFoundException('Apelación no encontrada.');
    }

    const appeal = appeals[0];

    if (dto.action === 'APPROVE') {
      // 1. Mark appeal approved
      await this.prisma.$executeRawUnsafe(
        `UPDATE identity.sanction_appeals
         SET status = 'APPROVED', admin_response = $1, reviewed_by = $2::uuid, reviewed_at = NOW()
         WHERE id = $3::uuid`,
        dto.admin_response || 'Apelación aprobada. Se levanta la sanción.',
        adminId,
        appealId
      );

      // 2. Revoke the sanction
      await this.revokeSanction(appeal.actual_sanction_id, { revoke_reason: 'Apelación aprobada' }, adminId);

      return { message: 'Apelación aprobada y sanción levantada exitosamente.' };
    } else {
      // Mark appeal rejected
      await this.prisma.$executeRawUnsafe(
        `UPDATE identity.sanction_appeals
         SET status = 'REJECTED', admin_response = $1, reviewed_by = $2::uuid, reviewed_at = NOW()
         WHERE id = $3::uuid`,
        dto.admin_response || 'Apelación rechazada tras revisión de la evidencia.',
        adminId,
        appealId
      );

      // Notify user
      try {
        await this.prisma.$executeRawUnsafe(
          `INSERT INTO identity.notifications (id, user_id, type, title, message, link, link_label, is_read, created_at)
           VALUES (gen_random_uuid(), $1::uuid, 'APPEAL_REJECTED', 'Apelación Revisada', $2, '/profile', 'Ver Estado', false, NOW())`,
          appeal.user_id,
          `Tu apelación fue evaluada y ha sido RECHAZADA. Respuesta administrativa: "${dto.admin_response || 'La sanción se mantiene vigente.'}"`
        );
      } catch (err) {}

      return { message: 'Apelación rechazada.' };
    }
  }
}

