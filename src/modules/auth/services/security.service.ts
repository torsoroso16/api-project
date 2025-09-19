import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { Logger } from '@nestjs/common';
import { SecurityServiceInterface } from '../../../core/interfaces/services/security.service.interface';

@Injectable()
export class SecurityService implements SecurityServiceInterface {
  private readonly logger = new Logger(SecurityService.name);

  constructor(
    @InjectRedis() private readonly redis: Redis
  ) {}

  async detectTokenReuse(jti: string): Promise<boolean> {
    try {
      const revokedKey = `revoked_token:${jti}`;
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

  async logSecurityEvent(event: string, userId?: number, details?: Record<string, any>): Promise<void> {
    const logEntry = {
      event,
      userId,
      timestamp: new Date().toISOString(),
      details: details || {},
    };

    this.logger.warn(`SECURITY EVENT: ${JSON.stringify(logEntry)}`);
  }

  async markTokenAsRevoked(jti: string, ttlSeconds: number): Promise<void> {
    const revokedKey = `revoked_token:${jti}`;
    await this.redis.setex(revokedKey, ttlSeconds, '1');
  }
}