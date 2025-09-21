import { DataSource } from 'typeorm';
import path from 'path';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: +(process.env.DB_PORT || 5432),
  username: process.env.DB_USERNAME || 'shop_user',
  password: process.env.DB_PASSWORD || 'shop_pass',
  database: process.env.DB_NAME || 'shop_api',
  entities: [path.join(__dirname, '../../modules/**/entities/*.entity.{ts,js}')],
  migrations: [path.join(__dirname, 'migrations/*.{ts,js}')],
  synchronize: false,
});

// Kalau kamu mau bisa langsung initialize di tempat lain:
// AppDataSource.initialize().then(() => console.log('DB connected'));
