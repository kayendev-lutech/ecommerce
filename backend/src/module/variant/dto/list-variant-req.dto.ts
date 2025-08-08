import { PageOptionsDto } from '@common/dto/cursor-pagination/page-options.dto';
import { IsOptional, IsString, IsNumber, Min, IsInt, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class ListVariantReqDto extends PageOptionsDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  product_id?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  order?: 'ASC' | 'DESC' = 'DESC';

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_default?: boolean;
}