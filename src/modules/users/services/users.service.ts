import { Injectable, Inject } from '@nestjs/common';
import type { UserRepositoryInterface } from '../../../core/interfaces/repositories/user.repository.interface';
import type { RoleRepositoryInterface } from '../../../core/interfaces/repositories/role.repository.interface';

// Use Cases
import { GetUsersUseCase, GetUsersUseCaseInput } from '../../../core/use-cases/users/get-users.usecase';
import { GetUserUseCase } from '../../../core/use-cases/users/get-user.usecase';
import { UpdateUserUseCase, UpdateUserUseCaseInput } from '../../../core/use-cases/users/update-user.usecase';
import { ManageUserRolesUseCase } from '../../../core/use-cases/users/manage-user-roles.usecase';
import { BanUserUseCase } from '../../../core/use-cases/users/ban-user.usecase';
import { DeleteUserUseCase } from '../../../core/use-cases/users/delete-user.usecase';
import { AdminManagementUseCase } from '../../../core/use-cases/users/admin-management.usecase';
import { StaffManagementUseCase, GetStaffUseCaseInput } from '../../../core/use-cases/users/staff-management.usecase';

@Injectable()
export class UsersService {
  private readonly getUsersUseCase: GetUsersUseCase;
  private readonly getUserUseCase: GetUserUseCase;
  private readonly updateUserUseCase: UpdateUserUseCase;
  private readonly manageUserRolesUseCase: ManageUserRolesUseCase;
  private readonly banUserUseCase: BanUserUseCase;
  private readonly deleteUserUseCase: DeleteUserUseCase;
  private readonly adminManagementUseCase: AdminManagementUseCase;
  private readonly staffManagementUseCase: StaffManagementUseCase;

  constructor(
    @Inject('UserRepositoryInterface')
    private readonly userRepository: UserRepositoryInterface,
    @Inject('RoleRepositoryInterface')
    private readonly roleRepository: RoleRepositoryInterface,
  ) {
    // Initialize use cases
    this.getUsersUseCase = new GetUsersUseCase(this.userRepository);
    this.getUserUseCase = new GetUserUseCase(this.userRepository);
    this.updateUserUseCase = new UpdateUserUseCase(this.userRepository, this.roleRepository);
    this.manageUserRolesUseCase = new ManageUserRolesUseCase(this.userRepository, this.roleRepository);
    this.banUserUseCase = new BanUserUseCase(this.userRepository);
    this.deleteUserUseCase = new DeleteUserUseCase(this.userRepository);
    this.adminManagementUseCase = new AdminManagementUseCase(this.userRepository, this.roleRepository);
    this.staffManagementUseCase = new StaffManagementUseCase(this.userRepository);
  }

  async getUsers(input: GetUsersUseCaseInput) {
    return await this.getUsersUseCase.execute(input);
  }

  async getUsersByPermission(input: GetUsersUseCaseInput) {
    return await this.getUsersUseCase.execute(input);
  }

  async getUser(id: number) {
    return await this.getUserUseCase.execute({ id });
  }

  async findOneById(id: number) {
    return await this.userRepository.findById(id);
  }

  async findOneByEmail(email: string) {
    return await this.userRepository.findByEmail(email);
  }

  async updateUser(id: number, input: Omit<UpdateUserUseCaseInput, 'id' | 'updatedBy'>, updatedBy: number) {
    return await this.updateUserUseCase.execute({ ...input, id, updatedBy });
  }

  async assignRole(userId: number, roleName: string) {
    return await this.manageUserRolesUseCase.assignRole({ userId, roleName });
  }

  async removeRole(userId: number, roleName: string) {
    return await this.manageUserRolesUseCase.removeRole({ userId, roleName });
  }

  async banUser(userId: number, bannedBy: number, reason?: string) {
    return await this.banUserUseCase.banUser({ userId, bannedBy, reason });
  }

  async unbanUser(userId: number, unbannedBy: number) {
    return await this.banUserUseCase.unbanUser({ userId, unbannedBy });
  }

  async deleteUser(userId: number, deletedBy: number) {
    return await this.deleteUserUseCase.execute({ userId, deletedBy });
  }

  async makeOrRevokeAdmin(userId: number, actionBy: number) {
    return await this.adminManagementUseCase.makeOrRevokeAdmin({ userId, actionBy });
  }

  async getMyStaffs(input: GetStaffUseCaseInput) {
    return await this.staffManagementUseCase.getStaff(input);
  }

  // Additional service methods for compatibility
  async subscribeToNewsletter(email: string): Promise<boolean> {
    // Dummy implementation - replace with actual newsletter service
    console.log(`Subscribing ${email} to newsletter`);
    return true;
  }

  async licenseKeyValidation(licenseKey: string): Promise<boolean> {
    // Dummy implementation - replace with actual license validation
    console.log(`Validating license key: ${licenseKey}`);
    return licenseKey === 'valid-license-key';
  }
}