import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import * as passportJwt from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

const Strategy = (passportJwt as any).Strategy || (passportJwt as any).default?.Strategy;
const ExtractJwt = (passportJwt as any).ExtractJwt || (passportJwt as any).default?.ExtractJwt;

export interface JwtPayload {
  sub: string;
  email: string;
  roles?: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: (req: any) => {
        if (req?.headers) {
          const auth = req.headers.authorization || req.headers.Authorization;
          if (auth && typeof auth === 'string' && auth.startsWith('Bearer ')) {
            return auth.slice(7).trim();
          }
        }
        return ExtractJwt ? ExtractJwt.fromAuthHeaderAsBearerToken()(req) : null;
      },
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') || 'campus-arena-jwt-secret-change-in-production-2026',
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Token inválido.');
    }
    return {
      id: payload.sub,
      email: payload.email,
      roles: payload.roles || ['COMPETITOR'],
    };
  }
}
