import { Injectable, Inject } from '@nestjs/common';
import { ProfileManagementUseCase, CreateProfileUseCaseInput, UpdateProfileUseCaseInput, DeleteProfileUseCaseInput } from '../../../core/use-cases/users/profile-management.usecase';
import type { UserRepositoryInterface } from '../../../core/interfaces/repositories/user.repository.interface';
import type { ProfileRepositoryInterface } from '../../../core/interfaces/repositories/profile.repository.interface';

@Injectable()
export class ProfileService {
  private readonly profileManagementUseCase: ProfileManagementUseCase;

  constructor(
    @Inject('UserRepositoryInterface')
    private readonly userRepository: UserRepositoryInterface,
    @Inject('ProfileRepositoryInterface')
    private readonly profileRepository: ProfileRepositoryInterface,
  ) {
    this.profileManagementUseCase = new ProfileManagementUseCase(
      this.userRepository,
      this.profileRepository
    );
  }

  async createProfile(input: CreateProfileUseCaseInput) {
    return await this.profileManagementUseCase.createProfile(input);
  }

  async updateProfile(input: UpdateProfileUseCaseInput) {
    return await this.profileManagementUseCase.updateProfile(input);
  }

  async deleteProfile(input: DeleteProfileUseCaseInput) {
    return await this.profileManagementUseCase.deleteProfile(input);
  }

}