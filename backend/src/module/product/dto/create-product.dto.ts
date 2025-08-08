import { IsString, IsOptional, IsNumber, Min, Max, Length, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsOptional()
  @IsString()
  @Length(3, 100, { message: 'Product name must be between 3 and 100 characters' })
  name?: string;

  @IsOptional()
  @IsString()
  @Length(3, 100, { message: 'Product slug must be between 3 and 100 characters' })
  slug?: string;

  @IsOptional()
  @IsString()
  @Length(0, 1000, { message: 'Description must not exceed 1000 characters' })
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Price must be a valid number with max 2 decimal places' },
  )
  @Min(0.01, { message: 'Price must be greater than 0' })
  @Max(999999.99, { message: 'Price must not exceed 999999.99' })
  price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Discount price must be a valid number with max 2 decimal places' },
  )
  @Min(0, { message: 'Discount price must be 0 or greater' })
  @Max(999999.99, { message: 'Discount price must not exceed 999999.99' })
  discount_price?: number;

  @IsOptional()
  @IsString()
  @Length(3, 3, { message: 'Currency code must be exactly 3 characters (e.g., VND, USD)' })
  currency_code?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Category ID must be an integer' })
  @Min(1, { message: 'Category ID must be greater than 0' })
  category_id?: number;

  @IsOptional()
  @IsString()
  image_url?: string;
}
