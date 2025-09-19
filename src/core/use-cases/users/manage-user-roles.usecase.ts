import { UserRepositoryInterface } from '../../interfaces/repositories/user.repository.interface';
import { RoleRepositoryInterface } from '../../interfaces/repositories/role.repository.interface';
import { User } from '../../entities/user.entity';

export interface AssignRoleUseCaseInput {
  userId: number;
  roleName: string;
}

export interface RemoveRoleUseCaseInput {
  userId: number;
  roleName: string;
}

export class ManageUserRolesUseCase {
  constructor(
    private readonly userRepository: UserRepositoryInterface,
    private readonly roleRepository: RoleRepositoryInterface
  ) {}

  async assignRole(input: AssignRoleUseCaseInput): Promise<User> {
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new Error('User not found');
    }

    const role = await this.roleRepository.findByName(input.roleName);
    if (!role) {
      throw new Error('Role not found');
    }

    return await this.userRepository.assignRole(input.userId, input.roleName);
  }

  async removeRole(input: RemoveRoleUseCaseInput): Promise<User> {
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new Error('User not found');
    }

    return await this.userRepository.removeRole(input.userId, input.roleName);
  }
}