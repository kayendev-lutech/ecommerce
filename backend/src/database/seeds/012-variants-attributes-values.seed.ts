import { AppDataSource } from '@config/typeorm.config';
import { Variant } from '@module/variant/entity/variant.entity';
import { CategoryAttribute } from '@module/category/entity/category-attribute.entity';
import { CategoryAttributeOption } from '@module/category/entity/category-attribute-option.entity';
import { VariantAttributeValue } from '@module/variant/entity/variant-attribute-value.entity';
import { Product } from '@module/product/entity/product.entity';
import { logger } from '@logger/logger';

export const seedVariantAttributeValues = async () => {
  const variantRepo = AppDataSource.getRepository(Variant);
  const attributeRepo = AppDataSource.getRepository(CategoryAttribute);
  const optionRepo = AppDataSource.getRepository(CategoryAttributeOption);
  const valueRepo = AppDataSource.getRepository(VariantAttributeValue);
  const productRepo = AppDataSource.getRepository(Product);

  const variants = await variantRepo.find();
  const attributes = await attributeRepo.find();
  const options = await optionRepo.find();
  const products = await productRepo.find();

  if (variants.length === 0) {
    logger.warn('No variants found. Please seed variants first.');
    return;
  }

  if (attributes.length === 0) {
    logger.warn('No category attributes found. Please seed category attributes first.');
    return;
  }

  // Ví dụ: mỗi variant sẽ có 2 thuộc tính variant-level (color, size/storage)
  for (const variant of variants) {
    // Lấy product để xác định category
    const product = products.find(p => p.id === variant.product_id);
    if (!product) continue;

    // Lấy các attribute variant-level của category này
    const variantLevelAttrs = attributes.filter(
      a => a.category_id === product.category_id && a.is_variant_level
    );

    for (const attr of variantLevelAttrs) {
      // Sinh giá trị mẫu cho từng attribute
      let value: string;
      if (attr.name === 'color') {
        value = ['black', 'white', 'gray', 'red', 'blue'][variant.id % 5];
      } else if (attr.name === 'size') {
        value = ['s', 'm', 'l', 'xl', 'xxl'][variant.id % 5];
      } else if (attr.name === 'storage') {
        value = ['64gb', '128gb', '256gb', '512gb', '1tb'][variant.id % 5];
      } else {
        value = 'sample';
      }

      let category_attribute_option_id: number | null = null;
      let custom_value: string | null = null;

      if (attr.type === 'enum') {
        const option = options.find(
          o => o.category_attribute_id === attr.id && o.option_value === value
        );
        if (!option) {
          logger.warn(`Option ${value} for attribute ${attr.name} not found, skipping`);
          continue;
        }
        category_attribute_option_id = option.id;
      } else {
        custom_value = value;
      }

      const existing = await valueRepo.findOne({
        where: {
          variant_id: variant.id,
          category_attribute_id: attr.id,
        }
      });

      if (!existing) {
        const attrValue = valueRepo.create({
          variant_id: variant.id,
          category_attribute_id: attr.id,
          category_attribute_option_id,
          custom_value,
        });
        await valueRepo.save(attrValue);
        logger.info(`✅ Seeded variant attribute value: Variant ${variant.id} - ${attr.name}: ${value}`);
      } else {
        logger.info(`⏭️ Variant attribute value for Variant ${variant.id} - ${attr.name} already exists, skipping`);
      }
    }
  }

  logger.info('✅ Variant attribute values seeding completed');
};

if (require.main === module) {
  AppDataSource.initialize()
    .then(() => seedVariantAttributeValues())
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error('❌ Seeding variant attribute values failed', err);
      process.exit(1);
    });
}