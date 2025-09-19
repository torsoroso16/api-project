import { Injectable, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import { PasswordResetTokenRepositoryInterface, PasswordResetToken } from '../../../core/interfaces/repositories/password-reset-token.repository.interface';
import { AUTH_CONSTANTS } from '../../../shared/constants/auth.constants';
import { InjectRedis } from '@nestjs-modules/ioredis';

@Injectable()
export class PasswordResetTokenRedisRepository implements PasswordResetTokenRepositoryInterface {
  private readonly prefix = AUTH_CONSTANTS.PASSWORD_RESET_TOKEN_PREFIX || 'password-reset:';

  constructor(
    @InjectRedis()
    private readonly redis: Redis,
  ) {}

  async save(data: PasswordResetToken): Promise<void> {
    const key = `${this.prefix}${data.token}`;
    const ttl = Math.floor((data.expiresAt.getTime() - Date.now()) / 1000); // detik
    await this.redis.set(key, JSON.stringify(data), 'EX', ttl > 0 ? ttl : 0);
  }

  async findByToken(token: string): Promise<PasswordResetToken | null> {
    const key = `${this.prefix}${token}`;
    const value = await this.redis.get(key);
    if (!value) return null;
    return JSON.parse(value) as PasswordResetToken;
  }

  async delete(token: string): Promise<void> {
    const key = `${this.prefix}${token}`;
    await this.redis.del(key);
  }

  async deleteByUserId(userId: number): Promise<void> {
    // Cari semua key yang berhubungan dengan userId
    const pattern = `${this.prefix}*`;
    const keys = await this.scanKeys(pattern);

    for (const key of keys) {
      const value = await this.redis.get(key);
      if (!value) continue;

      const tokenData = JSON.parse(value) as PasswordResetToken;
      if (tokenData.userId === userId) {
        await this.redis.del(key);
      }
    }
  }

  /**
   * Helper untuk scan keys tanpa block Redis
   */
  private async scanKeys(pattern: string): Promise<string[]> {
    let cursor = '0';
    const keys: string[] = [];

    do {
      const [newCursor, foundKeys] = await this.redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = newCursor;
      keys.push(...foundKeys);
    } while (cursor !== '0');

    return keys;
  }
}