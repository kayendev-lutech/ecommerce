import { IsString, IsOptional, Length, IsInt, Min, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCategoryDto {
  @IsString()
  @Length(1, 100, { message: 'Category name must be between 1 and 100 characters' })
  name!: string;

  @IsString()
  @Length(1, 100, { message: 'Category slug must be between 1 and 100 characters' })
  slug!: string;

  @IsOptional()
  @IsString()
  @Length(0, 1000, { message: 'Description must not exceed 1000 characters' })
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Parent ID must be an integer' })
  @Min(1, { message: 'Parent ID must be greater than 0' })
  parent_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Sort order must be an integer' })
  @Min(0, { message: 'Sort order must be 0 or greater' })
  sort_order?: number;

  @IsOptional()
  @IsBoolean({ message: 'is_active must be a boolean' })
  is_active?: boolean;

  @IsOptional()
  metadata?: Record<string, any>;
}
