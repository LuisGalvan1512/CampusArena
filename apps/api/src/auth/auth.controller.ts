import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import * as express from 'express';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { GoogleAuthDto } from './dto/google-auth.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { CurrentUser } from './decorators/current-user.decorator.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/v1/auth/google
   * Google OAuth login and registration with automatic session issuance and onboarding flag.
   */
  @Post('google')
  @HttpCode(HttpStatus.OK)
  async googleAuth(
    @Body() dto: GoogleAuthDto,
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const ip = (req.ip || req.headers['x-forwarded-for'] || '0.0.0.0') as string;
    const userAgent = req.headers['user-agent'] || 'Unknown';

    const result = await this.authService.loginWithGoogle(dto, ip, userAgent);

    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return {
      is_new_user: result.is_new_user,
      access_token: result.accessToken,
      expires_in: result.expiresIn,
      user: result.user,
    };
  }

  /**
   * POST /api/v1/auth/verify-otp
   * Validates the 6-digit Device OTP and emits JWT session cookies & token.
   */
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(
    @Body() dto: { email: string; code: string },
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const ip = (req.ip || req.headers['x-forwarded-for'] || '0.0.0.0') as string;
    const userAgent = req.headers['user-agent'] || 'Unknown';

    const result = await this.authService.verifyDeviceOtp(dto.email, dto.code, ip, userAgent);

    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return {
      access_token: result.accessToken,
      expires_in: result.expiresIn,
      user: result.user,
    };
  }

  /**
   * POST /api/v1/auth/resend-otp
   * Resends a fresh 6-digit Device OTP code.
   */
  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  async resendOtp(
    @Body() dto: { email: string },
    @Req() req: express.Request,
  ) {
    const ip = (req.ip || req.headers['x-forwarded-for'] || '0.0.0.0') as string;
    const userAgent = req.headers['user-agent'] || 'Unknown';

    return this.authService.resendDeviceOtp(dto.email, ip, userAgent);
  }

  /**
   * POST /api/v1/auth/register
   * Registers a new user account.
   */
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /**
   * POST /api/v1/auth/login
   * Authenticates user and returns access token + refresh token cookie.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const ip = (req.ip || req.headers['x-forwarded-for'] || '0.0.0.0') as string;
    const userAgent = req.headers['user-agent'] || 'Unknown';

    const result = await this.authService.login(dto, ip, userAgent);

    // Set refresh token in httpOnly secure cookie (Auth.spec.md section 2)
    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    return {
      access_token: result.accessToken,
      expires_in: result.expiresIn,
      user: result.user,
    };
  }

  /**
   * POST /api/v1/auth/refresh
   * Reads refresh_token cookie, rotates it, and returns a new access token.
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const currentRefreshToken = (req as any).cookies?.['refresh_token'] as string | undefined;

    if (!currentRefreshToken) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        error: {
          code: 'NO_REFRESH_TOKEN',
          message: 'No se encontró un token de sesión válido.',
          details: null,
        },
      });
      return;
    }

    const result = await this.authService.refreshToken(currentRefreshToken);

    // Set new rotated refresh token cookie
    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return {
      access_token: result.accessToken,
      expires_in: result.expiresIn,
    };
  }

  /**
   * POST /api/v1/auth/logout
   * Revokes refresh token and clears the cookie.
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const refreshToken = (req as any).cookies?.['refresh_token'] as string | undefined;

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    // Clear the cookie
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return { message: 'Sesión cerrada exitosamente.' };
  }

  /**
   * POST /api/v1/auth/verify-email
   * Placeholder: Full email verification with tokens will be implemented
   * when the email service is integrated.
   */
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body('token') token: string) {
    // TODO: Implement full email verification token lookup
    // For now this is a stub that will be completed with the email service
    return { message: 'Verificación de correo pendiente de implementación completa.' };
  }

  /**
   * GET /api/v1/auth/me
   * Returns the currently authenticated user's data.
   * Protected by JWT Guard.
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: { id: string; email: string; roles: string[] }) {
    return this.authService.getMe(user.id);
  }
}
