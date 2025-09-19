import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const typeOrmConfigAsync: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    type: configService.get<'postgres' | 'mysql'>('DB_TYPE') || 'postgres',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 5432),
    username: configService.get<string>('DB_USERNAME', 'shop_user'),
    password: configService.get<string>('DB_PASSWORD', 'shop_pass'),
    database: configService.get<string>('DB_NAME', 'shop_api'),
    entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
    autoLoadEntities: true,
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
    synchronize: configService.get<boolean>('DB_SYNCHRONIZE', false),
    logging: configService.get<boolean>('DB_LOGGING', false),
    ssl: configService.get<boolean>('DB_SSL', false) ? {
      rejectUnauthorized: false,
    } : false,
    extra: {
        max: configService.get<number>('DB_MAX_CONNECTIONS', 10),
        connectionTimeoutMillis: configService.get<number>('DB_TIMEOUT', 5000),
    },
  }),
  inject: [ConfigService],
};