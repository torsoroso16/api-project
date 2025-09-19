import { Injectable, Inject } from '@nestjs/common';
import type { UserRepositoryInterface } from '../../../core/interfaces/repositories/user.repository.interface';
import type { RoleRepositoryInterface } from '../../../core/interfaces/repositories/role.repository.interface';
import type { RefreshTokenRepositoryInterface } from '../../../core/interfaces/repositories/refresh-token.repository.interface';
import { RegisterUseCase, RegisterUseCaseInput } from '../../../core/use-cases/auth/register.usecase';
import { LoginUseCase, LoginUseCaseInput } from '../../../core/use-cases/auth/login.usecase';
import { RefreshTokenUseCase } from '../../../core/use-cases/auth/refresh-token.usecase';
import { ChangePasswordUseCase, ChangePasswordUseCaseInput } from '../../../core/use-cases/auth/change-password.usecase';
import { VerifyEmailUseCase } from '../../../core/use-cases/auth/verify-email.usecase';
import { ForgotPasswordUseCase } from '../../../core/use-cases/auth/forgot-password.usecase';
import { ResetPasswordUseCase } from '../../../core/use-cases/auth/reset-password.usecase';
import { LogoutUseCase } from '../../../core/use-cases/auth/logout.usecase';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { EmailService } from './email.service';
import { SecurityService } from './security.service';

@Injectable()
export class AuthService {
  private readonly registerUseCase: RegisterUseCase;
  private readonly loginUseCase: LoginUseCase;
  private readonly refreshTokenUseCase: RefreshTokenUseCase;
  private readonly changePasswordUseCase: ChangePasswordUseCase;
  private readonly verifyEmailUseCase: VerifyEmailUseCase;
  private readonly logoutUseCase: LogoutUseCase;
  private readonly forgotPasswordUseCase: ForgotPasswordUseCase;
  private readonly resetPasswordUseCase: ResetPasswordUseCase;


  constructor(
    @Inject('UserRepositoryInterface')
    private readonly userRepository: UserRepositoryInterface,
    @Inject('RoleRepositoryInterface')
    private readonly roleRepository: RoleRepositoryInterface,
    @Inject('RefreshTokenRepositoryInterface')
    private readonly refreshTokenRepository: RefreshTokenRepositoryInterface,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly emailService: EmailService,
    private readonly securityService: SecurityService
  ) {
    // Initialize use cases
    this.registerUseCase = new RegisterUseCase(
      this.userRepository,
      this.roleRepository,
      this.passwordService,
      this.tokenService,
      this.emailService
    );

    this.loginUseCase = new LoginUseCase(
      this.userRepository,
      this.passwordService,
      this.tokenService
    );

    this.refreshTokenUseCase = new RefreshTokenUseCase(
      this.userRepository,
      this.refreshTokenRepository,
      this.tokenService,
      this.securityService
    );

    this.changePasswordUseCase = new ChangePasswordUseCase(
      this.userRepository,
      this.passwordService,
      this.refreshTokenRepository
    );

    this.verifyEmailUseCase = new VerifyEmailUseCase(
      this.userRepository
    );

    this.logoutUseCase = new LogoutUseCase(
      this.tokenService,
      this.refreshTokenRepository
    );
  }

  async register(input: RegisterUseCaseInput) {
    return await this.registerUseCase.execute(input);
  }

  async login(input: LoginUseCaseInput) {
    return await this.loginUseCase.execute(input);
  }

  async refreshTokens(refreshToken: string) {
    return await this.refreshTokenUseCase.execute({ refreshToken });
  }

  async changePassword(userId: number, input: Omit<ChangePasswordUseCaseInput, 'userId'>) {
    return await this.changePasswordUseCase.execute({ userId, ...input });
  }

  async verifyEmail(token: string) {
    return await this.verifyEmailUseCase.execute({ token });
  }

  async logout(refreshToken: string) {
    return await this.logoutUseCase.execute({ refreshToken });
  }

  // Helper methods for compatibility with existing resolver
  async getUserById(id: number) {
    return await this.userRepository.findById(id);
  }

  verifyAccessToken(token: string) {
    return this.tokenService.verifyAccessToken(token);
  }

  async forgotPassword(email: string) {
    return await this.forgotPasswordUseCase.execute({ email });
  }
  
  async resetPassword(token: string, newPassword: string) {
    return await this.resetPasswordUseCase.execute({ token, newPassword });
  }
}