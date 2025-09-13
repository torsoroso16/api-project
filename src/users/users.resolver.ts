import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards, ValidationPipe } from '@nestjs/common';

import { UsersService } from './users.service';
import { User } from '../database/entities/user.entity';
import { Profile } from '../database/entities/profile.entity';
import { UpdateUserInput } from './dto/update-user.input';
import { CreateProfileInput } from './dto/create-profile.input';
import { GetUsersArgs, UserPaginator } from './dto/get-users.args';
import { GetUserPermissionArgs } from './dto/get-user-permission.args';
import { GetMyStaffsArgs, StaffPaginator } from './dto/get-my-staffs.args';
import { GetUserArgs } from './dto/get-user.args';
import { UpdateProfileArgs } from './dto/update-profile.args';
import { MakeOrRevokeAdminInput } from './dto/make-revoke-admin.input';
import { SuccessResponse } from '../common/dto/success-response.type';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Resolver(() => User)
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Roles('super_admin', 'admin')
  @Query(() => UserPaginator, { name: 'users' })
  async getUsers(@Args() args: GetUsersArgs): Promise<UserPaginator> {
    return this.usersService.getUsers(args);
  }

  @Roles('super_admin', 'admin')
  @Query(() => UserPaginator, { name: 'usersByPermission' })
  async getUsersByPermission(@Args() args: GetUserPermissionArgs): Promise<UserPaginator> {
    return this.usersService.getUsersByPermission(args);
  }

  @Query(() => User, { name: 'me' })
  async me(@CurrentUser() user: User): Promise<User> {
    return user; // User is already loaded from JWT token via strategy
  }

  @Query(() => User, { name: 'user', nullable: true })
  async getUser(@Args() args: GetUserArgs): Promise<User | null> {
    return this.usersService.getUser(args.id);
  }

  @Mutation(() => User)
  async updateUser(
    @Args('input', new ValidationPipe()) updateUserInput: UpdateUserInput,
    @CurrentUser() currentUser: User,
  ): Promise<User> {
    // Users can only update their own profile, admins can update anyone
    const canUpdate = 
      currentUser.id === updateUserInput.id ||
      currentUser.roles.some(role => ['super_admin', 'admin'].includes(role.name));

    if (!canUpdate) {
      throw new Error('Insufficient permissions');
    }

    return this.usersService.updateUser(updateUserInput.id, updateUserInput);
  }

  @Mutation(() => User)
  async activeUser(@Args('id', { type: () => ID }) id: number): Promise<User> {
    return this.usersService.unbanUser(id);
  }

  @Roles('super_admin', 'admin')
  @Mutation(() => User)
  async banUser(@Args('id', { type: () => ID }) id: number): Promise<User> {
    return this.usersService.banUser(id);
  }

  @Roles('super_admin')
  @Mutation(() => SuccessResponse)
  async removeUser(@Args('id', { type: () => ID }) id: number): Promise<SuccessResponse> {
    const deleted = await this.usersService.deleteUser(id);
    return {
      success: deleted,
      message: deleted ? 'User deleted successfully' : 'User not found',
    };
  }

  @Mutation(() => Profile)
  async createProfile(
    @Args('input', new ValidationPipe()) profileInput: CreateProfileInput,
    @CurrentUser() user: User,
  ): Promise<Profile> {
    return this.usersService.createProfile(user.id, profileInput);
  }

  @Mutation(() => Profile)
  async updateProfile(
    @Args() updateProfileArgs: UpdateProfileArgs,
    @CurrentUser() currentUser: User,
  ): Promise<Profile> {
    // Users can only update their own profile, admins can update anyone
    const canUpdate = 
      currentUser.id === updateProfileArgs.id ||
      currentUser.roles.some(role => ['super_admin', 'admin'].includes(role.name));

    if (!canUpdate) {
      throw new Error('Insufficient permissions');
    }

    return this.usersService.updateProfile(updateProfileArgs.id, updateProfileArgs.input);
  }

  @Mutation(() => SuccessResponse)
  async deleteProfile(
    @Args('id', { type: () => ID }) id: number,
    @CurrentUser() currentUser: User,
  ): Promise<SuccessResponse> {
    // Users can only delete their own profile, admins can delete anyone's
    const canDelete = 
      currentUser.id === id ||
      currentUser.roles.some(role => ['super_admin', 'admin'].includes(role.name));

    if (!canDelete) {
      throw new Error('Insufficient permissions');
    }

    const deleted = await this.usersService.deleteProfile(id);
    return {
      success: deleted,
      message: deleted ? 'Profile deleted successfully' : 'Profile not found',
    };
  }

  @Roles('super_admin', 'admin')
  @Mutation(() => User)
  async assignRole(
    @Args('userId', { type: () => ID }) userId: number,
    @Args('roleName') roleName: string,
  ): Promise<User> {
    return this.usersService.assignRole(userId, roleName);
  }

  @Roles('super_admin', 'admin')
  @Mutation(() => User)
  async removeRole(
    @Args('userId', { type: () => ID }) userId: number,
    @Args('roleName') roleName: string,
  ): Promise<User> {
    return this.usersService.removeRole(userId, roleName);
  }

  @Roles('super_admin')
  @Mutation(() => SuccessResponse)
  async makeOrRevokeAdmin(
    @Args('input', new ValidationPipe()) makeOrRevokeAdminInput: MakeOrRevokeAdminInput,
  ): Promise<SuccessResponse> {
    const success = await this.usersService.makeOrRevokeAdmin(makeOrRevokeAdminInput);
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
    return this.usersService.getMyStaffs(getMyStaffsArgs);
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
}