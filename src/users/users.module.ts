import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { User } from '../database/entities/user.entity';
import { Role } from '../database/entities/role.entity';
import { Profile } from '../database/entities/profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Profile])],
  providers: [UsersResolver, UsersService],
  exports: [UsersService],
})
export class UsersModule {}