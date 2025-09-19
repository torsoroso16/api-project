import { Resolver, Mutation, Query, Args, Context } from '@nestjs/graphql';
import { UseGuards, ValidationPipe } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Response } from 'express';

import { AuthService } from '../services/auth.service';
import { RegisterInput } from '../dto/register.input';
import { LoginInput } from '../dto/login.input';
import { AuthPayload } from '../dto/auth-payload.type';
import { ChangePasswordInput } from '../dto/change-password.input';
import { ForgotPasswordInput } from '../dto/forgot-password.input';
import { ResetPasswordInput } from '../dto/reset-password.input';
import { SuccessResponse } from '../../../common/dto/success-response.type';
import { UserEntity } from '../entities/user.entity';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { Public } from '../../../shared/decorators/public.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { GqlThrottlerGuard } from '../guards/throttler.guard';
import { AUTH_CONSTANTS } from '../../../shared/constants/auth.constants';

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
    if (result.tokens.refreshToken) {
      response.cookie(
        AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE_NAME,
        result.tokens.refreshToken,
        AUTH_CONSTANTS.COOKIE_OPTIONS,
      );
    }

    return {
      accessToken: result.tokens.accessToken,
      user: this.mapDomainUserToGraphQL(result.user),
    };
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
    if (result.tokens.refreshToken) {
      response.cookie(
        AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE_NAME,
        result.tokens.refreshToken,
        AUTH_CONSTANTS.COOKIE_OPTIONS,
      );
    }

    return {
      accessToken: result.tokens.accessToken,
      user: this.mapDomainUserToGraphQL(result.user),
    };
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

    const result = await this.authService.refreshTokens(refreshToken);
    
    // Set new refresh token in cookie
    response.cookie(
      AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE_NAME,
      result.tokens.refreshToken,
      AUTH_CONSTANTS.COOKIE_OPTIONS,
    );

    return {
      accessToken: result.tokens.accessToken,
      user: this.mapDomainUserToGraphQL(result.user),
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

  @Query(() => UserEntity)
  async me(@CurrentUser() user: UserEntity): Promise<UserEntity> {
    return user;
  }

  @Mutation(() => SuccessResponse)
  async changePassword(
    @Args('input', new ValidationPipe()) input: ChangePasswordInput,
    @CurrentUser() user: UserEntity,
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

  // Helper method to map domain entity to GraphQL type
  private mapDomainUserToGraphQL(domainUser: any): UserEntity {
    const graphqlUser = new UserEntity();
    graphqlUser.id = domainUser.id;
    graphqlUser.email = domainUser.email;
    graphqlUser.name = domainUser.name;
    graphqlUser.isEmailVerified = domainUser.isEmailVerified;
    graphqlUser.isActive = domainUser.isActive;
    graphqlUser.createdAt = domainUser.createdAt;
    graphqlUser.updatedAt = domainUser.updatedAt;
    return graphqlUser;
  }
}