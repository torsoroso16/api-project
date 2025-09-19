import { RedisOptions } from 'ioredis';
import { ConfigService } from '@nestjs/config';

export const redisConfigFactory = (configService: ConfigService): RedisOptions => ({
  host: configService.get<string>('REDIS_HOST', 'localhost'),
  port: configService.get<number>('REDIS_PORT', 6379),
  password: configService.get<string>('REDIS_PASSWORD'),
  db: configService.get<number>('REDIS_DB', 0),
  retryStrategy: (times: number) => {
    return Math.min(times * 100, 2000);
  },
  enableReadyCheck: true,
  lazyConnect: true,
});