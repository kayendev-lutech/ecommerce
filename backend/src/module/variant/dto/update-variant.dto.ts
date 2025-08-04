import { PartialType } from '@nestjs/mapped-types';
import { CreateVariantDto } from './create-variant.dto';

// Sử dụng PartialType để tất cả các trường đều optional khi update
export class UpdateVariantDto extends PartialType(CreateVariantDto) {}