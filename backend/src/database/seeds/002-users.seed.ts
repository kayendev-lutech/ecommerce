import { AppDataSource } from '@config/typeorm.config.js';
import { User } from '@module/user/entity/user.entity';
import { Role } from '@module/role/entity/role.entity';
import bcrypt from 'bcryptjs';

export const seedUsers = async () => {
  const userRepo = AppDataSource.getRepository(User);
  const roleRepo = AppDataSource.getRepository(Role);

  const adminRole = await roleRepo.findOne({ where: { name: 'admin' } });
  if (!adminRole) throw new Error('Admin role not found, seed roles first!');

  const admin = await userRepo.findOne({ where: { email: 'admin@example.com' } });
  if (!admin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await userRepo.save(
      userRepo.create({
        username: 'admin',
        email: 'admin@example.com',
        password_hash: hashedPassword,
        role: adminRole.name,
        is_active: true,
      }),
    );
  }

  console.log('Seeded users successfully');
};

AppDataSource.initialize()
  .then(() => seedUsers())
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seeding users failed', err);
    process.exit(1);
  });
