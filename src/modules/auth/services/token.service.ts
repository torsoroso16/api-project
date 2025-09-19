import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { TokenServiceInterface, JwtPayload, JwtRefreshPayload, TokenPair } from '../../../core/interfaces/services/token.service.interface';

@Injectable()
export class TokenService implements TokenServiceInterface {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async generateAccessToken(payload: JwtPayload): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '10m'),
    });
  }

  async generateRefreshToken(payload: JwtRefreshPayload): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '30d'),
    });
  }

  async generateTokenPair(user: { id: number; email: string; roles: string[] }): Promise<TokenPair> {
    const accessPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
    };

    const refreshJti = uuidv4();
    const refreshPayload: JwtRefreshPayload = {
      sub: user.id,
      jti: refreshJti,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(accessPayload),
      this.generateRefreshToken(refreshPayload)
    ]);

    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string): JwtPayload {
    return this.jwtService.verify<JwtPayload>(token, {
      secret: this.configService.get<string>('JWT_SECRET'),
    });
  }

  verifyRefreshToken(token: string): JwtRefreshPayload {
    return this.jwtService.verify<JwtRefreshPayload>(token, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });
  }

  decodeToken(token: string): any {
    return this.jwtService.decode(token);
  }
}