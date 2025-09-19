import { UserRepositoryInterface } from '../../interfaces/repositories/user.repository.interface';
import { PasswordServiceInterface } from '../../interfaces/services/password.service.interface';
import { RefreshTokenRepositoryInterface } from '../../interfaces/repositories/refresh-token.repository.interface';
import { PasswordResetTokenRepositoryInterface } from '../../interfaces/repositories/password-reset-token.repository.interface';

export interface ResetPasswordUseCaseInput {
  token: string;
  newPassword: string;
}

export class ResetPasswordUseCase {
  constructor(
    private readonly userRepository: UserRepositoryInterface,
    private readonly passwordService: PasswordServiceInterface,
    private readonly refreshTokenRepository: RefreshTokenRepositoryInterface,
    private readonly passwordResetTokenRepository: PasswordResetTokenRepositoryInterface,
  ) {}

  async execute(input: ResetPasswordUseCaseInput): Promise<void> {
    const tokenData = await this.passwordResetTokenRepository.findByToken(input.token);

    if (!tokenData) {
      throw new Error('Invalid or expired reset token');
    }

    if (new Date() > tokenData.expiresAt) {
      await this.passwordResetTokenRepository.delete(input.token);
      throw new Error('Reset token has expired');
    }

    const user = await this.userRepository.findById(tokenData.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Hash password baru
    const newPasswordHash = await this.passwordService.hash(input.newPassword);

    // Update user
    const updatedUser = user.changePassword(newPasswordHash);
    await this.userRepository.update(user.id, updatedUser);

    // Hapus reset token
    await this.passwordResetTokenRepository.delete(input.token);

    // Revoke semua refresh token demi keamanan
    await this.refreshTokenRepository.revokeAllByUserId(user.id);
  }
}