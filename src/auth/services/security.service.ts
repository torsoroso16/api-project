import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RefreshToken } from '../../database/entities/refresh-token.entity';
import { AUTH_CONSTANTS } from '../constants/auth.constants';

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);

  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  // Clean up expired tokens every hour
  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredTokens() {
    try {
      this.logger.log('Starting cleanup of expired tokens...');

      // Remove expired refresh tokens from database
      const deletedResult = await this.refreshTokenRepository.delete({
        expiresAt: LessThan(new Date()),
      });

      this.logger.log(`Cleaned up ${deletedResult.affected} expired refresh tokens`);

      // Clean up expired Redis keys (they should expire automatically, but let's be sure)
      const pattern = `${AUTH_CONSTANTS.REFRESH_TOKEN_REDIS_PREFIX}*`;
      const keys = await this.redis.keys(pattern);
      
      let expiredKeysCount = 0;
      for (const key of keys) {
        const ttl = await this.redis.ttl(key);
        if (ttl === -2) { // Key doesn't exist
          expiredKeysCount++;
        }
      }

      this.logger.log(`Found ${expiredKeysCount} expired Redis keys`);
    } catch (error) {
      this.logger.error('Error during token cleanup:', error);
    }
  }

  // Clean up revoked tokens from Redis weekly
  @Cron(CronExpression.EVERY_WEEK)
  async cleanupRevokedTokens() {
    try {
      this.logger.log('Starting cleanup of revoked tokens...');

      const pattern = `${AUTH_CONSTANTS.REVOKED_TOKEN_REDIS_PREFIX}*`;
      const keys = await this.redis.keys(pattern);
      
      let cleanedCount = 0;
      for (const key of keys) {
        const ttl = await this.redis.ttl(key);
        if (ttl <= 0) {
          await this.redis.del(key);
          cleanedCount++;
        }
      }

      this.logger.log(`Cleaned up ${cleanedCount} expired revoked token entries`);
    } catch (error) {
      this.logger.error('Error during revoked token cleanup:', error);
    }
  }

  async detectTokenReuse(jti: string): Promise<boolean> {
    try {
      const revokedKey = `${AUTH_CONSTANTS.REVOKED_TOKEN_REDIS_PREFIX}${jti}`;
      const isRevoked = await this.redis.exists(revokedKey);
      
      if (isRevoked) {
        this.logger.warn(`Potential token reuse detected for JTI: ${jti}`);
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error('Error checking token reuse:', error);
      return false;
    }
  }

  async logSecurityEvent(
    event: string, 
    userId?: number, 
    details?: Record<string, any>
  ) {
    const logEntry = {
      event,
      userId,
      timestamp: new Date().toISOString(),
      details: details || {},
    };

    this.logger.warn(`SECURITY EVENT: ${JSON.stringify(logEntry)}`);

    // In production, you might want to send this to a security monitoring system
    // or store in a dedicated security logs table
  }
}