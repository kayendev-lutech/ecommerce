import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class IdParamDto {
  @Type(() => Number)
  @IsInt({ message: 'id must be an integer number' })
  @Min(1, { message: 'id must not be less than 1' })
  id!: number;
}
