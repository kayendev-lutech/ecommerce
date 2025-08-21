import { AppDataSource } from '@config/typeorm.config';
import { CategoryAttribute } from '@module/category/entity/category-attribute.entity';
import { Category } from '@module/category/entity/category.entity';
import { logger } from '@logger/logger';
import { AttributeType } from '@common/attribute.enum';

export const seedCategoryAttributes = async () => {
  const attributeRepo = AppDataSource.getRepository(CategoryAttribute);
  const categoryRepo = AppDataSource.getRepository(Category);

  // Get categories
  const electronicsCategory = await categoryRepo.findOne({ where: { slug: 'electronics' } });
  const fashionCategory = await categoryRepo.findOne({ where: { slug: 'fashion' } });

  if (!electronicsCategory || !fashionCategory) {
    logger.warn('Categories not found. Please seed categories first.');
    return;
  }

  const attributesData = [
    // Electronics category attributes
    {
      category_id: electronicsCategory.id,
      name: 'brand',
      type: 'text',
      is_required: false,
      is_variant_level: false,
      sort_order: 1,
    },
    {
      category_id: electronicsCategory.id,
      name: 'color',
      type: 'enum',
      is_required: false,
      is_variant_level: true,
      sort_order: 2,
    },
    {
      category_id: electronicsCategory.id,
      name: 'storage',
      type: 'enum',
      is_required: false,
      is_variant_level: true,
      sort_order: 3,
    },
    {
      category_id: electronicsCategory.id,
      name: 'screen_size',
      type: 'number',
      is_required: false,
      is_variant_level: false,
      sort_order: 4,
    },
    {
      category_id: electronicsCategory.id,
      name: 'warranty_months',
      type: 'number',
      is_required: false,
      is_variant_level: false,
      sort_order: 5,
    },
    {
      category_id: electronicsCategory.id,
      name: 'is_waterproof',
      type: 'boolean',
      is_required: false,
      is_variant_level: false,
      sort_order: 6,
    },

    // Fashion category attributes
    {
      category_id: fashionCategory.id,
      name: 'size',
      type: 'enum',
      is_required: false,
      is_variant_level: true,
      sort_order: 1,
    },
    {
      category_id: fashionCategory.id,
      name: 'color',
      type: 'enum',
      is_required: false,
      is_variant_level: true,
      sort_order: 2,
    },
    {
      category_id: fashionCategory.id,
      name: 'material',
      type: 'text',
      is_required: false,
      is_variant_level: false,
      sort_order: 3,
    },
    {
      category_id: fashionCategory.id,
      name: 'gender',
      type: 'enum',
      is_required: false,
      is_variant_level: false,
      sort_order: 4,
    },
  ];

  for (const attrData of attributesData) {
    const category_id = Number(attrData.category_id);
    const type = (attrData.type as AttributeType);

    const existing = await attributeRepo.findOne({
      where: { category_id, name: attrData.name }
    });

    if (!existing) {
      const attribute = attributeRepo.create({
        ...attrData,
        category_id,
        type,
      });
      await attributeRepo.save(attribute);
      logger.info(`✅ Seeded category attribute: ${attrData.name} for category ${category_id}`);
    } else {
      logger.info(`⏭️ Category attribute ${attrData.name} already exists, skipping`);
    }
  }

  logger.info('✅ Category attributes seeding completed');
};

// Run if called directly
if (require.main === module) {
  AppDataSource.initialize()
    .then(() => seedCategoryAttributes())
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error('❌ Seeding category attributes failed', err);
      process.exit(1);
    });
}