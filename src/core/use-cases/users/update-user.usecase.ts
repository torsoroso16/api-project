import { UserRepositoryInterface } from '../../interfaces/repositories/user.repository.interface';
import { RoleRepositoryInterface } from '../../interfaces/repositories/role.repository.interface';
import { User } from '../../entities/user.entity';

export interface UpdateUserUseCaseInput {
  id: number;
  name?: string;
  email?: string;
  isActive?: boolean;
  profile?: {
    bio?: string;
    avatar?: string;
    contact?: string;
    socials?: Array<{ type: string; link: string }>;
  };
  roleNames?: string[];
  updatedBy: number; // ID of user making the update
}

export class UpdateUserUseCase {
  constructor(
    private readonly userRepository: UserRepositoryInterface,
    private readonly roleRepository: RoleRepositoryInterface
  ) {}

  async execute(input: UpdateUserUseCaseInput): Promise<User> {
    const user = await this.userRepository.findById(input.id);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Create updated user
    let updatedUser = new User(
      user.id,
      input.email || user.email,
      input.name || user.name,
      user.passwordHash,
      user.isEmailVerified,
      input.isActive !== undefined ? input.isActive : user.isActive,
      user.emailVerificationToken,
      user.createdAt,
      new Date()
    );

    // Handle role updates if provided
    if (input.roleNames) {
      // Validate roles exist
      for (const roleName of input.roleNames) {
        const role = await this.roleRepository.findByName(roleName);
        if (!role) {
          throw new Error(`Role ${roleName} not found`);
        }
      }
    }

    return await this.userRepository.update(input.id, updatedUser);
  }
}