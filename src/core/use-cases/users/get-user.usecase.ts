import { UserRepositoryInterface } from '../../interfaces/repositories/user.repository.interface';
import { User } from '../../entities/user.entity';

export interface GetUserUseCaseInput {
  id: number;
}

export class GetUserUseCase {
  constructor(
    private readonly userRepository: UserRepositoryInterface
  ) {}

  async execute(input: GetUserUseCaseInput): Promise<User> {
    const user = await this.userRepository.findById(input.id);
    
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}