import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private supabase: SupabaseClient;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const supabaseUrl =
      this.config.get<string>('SUPABASE_URL') ||
      'https://sxqwztaccmdnpotcfeev.supabase.co';
    const supabaseKey =
      this.config.get<string>('NEXT_PUBLIC_SUPABASE_ANON_KEY') ||
      this.config.get<string>('SUPABASE_ANON_KEY') ||
      '';

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader =
      request.headers.authorization || request.headers.Authorization;

    if (
      !authHeader ||
      typeof authHeader !== 'string' ||
      !authHeader.startsWith('Bearer ')
    ) {
      throw new UnauthorizedException('Token de autorización no proporcionado.');
    }

    const token = authHeader.substring(7).trim();
    if (!token) {
      throw new UnauthorizedException('Token de autorización inválido.');
    }

    // Verify token with Supabase Auth
    const {
      data: { user: supabaseUser },
      error,
    } = await this.supabase.auth.getUser(token);

    if (error || !supabaseUser) {
      throw new UnauthorizedException('Sesión de Supabase inválida o expirada.');
    }

    // Find user in identity.users
    let user = await this.prisma.user.findUnique({
      where: { id: supabaseUser.id },
    });

    // Fallback sync if trigger hasn't finished yet
    if (!user && supabaseUser.email) {
      const emailNormalized = supabaseUser.email.toLowerCase().trim();
      const isSuperAdmin = emailNormalized === 'luis.galvan@tecsup.edu.pe';
      const meta = supabaseUser.user_metadata || {};
      const parts = emailNormalized.split('@')[0].split('.');
      const firstName =
        meta.given_name ||
        meta.first_name ||
        (parts[0]?.charAt(0).toUpperCase() + parts[0]?.slice(1)) ||
        'Estudiante';
      const lastName =
        meta.family_name ||
        meta.last_name ||
        (parts[1]?.charAt(0).toUpperCase() + parts[1]?.slice(1)) ||
        'Tecsup';
      const avatar =
        meta.avatar_url ||
        meta.picture ||
        `https://api.dicebear.com/7.x/bottts/svg?seed=${emailNormalized}`;

      user = await this.prisma.user.create({
        data: {
          id: supabaseUser.id,
          email: emailNormalized,
          first_name: firstName,
          last_name: lastName,
          avatar_url: avatar,
          role: isSuperAdmin ? ('ADMIN' as any) : ('STUDENT' as any),
          email_verified: true,
          profile: {
            create: {
              career: 'Diseño y Desarrollo de Software',
              cycle: 4,
              biography: 'Competidor de la Arena Tecsup.',
              avatar_url: avatar,
            },
          },
        },
      });
    }

    if (!user) {
      throw new UnauthorizedException('Usuario no registrado en la plataforma.');
    }

    // Attach user to request for CurrentUser decorator and RolesGuard
    request.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      roles: [user.role],
    };

    return true;
  }
}
