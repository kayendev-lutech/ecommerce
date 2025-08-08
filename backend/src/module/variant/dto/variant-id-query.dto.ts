import { IsString, IsNotEmpty } from 'class-validator';

export class IdParamDto {
  @IsString()
  @IsNotEmpty()
  id!: number;
}
