import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';
import { EmailService } from './services/email.service';
import { SecurityService } from './services/security.service';
import { AuthResolver } from './auth.resolver';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { RateLimitInterceptor } from './interceptors/rate-limit.interceptor';
import { AuthCleanupTask } from './tasks/auth-cleanup.task';
import { AllExceptionsFilter } from '../common/filters/all-exceptions.filter';
import { User } from '../database/entities/user.entity';
import { Role } from '../database/entities/role.entity';
import { RefreshToken } from '../database/entities/refresh-token.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    PassportModule,
    ScheduleModule.forRoot(),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '10m'),
          issuer: configService.get<string>('JWT_ISSUER', 'your-app'),
          audience: configService.get<string>('JWT_AUDIENCE', 'your-app-users'),
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Role, RefreshToken]),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get('THROTTLE_TTL', 60000),
          limit: configService.get('THROTTLE_LIMIT', 10),
        },
      ],
      inject: [ConfigService],
    }),
    UsersModule,
  ],
  providers: [
    AuthService,
    TokenService,
    EmailService,
    SecurityService,
    AuthResolver,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    RefreshTokenGuard,
    AuthCleanupTask,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RateLimitInterceptor,
    },
  ],
  exports: [
    AuthService, 
    TokenService, 
    SecurityService,
    JwtAuthGuard, 
    RolesGuard,
    RefreshTokenGuard,
  ],
})
export class AuthModule {}