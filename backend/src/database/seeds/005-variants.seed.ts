import { AppDataSource } from '@config/typeorm.config.js';
import { Variant } from '@module/variant/entity/variant.entity';
import { Product } from '@module/product/entity/product.entity';

export const seedVariants = async () => {
  const variantRepo = AppDataSource.getRepository(Variant);
  const productRepo = AppDataSource.getRepository(Product);

  const products = await productRepo.find();

  const variantTemplates = [
    (product: Product) => ({
      product_id: product.id,
      name: `${product.name} - Option 1`,
      price: Number(product.price),
      stock: 10,
      attributes: { option: 'Option 1' },
      is_active: true,
    }),
    (product: Product) => ({
      product_id: product.id,
      name: `${product.name} - Option 2`,
      price: Number(product.price) + 100,
      stock: 5,
      attributes: { option: 'Option 2' },
      is_active: true,
    }),
  ];

  for (const product of products) {
    for (const makeVariant of variantTemplates) {
      const v = makeVariant(product);
      const exists = await variantRepo.findOne({
        where: { name: v.name, product_id: v.product_id },
      });
      if (!exists) {
        await variantRepo.save(variantRepo.create(v));
      }
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
