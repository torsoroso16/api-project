import { JwtModuleAsyncOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const jwtConfigAsync: JwtModuleAsyncOptions = {
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
};
