import { AppDataSource } from '@config/typeorm.config';
import { ProductAttributeValue } from '@module/product/entity/product-attribute-value.entity';
import { ProductAttribute } from '@module/product/entity/product-attribute.entity';
import { Product } from '@module/product/entity/product.entity';
import { logger } from '@logger/logger';

export const seedProductAttributeValues = async () => {
  const valueRepo = AppDataSource.getRepository(ProductAttributeValue);
  const attributeRepo = AppDataSource.getRepository(ProductAttribute);
  const productRepo = AppDataSource.getRepository(Product);

  // Get all products and attributes
  const products = await productRepo.find();
  const attributes = await attributeRepo.find();

  if (products.length === 0) {
    logger.warn('No products found. Please seed products first.');
    return;
  }

  if (attributes.length === 0) {
    logger.warn('No attributes found. Please seed product attributes first.');
    return;
  }

  // Sample attribute values data
  const sampleValues = [
    // iPhone 14 attributes
    {
      productSlug: 'iphone-14',
      values: {
        'color': 'Đen',
        'storage': '128GB',
        'brand': 'Apple',
        'weight': '0.172',
        'warranty_months': '12',
        'is_waterproof': 'true',
        'screen_size': '6.1',
        'connectivity': 'Lightning',
      }
    },
    // MacBook Air M2 attributes
    {
      productSlug: 'macbook-air-m2',
      values: {
        'color': 'Xám',
        'storage': '256GB',
        'brand': 'Apple',
        'weight': '1.24',
        'warranty_months': '12',
        'screen_size': '13.6',
        'connectivity': 'USB-C',
      }
    },
    // Samsung Galaxy S23 attributes
    {
      productSlug: 'samsung-galaxy-s23',
      values: {
        'color': 'Trắng',
        'storage': '256GB',
        'brand': 'Samsung',
        'weight': '0.168',
        'warranty_months': '24',
        'is_waterproof': 'true',
        'screen_size': '6.1',
        'connectivity': 'USB-C',
      }
    },
    // Sony WH-1000XM5 attributes
    {
      productSlug: 'sony-wh-1000xm5',
      values: {
        'color': 'Đen',
        'brand': 'Sony',
        'weight': '0.25',
        'warranty_months': '12',
        'connectivity': 'Bluetooth',
      }
    },
    // iPad Pro 12.9 attributes
    {
      productSlug: 'ipad-pro-12-9',
      values: {
        'color': 'Xám',
        'storage': '128GB',
        'brand': 'Apple',
        'weight': '0.682',
        'warranty_months': '12',
        'screen_size': '12.9',
        'connectivity': 'USB-C',
      }
    },
  ];

  for (const sampleValue of sampleValues) {
    const product = products.find(p => p.slug === sampleValue.productSlug);
    if (!product) {
      logger.warn(`Product with slug ${sampleValue.productSlug} not found, skipping`);
      continue;
    }

    for (const [attributeName, value] of Object.entries(sampleValue.values)) {
      const attribute = attributes.find(a => a.name === attributeName);
      if (!attribute) {
        logger.warn(`Attribute ${attributeName} not found, skipping`);
        continue;
      }

      const existing = await valueRepo.findOne({
        where: {
          product_id: product.id,
          attribute_id: attribute.id,
        }
      });

      if (!existing) {
        const attributeValue = valueRepo.create({
          product_id: product.id,
          attribute_id: attribute.id,
          value: value.toString(),
        });

        await valueRepo.save(attributeValue);
        logger.info(`✅ Seeded value for ${product.name} - ${attribute.display_name}: ${value}`);
      } else {
        logger.info(`⏭️ Value for ${product.name} - ${attribute.display_name} already exists, skipping`);
      }
    }
  }

  // Add some random values for remaining products
  const remainingProducts = products.filter(p => 
    !sampleValues.some(sv => sv.productSlug === p.slug)
  );

  const colorAttr = attributes.find(a => a.name === 'color');
  const brandAttr = attributes.find(a => a.name === 'brand');
  const warrantyAttr = attributes.find(a => a.name === 'warranty_months');

  for (const product of remainingProducts.slice(0, 10)) { // Only first 10 to avoid too much data
    // Add basic attributes for remaining products
    const basicAttributes = [
      { attr: colorAttr, value: ['Đen', 'Trắng', 'Xám'][Math.floor(Math.random() * 3)] },
      { attr: brandAttr, value: 'Generic' },
      { attr: warrantyAttr, value: '12' },
    ];

    for (const { attr, value } of basicAttributes) {
      if (!attr) continue;

      const existing = await valueRepo.findOne({
        where: {
          product_id: product.id,
          attribute_id: attr.id,
        }
      });

      if (!existing) {
        const attributeValue = valueRepo.create({
          product_id: product.id,
          attribute_id: attr.id,
          value: value,
        });

        await valueRepo.save(attributeValue);
        logger.info(`✅ Seeded basic value for ${product.name} - ${attr.display_name}: ${value}`);
      }
    }
  }

  logger.info('✅ Product attribute values seeding completed');
};

// Run if called directly
if (require.main === module) {
  AppDataSource.initialize()
    .then(() => seedProductAttributeValues())
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error('❌ Seeding product attribute values failed', err);
      process.exit(1);
    });
}