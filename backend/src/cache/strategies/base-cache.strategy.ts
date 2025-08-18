import { RedisService } from '@services/redis.service';
import { logger } from '@logger/logger';
import { ICacheStrategy, ICacheConfig } from '@cache/interfaces/cache-strategy.interface';

export abstract class BaseCacheStrategy<T> implements ICacheStrategy<T> {
  protected redisService: RedisService;
  protected config: ICacheConfig;

  constructor(redisService: RedisService, config: ICacheConfig) {
    this.redisService = redisService;
    this.config = config;
  }

  abstract get(id: number): Promise<T | null>;
  abstract set(id: number, data: T, ttl?: number): Promise<void>;
  abstract invalidate(id: number): Promise<void>;
  abstract invalidateList(): Promise<void>;

  protected async safeSet(key: string, data: any, ttl: number): Promise<void> {
    try {
      await this.redisService.set(key, data, ttl);
      logger.debug(`Cache set for key: ${key}`);
    } catch (error) {
      logger.error(`Error setting cache for key ${key}:`, error);
    }
  }

  protected async safeGet<U>(key: string): Promise<U | null> {
    try {
      return await this.redisService.get<U>(key);
    } catch (error) {
      logger.error(`Error getting cache for key ${key}:`, error);
      return null;
    }
  }

  protected async safeDel(key: string | string[]): Promise<void> {
    try {
      if (Array.isArray(key)) {
        await Promise.allSettled(key.map(k => this.redisService.del(k)));
      } else {
        await this.redisService.del(key);
      }
      logger.debug(`Cache deleted for key(s): ${key}`);
    } catch (error) {
      logger.error(`Error deleting cache for key(s) ${key}:`, error);
    }
  }
}