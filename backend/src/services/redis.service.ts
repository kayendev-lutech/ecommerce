import { RedisConfig } from '@config/redis.config';
import { logger } from '@logger/logger';

export class RedisService {
  private get redisClient() {
    return RedisConfig.getInstance().getClient();
  }

  /**
   * Set cache với TTL
   */
  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    try {
      const stringValue = JSON.stringify(value);
      await this.redisClient.setEx(key, ttlSeconds, stringValue);
    } catch (error) {
      logger.error(`Redis SET error for key ${key}:`, error);
    }
  }

  /**
   * Get cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set hash field (dùng cho variants của 1 product)
   */
  async hset(key: string, field: string, value: any): Promise<void> {
    try {
      const stringValue = JSON.stringify(value);
      await this.redisClient.hSet(key, field, stringValue);
    } catch (error) {
      logger.error(`Redis HSET error for key ${key}, field ${field}:`, error);
    }
  }

  /**
   * Get tất cả hash fields (lấy tất cả variants của 1 product)
   */
  async hgetall<T>(key: string): Promise<Record<string, T>> {
    try {
      const hashData = await this.redisClient.hGetAll(key);
      const result: Record<string, T> = {};

      for (const [field, value] of Object.entries(hashData)) {
        result[field] = JSON.parse(value as string);
      }

      return result;
    } catch (error) {
      logger.error(`Redis HGETALL error for key ${key}:`, error);
      return {};
    }
  }

  /**
   * Xóa cache
   */
  async del(key: string): Promise<void> {
    try {
      await this.redisClient.del(key);
    } catch (error) {
      logger.error(`Redis DEL error for key ${key}:`, error);
    }
  }

  /**
   * Xóa hash field
   */
  async hdel(key: string, field: string): Promise<void> {
    try {
      await this.redisClient.hDel(key, field);
    } catch (error) {
      logger.error(`Redis HDEL error for key ${key}, field ${field}:`, error);
    }
  }

  /**
   * Set TTL cho key
   */
  async expire(key: string, ttlSeconds: number): Promise<void> {
    try {
      await this.redisClient.expire(key, ttlSeconds);
    } catch (error) {
      logger.error(`Redis EXPIRE error for key ${key}:`, error);
    }
  }

  /**
   * Check key tồn tại
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redisClient.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Redis EXISTS error for key ${key}:`, error);
      return false;
    }
  }
  /**
   * Delete keys by pattern (cần cho việc invalidate list cache)
   */
  async deleteByPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redisClient.keys(pattern);
      if (keys.length > 0) {
        await this.redisClient.del(keys);
        logger.info(`Deleted ${keys.length} keys matching pattern: ${pattern}`);
      }
    } catch (error) {
      logger.error(`Redis DELETE BY PATTERN error for pattern ${pattern}:`, error);
    }
  }
  /**
   * Set a value only if the key does not already exist (SETNX).
   * Optionally set an expiration in seconds.
   * Returns true if the key was set, false otherwise.
   */
  async setnx(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
    // Assuming you are using ioredis or node-redis
    // For ioredis:
    // NX = only set if not exists, EX = expire in seconds
    const args: any[] = [key, value, 'NX'];
    if (ttlSeconds) {
      args.push('EX', ttlSeconds);
    }
    const result = await (this.redisClient as any).set(...args);
    return result === 'OK';
  }
}
