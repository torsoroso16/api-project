import { Resolver, Mutation, Query, Args, Context } from '@nestjs/graphql';
import { UseGuards, ValidationPipe } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Response } from 'express';

import { AuthService } from './services/auth.service';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';
import { AuthPayload } from './dto/auth-payload.type';
import { ChangePasswordInput } from './dto/change-password.input';
import { ForgotPasswordInput } from './dto/forgot-password.input';
import { ResetPasswordInput } from './dto/reset-password.input';
import { SuccessResponse } from '../common/dto/success-response.type';
import { User } from '../database/entities/user.entity';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GqlThrottlerGuard } from './guards/throttler.guard';
import { AUTH_CONSTANTS } from './constants/auth.constants';

@Resolver()
@UseGuards(JwtAuthGuard)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(GqlThrottlerGuard)
  @Mutation(() => AuthPayload)
  async register(
    @Args('input', new ValidationPipe()) input: RegisterInput,
    @Context('res') response: Response,
  ): Promise<AuthPayload> {
    const result = await this.authService.register(input);
    
    // Set refresh token in HTTP-only cookie
    const refreshTokenPayload = this.extractRefreshTokenFromResult(result);
    if (refreshTokenPayload) {
      response.cookie(
        AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE_NAME,
        refreshTokenPayload,
        AUTH_CONSTANTS.COOKIE_OPTIONS,
      );
    }

    return result;
  }

  @Public()
  @UseGuards(GqlThrottlerGuard)
  @Mutation(() => AuthPayload)
  async login(
    @Args('input', new ValidationPipe()) input: LoginInput,
    @Context('res') response: Response,
  ): Promise<AuthPayload> {
    const result = await this.authService.login(input);
    
    // Set refresh token in HTTP-only cookie
    const refreshTokenPayload = this.extractRefreshTokenFromResult(result);
    if (refreshTokenPayload) {
      response.cookie(
        AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE_NAME,
        refreshTokenPayload,
        AUTH_CONSTANTS.COOKIE_OPTIONS,
      );
    }

    return result;
  }

  @Public()
  @Mutation(() => AuthPayload)
  async refreshToken(
    @Context('req') request: any,
    @Context('res') response: Response,
  ): Promise<AuthPayload> {
    const refreshToken = request.cookies?.[AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE_NAME];
    
    if (!refreshToken) {
      throw new Error('Refresh token not found');
    }

    const tokens = await this.authService.refreshTokens(refreshToken);
    
    // Set new refresh token in cookie
    response.cookie(
      AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE_NAME,
      tokens.refreshToken,
      AUTH_CONSTANTS.COOKIE_OPTIONS,
    );

    // Get user from access token (you might want to optimize this)
    const payload = this.authService.verifyAccessToken(tokens.accessToken);
    const user = await this.authService.getUserById(payload.sub);

    return {
      accessToken: tokens.accessToken,
      user,
    };
  }

  @Mutation(() => SuccessResponse)
  async logout(
    @Context('req') request: any,
    @Context('res') response: Response,
  ): Promise<SuccessResponse> {
    const refreshToken = request.cookies?.[AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE_NAME];
    
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    // Clear refresh token cookie
    response.clearCookie(AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE_NAME);

    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  @Query(() => User)
  async me(@CurrentUser() user: User): Promise<User> {
    return user;
  }

  @Mutation(() => SuccessResponse)
  async changePassword(
    @Args('input', new ValidationPipe()) input: ChangePasswordInput,
    @CurrentUser() user: User,
  ): Promise<SuccessResponse> {
    await this.authService.changePassword(user.id, input);
    
    return {
      success: true,
      message: 'Password changed successfully',
    };
  }

  @Public()
  @UseGuards(GqlThrottlerGuard)
  @Mutation(() => SuccessResponse)
  async forgotPassword(
    @Args('input', new ValidationPipe()) input: ForgotPasswordInput,
  ): Promise<SuccessResponse> {
    await this.authService.forgotPassword(input.email);
    
    return {
      success: true,
      message: 'Password reset instructions sent to your email',
    };
  }

  @Public()
  @Mutation(() => SuccessResponse)
  async resetPassword(
    @Args('input', new ValidationPipe()) input: ResetPasswordInput,
  ): Promise<SuccessResponse> {
    await this.authService.resetPassword(input.token, input.newPassword);
    
    return {
      success: true,
      message: 'Password reset successfully',
    };
  }

  @Public()
  @Mutation(() => SuccessResponse)
  async verifyEmail(
    @Args('token') token: string,
  ): Promise<SuccessResponse> {
    await this.authService.verifyEmail(token);
    
    return {
      success: true,
      message: 'Email verified successfully',
    };
  }

  private extractRefreshTokenFromResult(result: any): string | null {
    // This is a helper method to extract refresh token if your AuthPayload includes it
    // Modify based on your actual implementation
    return result.refreshToken || null;
  }
}