import { AppDataSource } from '@config/typeorm.config.js';
import { Category } from '@module/category/entity/category.entity';

export const seedCategories = async () => {
  const categoryRepo = AppDataSource.getRepository(Category);

  const categories = [
    { name: 'Electronics', slug: 'electronics', description: 'Electronic items and gadgets' },
    { name: 'Fashion', slug: 'fashion', description: 'Clothing and fashion items' },
  ];

  for (const c of categories) {
    const exists = await categoryRepo.findOne({ where: { slug: c.slug } });
    if (!exists) {
      await categoryRepo.save(categoryRepo.create(c));
    }
  }

  console.log('Seeded categories successfully');
};

// AppDataSource.initialize()
//   .then(() => seedCategories())
//   .then(() => process.exit(0))
//   .catch((err) => {
//     console.error('Seeding categories failed', err);
//     process.exit(1);
//   });
