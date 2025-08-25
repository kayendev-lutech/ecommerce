import { RedisService } from '@services/redis.service';
import { getOrSetCache } from '@module/product/helper/product-cache.utils';
import { logger } from '@logger/logger';

export function Cacheable(key: string | ((...args: any[]) => string), ttl: number = 300) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const redisService: RedisService = (this as any).redisService; // chữ r thường

      if (!redisService) {
        logger.warn('RedisService not found, executing method without cache');
        return method.apply(this, args);
      }

      const cacheKey = typeof key === 'function' ? key(...args) : key;

      return getOrSetCache(redisService, cacheKey, ttl, async () => method.apply(this, args));
    };
  };
}

export function CacheInvalidate(keys: string | string[] | ((...args: any[]) => string | string[])) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await method.apply(this, args);

      const redisService: RedisService = (this as any).redisService;
      if (!redisService) {
        logger.warn('RedisService not found, skipping cache invalidation');
        return result;
      }

      try {
        const invalidateKeys = typeof keys === 'function' ? keys(...args) : keys;
        const keyArray = Array.isArray(invalidateKeys) ? invalidateKeys : [invalidateKeys];

        await Promise.allSettled(keyArray.map((key) => redisService.del(key)));

        logger.debug(`Cache invalidated for keys: ${keyArray.join(', ')}`);
      } catch (error) {
        logger.error('Cache invalidation failed:', error);
      }

      return result;
    };
  };
}
