import { AppDataSource } from '@config/typeorm.config.js';
import { Token } from '@module/token/entity/token.entity';
import { User } from '@module/user/entity/user.entity';

export const seedTokens = async () => {
  const tokenRepo = AppDataSource.getRepository(Token);
  const userRepo = AppDataSource.getRepository(User);

  const adminUser = await userRepo.findOne({ where: { email: 'admin@example.com' } });
  if (!adminUser) throw new Error('Admin user not found. Seed users first!');

  const tokenExists = await tokenRepo.findOne({ where: { user_id: adminUser.id } });
  if (!tokenExists) {
    await tokenRepo.save(
      tokenRepo.create({
        user_id: adminUser.id,
        token: 'admin-token-demo',
        type: 'access',
        expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24h
        is_revoked: false,
      }),
    );
  }

  console.log('Seeded tokens successfully');
};

AppDataSource.initialize()
  .then(() => seedTokens())
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seeding tokens failed', err);
    process.exit(1);
  });
