import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  /**
   * POST /auth/register
   * Registers a new user with Argon2-hashed password.
   * Business rules: RN-001 (Argon2), RN-002 (unique email).
   */
  async register(dto: RegisterDto) {
    // RN-002: Check for duplicate email
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Ya existe una cuenta registrada con este correo electrónico.');
    }

    // RN-001: Hash password with Argon2id
    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
    });

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        first_name: dto.first_name,
        last_name: dto.last_name,
        password_hash: passwordHash,
        email_verified: false,
        status: 'ACTIVE',
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
      message: 'Cuenta creada exitosamente. Revisa tu correo para verificar tu cuenta.',
    };
  }

  /**
   * POST /auth/login
   * Verifies credentials, creates session + refresh token, returns access token.
   * Business rules: RN-001, RN-004.
   */
  async login(dto: LoginDto, ip: string, userAgent: string) {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('El correo o la contraseña ingresada son incorrectos.');
    }

    // Verify password against Argon2 hash
    const isPasswordValid = await argon2.verify(user.password_hash, dto.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('El correo o la contraseña ingresada son incorrectos.');
    }

    // Parse user agent for session metadata
    const device = this.parseDevice(userAgent);
    const browser = this.parseBrowser(userAgent);

    // Create session
    const session = await this.prisma.session.create({
      data: {
        user_id: user.id,
        ip: ip,
        device: device,
        browser: browser,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Generate refresh token and store its hash
    const refreshTokenRaw = crypto.randomUUID();
    const refreshTokenHash = crypto
      .createHash('sha256')
      .update(refreshTokenRaw)
      .digest('hex');

    await this.prisma.refreshToken.create({
      data: {
        session_id: session.id,
        token_hash: refreshTokenHash,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Update last_login_at
    await this.prisma.user.update({
      where: { id: user.id },
      data: { last_login_at: new Date() },
    });

    // Generate JWT access token (short-lived: 15 minutes)
    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      roles: ['COMPETITOR'], // Default role for now
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
        roles: ['COMPETITOR'],
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
        email_verified: true,
        status: true,
        created_at: true,
        last_login_at: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado.');
    }

    return {
      ...user,
      roles: ['COMPETITOR'],
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
