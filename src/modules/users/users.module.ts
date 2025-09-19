import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities (ORM)
import { UserEntity } from './entities/user.entity';
import { ProfileEntity } from './entities/profile.entity';
import { RoleEntity } from '../auth/entities/role.entity';

// Controllers
import { UsersResolver } from './controllers/users.resolver';

// Services
import { UsersService } from './services/users.service';
import { ProfileService } from './services/profile.service';

// Repositories
import { UserRepository } from './repositories/user.repository';
import { ProfileRepository } from './repositories/profile.repository';

// Shared modules
import { SharedModule } from '../../shared/shared.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, ProfileEntity, RoleEntity]),
    SharedModule,
    AuthModule,
  ],
  providers: [
    // Controllers
    UsersResolver,
    
    // Services
    UsersService,
    ProfileService,
    
    // Repositories
    {
      provide: 'UserRepositoryInterface',
      useClass: UserRepository,
    },
    {
      provide: 'ProfileRepositoryInterface',
      useClass: ProfileRepository,
    },
  ],
  exports: [
    UsersService,
    'UserRepositoryInterface',
    'ProfileRepositoryInterface',
  ],
})
export class UsersModule {}