import { IsOptional, IsNumber } from 'class-validator';

export class CreateOrderItemDto {
  @IsNumber()
  product_id: number;

  @IsOptional()
  @IsNumber()
  variant_id?: number;

  @IsNumber()
  quantity: number;

  @IsOptional()
  attributes?: Record<string, any>;
}
