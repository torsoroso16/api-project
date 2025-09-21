import { AppDataSource } from '../data-source';

// Seeders
import { seedRoles } from './create-roles.seed';
import { seedProducts } from './create-products.seed';

async function runSeeds() {
  try {
    await AppDataSource.initialize();
    console.log('📊 Database connected');

    await seedRoles(AppDataSource);
    await seedProducts(AppDataSource);

    console.log('✅ All seeds completed');
  } catch (error) {
    console.error('❌ Error running seeds:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

// Jalankan script jika dieksekusi langsung
if (require.main === module) {
  runSeeds();
}
