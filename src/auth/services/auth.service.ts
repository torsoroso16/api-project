import { 
  Injectable, 
  UnauthorizedException, 
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';

import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';

import { User } from '../../database/entities/user.entity';
import { Role } from '../../database/entities/role.entity';
import { RefreshToken } from '../../database/entities/refresh-token.entity';
import { RegisterInput } from '../dto/register.input';
import { LoginInput } from '../dto/login.input';
import { AuthPayload } from '../dto/auth-payload.type';
import { ChangePasswordInput } from '../dto/change-password.input';
import { JwtPayload, JwtRefreshPayload } from '../interfaces/jwt-payload.interface';
import { TokenService } from './token.service';
import { EmailService } from './email.service';
import { AUTH_CONSTANTS } from '../constants/auth.constants';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
    private readonly emailService: EmailService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async register(registerInput: RegisterInput): Promise<AuthPayload> {
    const { email, password, name } = registerInput;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // 64 MB
      timeCost: 3,
      parallelism: 1,
    });

    // Get default role (customer)
    const customerRole = await this.roleRepository.findOne({
      where: { name: 'customer' },
    });

    if (!customerRole) {
      throw new BadRequestException('Default customer role not found');
    }

    // Create user
    const user = this.userRepository.create({
      email,
      name,
      passwordHash,
      roles: [customerRole],
      emailVerificationToken: uuidv4(),
    });

    const savedUser = await this.userRepository.save(user);

    // Send verification email (dummy service)
    await this.emailService.sendVerificationEmail(
      savedUser.email,
      savedUser.emailVerificationToken,
    );

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(savedUser);

    // Save refresh token to database
    await this.tokenService.saveRefreshToken(refreshToken, savedUser.id);

    return {
      accessToken,
      user: savedUser,
    };
  }

  async login(loginInput: LoginInput): Promise<AuthPayload> {
    const { email, password } = loginInput;

    // Find user with roles
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['roles'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await argon2.verify(user.passwordHash, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user);

    // Save refresh token
    await this.tokenService.saveRefreshToken(refreshToken, user.id);

    return {
      accessToken,
      user,
    };
  }

  async refreshTokens(
    refreshTokenFromCookie: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify<JwtRefreshPayload>(
        refreshTokenFromCookie,
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        },
      );

      // Check if token exists and is valid
      const tokenRecord = await this.tokenService.validateRefreshToken(
        payload.jti,
        refreshTokenFromCookie,
      );

      if (!tokenRecord) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Get user with roles
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
        relations: ['roles'],
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      // Revoke old refresh token
      await this.tokenService.revokeRefreshToken(payload.jti);

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      // Save new refresh token
      await this.tokenService.saveRefreshToken(tokens.refreshToken, user.id);

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(refreshToken: string): Promise<boolean> {
    try {
      const payload = this.jwtService.decode(refreshToken) as JwtRefreshPayload;
      if (payload?.jti) {
        await this.tokenService.revokeRefreshToken(payload.jti);
      }
      return true;
    } catch (error) {
      return true; // Always return success for logout
    }
  }

  async changePassword(
    userId: number,
    changePasswordInput: ChangePasswordInput,
  ): Promise<boolean> {
    const { currentPassword, newPassword } = changePasswordInput;

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await argon2.verify(
      user.passwordHash,
      currentPassword,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await argon2.hash(newPassword, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
    });

    // Update password
    await this.userRepository.update(userId, {
      passwordHash: newPasswordHash,
    });

    // Revoke all refresh tokens for this user
    await this.tokenService.revokeAllUserRefreshTokens(userId);

    return true;
  }

  async verifyEmail(token: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    await this.userRepository.update(user.id, {
      isEmailVerified: true,
      emailVerificationToken: null,
    });

    return true;
  }

  private async generateTokens(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const roles = user.roles?.map(role => role.name) || [];
    
    const accessPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles,
    };

    const refreshJti = uuidv4();
    const refreshPayload: JwtRefreshPayload = {
      sub: user.id,
      jti: refreshJti,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: AUTH_CONSTANTS.TOKEN_EXPIRY.ACCESS_TOKEN,
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: AUTH_CONSTANTS.TOKEN_EXPIRY.REFRESH_TOKEN,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists - always return success
      return;
    }

    const resetToken = uuidv4();
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 1); // 1 hour expiry

    // Store reset token in Redis
    const redisKey = `${AUTH_CONSTANTS.PASSWORD_RESET_TOKEN_PREFIX}${resetToken}`;
    await this.redis.setex(
      redisKey,
      3600, // 1 hour in seconds
      JSON.stringify({
        userId: user.id,
        email: user.email,
        expiresAt: tokenExpiry.toISOString(),
      }),
    );

    // Send reset email
    await this.emailService.sendPasswordResetEmail(user.email, resetToken);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const redisKey = `${AUTH_CONSTANTS.PASSWORD_RESET_TOKEN_PREFIX}${token}`;
    const tokenData = await this.redis.get(redisKey);

    if (!tokenData) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const { userId, expiresAt } = JSON.parse(tokenData);

    if (new Date() > new Date(expiresAt)) {
      await this.redis.del(redisKey);
      throw new BadRequestException('Reset token has expired');
    }

    // Hash new password
    const passwordHash = await argon2.hash(newPassword, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
    });

    // Update user password
    await this.userRepository.update(userId, {
      passwordHash,
    });

    // Remove reset token
    await this.redis.del(redisKey);

    // Revoke all refresh tokens for security
    await this.tokenService.revokeAllUserRefreshTokens(userId);
  }

  async getUserById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles', 'profile'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  verifyAccessToken(token: string): JwtPayload {
    try {
      return this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid access token');
    }
  }
}