import { OrderStatus, PaymentStatus } from '@common/order.enum';
import { OrderItem } from '../entity/order-item.entity';

export class OrderResDto {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address: string;
  billing_address?: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method?: string;
  subtotal: number;
  tax_amount: number;
  shipping_fee: number;
  discount_amount: number;
  total_amount: number;
  currency_code: string;
  notes?: string;
  shipped_at?: Date;
  delivered_at?: Date;
  cancelled_at?: Date;
  cancel_reason?: string;
  created_at: Date;
  updated_at: Date;
  items: OrderItem[];
}