import { AppDataSource } from '@config/typeorm.config';
import { Order } from '@module/order/entity/order.entity';
import { OrderItem } from '@module/order/entity/order-item.entity';
import { Product } from '@module/product/entity/product.entity';
import { Variant } from '@module/variant/entity/variant.entity';
import { logger } from '@logger/logger';

export const seedOrderItems = async () => {
  const orderRepo = AppDataSource.getRepository(Order);
  const orderItemRepo = AppDataSource.getRepository(OrderItem);
  const productRepo = AppDataSource.getRepository(Product);
  const variantRepo = AppDataSource.getRepository(Variant);

  // Lấy 1 số order, product, variant để seed
  const orders = await orderRepo.find({ take: 3 });
  const products = await productRepo.find({ take: 5 });
  const variants = await variantRepo.find({ take: 10 });

  if (orders.length === 0 || products.length === 0) {
    logger.warn('No orders or products found for order item seeding.');
    return;
  }

  const itemsData = [
    {
      order_id: orders[0].id,
      product_id: products[0].id,
      variant_id: variants.find(v => v.product_id === products[0].id)?.id,
      product_name: products[0].name,
      variant_name: variants.find(v => v.product_id === products[0].id)?.name || 'Default',
      sku: variants.find(v => v.product_id === products[0].id)?.sku || 'DEFAULT-001',
      quantity: 1,
      unit_price: 100000,
      total_price: 100000,
      currency_code: 'VND',
      attributes: { color: 'Red', size: 'M' },
    },
    {
      order_id: orders[1].id,
      product_id: products[1].id,
      variant_id: variants.find(v => v.product_id === products[1].id)?.id,
      product_name: products[1].name,
      variant_name: variants.find(v => v.product_id === products[1].id)?.name || 'Default',
      sku: variants.find(v => v.product_id === products[1].id)?.sku || 'DEFAULT-002',
      quantity: 2,
      unit_price: 150000,
      total_price: 300000,
      currency_code: 'VND',
      attributes: { color: 'Blue', size: 'L' },
    },
    {
      order_id: orders[2].id,
      product_id: products[2].id,
      variant_id: variants.find(v => v.product_id === products[2].id)?.id,
      product_name: products[2].name,
      variant_name: variants.find(v => v.product_id === products[2].id)?.name || 'Default',
      sku: variants.find(v => v.product_id === products[2].id)?.sku || 'DEFAULT-003',
      quantity: 1,
      unit_price: 200000,
      total_price: 200000,
      currency_code: 'VND',
      attributes: { color: 'Black', size: 'XL' },
    },
  ];

  for (const item of itemsData) {
    const exists = await orderItemRepo.findOne({
      where: {
        order_id: item.order_id,
        product_id: item.product_id,
        sku: item.sku,
      },
    });
    if (!exists) {
      await orderItemRepo.save(orderItemRepo.create(item));
      logger.info(`Seeded order item for order ${item.order_id} - product ${item.product_id}`);
    } else {
      logger.info(`Order item for order ${item.order_id} - product ${item.product_id} already exists, skipping`);
    }
  }
};

AppDataSource.initialize()
  .then(() => seedOrderItems())
  .then(() => process.exit(0))
  .catch((err) => {
    logger.error('❌ Seeding order items failed', err);
    process.exit(1);
  });