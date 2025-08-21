import { AppDataSource } from '@config/typeorm.config';
import { Product } from '@module/product/entity/product.entity';
import { logger } from '@logger/logger';

// Các entity mới
import { CategoryAttribute } from '@module/category/entity/category-attribute.entity';
import { CategoryAttributeOption } from '@module/category/entity/category-attribute-option.entity';
import { ProductAttributeValue } from '@module/product/entity/product-attribute-value.entity';

export const seedProductAttributeValues = async () => {
  const valueRepo = AppDataSource.getRepository(ProductAttributeValue);
  const attributeRepo = AppDataSource.getRepository(CategoryAttribute);
  const optionRepo = AppDataSource.getRepository(CategoryAttributeOption);
  const productRepo = AppDataSource.getRepository(Product);

  // Get all products and attributes
  const products = await productRepo.find();
  const attributes = await attributeRepo.find();
  const options = await optionRepo.find();

  if (products.length === 0) {
    logger.warn('No products found. Please seed products first.');
    return;
  }

  if (attributes.length === 0) {
    logger.warn('No category attributes found. Please seed category attributes first.');
    return;
  }

  // Sample attribute values data
  const sampleValues = [
    // iPhone 14 attributes
    {
      productSlug: 'iphone-14',
      values: {
        'color': 'black',
        'storage': '128gb',
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
        'color': 'gray',
        'storage': '256gb',
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
        'color': 'white',
        'storage': '256gb',
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
        'color': 'black',
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
        'color': 'gray',
        'storage': '128gb',
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
      const attribute = attributes.find(a => a.name === attributeName && a.category_id === product.category_id);
      if (!attribute) {
        logger.warn(`Attribute ${attributeName} not found for category ${product.category_id}, skipping`);
        continue;
      }

      // Kiểm tra nếu là enum thì lưu option_id, còn lại lưu custom_value
      let category_attribute_option_id: number | null = null;
      let custom_value: string | null = null;

      if (attribute.type === 'enum') {
        const option = options.find(
          o => o.category_attribute_id === attribute.id && o.option_value === value.toString().toLowerCase()
        );
        if (!option) {
          logger.warn(`Option ${value} for attribute ${attributeName} not found, skipping`);
          continue;
        }
        category_attribute_option_id = option.id;
      } else {
        custom_value = value.toString();
      }

      const existing = await valueRepo.findOne({
        where: {
          product_id: product.id,
          category_attribute_id: attribute.id,
        }
      });

      if (!existing) {
        const attributeValue = valueRepo.create({
          product_id: product.id,
          category_attribute_id: attribute.id,
          category_attribute_option_id,
          custom_value,
        });

        await valueRepo.save(attributeValue);
        logger.info(`✅ Seeded value for ${product.name} - ${attribute.name}: ${value}`);
      } else {
        logger.info(`⏭️ Value for ${product.name} - ${attribute.name} already exists, skipping`);
      }
    }
  }

  // Add some random values for remaining products
  const remainingProducts = products.filter(p =>
    !sampleValues.some(sv => sv.productSlug === p.slug)
  );

  const colorAttrs = attributes.filter(a => a.name === 'color');
  const brandAttrs = attributes.filter(a => a.name === 'brand');
  const warrantyAttrs = attributes.filter(a => a.name === 'warranty_months');

  for (const product of remainingProducts.slice(0, 10)) {
    // Lấy attribute đúng category
    const colorAttr = colorAttrs.find(a => a.category_id === product.category_id);
    const brandAttr = brandAttrs.find(a => a.category_id === product.category_id);
    const warrantyAttr = warrantyAttrs.find(a => a.category_id === product.category_id);

    // Add basic attributes for remaining products
    const basicAttributes = [
      {
        attr: colorAttr,
        value: ['black', 'white', 'gray'][Math.floor(Math.random() * 3)]
      },
      { attr: brandAttr, value: 'Generic' },
      { attr: warrantyAttr, value: '12' },
    ];

    for (const { attr, value } of basicAttributes) {
      if (!attr) continue;

      let category_attribute_option_id: number | null = null;
      let custom_value: string | null = null;

      if (attr.type === 'enum') {
        const option = options.find(
          o => o.category_attribute_id === attr.id && o.option_value === value.toString().toLowerCase()
        );
        if (!option) {
          logger.warn(`Option ${value} for attribute ${attr.name} not found, skipping`);
          continue;
        }
        category_attribute_option_id = option.id;
      } else {
        custom_value = value.toString();
      }

      const existing = await valueRepo.findOne({
        where: {
          product_id: product.id,
          category_attribute_id: attr.id,
        }
      });

      if (!existing) {
        const attributeValue = valueRepo.create({
          product_id: product.id,
          category_attribute_id: attr.id,
          category_attribute_option_id,
          custom_value,
        });

        await valueRepo.save(attributeValue);
        logger.info(`✅ Seeded basic value for ${product.name} - ${attr.name}: ${value}`);
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