import { AppDataSource } from '@config/typeorm.config.js';
import { Role } from '@module/role/entity/role.entity';

export const seedRoles = async () => {
  const roleRepo = AppDataSource.getRepository(Role);

  const roles = [
    { name: 'user', description: 'User who buys products' },
    { name: 'seller', description: 'User who sells products' },
    { name: 'admin', description: 'Administrator with full access' },
  ];

  for (const r of roles) {
    const exists = await roleRepo.findOne({ where: { name: r.name } });
    if (!exists) {
      await roleRepo.save(roleRepo.create(r));
    }
  }

  console.log('Seeded roles successfully');
};

AppDataSource.initialize()
  .then(() => seedRoles())
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seeding roles failed', err);
    process.exit(1);
  });
