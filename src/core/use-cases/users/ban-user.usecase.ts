import { UserRepositoryInterface } from '../../interfaces/repositories/user.repository.interface';
import { User } from '../../entities/user.entity';

export interface BanUserUseCaseInput {
  userId: number;
  bannedBy: number;
  reason?: string;
}

export interface UnbanUserUseCaseInput {
  userId: number;
  unbannedBy: number;
}

export class BanUserUseCase {
  constructor(
    private readonly userRepository: UserRepositoryInterface
  ) {}

  async banUser(input: BanUserUseCaseInput): Promise<User> {
    const user = await this.userRepository.findById(input.userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.isActive) {
      throw new Error('User is already banned');
    }

    const bannedUser = user.deactivate();
    return await this.userRepository.update(input.userId, bannedUser);
  }

  async unbanUser(input: UnbanUserUseCaseInput): Promise<User> {
    const user = await this.userRepository.findById(input.userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    if (user.isActive) {
      throw new Error('User is not banned');
    }

    const activeUser = new User(
      user.id,
      user.email,
      user.name,
      user.passwordHash,
      user.isEmailVerified,
      true, // Activate user
      user.emailVerificationToken,
      user.createdAt,
      new Date()
    );

    return await this.userRepository.update(input.userId, activeUser);
  }
}