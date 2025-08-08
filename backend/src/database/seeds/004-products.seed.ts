import { AppDataSource } from '@config/typeorm.config.js';
import { Product } from '@module/product/entity/product.entity';
import { Category } from '@module/category/entity/category.entity';

export const seedProducts = async () => {
  const productRepo = AppDataSource.getRepository(Product);
  const categoryRepo = AppDataSource.getRepository(Category);

  const electronicsCategory = await categoryRepo.findOne({ where: { slug: 'electronics' } });
  if (!electronicsCategory)
    throw new Error("Category 'electronics' not found. Seed categories first!");

  const products = [
    {
      name: 'iPhone 14',
      slug: 'iphone-14',
      description: 'Latest Apple iPhone 14',
      price: 999.99,
      category_id: Number(electronicsCategory.id),
      currency_code: 'VND',
      is_active: true,
    },
    {
      name: 'MacBook Air M2',
      slug: 'macbook-air-m2',
      description: 'Apple MacBook Air with M2 chip',
      price: 1299.0,
      category_id: Number(electronicsCategory.id),
      currency_code: 'VND',
      is_active: true,
    },
    {
      name: 'Samsung Galaxy S23',
      slug: 'samsung-galaxy-s23',
      description: 'Samsung flagship smartphone',
      price: 899.99,
      category_id: Number(electronicsCategory.id),
      currency_code: 'VND',
      is_active: true,
    },
    {
      name: 'Sony WH-1000XM5',
      slug: 'sony-wh-1000xm5',
      description: 'Sony noise cancelling headphones',
      price: 399.99,
      category_id: Number(electronicsCategory.id),
      currency_code: 'VND',
      is_active: true,
    },
    {
      name: 'iPad Pro 12.9',
      slug: 'ipad-pro-12-9',
      description: 'Apple iPad Pro 12.9 inch',
      price: 1499.0,
      category_id: Number(electronicsCategory.id),
      currency_code: 'VND',
      is_active: true,
    },
    {
      name: 'Dell XPS 13',
      slug: 'dell-xps-13',
      description: 'Dell XPS 13 ultrabook',
      price: 1199.0,
      category_id: Number(electronicsCategory.id),
      currency_code: 'VND',
      is_active: true,
    },
    {
      name: 'Canon EOS R6',
      slug: 'canon-eos-r6',
      description: 'Canon mirrorless camera',
      price: 2499.0,
      category_id: Number(electronicsCategory.id),
      currency_code: 'VND',
      is_active: true,
    },
    {
      name: 'GoPro HERO11',
      slug: 'gopro-hero11',
      description: 'GoPro action camera',
      price: 499.99,
      category_id: Number(electronicsCategory.id),
      currency_code: 'VND',
      is_active: true,
    },
    {
      name: 'Apple Watch Series 8',
      slug: 'apple-watch-series-8',
      description: 'Apple Watch Series 8',
      price: 399.0,
      category_id: Number(electronicsCategory.id),
      currency_code: 'VND',
      is_active: true,
    },
    {
      name: 'JBL Charge 5',
      slug: 'jbl-charge-5',
      description: 'JBL portable bluetooth speaker',
      price: 179.99,
      category_id: Number(electronicsCategory.id),
      currency_code: 'VND',
      is_active: true,
    },
    {
      name: 'Google Pixel 7 Pro',
      slug: 'google-pixel-7-pro',
      description: 'Google flagship Android phone',
      price: 899.0,
      category_id: Number(electronicsCategory.id),
      currency_code: 'VND',
      is_active: true,
    },
    {
      name: 'ASUS ROG Phone 6',
      slug: 'asus-rog-phone-6',
      description: 'Gaming smartphone by ASUS',
      price: 999.0,
      category_id: Number(electronicsCategory.id),
      currency_code: 'VND',
      is_active: true,
    },
    {
      name: 'LG OLED TV 55 inch',
      slug: 'lg-oled-tv-55',
      description: 'LG OLED smart TV',
      price: 1499.0,
      category_id: Number(electronicsCategory.id),
      currency_code: 'VND',
      is_active: true,
    },
    {
      name: 'Anker PowerCore 10000',
      slug: 'anker-powercore-10000',
      description: 'Portable charger by Anker',
      price: 49.99,
      category_id: Number(electronicsCategory.id),
      currency_code: 'VND',
      is_active: true,
    },
    {
      name: 'Logitech MX Master 3',
      slug: 'logitech-mx-master-3',
      description: 'Ergonomic wireless mouse',
      price: 99.99,
      category_id: Number(electronicsCategory.id),
      currency_code: 'VND',
      is_active: true,
    },
  ];

  for (const p of products) {
    if (!p || !p.slug) continue;
    const exists = await productRepo.findOne({ where: { slug: p.slug } });
    if (!exists) {
      await productRepo.save(productRepo.create(p));
    }
  }

  console.log('✅ Seeded products successfully');
};

AppDataSource.initialize()
  .then(() => seedProducts())
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Seeding products failed', err);
    process.exit(1);
  });
