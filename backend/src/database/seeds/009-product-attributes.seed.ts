import { AppDataSource } from '@config/typeorm.config';
import { ProductAttribute } from '@module/product/entity/product-attribute.entity';
import { logger } from '@logger/logger';

export const seedProductAttributes = async () => {
  const attributeRepo = AppDataSource.getRepository(ProductAttribute);

  const attributesData = [
    {
      name: 'color',
      display_name: 'Màu sắc',
      data_type: 'select',
      options: ['Đỏ', 'Xanh', 'Vàng', 'Đen', 'Trắng', 'Xám', 'Nâu', 'Hồng'],
      is_required: false,
      is_filterable: true,
      sort_order: 1,
    },
    {
      name: 'size',
      display_name: 'Kích thước',
      data_type: 'select',
      options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      is_required: false,
      is_filterable: true,
      sort_order: 2,
    },
    {
      name: 'material',
      display_name: 'Chất liệu',
      data_type: 'text',
      is_required: false,
      is_filterable: true,
      sort_order: 3,
    },
    {
      name: 'brand',
      display_name: 'Thương hiệu',
      data_type: 'text',
      is_required: false,
      is_filterable: true,
      sort_order: 4,
    },
    {
      name: 'weight',
      display_name: 'Trọng lượng (kg)',
      data_type: 'number',
      is_required: false,
      is_filterable: false,
      sort_order: 5,
    },
    {
      name: 'warranty_months',
      display_name: 'Bảo hành (tháng)',
      data_type: 'number',
      is_required: false,
      is_filterable: true,
      sort_order: 6,
    },
    {
      name: 'is_waterproof',
      display_name: 'Chống nước',
      data_type: 'boolean',
      is_required: false,
      is_filterable: true,
      sort_order: 7,
    },
    {
      name: 'screen_size',
      display_name: 'Kích thước màn hình (inch)',
      data_type: 'number',
      is_required: false,
      is_filterable: true,
      sort_order: 8,
    },
    {
      name: 'storage',
      display_name: 'Dung lượng',
      data_type: 'select',
      options: ['64GB', '128GB', '256GB', '512GB', '1TB'],
      is_required: false,
      is_filterable: true,
      sort_order: 9,
    },
    {
      name: 'connectivity',
      display_name: 'Kết nối',
      data_type: 'select',
      options: ['WiFi', 'Bluetooth', 'USB-C', 'Lightning', '3.5mm', 'Wireless'],
      is_required: false,
      is_filterable: true,
      sort_order: 10,
    },
  ];

  for (const attrData of attributesData) {
    const existing = await attributeRepo.findOne({
      where: { name: attrData.name }
    });

    if (!existing) {
      const attribute = attributeRepo.create(attrData);
      await attributeRepo.save(attribute);
      logger.info(`✅ Seeded product attribute: ${attrData.name}`);
    } else {
      logger.info(`⏭️ Product attribute ${attrData.name} already exists, skipping`);
    }
  }

  logger.info('✅ Product attributes seeding completed');
};

// Run if called directly
if (require.main === module) {
  AppDataSource.initialize()
    .then(() => seedProductAttributes())
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error('❌ Seeding product attributes failed', err);
      process.exit(1);
    });
}