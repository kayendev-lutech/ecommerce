import { RedisService } from "@services/redis.service";

export function getProductCacheKey(id: number): string {
  return `product:${id}`;
}

export function getVariantsCacheKey(productId: number): string {
  return `product:${productId}:variants`;
}

export function getProductMetaCacheKey(id: number): string {
  return `product:${id}:meta`;
}

export function getProductPriceCacheKey(id: number): string {
  return `product:${id}:price`;
}

export function getProductListCacheKey(filters: string): string {
  return `product:list:${filters}`;
}

export async function getOrSetCache<T>(
  redisService: RedisService,
  key: string,
  ttl: number,
  fetchFn: () => Promise<T | null>
): Promise<T | null> {
  let value = await redisService.get<T>(key);
  if (value !== null && value !== undefined) return value;

  const lockKey = `${key}:lock`;
  const lock = await redisService.setnx(lockKey, '1', 5); // 5s lock
  if (!lock) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    value = await redisService.get<T>(key);
    if (value !== null && value !== undefined) return value;
  }

  const data = await fetchFn();
  if (data !== null && data !== undefined) {
    await redisService.set(key, data, ttl);
  }
  await redisService.del(lockKey);
  return data;
}
 /**
   * Invalidate all product list cache entries
   * Sử dụng pattern matching để xóa tất cả cache list
   */
export async function invalidateProductListCache(redisService: RedisService): Promise<void> {
  try {
    const listCachePattern = 'product:list:*';
    if (typeof redisService.deleteByPattern === 'function') {
      await redisService.deleteByPattern(listCachePattern);
      logger.info('Product list cache invalidated');
    } else {
      logger.warn('deleteByPattern method is not implemented in RedisService');
    }
  } catch (error) {
    logger.error('Error invalidating product list cache:', error);
  }
}