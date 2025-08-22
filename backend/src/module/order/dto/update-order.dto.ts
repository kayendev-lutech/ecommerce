import { OrderStatus, PaymentStatus } from '@common/order.enum';
import { IsOptional, IsString, IsEnum } from 'class-validator';

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsEnum(PaymentStatus)
  payment_status?: PaymentStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
