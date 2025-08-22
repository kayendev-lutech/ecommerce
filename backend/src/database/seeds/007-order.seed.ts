import { AppDataSource } from '@config/typeorm.config';
import { Product } from '@module/product/entity/product.entity';
import { Variant } from '@module/variant/entity/variant.entity';
import { logger } from '@logger/logger';
import { Order } from '@module/order/entity/order.entity';
import { OrderStatus, PaymentStatus } from '@common/order.enum';
import { OrderItem } from '@module/order/entity/order-item.entity';

export class OrderSeeder {
  async run(): Promise<void> {
    const orderRepository = AppDataSource.getRepository(Order);
    const productRepository = AppDataSource.getRepository(Product);
    const variantRepository = AppDataSource.getRepository(Variant);

    // Get some products and variants for seed data
    const products = await productRepository.find({ take: 5 });
    const variants = await variantRepository.find({ take: 10 });

    if (products.length === 0) {
      logger.warn('No products found for order seeding. Please seed products first.');
      return;
    }

    const ordersData = [
      {
        order_number: 'ORD-2024-000001',
        customer_name: 'Nguyễn Văn A',
        customer_email: 'nguyenvana@example.com',
        customer_phone: '0901234567',
        shipping_address: '123 Đường ABC, Quận 1, TP.HCM',
        billing_address: '123 Đường ABC, Quận 1, TP.HCM',
        status: OrderStatus.DELIVERED,
        payment_status: PaymentStatus.PAID,
        payment_method: 'credit_card',
        subtotal: 500000,
        tax_amount: 50000,
        shipping_fee: 30000,
        discount_amount: 20000,
        total_amount: 560000,
        currency_code: 'VND',
        notes: 'Giao hàng ngoài giờ hành chính',
        shipped_at: new Date('2024-01-15T10:00:00'),
        delivered_at: new Date('2024-01-17T14:30:00'),
        items: [
          {
            product_id: products[0].id,
            variant_id: variants.find((v) => v.product_id === products[0].id)?.id,
            product_name: products[0].name,
            variant_name: variants.find((v) => v.product_id === products[0].id)?.name || 'Default',
            sku: variants.find((v) => v.product_id === products[0].id)?.sku || 'DEFAULT-001',
            quantity: 2,
            unit_price: 200000,
            total_price: 400000,
            currency_code: 'VND',
            attributes: { color: 'Red', size: 'M' },
          },
          {
            product_id: products[1].id,
            variant_id: variants.find((v) => v.product_id === products[1].id)?.id,
            product_name: products[1].name,
            variant_name: variants.find((v) => v.product_id === products[1].id)?.name || 'Default',
            sku: variants.find((v) => v.product_id === products[1].id)?.sku || 'DEFAULT-002',
            quantity: 1,
            unit_price: 100000,
            total_price: 100000,
            currency_code: 'VND',
            attributes: { color: 'Blue', size: 'L' },
          },
        ],
      },
      {
        order_number: 'ORD-2024-000002',
        customer_name: 'Trần Thị B',
        customer_email: 'tranthib@example.com',
        customer_phone: '0902345678',
        shipping_address: '456 Đường XYZ, Quận 3, TP.HCM',
        status: OrderStatus.PROCESSING,
        payment_status: PaymentStatus.PAID,
        payment_method: 'bank_transfer',
        subtotal: 300000,
        tax_amount: 30000,
        shipping_fee: 25000,
        discount_amount: 0,
        total_amount: 355000,
        currency_code: 'VND',
        notes: 'Khách hàng VIP',
        items: [
          {
            product_id: products[2].id,
            variant_id: variants.find((v) => v.product_id === products[2].id)?.id,
            product_name: products[2].name,
            variant_name: variants.find((v) => v.product_id === products[2].id)?.name || 'Default',
            sku: variants.find((v) => v.product_id === products[2].id)?.sku || 'DEFAULT-003',
            quantity: 1,
            unit_price: 300000,
            total_price: 300000,
            currency_code: 'VND',
            attributes: { color: 'Black', size: 'XL' },
          },
        ],
      },
      {
        order_number: 'ORD-2024-000003',
        customer_name: 'Lê Văn C',
        customer_email: 'levanc@example.com',
        customer_phone: '0903456789',
        shipping_address: '789 Đường DEF, Quận 7, TP.HCM',
        status: OrderStatus.CANCELLED,
        payment_status: PaymentStatus.REFUNDED,
        payment_method: 'cod',
        subtotal: 150000,
        tax_amount: 15000,
        shipping_fee: 20000,
        discount_amount: 10000,
        total_amount: 175000,
        currency_code: 'VND',
        cancelled_at: new Date('2024-01-10T09:00:00'),
        cancel_reason: 'Khách hàng yêu cầu hủy',
        items: [
          {
            product_id: products[3].id,
            variant_id: variants.find((v) => v.product_id === products[3].id)?.id,
            product_name: products[3].name,
            variant_name: variants.find((v) => v.product_id === products[3].id)?.name || 'Default',
            sku: variants.find((v) => v.product_id === products[3].id)?.sku || 'DEFAULT-004',
            quantity: 1,
            unit_price: 150000,
            total_price: 150000,
            currency_code: 'VND',
            attributes: { color: 'White', size: 'S' },
          },
        ],
      },
    ];

    for (const orderData of ordersData) {
      const existingOrder = await orderRepository.findOne({
        where: { order_number: orderData.order_number },
      });

      if (!existingOrder) {
        const { items, ...orderInfo } = orderData;

        const order = orderRepository.create(orderInfo);
        const savedOrder = await orderRepository.save(order);

        // Create order items
        const orderItems = items.map((item) => {
          const orderItem = new OrderItem();
          Object.assign(orderItem, {
            ...item,
            order_id: savedOrder.id,
          });
          return orderItem;
        });

        const orderItemRepository = AppDataSource.getRepository(OrderItem);
        await orderItemRepository.save(orderItems);

        logger.info(`Order ${orderData.order_number} seeded successfully`);
      } else {
        logger.info(`Order ${orderData.order_number} already exists, skipping`);
      }
    }
  }
}

export const seedOrders = async (): Promise<void> => {
  const seeder = new OrderSeeder();
  await seeder.run();
};
