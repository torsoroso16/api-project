import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { Role } from '../database/entities/role.entity';
import { Profile } from '../database/entities/profile.entity';
import { GetUsersArgs, UserPaginator } from './dto/get-users.args';
import { GetUserPermissionArgs } from './dto/get-user-permission.args';
import { GetMyStaffsArgs, StaffPaginator } from './dto/get-my-staffs.args';
import { UpdateUserInput } from './dto/update-user.input';
import { CreateProfileInput } from './dto/create-profile.input';
import { MakeOrRevokeAdminInput } from './dto/make-revoke-admin.input';
import { paginate } from '../common/pagination/paginate';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  async findOneById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['roles', 'profile'],
    });
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['roles', 'profile'],
    });
  }

  async getUsers(args: GetUsersArgs): Promise<UserPaginator> {
    const { text, first = 15, page = 1, orderBy, permission, is_active } = args;
    
    let queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .leftJoinAndSelect('user.profile', 'profile');

    // Search filter
    if (text) {
      queryBuilder = queryBuilder.where(
        'user.name ILIKE :search OR user.email ILIKE :search',
        { search: `%${text}%` },
      );
    }

    // Permission filter
    if (permission) {
      queryBuilder = queryBuilder.andWhere(
        'roles.name = :permission',
        { permission },
      );
    }

    // Active status filter
    if (is_active !== undefined) {
      queryBuilder = queryBuilder.andWhere(
        'user.isActive = :isActive',
        { isActive: is_active },
      );
    }

    // Ordering
    if (orderBy && orderBy.length > 0) {
      orderBy.forEach((order, index) => {
        const column = this.mapOrderColumn(order.column);
        if (index === 0) {
          queryBuilder = queryBuilder.orderBy(column, order.order.toUpperCase() as 'ASC' | 'DESC');
        } else {
          queryBuilder = queryBuilder.addOrderBy(column, order.order.toUpperCase() as 'ASC' | 'DESC');
        }
      });
    } else {
      queryBuilder = queryBuilder.orderBy('user.createdAt', 'DESC');
    }

    const [users, total] = await queryBuilder
      .skip((page - 1) * first)
      .take(first)
      .getManyAndCount();

    return {
      data: users,
      paginatorInfo: paginate(total, page, first, users.length),
    };
  }

  async getUsersByPermission(args: GetUserPermissionArgs): Promise<UserPaginator> {
    const { first = 15, page = 1, permission, search, is_active } = args;
    
    let queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .leftJoinAndSelect('user.profile', 'profile');

    if (permission) {
      queryBuilder = queryBuilder.where('roles.name = :permission', { permission });
    }

    if (search) {
      queryBuilder = queryBuilder.andWhere(
        'user.name ILIKE :search OR user.email ILIKE :search',
        { search: `%${search}%` },
      );
    }

    if (is_active !== undefined) {
      queryBuilder = queryBuilder.andWhere('user.isActive = :isActive', { isActive: is_active });
    }

    const [users, total] = await queryBuilder
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * first)
      .take(first)
      .getManyAndCount();

    return {
      data: users,
      paginatorInfo: paginate(total, page, first, users.length),
    };
  }

  async getMyStaffs(args: GetMyStaffsArgs): Promise<StaffPaginator> {
    const { first = 15, page = 1, search } = args;
    
    // Get users with 'staff' role
    let queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .leftJoinAndSelect('user.profile', 'profile')
      .where('roles.name = :roleName', { roleName: 'staff' });

    if (search) {
      queryBuilder = queryBuilder.andWhere(
        'user.name ILIKE :search OR user.email ILIKE :search',
        { search: `%${search}%` },
      );
    }

    const [users, total] = await queryBuilder
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * first)
      .take(first)
      .getManyAndCount();

    return {
      data: users,
      paginatorInfo: paginate(total, page, first, users.length),
    };
  }

  async getUser(id: number): Promise<User> {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async me(): Promise<User> {
    // This would typically get the current user from context
    // For now, return a placeholder - this should be handled by the resolver
    throw new Error('Me method should be handled by the resolver with current user context');
  }

  async updateUser(id: number, updateUserInput: UpdateUserInput): Promise<User> {
    const user = await this.findOneById(id);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update basic user fields
    if (updateUserInput.name) user.name = updateUserInput.name;
    if (updateUserInput.email) user.email = updateUserInput.email;
    if (updateUserInput.isActive !== undefined) user.isActive = updateUserInput.isActive;

    // Handle profile update
    if (updateUserInput.profile) {
      if (user.profile) {
        // Update existing profile
        Object.assign(user.profile, updateUserInput.profile);
        await this.profileRepository.save(user.profile);
      } else {
        // Create new profile
        const newProfile = this.profileRepository.create({
          ...updateUserInput.profile,
          user,
        });
        user.profile = await this.profileRepository.save(newProfile);
      }
    }

    // Handle role updates
    if (updateUserInput.roleNames) {
      const roles = await this.roleRepository.find({
        where: { name: In(updateUserInput.roleNames) },
      });
      user.roles = roles;
    }

    return this.userRepository.save(user);
  }

  async createProfile(userId: number, profileInput: CreateProfileInput): Promise<Profile> {
    const user = await this.findOneById(userId);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.profile) {
      throw new BadRequestException('User already has a profile');
    }

    const profile = this.profileRepository.create({
      ...profileInput,
      user,
    });

    return this.profileRepository.save(profile);
  }

  async updateProfile(userId: number, profileInput: CreateProfileInput): Promise<Profile> {
    const user = await this.findOneById(userId);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.profile) {
      // Create new profile if it doesn't exist
      return this.createProfile(userId, profileInput);
    }

    // Update existing profile
    Object.assign(user.profile, profileInput);
    return this.profileRepository.save(user.profile);
  }

  async deleteProfile(userId: number): Promise<boolean> {
    const user = await this.findOneById(userId);
    
    if (!user || !user.profile) {
      throw new NotFoundException('User or profile not found');
    }

    await this.profileRepository.remove(user.profile);
    return true;
  }

  async assignRole(userId: number, roleName: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const role = await this.roleRepository.findOne({
      where: { name: roleName },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (!user.roles.find(r => r.id === role.id)) {
      user.roles.push(role);
      await this.userRepository.save(user);
    }

    return user;
  }

  async removeRole(userId: number, roleName: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.roles = user.roles.filter(role => role.name !== roleName);
    
    return this.userRepository.save(user);
  }

  async makeOrRevokeAdmin(input: MakeOrRevokeAdminInput): Promise<boolean> {
    const { user_id } = input;
    const user = await this.findOneById(user_id);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const adminRole = await this.roleRepository.findOne({
      where: { name: 'admin' },
    });

    if (!adminRole) {
      throw new NotFoundException('Admin role not found');
    }

    const hasAdminRole = user.roles.some(role => role.name === 'admin');

    if (hasAdminRole) {
      // Revoke admin
      user.roles = user.roles.filter(role => role.name !== 'admin');
    } else {
      // Make admin
      user.roles.push(adminRole);
    }

    await this.userRepository.save(user);
    return true;
  }

  async banUser(id: number): Promise<User> {
    const user = await this.findOneById(id);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isActive = false;
    return this.userRepository.save(user);
  }

  async unbanUser(id: number): Promise<User> {
    const user = await this.findOneById(id);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isActive = true;
    return this.userRepository.save(user);
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return result.affected > 0;
  }

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

  private mapOrderColumn(column: string): string {
    const columnMap = {
      'CREATED_AT': 'user.createdAt',
      'NAME': 'user.name',
      'UPDATED_AT': 'user.updatedAt',
      'IS_ACTIVE': 'user.isActive',
      'EMAIL': 'user.email',
    };
    
    return columnMap[column] || 'user.createdAt';
  }
}