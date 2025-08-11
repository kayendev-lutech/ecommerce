import { PageOptionsDto } from '@common/dto/offset-pagination/page-options.dto';
import { StringFieldOptional } from '@decorators/field.decorators';

export class ListUserReqDto extends PageOptionsDto {
  @StringFieldOptional()
  search?: string;

  @StringFieldOptional()
  sortBy?: string;
}