import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { MailService } from '../mail/mail.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  /**
   * GET /auth/me
   * Retorna los datos completos del usuario autenticado con perfil y roles.
   */
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        avatar_url: true,
        email_verified: true,
        status: true,
        created_at: true,
        last_login_at: true,
        profile: {
          select: {
            career: true,
            cycle: true,
            biography: true,
            avatar_url: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado en la plataforma.');
    }

    return {
      ...user,
      roles: [user.role],
    };
  }

  /**
   * Sincroniza un usuario autenticado por Supabase en identity.users y profile.user_profiles
   */
  async syncSupabaseUser(supabaseUser: {
    id: string;
    email: string;
    user_metadata?: any;
  }) {
    const emailNormalized = (supabaseUser.email || '').toLowerCase().trim();

    if (!emailNormalized.endsWith('@tecsup.edu.pe')) {
      throw new ForbiddenException(
        'Acceso restringido: Solo se permite el ingreso con correos institucionales de Tecsup (@tecsup.edu.pe).'
      );
    }

    const isSuperAdmin = emailNormalized === 'luis.galvan@tecsup.edu.pe';
    const meta = supabaseUser.user_metadata || {};
    const parts = emailNormalized.split('@')[0].split('.');
    const firstName =
      meta.given_name ||
      meta.first_name ||
      parts[0]?.charAt(0).toUpperCase() + parts[0]?.slice(1) ||
      'Estudiante';
    const lastName =
      meta.family_name ||
      meta.last_name ||
      parts[1]?.charAt(0).toUpperCase() + parts[1]?.slice(1) ||
      'Tecsup';
    const avatarUrl =
      meta.avatar_url ||
      meta.picture ||
      `https://api.dicebear.com/7.x/bottts/svg?seed=${emailNormalized}`;

    let user = await this.prisma.user.findUnique({
      where: { id: supabaseUser.id },
    });

    const isNewUser = !user;

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          id: supabaseUser.id,
          email: emailNormalized,
          first_name: firstName,
          last_name: lastName,
          avatar_url: avatarUrl,
          role: isSuperAdmin ? ('ADMIN' as any) : ('STUDENT' as any),
          email_verified: true,
          profile: {
            create: {
              career: 'Diseño y Desarrollo de Software',
              cycle: 4,
              biography: 'Competidor de la Arena Tecsup.',
              avatar_url: avatarUrl,
            },
          },
        },
      });

      this.mail
        .sendOtpEmail(
          emailNormalized,
          'ACTIVADO',
          firstName,
          'Supabase Auth Session',
          true
        )
        .catch(() => {});
    } else {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          last_login_at: new Date(),
          avatar_url: avatarUrl || user.avatar_url,
          role: isSuperAdmin ? ('ADMIN' as any) : user.role,
        },
      });
    }

    return {
      is_new_user: isNewUser,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        avatar_url: user.avatar_url,
        roles: [user.role],
      },
    };
  }
}
