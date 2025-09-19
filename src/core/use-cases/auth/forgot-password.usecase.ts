import { UserRepositoryInterface } from '../../interfaces/repositories/user.repository.interface';
import { PasswordResetTokenRepositoryInterface } from '../../interfaces/repositories/password-reset-token.repository.interface';
import { EmailServiceInterface } from '../../interfaces/services/email.service.interface';
import { v4 as uuidv4 } from 'uuid';

export interface ForgotPasswordUseCaseInput {
  email: string;
}

export class ForgotPasswordUseCase {
  constructor(
    private readonly userRepository: UserRepositoryInterface,
    private readonly passwordResetTokenRepository: PasswordResetTokenRepositoryInterface,
    private readonly emailService: EmailServiceInterface,
  ) {}

  async execute(input: ForgotPasswordUseCaseInput): Promise<void> {
    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      // Jangan bocorkan kalau email tidak ada → tetap sukses
      return;
    }

    // Generate token + expiry
    const resetToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Simpan ke storage (misalnya Redis)
    await this.passwordResetTokenRepository.save({
      token: resetToken,
      userId: user.id,
      email: user.email,
      expiresAt,
    });

    // Kirim email
    await this.emailService.sendPasswordResetEmail(user.email, resetToken);
  }
}