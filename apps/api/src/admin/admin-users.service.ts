import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UserRole } from '@prisma/client';

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * GET /admin/users
   * Returns paginated list of users with search and role filter.
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

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          role: true,
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
   * Note: The main superadmin email 'luis.galvan@tecsup.edu.pe' cannot be downgraded.
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
}
