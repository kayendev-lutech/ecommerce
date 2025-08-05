import { IsString, IsOptional, IsNumber, Min, Max, Length, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVariantDto {
  @Type(() => Number)
  @IsInt({ message: 'product_id must be an integer' })
  @Min(1, { message: 'product_id must be greater than 0' })
  product_id!: number;

  @IsString()
  @Length(1, 100, { message: 'Variant name must be between 1 and 100 characters' })
  name!: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Price must be a valid number' })
  @Min(0, { message: 'Price must be >= 0' })
  @Max(999999.99, { message: 'Price must not exceed 999999.99' })
  price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Discount price must be a valid number' })
  @Min(0, { message: 'Discount price must be >= 0' })
  @Max(999999.99, { message: 'Discount price must not exceed 999999.99' })
  discount_price?: number;

  @IsOptional()
  @IsString()
  @Length(3, 3, { message: 'Currency code must be exactly 3 characters' })
  currency_code?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock_reserved?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  low_stock_threshold?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  weight?: number;

  @IsOptional()
  @IsString()
  image_url?: string;

  @IsOptional()
  attributes?: Record<string, any>;

  @IsOptional()
  is_active?: boolean;
}
