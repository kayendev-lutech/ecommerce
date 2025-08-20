import { ApiProperty } from '@nestjs/swagger';
import { Variant } from '@module/variant/entity/variant.entity';

export class ProductResDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'iPhone 14' })
  name!: string;

  @ApiProperty({ example: 'iphone-14' })
  slug!: string;

  @ApiProperty({ example: 'Latest Apple iPhone 14', required: false })
  description?: string;

  @ApiProperty({ example: 999.99 })
  price!: number;

  @ApiProperty({ example: 899.99, required: false })
  discount_price?: number;

  @ApiProperty({ example: 'VND' })
  currency_code!: string;

  @ApiProperty({ example: 2 })
  category_id!: number;

  @ApiProperty({ example: 'https://example.com/image.jpg', required: false })
  image_url?: string;

  @ApiProperty({ example: true })
  is_active!: boolean;

  @ApiProperty({ example: true })
  is_visible!: boolean;

  @ApiProperty({ type: 'string', format: 'date-time' })
  created_at!: Date;

  @ApiProperty({ type: 'string', format: 'date-time' })
  updated_at!: Date;

  @ApiProperty({ type: 'string', format: 'date-time', required: false })
  deleted_at?: Date;

  @ApiProperty({ type: () => [Variant], required: false })
  variants?: Variant[];
  
  @ApiProperty({ type: Object, required: false })
  attributes?: Record<string, any>;
}