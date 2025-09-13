import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '@nestjs-modules/ioredis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { typeOrmConfigAsync } from '../config/database.config';
import { redisConfigFactory } from '../config/redis.config';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync(typeOrmConfigAsync),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'single',
        config: redisConfigFactory(configService),
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [TypeOrmModule, RedisModule],
})
export class DatabaseModule {}