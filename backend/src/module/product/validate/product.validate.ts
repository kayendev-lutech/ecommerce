import { ConflictException } from '@errors/app-error';
import { Product } from '../entity/product.entity';
import { Variant } from '@module/variant/entity/variant.entity';

export function validateVariantNames(variants: Partial<Variant>[]) {
  const names = variants.map((v) => v.name?.trim()).filter(Boolean);
  const uniqueNames = new Set(names);
  if (uniqueNames.size !== names.length) {
    throw new ConflictException('Variant names within the same product must be unique.');
  }
}

export function buildVariantData(
  variants: Partial<Variant>[],
  product: Partial<Product> & { id: number }, 
): Partial<Variant>[] {
  return variants.map((v, i) => ({
    ...v,
    product_id: String(product.id),
    currency_code: v.currency_code || product.currency_code || 'VND',
    price: v.price ?? product.price ?? 0,
    is_default: v.is_default ?? i === 0,
    sort_order: v.sort_order ?? i,
  }));
}