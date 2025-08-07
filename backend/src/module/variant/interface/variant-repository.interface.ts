import { Variant } from '@module/variant/entity/variant.entity';

export interface IVariantRepository {
  findAll(): Promise<Variant[]>;
  findById(id: string): Promise<Variant | null>;
  findByProductId(product_id: string): Promise<Variant[]>;
  findByNameAndProductId(name: string, product_id: string): Promise<Variant | null>;
  findBySku(sku: string): Promise<Variant | null>;
  createVariant(data: Partial<Variant>): Promise<Variant>;
  updateVariant(id: string, data: Partial<Variant>): Promise<Variant | null>;
  deleteVariant(id: string): Promise<void>;
}
