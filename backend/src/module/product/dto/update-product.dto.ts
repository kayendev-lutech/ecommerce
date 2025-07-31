import { IsString, IsOptional } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  price?: number;

  @IsOptional()
  @IsString()
  currency_code?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  discount_price?: number;

  @IsOptional()
  @IsString()
  slug?: string;
}