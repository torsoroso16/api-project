import { UserRepositoryInterface } from '../../interfaces/repositories/user.repository.interface';
import { PasswordServiceInterface } from '../../interfaces/services/password.service.interface';
import { RefreshTokenRepositoryInterface } from '../../interfaces/repositories/refresh-token.repository.interface';

export interface ChangePasswordUseCaseInput {
  userId: number;
  currentPassword: string;
  newPassword: string;
}

export class ChangePasswordUseCase {
  constructor(
    private readonly userRepository: UserRepositoryInterface,
    private readonly passwordService: PasswordServiceInterface,
    private readonly refreshTokenRepository: RefreshTokenRepositoryInterface
  ) {}

  async execute(input: ChangePasswordUseCaseInput): Promise<void> {
    // Find user
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await this.passwordService.verify(
      user.passwordHash,
      input.currentPassword
    );
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await this.passwordService.hash(input.newPassword);

    // Update user with new password
    const updatedUser = user.changePassword(newPasswordHash);
    await this.userRepository.update(user.id, updatedUser);

    // Revoke all refresh tokens for security
    await this.refreshTokenRepository.revokeAllByUserId(user.id);
  }
}