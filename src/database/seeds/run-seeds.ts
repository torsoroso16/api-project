import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { seedRoles } from './create-roles.seed';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { Profile } from '../entities/profile.entity';

async function runSeeds() {
  const configService = new ConfigService();

  const dataSource = new DataSource({
    type: 'postgres',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 5432),
    username: configService.get<string>('DB_USERNAME', 'postgres'),
    password: configService.get<string>('DB_PASSWORD', 'password'),
    database: configService.get<string>('DB_NAME', 'ecommerce'),
    entities: [User, Role, RefreshToken, Profile],
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