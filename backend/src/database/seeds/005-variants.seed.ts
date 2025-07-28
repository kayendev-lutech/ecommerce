import { AppDataSource } from '@config/typeorm.config.js';
import { Variant } from '@module/variant/entity/variant.entity';
import { Product } from '@module/product/entity/product.entity';

export const seedVariants = async () => {
  const variantRepo = AppDataSource.getRepository(Variant);
  const productRepo = AppDataSource.getRepository(Product);

  const iphone = await productRepo.findOne({ where: { slug: 'iphone-14' } });
  if (!iphone) throw new Error("Product 'iPhone 14' not found. Seed products first!");

  const variants = [
    { product_id: iphone.id, name: 'iPhone 14 - 128GB', price: 999.99, stock: 10 },
    { product_id: iphone.id, name: 'iPhone 14 - 256GB', price: 1099.99, stock: 8 },
  ];

  for (const v of variants) {
    const exists = await variantRepo.findOne({ where: { name: v.name, product_id: v.product_id } });
    if (!exists) {
      await variantRepo.save(variantRepo.create(v));
    }
  }

  console.log('Seeded variants successfully');
};

AppDataSource.initialize()
  .then(() => seedVariants())
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seeding variants failed', err);
    process.exit(1);
  });
