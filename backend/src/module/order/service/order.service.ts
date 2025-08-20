import { OrderRepository } from '@module/order/repository/order.repository';
import { Order } from '@module/order/entity/order.entity';
import { OrderItem } from '@module/order/entity/order-item.entity';
import { CreateOrderDto } from '@module/order/dto/create-order.dto';
import { UpdateOrderDto } from '@module/order/dto/update-order.dto';
import { NotFoundException, BadRequestException, ConflictException } from '@errors/app-error';
import { AppDataSource } from '@config/typeorm.config';
import { ProductRepository } from '@module/product/repository/product.respository';
import { VariantRepository } from '@module/variant/repository/variant.repository';
import { QueueService } from 'src/queue/services/queue.service';
import { EXCHANGES, ROUTING_KEYS } from 'src/queue/config/exchange.config';
import { logger } from '@logger/logger';
import { OffsetPaginatedDto } from '@common/dto/offset-pagination/paginated.dto';
import { OffsetPaginationDto } from '@common/dto/offset-pagination/offset-pagination.dto';
import { OrderStatus, PaymentStatus } from '@common/order.enum';
import { ExchangeService } from '@services/exchange.service';
import { ListOrderReqDto } from '../dto/list-order-req.dto';
import { OrderResDto } from '../dto/order-res.dto';

export class OrderService {
  private orderRepository = new OrderRepository();
  private productRepository = new ProductRepository();
  private variantRepository = new VariantRepository();
  private queueService = new QueueService();
  private exchangeService = new ExchangeService();

  /**
   * Get paginated orders
   */
  async getAllWithPagination(reqDto: ListOrderReqDto): Promise<OffsetPaginatedDto<OrderResDto>> {
    const { data, total } = await this.orderRepository.findWithPagination(reqDto);
    const pageOptions = new OffsetPaginationDto(total, reqDto);
    return new OffsetPaginatedDto(data, pageOptions);
  }

  /**
   * Get order by ID
   */
  async getById(id: number): Promise<Order | null> {
    return await this.orderRepository.findById(id);
  }

  /**
   * Get order by order number
   */
  async getByOrderNumber(orderNumber: string): Promise<Order | null> {
    return await this.orderRepository.findByOrderNumber(orderNumber);
  }

  /**
   * Create new order with inventory validation and event publishing
   */
  async create(data: CreateOrderDto): Promise<Order> {
    try {
      // Validate products and variants availability
      await this.validateOrderItems(data.items);

      // Generate order number
      const orderNumber = await this.generateOrderNumber();

      // Calculate totals
      const { subtotal, totalAmount } = await this.calculateOrderTotals(data.items, data);

      // Create order entity
      const { items, ...orderDataWithoutItems } = data;
      const orderData = {
        ...orderDataWithoutItems,
        order_number: orderNumber,
        subtotal,
        total_amount: totalAmount,
        status: OrderStatus.PENDING,
        payment_status: PaymentStatus.PENDING,
      };

      const savedOrder = await this.orderRepository.createOrder(orderData);

      // Create order items
      const orderItemsData: any[] = [];
      for (const itemData of data.items) {
        const product = await this.productRepository.findById(itemData.product_id);
        if (!product) throw new BadRequestException(`Product ${itemData.product_id} not found`);

        let variant = null;
        if (itemData.variant_id) {
          variant = await this.variantRepository.findById(itemData.variant_id);
          if (!variant) throw new BadRequestException(`Variant ${itemData.variant_id} not found`);
        }

        const unitPrice = variant?.price ?? product.price;
        if (unitPrice == null) throw new BadRequestException('Price is required for order item');

        orderItemsData.push({
          order_id: savedOrder.id,
          product_id: itemData.product_id,
          variant_id: itemData.variant_id ?? null,
          product_name: product.name ?? 'Unknown Product', // luôn có giá trị
          variant_name: variant ? variant.name : '', // nullable thì dùng '', null hoặc 'Default'
          sku: (variant?.sku ?? product.slug ?? 'UNKNOWN-SKU'), // luôn có giá trị
          quantity: itemData.quantity,
          unit_price: unitPrice ?? 0, // luôn có giá trị
          total_price: (unitPrice ?? 0) * itemData.quantity, // luôn có giá trị
          currency_code: data.currency_code ?? product.currency_code ?? 'VND', // luôn có giá trị
          attributes: itemData.attributes ?? {}, // không undefined
        });
      }

      // Save all order items at once
      await AppDataSource
        .createQueryBuilder()
        .insert()
        .into(OrderItem)
        .values(orderItemsData)
        .execute();

      // Load complete order with items
      const completeOrder = await this.orderRepository.findById(savedOrder.id);

      if (!completeOrder) {
        throw new Error('Failed to load created order');
      }

      // Publish order created event (async, don't wait)
      this.publishOrderEvent(ROUTING_KEYS.ORDER_CREATED, completeOrder);

      // Reserve inventory (async, don't wait)
      this.reserveInventory(completeOrder);

      logger.info(`Order ${completeOrder.order_number} created successfully`);
      return completeOrder;

    } catch (error) {
      logger.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Update order status with event publishing
   */
  async updateStatus(id: number, status: OrderStatus, notes?: string): Promise<Order> {
    const order = await this.getOrderOrFail(id);
    
    // Validate status transition
    this.validateStatusTransition(order.status, status);

    const updateData: Partial<Order> = { 
      status, 
      notes: notes || order.notes,
    };

    // Add timestamps based on status
    switch (status) {
      case OrderStatus.SHIPPED:
        updateData.shipped_at = new Date();
        break;
      case OrderStatus.DELIVERED:
        updateData.delivered_at = new Date();
        break;
      case OrderStatus.CANCELLED:
        updateData.cancelled_at = new Date();
        updateData.cancel_reason = notes || 'Order cancelled';
        break;
    }

    const updatedOrder = await this.orderRepository.update(id, updateData);
    
    if (!updatedOrder) {
      throw new NotFoundException('Order not found after update');
    }

    // Publish order status updated event
    await this.publishOrderEvent(ROUTING_KEYS.ORDER_UPDATED, updatedOrder);

    // Handle specific status changes
    if (status === OrderStatus.CANCELLED) {
      await this.releaseInventory(updatedOrder);
    } else if (status === OrderStatus.SHIPPED) {
      await this.publishOrderEvent(ROUTING_KEYS.ORDER_SHIPPED, updatedOrder);
    } else if (status === OrderStatus.DELIVERED) {
      await this.publishOrderEvent(ROUTING_KEYS.ORDER_DELIVERED, updatedOrder);
    }

    logger.info(`Order ${updatedOrder.order_number} status updated to ${status}`);
    return updatedOrder;
  }

  /**
   * Update payment status with event publishing
   */
  async updatePaymentStatus(id: number, paymentStatus: PaymentStatus, paymentMethod?: string): Promise<Order> {
    const order = await this.getOrderOrFail(id);

    const updatedOrder = await this.orderRepository.update(id, {
      payment_status: paymentStatus,
      payment_method: paymentMethod || order.payment_method,
    });

    if (!updatedOrder) {
      throw new NotFoundException('Order not found after payment update');
    }

    // Publish payment events
    if (paymentStatus === PaymentStatus.PAID) {
      await this.publishOrderEvent(ROUTING_KEYS.PAYMENT_COMPLETED, updatedOrder);
    } else if (paymentStatus === PaymentStatus.FAILED) {
      await this.publishOrderEvent(ROUTING_KEYS.PAYMENT_FAILED, updatedOrder);
    }

    logger.info(`Order ${updatedOrder.order_number} payment status updated to ${paymentStatus}`);
    return updatedOrder;
  }

  /**
   * Cancel order with inventory release
   */
  async cancel(id: number, reason?: string): Promise<Order> {
    return await this.updateStatus(id, OrderStatus.CANCELLED, reason);
  }

  // Private helper methods

  private async getOrderOrFail(id: number): Promise<Order> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }
    return order;
  }

  private async generateOrderNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    
    // Get count of orders this month
    const count = await this.orderRepository.getMonthlyOrderCount(year, parseInt(month));
    const orderNumber = `ORD-${year}${month}-${String(count + 1).padStart(6, '0')}`;
    
    return orderNumber;
  }

  private async validateOrderItems(items: any[]): Promise<void> {
    for (const item of items) {
      const product = await this.productRepository.findById(item.product_id);
      if (!product || !product.is_active) {
        throw new BadRequestException(`Product ${item.product_id} is not available`);
      }

      if (item.variant_id) {
        const variant = await this.variantRepository.findById(item.variant_id);
        if (!variant || !variant.is_active) {
          throw new BadRequestException(`Variant ${item.variant_id} is not available`);
        }

        if (variant && (variant.stock ?? 0) < item.quantity) {
          throw new BadRequestException(`Insufficient stock for variant ${variant.name}`);
        }
      }
    }
  }

  private async calculateOrderTotals(items: any[], orderData: any): Promise<{ subtotal: number; totalAmount: number }> {
    let subtotal = 0;

    for (const item of items) {
      const product = await this.productRepository.findById(item.product_id);
      const variant = item.variant_id 
        ? await this.variantRepository.findById(item.variant_id) 
        : null;
      
      const unitPrice = variant?.price || product!.price;
      subtotal += unitPrice * item.quantity;
    }

    const taxAmount = orderData.tax_amount || 0;
    const shippingFee = orderData.shipping_fee || 0;
    const discountAmount = orderData.discount_amount || 0;

    const totalAmount = subtotal + taxAmount + shippingFee - discountAmount;

    return { subtotal, totalAmount };
  }

  private validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): void {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [OrderStatus.REFUNDED],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.REFUNDED]: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}`
      );
    }
  }

  private async publishOrderEvent(routingKey: string, order: Order): Promise<void> {
    try {
      await this.exchangeService.publishToExchange(
        EXCHANGES.ORDER_EXCHANGE,
        routingKey,
        {
          event: routingKey,
          order_id: order.id,
          order_number: order.order_number,
          order,
          timestamp: new Date().toISOString(),
        }
      );

      logger.info(`Published order event: ${routingKey} for order ${order.order_number}`);
    } catch (error) {
      logger.error(`Failed to publish order event ${routingKey}:`, error);
      // Don't throw error to prevent operation failure
    }
  }

  private async reserveInventory(order: Order): Promise<void> {
    try {
      await this.exchangeService.publishToExchange(
        EXCHANGES.INVENTORY_EXCHANGE,
        ROUTING_KEYS.INVENTORY_RESERVED,
        {
          event: ROUTING_KEYS.INVENTORY_RESERVED,
          order_id: order.id,
          order_number: order.order_number,
          items: order.items.map(item => ({
            product_id: item.product_id,
            variant_id: item.variant_id,
            quantity: item.quantity,
          })),
          timestamp: new Date().toISOString(),
        }
      );

      logger.info(`Inventory reservation requested for order ${order.order_number}`);
    } catch (error) {
      logger.error(`Failed to reserve inventory for order ${order.order_number}:`, error);
    }
  }

  private async releaseInventory(order: Order): Promise<void> {
    try {
      await this.exchangeService.publishToExchange(
        EXCHANGES.INVENTORY_EXCHANGE,
        ROUTING_KEYS.INVENTORY_RELEASED,
        {
          event: ROUTING_KEYS.INVENTORY_RELEASED,
          order_id: order.id,
          order_number: order.order_number,
          items: order.items.map(item => ({
            product_id: item.product_id,
            variant_id: item.variant_id,
            quantity: item.quantity,
          })),
          timestamp: new Date().toISOString(),
        }
      );

      logger.info(`Inventory release requested for order ${order.order_number}`);
    } catch (error) {
      logger.error(`Failed to release inventory for order ${order.order_number}:`, error);
    }
  }
}