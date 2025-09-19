import { UserRepositoryInterface } from '../../interfaces/repositories/user.repository.interface';

export interface DeleteUserUseCaseInput {
  userId: number;
  deletedBy: number;
}

export class DeleteUserUseCase {
  constructor(
    private readonly userRepository: UserRepositoryInterface
  ) {}

  async execute(input: DeleteUserUseCaseInput): Promise<boolean> {
    const user = await this.userRepository.findById(input.userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Prevent self-deletion
    if (input.userId === input.deletedBy) {
      throw new Error('Cannot delete your own account');
    }

    await this.userRepository.delete(input.userId);
    return true;
  }
}