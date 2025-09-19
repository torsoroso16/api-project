import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '@nestjs-modules/ioredis';
import { redisConfigFactory } from './config/redis.config';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'single',
        config: redisConfigFactory(configService),
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [ConfigModule, RedisModule],
})
export class SharedModule {}