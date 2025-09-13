import { DataSource } from 'typeorm';
import { Role } from '../entities/role.entity';

export async function seedRoles(dataSource: DataSource) {
  const roleRepository = dataSource.getRepository(Role);

  const roles = [
    {
      name: 'super_admin',
      description: 'Super Administrator with full system access',
    },
    {
      name: 'admin',
      description: 'Administrator with management access',
    },
    {
      name: 'store_owner',
      description: 'Store owner with shop management access',
    },
    {
      name: 'staff',
      description: 'Staff member with limited access',
    },
    {
      name: 'customer',
      description: 'Regular customer with basic access',
    },
  ];

  for (const roleData of roles) {
    const existingRole = await roleRepository.findOne({
      where: { name: roleData.name },
    });

    if (!existingRole) {
      const role = roleRepository.create(roleData);
      await roleRepository.save(role);
      console.log(`✅ Created role: ${roleData.name}`);
    } else {
      console.log(`⚠️  Role already exists: ${roleData.name}`);
    }
  }
}