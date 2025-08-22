import { AppDataSource } from '@config/typeorm.config';
import { CategoryAttribute } from '@module/category/entity/category-attribute.entity';
import { CategoryAttributeOption } from '@module/category/entity/category-attribute-option.entity';
import { logger } from '@logger/logger';
import { AttributeType } from '@common/attribute.enum';

export const seedCategoryAttributeOptions = async () => {
  const attributeRepo = AppDataSource.getRepository(CategoryAttribute);
  const optionRepo = AppDataSource.getRepository(CategoryAttributeOption);

  // Get all enum type attributes
  const enumAttributes = await attributeRepo.find({
    where: { type: AttributeType.ENUM },
  });

  const optionsData = [
    // Color options (for both electronics and fashion)
    {
      attributeName: 'color',
      options: [
        { option_value: 'black', display_name: 'Đen', sort_order: 1 },
        { option_value: 'white', display_name: 'Trắng', sort_order: 2 },
        { option_value: 'red', display_name: 'Đỏ', sort_order: 3 },
        { option_value: 'blue', display_name: 'Xanh dương', sort_order: 4 },
        { option_value: 'green', display_name: 'Xanh lá', sort_order: 5 },
        { option_value: 'gray', display_name: 'Xám', sort_order: 6 },
      ],
    },
    // Storage options (electronics)
    {
      attributeName: 'storage',
      options: [
        { option_value: '64gb', display_name: '64GB', sort_order: 1 },
        { option_value: '128gb', display_name: '128GB', sort_order: 2 },
        { option_value: '256gb', display_name: '256GB', sort_order: 3 },
        { option_value: '512gb', display_name: '512GB', sort_order: 4 },
        { option_value: '1tb', display_name: '1TB', sort_order: 5 },
      ],
    },
    // Size options (fashion)
    {
      attributeName: 'size',
      options: [
        { option_value: 'xs', display_name: 'XS', sort_order: 1 },
        { option_value: 's', display_name: 'S', sort_order: 2 },
        { option_value: 'm', display_name: 'M', sort_order: 3 },
        { option_value: 'l', display_name: 'L', sort_order: 4 },
        { option_value: 'xl', display_name: 'XL', sort_order: 5 },
        { option_value: 'xxl', display_name: 'XXL', sort_order: 6 },
      ],
    },
    // Gender options (fashion)
    {
      attributeName: 'gender',
      options: [
        { option_value: 'male', display_name: 'Nam', sort_order: 1 },
        { option_value: 'female', display_name: 'Nữ', sort_order: 2 },
        { option_value: 'unisex', display_name: 'Unisex', sort_order: 3 },
      ],
    },
  ];

  for (const optionData of optionsData) {
    const attributes = enumAttributes.filter((attr) => attr.name === optionData.attributeName);

    for (const attribute of attributes) {
      for (const optionInfo of optionData.options) {
        const existing = await optionRepo.findOne({
          where: {
            category_attribute_id: attribute.id,
            option_value: optionInfo.option_value,
          },
        });

        if (!existing) {
          const option = optionRepo.create({
            category_attribute_id: attribute.id,
            ...optionInfo,
          });
          await optionRepo.save(option);
          logger.info(
            `✅ Seeded option: ${optionInfo.display_name} for attribute ${attribute.name}`,
          );
        } else {
          logger.info(`⏭️ Option ${optionInfo.option_value} already exists, skipping`);
        }
      }
    }
  }

  logger.info('✅ Category attribute options seeding completed');
};

// Run if called directly
if (require.main === module) {
  AppDataSource.initialize()
    .then(() => seedCategoryAttributeOptions())
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error('❌ Seeding category attribute options failed', err);
      process.exit(1);
    });
}
