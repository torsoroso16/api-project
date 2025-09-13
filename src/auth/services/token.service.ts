import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { RefreshToken } from '../../database/entities/refresh-token.entity';
import { JwtRefreshPayload } from '../interfaces/jwt-payload.interface';
import { AUTH_CONSTANTS } from '../constants/auth.constants';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRedis() private readonly redis: Redis,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async saveRefreshToken(token: string, userId: number): Promise<void> {
    try {
      const payload = this.jwtService.decode(token) as JwtRefreshPayload;
      const tokenHash = await argon2.hash(token);
      
      const refreshToken = this.refreshTokenRepository.create({
        jti: payload.jti,
        tokenHash,
        userId,
        expiresAt: new Date(payload.exp! * 1000),
      });

      await this.refreshTokenRepository.save(refreshToken);

      // Also store in Redis for fast lookup
      const redisKey = `${AUTH_CONSTANTS.REFRESH_TOKEN_REDIS_PREFIX}${payload.jti}`;
      await this.redis.setex(
        redisKey,
        30 * 24 * 60 * 60, // 30 days in seconds
        JSON.stringify({
          userId,
          tokenHash,
          expiresAt: refreshToken.expiresAt.toISOString(),
        }),
      );
    } catch (error) {
      console.error('Error saving refresh token:', error);
      throw error;
    }
  }

  async validateRefreshToken(jti: string, token: string): Promise<RefreshToken | null> {
    try {
      // First check Redis for fast lookup
      const redisKey = `${AUTH_CONSTANTS.REFRESH_TOKEN_REDIS_PREFIX}${jti}`;
      const redisData = await this.redis.get(redisKey);

      if (redisData) {
        const { tokenHash, expiresAt } = JSON.parse(redisData);
        
        // Check if token is expired
        if (new Date() > new Date(expiresAt)) {
          await this.redis.del(redisKey);
          return null;
        }

        // Verify token hash
        const isValid = await argon2.verify(tokenHash, token);
        if (!isValid) {
          return null;
        }

        // Get from database for full record
        return this.refreshTokenRepository.findOne({
          where: { jti, isRevoked: false },
          relations: ['user'],
        });
      }

      // Fallback to database
      const refreshToken = await this.refreshTokenRepository.findOne({
        where: { jti, isRevoked: false },
        relations: ['user'],
      });

      if (!refreshToken || refreshToken.expiresAt < new Date()) {
        return null;
      }

      const isValid = await argon2.verify(refreshToken.tokenHash, token);
      return isValid ? refreshToken : null;
    } catch (error) {
      console.error('Error validating refresh token:', error);
      return null;
    }
  }

  async revokeRefreshToken(jti: string): Promise<void> {
    try {
      // Mark as revoked in database
      await this.refreshTokenRepository.update(
        { jti },
        { isRevoked: true },
      );

      // Remove from Redis
      const redisKey = `${AUTH_CONSTANTS.REFRESH_TOKEN_REDIS_PREFIX}${jti}`;
      await this.redis.del(redisKey);

      // Add to revoked tokens set in Redis
      const revokedKey = `${AUTH_CONSTANTS.REVOKED_TOKEN_REDIS_PREFIX}${jti}`;
      await this.redis.setex(revokedKey, 30 * 24 * 60 * 60, '1');
    } catch (error) {
      console.error('Error revoking refresh token:', error);
      throw error;
    }
  }

  async revokeAllUserRefreshTokens(userId: number): Promise<void> {
    try {
      // Get all active tokens for user
      const userTokens = await this.refreshTokenRepository.find({
        where: { userId, isRevoked: false },
      });

      // Revoke all in database
      await this.refreshTokenRepository.update(
        { userId, isRevoked: false },
        { isRevoked: true },
      );

      // Remove from Redis and add to revoked set
      const pipeline = this.redis.pipeline();
      
      for (const token of userTokens) {
        const redisKey = `${AUTH_CONSTANTS.REFRESH_TOKEN_REDIS_PREFIX}${token.jti}`;
        const revokedKey = `${AUTH_CONSTANTS.REVOKED_TOKEN_REDIS_PREFIX}${token.jti}`;
        
        pipeline.del(redisKey);
        pipeline.setex(revokedKey, 30 * 24 * 60 * 60, '1');
      }

      await pipeline.exec();
    } catch (error) {
      console.error('Error revoking all user tokens:', error);
      throw error;
    }
  }

  async isTokenRevoked(jti: string): Promise<boolean> {
    try {
      const revokedKey = `${AUTH_CONSTANTS.REVOKED_TOKEN_REDIS_PREFIX}${jti}`;
      const isRevoked = await this.redis.exists(revokedKey);
      return !!isRevoked;
    } catch (error) {
      console.error('Error checking if token is revoked:', error);
      return false;
    }
  }

  async cleanupExpiredTokens(): Promise<void> {
    try {
      // Remove expired tokens from database
      await this.refreshTokenRepository.delete({
        expiresAt: LessThan(new Date()),
      });

      // Note: Redis keys will expire automatically due to TTL
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error);
    }
  }
}