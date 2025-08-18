import { RedisService } from '@services/redis.service';
import { ProductCacheStrategy } from '@cache/strategies/product-cache-strategy';
import { ICacheConfig } from '@cache/interfaces/cache-strategy.interface';

export class CacheManager {
  private static instance: CacheManager;
  private redisService: RedisService;
  private productCache: ProductCacheStrategy;

  private constructor() {
    this.redisService = new RedisService();
    this.productCache = new ProductCacheStrategy(this.redisService);
  }

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  public getProductCache(): ProductCacheStrategy {
    return this.productCache;
  }

  public createProductCache(config?: Partial<ICacheConfig>): ProductCacheStrategy {
    return new ProductCacheStrategy(this.redisService, config);
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