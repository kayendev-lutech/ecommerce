import { Variant } from '@module/variant/entity/variant.entity';

export interface IVariantService {
  getById(id: string): Promise<Variant>;
  getByProductId(product_id: string): Promise<Variant[]>;
  create(data: Partial<Variant>): Promise<Variant>;
  update(id: string, data: Partial<Variant>): Promise<Variant>;
  delete(id: string): Promise<void>;
}
