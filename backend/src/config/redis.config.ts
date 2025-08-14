import { createClient } from 'redis';
import { logger } from '@logger/logger';

export class RedisConfig {
  private static instance: RedisConfig;
  private client: any;

  private constructor() {}

  public static getInstance(): RedisConfig {
    if (!RedisConfig.instance) {
      RedisConfig.instance = new RedisConfig();
    }
    return RedisConfig.instance;
  }

  public async connect() {
    try {
      this.client = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          connectTimeout: 5000,
        },
      });

      this.client.on('error', (err: any) => {
        logger.error('Redis Client Error', err);
      });

      this.client.on('connect', () => {
        logger.info('Redis connected successfully');
      });

      await this.client.connect();
      return this.client;
    } catch (error) {
      logger.error('Redis connection failed:', error);
      throw error;
    }
  }

  public getClient() {
    if (!this.client) {
      throw new Error('Redis client not initialized. Call connect() first.');
    }
    return this.client;
  }

  public async disconnect() {
    if (this.client) {
      await this.client.quit();
    }
  }
}