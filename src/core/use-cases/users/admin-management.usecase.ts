import { UserRepositoryInterface } from '../../interfaces/repositories/user.repository.interface';
import { RoleRepositoryInterface } from '../../interfaces/repositories/role.repository.interface';

export interface MakeOrRevokeAdminUseCaseInput {
  userId: number;
  actionBy: number; // ID of admin performing the action
}

export class AdminManagementUseCase {
  constructor(
    private readonly userRepository: UserRepositoryInterface,
    private readonly roleRepository: RoleRepositoryInterface
  ) {}

  async makeOrRevokeAdmin(input: MakeOrRevokeAdminUseCaseInput): Promise<boolean> {
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Prevent self-modification
    if (input.userId === input.actionBy) {
      throw new Error('Cannot modify your own admin status');
    }

    const adminRole = await this.roleRepository.findByName('admin');
    if (!adminRole) {
      throw new Error('Admin role not found');
    }

    // Check if user currently has admin role (this would need to be implemented in repository)
    // For now, we'll assume we can toggle it
    try {
      await this.userRepository.removeRole(input.userId, 'admin');
      return true; // Was admin, now revoked
    } catch {
      // User didn't have admin role, so make them admin
      await this.userRepository.assignRole(input.userId, 'admin');
      return true; // Now made admin
    }
  }
}