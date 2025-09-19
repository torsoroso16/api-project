import { UserRepositoryInterface } from '../../interfaces/repositories/user.repository.interface';
import { ProfileRepositoryInterface } from '../../interfaces/repositories/profile.repository.interface';
import { Profile } from '../../entities/profile.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

export interface CreateProfileUseCaseInput {
  userId: number;
  bio?: string;
  avatar?: string;
  contact?: string;
  socials?: Array<{ type: string; link: string }>;
}

export interface UpdateProfileUseCaseInput {
  userId: number;
  bio?: string;
  avatar?: string;
  contact?: string;
  socials?: Array<{ type: string; link: string }>;
}

export interface DeleteProfileUseCaseInput {
  userId: number;
  deletedBy: number;
}

export class ProfileManagementUseCase {
  constructor(
    private readonly userRepository: UserRepositoryInterface,
    private readonly profileRepository: ProfileRepositoryInterface
  ) {}

  async createProfile(input: CreateProfileUseCaseInput): Promise<Profile> {
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingProfile = await this.profileRepository.findByUserId(input.userId);
    if (existingProfile) {
      throw new BadRequestException('User already has a profile');
    }

    const profile = Profile.create({
      bio: input.bio,
      avatar: input.avatar,
      contact: input.contact,
      socials: input.socials
    });

    return await this.profileRepository.create(profile);
  }

  async updateProfile(input: UpdateProfileUseCaseInput): Promise<Profile> {
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingProfile = await this.profileRepository.findByUserId(input.userId);
    if (!existingProfile) {
      // Create new profile if doesn't exist
      return this.createProfile(input);
    }

    const updatedProfile = new Profile(
      existingProfile.id,
      input.bio !== undefined ? input.bio : existingProfile.bio,
      input.avatar !== undefined ? input.avatar : existingProfile.avatar,
      input.contact !== undefined ? input.contact : existingProfile.contact,
      input.socials !== undefined ? input.socials : existingProfile.socials,
      existingProfile.createdAt,
      new Date()
    );

    return await this.profileRepository.update(existingProfile.id, updatedProfile);
  }

  async deleteProfile(input: DeleteProfileUseCaseInput): Promise<boolean> {
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const profile = await this.profileRepository.findByUserId(input.userId);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    await this.profileRepository.delete(profile.id);
    return true;
  }
}