import { ApiProperty } from '@nestjs/swagger';

export class VariantResDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1 })
  product_id!: number;

  @ApiProperty({ example: 'iPhone 14 Pro - 128GB Black' })
  name!: string;

  @ApiProperty({ example: 'IP14P-128-BLK', required: false })
  sku?: string;

  @ApiProperty({ example: '123456789', required: false })
  barcode?: string;

  @ApiProperty({ example: 999.99, required: false })
  price?: number;

  @ApiProperty({ example: 899.99, required: false })
  discount_price?: number;

  @ApiProperty({ example: 'USD', required: false })
  currency_code?: string;

  @ApiProperty({ example: 10, required: false })
  stock?: number;

  @ApiProperty({ example: 0, required: false })
  stock_reserved?: number;

  @ApiProperty({ example: 0, required: false })
  low_stock_threshold?: number;

  @ApiProperty({ example: 0.2, required: false })
  weight?: number;

  @ApiProperty({ example: 'https://example.com/variant-image.jpg', required: false })
  image_url?: string;

  @ApiProperty({ type: Object, required: false })
  attributes?: Record<string, any>;

  @ApiProperty({ example: true })
  is_active!: boolean;

  @ApiProperty({ example: false })
  is_default!: boolean;

  @ApiProperty({ example: 0 })
  sort_order?: number;

  @ApiProperty({ type: 'string', format: 'date-time' })
  created_at!: Date;

  @ApiProperty({ type: 'string', format: 'date-time' })
  updated_at!: Date;

  @ApiProperty({ type: 'string', format: 'date-time', required: false })
  deleted_at?: Date;
}
