import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { seedRoles } from './create-roles.seed';
import { UserEntity } from '../../../modules/users/entities/user.entity';
import { RoleEntity } from '../../../modules/auth/entities/role.entity';
import { RefreshTokenEntity } from '../../../modules/auth/entities/refresh-token.entity';
import { ProfileEntity } from '../../../modules/users/entities/profile.entity';

async function runSeeds() {
  const configService = new ConfigService();

  const dataSource = new DataSource({
    type: 'postgres',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 5432),
    username: configService.get<string>('DB_USERNAME', 'postgres'),
    password: configService.get<string>('DB_PASSWORD', 'password'),
    database: configService.get<string>('DB_NAME', 'ecommerce'),
    entities: [UserEntity, RoleEntity, RefreshTokenEntity, ProfileEntity],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('📊 Database connected');

    await seedRoles(dataSource);
    
    console.log('✅ All seeds completed');
  } catch (error) {
    console.error('❌ Error running seeds:', error);
  } finally {
    await dataSource.destroy();
  }
}

if (require.main === module) {
  runSeeds();
}