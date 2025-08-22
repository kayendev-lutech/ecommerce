import { PageOptionsDto } from '@common/dto/cursor-pagination/page-options.dto';
import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class LoadMoreProductsReqDto extends PageOptionsDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}
