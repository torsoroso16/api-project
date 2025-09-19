import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

// Entities
import { UserEntity } from './entities/user.entity';
import { RoleEntity } from './entities/role.entity';
import { RefreshTokenEntity } from './entities/refresh-token.entity';

// Controllers (GraphQL / REST)
import { AuthResolver } from './controllers/auth.resolver';

// Services
import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';
import { EmailService } from './services/email.service';
import { SecurityService } from './services/security.service';
import { PasswordService } from './services/password.service';

// Repositories
import { UserRepository } from './repositories/user.repository';
import { RoleRepository } from './repositories/role.repository';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { PasswordResetTokenRedisRepository } from './repositories/password-reset-token.redis.repository';

// Guards & Strategies
import { JwtStrategy } from './guards/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

// Tasks
import { AuthCleanupTask } from './tasks/auth-cleanup.task';

// Shared modules
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [
    PassportModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([UserEntity, RoleEntity, RefreshTokenEntity]),

    // ✅ Configurable JWT (bukan hardcoded)
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'default-secret'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '10m'),
        },
      }),
      inject: [ConfigService],
    }),
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
    SharedModule,
  ],
  providers: [
    // Controllers
    AuthResolver,

    // Services
    AuthService,
    TokenService,
    EmailService,
    SecurityService,
    PasswordService,

    // Repositories
    {
      provide: 'UserRepositoryInterface',
      useClass: UserRepository,
    },
    {
      provide: 'RoleRepositoryInterface',
      useClass: RoleRepository,
    },
    {
      provide: 'RefreshTokenRepositoryInterface',
      useClass: RefreshTokenRepository,
    },
    {
      provide: 'PasswordResetTokenRepositoryInterface',
      useClass: PasswordResetTokenRedisRepository,
    },

    // Guards & Strategy
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    
    // Tasks
    AuthCleanupTask,
  ],
  exports: [
    AuthService,
    TokenService,
    JwtModule,
    JwtAuthGuard,
  ],
})
export class AuthModule {}