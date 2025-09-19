import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards, ValidationPipe, ForbiddenException } from '@nestjs/common';

import { UsersService } from '../services/users.service';
import { ProfileService } from '../services/profile.service';
import { UserEntity } from '../entities/user.entity';
import { ProfileEntity } from '../entities/profile.entity';
import { UpdateUserInput } from '../dto/update-user.input';
import { CreateProfileInput } from '../dto/create-profile.input';
import { GetUsersArgs, UserPaginator } from '../dto/get-users.args';
import { GetMyStaffsArgs, StaffPaginator } from '../dto/get-users.args';
import { SuccessResponse } from '../../../common/dto/success-response.type';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Public } from '../../../shared/decorators/public.decorator';
import { paginate } from '../../../common/pagination/paginate';

@Resolver(() => UserEntity)
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly profileService: ProfileService,
  ) {}

  @Roles('super_admin', 'admin')
  @Query(() => UserPaginator, { name: 'users' })
  async getUsers(@Args() args: GetUsersArgs): Promise<UserPaginator> {
    const result = await this.usersService.getUsers({
      text: args.text || args.search,
      first: args.first,
      page: args.page,
      permission: args.permission,
      isActive: args.is_active,
    });

    return {
      data: result.users.map(user => this.mapDomainUserToGraphQL(user)),
      paginatorInfo: paginate(result.total, result.currentPage, result.perPage, result.users.length),
    };
  }

  @Roles('super_admin', 'admin')
  @Query(() => UserPaginator, { name: 'usersByPermission' })
  async getUsersByPermission(@Args() args: GetUsersArgs): Promise<UserPaginator> {
    const result = await this.usersService.getUsersByPermission({
      text: args.search,
      first: args.first,
      page: args.page,
      permission: args.permission,
      isActive: args.is_active,
    });

    return {
      data: result.users.map(user => this.mapDomainUserToGraphQL(user)),
      paginatorInfo: paginate(result.total, result.currentPage, result.perPage, result.users.length),
    };
  }

  @Query(() => UserEntity, { name: 'me' })
  async me(@CurrentUser() user: UserEntity): Promise<UserEntity> {
    return user;
  }

  @Query(() => UserEntity, { name: 'user', nullable: true })
  async getUser(@Args('id', { type: () => ID }) id: number): Promise<UserEntity | null> {
    const user = await this.usersService.getUser(id);
    return user ? this.mapDomainUserToGraphQL(user) : null;
  }

  @Mutation(() => UserEntity)
  async updateUser(
    @Args('input', new ValidationPipe()) updateUserInput: UpdateUserInput,
    @CurrentUser() currentUser: UserEntity,
  ): Promise<UserEntity> {
    const canUpdate = 
      currentUser.id === updateUserInput.id ||
      currentUser.roles.some(role => ['super_admin', 'admin'].includes(role.name));

    if (!canUpdate) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const updatedUser = await this.usersService.updateUser(
      updateUserInput.id,
      {
        name: updateUserInput.name,
        email: updateUserInput.email,
        isActive: updateUserInput.isActive,
        profile: updateUserInput.profile,
        roleNames: updateUserInput.roleNames,
      },
      currentUser.id
    );

    return this.mapDomainUserToGraphQL(updatedUser);
  }

  @Mutation(() => UserEntity)
  async activeUser(@Args('id', { type: () => ID }) id: number, @CurrentUser() currentUser: UserEntity): Promise<UserEntity> {
    const user = await this.usersService.unbanUser(id, currentUser.id);
    return this.mapDomainUserToGraphQL(user);
  }

  @Roles('super_admin', 'admin')
  @Mutation(() => UserEntity)
  async banUser(@Args('id', { type: () => ID }) id: number, @CurrentUser() currentUser: UserEntity): Promise<UserEntity> {
    const user = await this.usersService.banUser(id, currentUser.id);
    return this.mapDomainUserToGraphQL(user);
  }

  @Roles('super_admin')
  @Mutation(() => SuccessResponse)
  async removeUser(@Args('id', { type: () => ID }) id: number, @CurrentUser() currentUser: UserEntity): Promise<SuccessResponse> {
    const deleted = await this.usersService.deleteUser(id, currentUser.id);
    return {
      success: deleted,
      message: deleted ? 'User deleted successfully' : 'User not found',
    };
  }

  @Mutation(() => ProfileEntity)
  async createProfile(
    @Args('input', new ValidationPipe()) profileInput: CreateProfileInput,
    @CurrentUser() user: UserEntity,
  ): Promise<ProfileEntity> {
    const profile = await this.profileService.createProfile({
      userId: user.id,
      bio: profileInput.bio,
      avatar: profileInput.avatar,
      contact: profileInput.contact,
      socials: profileInput.socials,
    });

    return this.mapDomainProfileToGraphQL(profile);
  }

  @Mutation(() => ProfileEntity)
  async updateProfile(
    @Args('id', { type: () => ID }) id: number,
    @Args('input', new ValidationPipe()) profileInput: CreateProfileInput, // bisa diganti UpdateProfileInput
    @CurrentUser() currentUser: UserEntity,
  ): Promise<ProfileEntity> {
    const canUpdate = 
      currentUser.id === id ||
      currentUser.roles.some(role => ['super_admin', 'admin'].includes(role.name));

    if (!canUpdate) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const profile = await this.profileService.updateProfile({
      userId: id,
      bio: profileInput.bio,
      avatar: profileInput.avatar,
      contact: profileInput.contact,
      socials: profileInput.socials,
    });

    return this.mapDomainProfileToGraphQL(profile);
  }

  @Mutation(() => SuccessResponse)
  async deleteProfile(
    @Args('id', { type: () => ID }) id: number,
    @CurrentUser() currentUser: UserEntity,
  ): Promise<SuccessResponse> {
    const canDelete = 
      currentUser.id === id ||
      currentUser.roles.some(role => ['super_admin', 'admin'].includes(role.name));

    if (!canDelete) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const deleted = await this.profileService.deleteProfile({
      userId: id,
      deletedBy: currentUser.id,
    });

    return {
      success: deleted,
      message: deleted ? 'Profile deleted successfully' : 'Profile not found',
    };
  }

  @Roles('super_admin', 'admin')
  @Mutation(() => UserEntity)
  async assignRole(
    @Args('userId', { type: () => ID }) userId: number,
    @Args('roleName') roleName: string,
  ): Promise<UserEntity> {
    const user = await this.usersService.assignRole(userId, roleName);
    return this.mapDomainUserToGraphQL(user);
  }

  @Roles('super_admin', 'admin')
  @Mutation(() => UserEntity)
  async removeRole(
    @Args('userId', { type: () => ID }) userId: number,
    @Args('roleName') roleName: string,
  ): Promise<UserEntity> {
    const user = await this.usersService.removeRole(userId, roleName);
    return this.mapDomainUserToGraphQL(user);
  }

  @Roles('super_admin')
  @Mutation(() => SuccessResponse)
  async makeOrRevokeAdmin(
    @Args('user_id', { type: () => ID }) userId: number,
    @CurrentUser() currentUser: UserEntity,
  ): Promise<SuccessResponse> {
    const success = await this.usersService.makeOrRevokeAdmin(userId, currentUser.id);
    return {
      success,
      message: success ? 'Admin status updated successfully' : 'Failed to update admin status',
    };
  }

  @Public()
  @Mutation(() => SuccessResponse)
  async subscribeToNewsletter(
    @Args('email', { type: () => String }) email: string,
  ): Promise<SuccessResponse> {
    const success = await this.usersService.subscribeToNewsletter(email);
    return {
      success,
      message: success ? 'Subscribed to newsletter successfully' : 'Failed to subscribe',
    };
  }

  @Roles('super_admin', 'admin', 'store_owner')
  @Query(() => StaffPaginator, { name: 'myStaffs' })
  async getMyStaffs(
    @Args() getMyStaffsArgs: GetMyStaffsArgs,
  ): Promise<StaffPaginator> {
    const result = await this.usersService.getMyStaffs({
      search: getMyStaffsArgs.search,
      first: getMyStaffsArgs.first,
      page: getMyStaffsArgs.page,
      orderBy: getMyStaffsArgs.orderBy,
      sortedBy: getMyStaffsArgs.sortedBy,
    });

    return {
      data: result.users.map(user => this.mapDomainUserToGraphQL(user)),
      paginatorInfo: paginate(result.total, result.currentPage, result.perPage, result.users.length),
    };
  }

  @Roles('super_admin')
  @Mutation(() => SuccessResponse)
  async licenseKeyValidation(
    @Args('license_key', { type: () => String }) license_key: string,
  ): Promise<SuccessResponse> {
    const success = await this.usersService.licenseKeyValidation(license_key);
    return {
      success,
      message: success ? 'License key is valid' : 'Invalid license key',
    };
  }

  // ====== Helper Mappers ======
  private mapDomainUserToGraphQL(domainUser: any): UserEntity {
    const graphqlUser = new UserEntity();
    graphqlUser.id = domainUser.id;
    graphqlUser.email = domainUser.email;
    graphqlUser.name = domainUser.name;
    graphqlUser.isEmailVerified = domainUser.isEmailVerified;
    graphqlUser.isActive = domainUser.isActive;
    graphqlUser.createdAt = domainUser.createdAt;
    graphqlUser.updatedAt = domainUser.updatedAt;

    graphqlUser.roles = domainUser.roles?.map(role => ({
      id: role.id,
      name: role.name,
    })) || [];

    graphqlUser.profile = domainUser.profile
      ? this.mapDomainProfileToGraphQL(domainUser.profile)
      : null;

    return graphqlUser;
  }

  private mapDomainProfileToGraphQL(domainProfile: any): ProfileEntity {
    const graphqlProfile = new ProfileEntity();
    graphqlProfile.id = domainProfile.id;
    graphqlProfile.bio = domainProfile.bio;
    graphqlProfile.avatar = domainProfile.avatar;
    graphqlProfile.contact = domainProfile.contact;
    graphqlProfile.socials = domainProfile.socials;
    graphqlProfile.createdAt = domainProfile.createdAt;
    graphqlProfile.updatedAt = domainProfile.updatedAt;
    return graphqlProfile;
  }
}
