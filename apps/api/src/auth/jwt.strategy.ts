import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_SECRET_KEY } from './auth.constants';
import type { JwtPayload } from './decorators/current-user.decorator';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    const secret = process.env[JWT_SECRET_KEY] || process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET or JWT_SECRET_KEY must be set');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  validate(payload: { sub: string; email: string; role: string; organizationId: string }): JwtPayload {
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      organizationId: payload.organizationId,
    };
  }
}
