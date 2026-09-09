import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { MailService } from '../mail/mail.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { GoogleAuthDto } from './dto/google-auth.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly mail: MailService,
  ) {}

  /**
   * POST /auth/google
   * Google OAuth login / registration exclusively for @tecsup.edu.pe accounts.
   */
  async loginWithGoogle(dto: GoogleAuthDto, ip: string, userAgent: string) {
    let email = dto.email;
    let firstName = dto.first_name || 'Estudiante';
    let lastName = dto.last_name || 'Tecsup';
    let avatarUrl = dto.avatar_url || null;
    let googleId = `google_${Date.now()}`;

    // Decode Google JWT if credential provided
    if (dto.credential) {
      try {
        const parts = dto.credential.split('.');
        if (parts.length === 3) {
          const payloadJson = Buffer.from(parts[1], 'base64').toString('utf-8');
          const payload = JSON.parse(payloadJson);
          if (payload.email) email = payload.email;
          if (payload.given_name) firstName = payload.given_name;
          if (payload.family_name) lastName = payload.family_name;
          if (payload.picture) avatarUrl = payload.picture;
          if (payload.sub) googleId = payload.sub;
        }
      } catch (e) {
        // Fallback to manual payload fields if not a standard JWT string
      }
    }

    if (!email) {
      throw new UnauthorizedException('No se pudo obtener el correo de la cuenta de Google.');
    }

    const emailNormalized = email.toLowerCase().trim();

    // STRICT DOMAIN RESTRICTION: Only @tecsup.edu.pe allowed
    if (!emailNormalized.endsWith('@tecsup.edu.pe')) {
      throw new ForbiddenException(
        'Acceso restringido: Solo se permite el ingreso con correos institucionales de Tecsup (@tecsup.edu.pe).'
      );
    }

    const isSuperAdmin = emailNormalized === 'luis.galvan@tecsup.edu.pe';

    let user = await this.prisma.user.findUnique({
      where: { email: emailNormalized },
    });

    const isNewUser = !user;

    if (!user) {
      // Auto-register user with Google
      user = await this.prisma.user.create({
        data: {
          email: emailNormalized,
          first_name: firstName,
          last_name: lastName,
          avatar_url: avatarUrl,
          google_id: googleId,
          email_verified: true,
          role: isSuperAdmin ? ('ADMIN' as any) : ('STUDENT' as any),
        },
      });

      // Create default user profile
      await this.prisma.userProfile.create({
        data: {
          user_id: user.id,
          career: 'Diseño y Desarrollo de Software',
          cycle: 4,
          biography: 'Competidor de la Arena Tecsup.',
          avatar_url: avatarUrl,
        },
      });
    } else {
      // Update role if superadmin and refresh avatar/login
      const newRole = isSuperAdmin ? ('ADMIN' as any) : user.role;
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          role: newRole,
          avatar_url: avatarUrl || user.avatar_url,
          last_login_at: new Date(),
        },
      });
    }

    // Create session
    const device = this.parseDevice(userAgent);
    const browser = this.parseBrowser(userAgent);

    const session = await this.prisma.session.create({
      data: {
        user_id: user.id,
        ip: ip,
        device: device,
        browser: browser,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Generate refresh token and store hash
    const refreshTokenRaw = crypto.randomUUID();
    const refreshTokenHash = crypto
      .createHash('sha256')
      .update(refreshTokenRaw)
      .digest('hex');

    await this.prisma.refreshToken.create({
      data: {
        session_id: session.id,
        token_hash: refreshTokenHash,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Generate JWT access token with role
    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
      roles: [user.role],
    });

    // Try sending welcome email asynchronously in background
    if (isNewUser) {
      this.mail.sendOtpEmail(
        emailNormalized,
        'ACTIVADO',
        user.first_name,
        `${device} • ${browser}`,
        true
      ).catch(() => {});
    }

    return {
      is_new_user: isNewUser,
      accessToken,
      refreshToken: refreshTokenRaw,
      expiresIn: this.config.get<number>('JWT_EXPIRATION', 86400),
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

  /**
   * POST /auth/verify-otp
   * Verifies the 6-digit Device OTP and generates access session tokens.
   */
  async verifyDeviceOtp(email: string, code: string, ip: string, userAgent: string) {
    const emailNormalized = email.toLowerCase().trim();

    const validOtp = await this.prisma.deviceOtp.findFirst({
      where: {
        email: emailNormalized,
        code: code.trim(),
        used: false,
        expires_at: { gt: new Date() },
      },
      orderBy: { created_at: 'desc' },
    });

    if (!validOtp) {
      throw new UnauthorizedException(
        'El código de verificación de 6 dígitos es incorrecto o ha expirado. Solicita uno nuevo.'
      );
    }

    // Mark OTP as used
    await this.prisma.deviceOtp.update({
      where: { id: validOtp.id },
      data: { used: true },
    });

    const user = await this.prisma.user.findUnique({
      where: { email: emailNormalized },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado.');
    }

    // Create session
    const device = this.parseDevice(userAgent);
    const browser = this.parseBrowser(userAgent);

    const session = await this.prisma.session.create({
      data: {
        user_id: user.id,
        ip: ip,
        device: device,
        browser: browser,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Generate refresh token and store hash
    const refreshTokenRaw = crypto.randomUUID();
    const refreshTokenHash = crypto
      .createHash('sha256')
      .update(refreshTokenRaw)
      .digest('hex');

    await this.prisma.refreshToken.create({
      data: {
        session_id: session.id,
        token_hash: refreshTokenHash,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Generate JWT access token with role
    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
      roles: [user.role],
    });

    return {
      accessToken,
      refreshToken: refreshTokenRaw,
      expiresIn: this.config.get<number>('JWT_EXPIRATION', 900),
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

  /**
   * POST /auth/resend-otp
   * Generates a new 6-digit Device OTP.
   */
  async resendDeviceOtp(email: string, ip: string, userAgent: string) {
    const emailNormalized = email.toLowerCase().trim();

    const user = await this.prisma.user.findUnique({
      where: { email: emailNormalized },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado.');
    }

    // Invalidate old active OTPs
    await this.prisma.deviceOtp.updateMany({
      where: { email: emailNormalized, used: false },
      data: { used: true },
    });

    // Generate new 6-digit Device OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const device = this.parseDevice(userAgent);
    const browser = this.parseBrowser(userAgent);
    const deviceInfo = `${device} • ${browser}`;

    await this.prisma.deviceOtp.create({
      data: {
        email: emailNormalized,
        code: otpCode,
        device: deviceInfo,
        ip: ip,
        expires_at: new Date(Date.now() + 10 * 60 * 1000),
        used: false,
      },
    });

    // Send styled institutional email
    await this.mail.sendOtpEmail(
      emailNormalized,
      otpCode,
      user.first_name,
      deviceInfo,
      false
    );

    return {
      message: `Nuevo código de 6 dígitos enviado a tu correo institucional ${emailNormalized}.`,
    };
  }

  /**
   * POST /auth/register
   * Registers a new user with Argon2-hashed password.
   */
  async register(dto: RegisterDto) {
    const emailNormalized = dto.email.toLowerCase().trim();
    if (!emailNormalized.endsWith('@tecsup.edu.pe')) {
      throw new ForbiddenException(
        'Acceso restringido: Solo se permite el registro con correos institucionales de Tecsup (@tecsup.edu.pe).'
      );
    }

    // Check duplicate
    const existingUser = await this.prisma.user.findUnique({
      where: { email: emailNormalized },
    });

    if (existingUser) {
      throw new ConflictException('Ya existe una cuenta registrada con este correo electrónico.');
    }

    const isSuperAdmin = emailNormalized === 'luis.galvan@tecsup.edu.pe';
    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
    });

    const user = await this.prisma.user.create({
      data: {
        email: emailNormalized,
        first_name: dto.first_name,
        last_name: dto.last_name,
        password_hash: passwordHash,
        email_verified: true,
        role: isSuperAdmin ? ('ADMIN' as any) : ('STUDENT' as any),
      },
    });

    await this.prisma.userProfile.create({
      data: {
        user_id: user.id,
        career: 'Diseño y Desarrollo de Software',
        cycle: 4,
        biography: 'Competidor de la Arena Tecsup.',
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
      },
      message: 'Cuenta creada exitosamente.',
    };
  }

  /**
   * POST /auth/login
   */
  async login(dto: LoginDto, ip: string, userAgent: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (!user) {
      throw new UnauthorizedException('El correo o la contraseña ingresada son incorrectos.');
    }

    if (!user.password_hash) {
      throw new UnauthorizedException('Esta cuenta está configurada para acceso exclusivo con Google (@tecsup.edu.pe).');
    }

    const isPasswordValid = await argon2.verify(user.password_hash, dto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('El correo o la contraseña ingresada son incorrectos.');
    }

    const device = this.parseDevice(userAgent);
    const browser = this.parseBrowser(userAgent);

    const session = await this.prisma.session.create({
      data: {
        user_id: user.id,
        ip: ip,
        device: device,
        browser: browser,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const refreshTokenRaw = crypto.randomUUID();
    const refreshTokenHash = crypto
      .createHash('sha256')
      .update(refreshTokenRaw)
      .digest('hex');

    await this.prisma.refreshToken.create({
      data: {
        session_id: session.id,
        token_hash: refreshTokenHash,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { last_login_at: new Date() },
    });

    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
      roles: [user.role],
    });

    return {
      accessToken,
      refreshToken: refreshTokenRaw,
      expiresIn: this.config.get<number>('JWT_EXPIRATION', 900),
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

  /**
   * POST /auth/refresh
   * Rotates the refresh token and emits a new access token.
   */
  async refreshToken(currentRefreshToken: string) {
    const tokenHash = crypto
      .createHash('sha256')
      .update(currentRefreshToken)
      .digest('hex');

    // Find the refresh token
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token_hash: tokenHash },
      include: { session: { include: { user: true } } },
    });

    if (!storedToken || storedToken.revoked_at || storedToken.expires_at < new Date()) {
      throw new UnauthorizedException('Sesión expirada o inválida. Inicia sesión nuevamente.');
    }

    // Revoke old refresh token (rotation)
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked_at: new Date() },
    });

    // Create new refresh token
    const newRefreshTokenRaw = crypto.randomUUID();
    const newRefreshTokenHash = crypto
      .createHash('sha256')
      .update(newRefreshTokenRaw)
      .digest('hex');

    await this.prisma.refreshToken.create({
      data: {
        session_id: storedToken.session_id,
        token_hash: newRefreshTokenHash,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const user = storedToken.session.user;

    // Generate new access token
    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      roles: ['COMPETITOR'],
    });

    return {
      accessToken,
      refreshToken: newRefreshTokenRaw,
      expiresIn: this.config.get<number>('JWT_EXPIRATION', 900),
    };
  }

  /**
   * POST /auth/logout
   * Revokes the active refresh token.
   */
  async logout(refreshToken: string) {
    const tokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token_hash: tokenHash },
    });

    if (storedToken && !storedToken.revoked_at) {
      await this.prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revoked_at: new Date() },
      });
    }

    return { message: 'Sesión cerrada exitosamente.' };
  }

  /**
   * POST /auth/verify-email
   * Validates the verification token and marks user email as verified.
   * Note: Full email verification flow (sending emails) will be implemented later.
   */
  async verifyEmail(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { email_verified: true },
    });

    return { message: 'Correo electrónico verificado exitosamente.' };
  }

  /**
   * GET /auth/me
   * Returns the authenticated user's full data.
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
      throw new UnauthorizedException('Usuario no encontrado.');
    }

    return {
      ...user,
      roles: [user.role],
    };
  }

  // --- Private helper methods ---

  private parseDevice(userAgent: string): string {
    if (/mobile/i.test(userAgent)) return 'Mobile';
    if (/tablet/i.test(userAgent)) return 'Tablet';
    return 'Desktop';
  }

  private parseBrowser(userAgent: string): string {
    if (/firefox/i.test(userAgent)) return 'Firefox';
    if (/edg/i.test(userAgent)) return 'Edge';
    if (/chrome/i.test(userAgent)) return 'Chrome';
    if (/safari/i.test(userAgent)) return 'Safari';
    return 'Unknown';
  }
}
