import { ConflictException } from '@errors/app-error';
import { Product } from '@module/product/entity/product.entity';
import { Variant } from '@module/variant/entity/variant.entity';
import { RedisService } from '@services/redis.service';
import { logger } from '@logger/logger';
import { getProductListCacheKey, getProductMetaCacheKey, getProductPriceCacheKey } from './product-cache.utils';

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
    product_id: product.id,
    currency_code: v.currency_code || product.currency_code || 'VND',
    price: v.price ?? product.price ?? 0,
    is_default: v.is_default ?? i === 0,
    sort_order: v.sort_order ?? i,
  }));
}

/**
 * Invalidate all product cache (meta, price, variants)
 */
export async function invalidateProductCache(
  redisService: RedisService,
  getVariantsCacheKey: (id: number) => string,
  productId: number
): Promise<void> {
  try {
    await Promise.all([
      redisService.del(getProductMetaCacheKey(productId)),
      redisService.del(getProductPriceCacheKey(productId)),
      redisService.del(getVariantsCacheKey(productId)),
    ]);
    logger.info(`Cache invalidated for product ${productId}`);
  } catch (error) {
    logger.error(`Error invalidating cache for product ${productId}:`, error);
  }
}
export function generateListCacheKey(reqDto: {
  page?: number;
  limit?: number;
  search?: string;
  order?: string;
  sortBy?: string;
}): string {
  const {
    page = 1,
    limit = 10,
    search,
    order = 'ASC',
    sortBy = 'created_at',
  } = reqDto;

  const keyParts = [
    `page:${page}`,
    `limit:${limit}`,
    search ? `search:${search.trim()}` : '',
    `order:${order}`,
    `sort:${sortBy}`,
  ].filter(Boolean).join('|');

  return getProductListCacheKey(keyParts);
}