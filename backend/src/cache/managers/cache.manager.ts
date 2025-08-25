import { RedisService } from '@services/redis.service';
import { ProductCacheService } from '@cache/strategies/product-cache-strategy';
import { ICacheConfig } from '@cache/cache.service';

export class CacheManager {
  private static instance: CacheManager;
  private redisService: RedisService;
  private productCache: ProductCacheService;

  private constructor() {
    this.redisService = new RedisService();
    this.productCache = new ProductCacheService(this.redisService);
  }

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  public getProductCache(): ProductCacheService {
    return this.productCache;
  }

  public createProductCache(config?: Partial<ICacheConfig>): ProductCacheService {
    return new ProductCacheService(this.redisService, config);
  }

  // Health check for cache services
  public async healthCheck(): Promise<{ redis: boolean }> {
    try {
      await this.redisService.set('health:check', 'ok', 60);
      const result = await this.redisService.get('health:check');
      await this.redisService.del('health:check');
      return { redis: result === 'ok' };
    } catch {
      return { redis: false };
    }
  }
}
