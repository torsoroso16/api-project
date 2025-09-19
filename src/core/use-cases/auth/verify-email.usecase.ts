import { UserRepositoryInterface } from '../../interfaces/repositories/user.repository.interface';

export interface VerifyEmailUseCaseInput {
  token: string;
}

export class VerifyEmailUseCase {
  constructor(
    private readonly userRepository: UserRepositoryInterface
  ) {}

  async execute(input: VerifyEmailUseCaseInput): Promise<void> {
    // Find user by verification token
    const user = await this.userRepository.findByEmailVerificationToken(input.token);
    if (!user) {
      throw new Error('Invalid verification token');
    }

    // Verify email
    const verifiedUser = user.verifyEmail();
    await this.userRepository.update(user.id, verifiedUser);
  }
}