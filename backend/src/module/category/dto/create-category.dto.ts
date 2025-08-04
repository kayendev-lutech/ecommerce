import { IsString, IsOptional, Length, IsInt, Min } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @Length(3, 100, { message: 'Category name must be between 3 and 100 characters' })
  name!: string;

  @IsString()
  @Length(3, 100, { message: 'Category slug must be between 3 and 100 characters' })
  slug!: string;

  @IsOptional()
  @IsString()
  @Length(0, 1000, { message: 'Description must not exceed 1000 characters' })
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  parent_id?: number;
}