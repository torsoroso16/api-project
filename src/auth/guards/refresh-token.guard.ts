import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SecurityService } from '../services/security.service';
import { AUTH_CONSTANTS } from '../constants/auth.constants';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly securityService: SecurityService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const refreshToken = request.cookies?.[AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE_NAME];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Check for token reuse
      const isTokenReused = await this.securityService.detectTokenReuse(payload.jti);
      if (isTokenReused) {
        await this.securityService.logSecurityEvent(
          'REFRESH_TOKEN_REUSE_DETECTED',
          payload.sub,
          { jti: payload.jti }
        );
        throw new UnauthorizedException('Token reuse detected');
      }

      request.refreshTokenPayload = payload;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}