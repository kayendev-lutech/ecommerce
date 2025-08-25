export enum ProductCacheTTL {
  META = 3600, // 1 hour
  PRICE = 600, // 10 minutes
  VARIANTS = 900, // 15 minutes
  LIST = 300, // 5 minutes
  GET_OR_SET = 120, // 2 minutes
}
export interface ICacheStrategy<T> {
  get(id: number): Promise<T | null>;
  set(id: number, data: T, ttl?: number): Promise<void>;
  invalidate(id: number): Promise<void>;
  invalidateList(): Promise<void>;
}

export interface ICacheConfig {
  metaTTL: number;
  priceTTL: number;
  variantsTTL: number;
  listTTL: number;
  GetOrSetTTL: number;
}

export abstract class CacheService<T> {
  constructor(protected readonly cacheManager: any) {}

  async get(id: number): Promise<T | null> {
    return this.cacheManager.get(id);
  }

  async set(id: number, data: T, ttl?: number): Promise<void> {
    await this.cacheManager.set(id, data, ttl);
  }

  async safeSet(id: number, data: T, ttl?: number): Promise<void> {
    if (data) {
      await this.set(id, data, ttl);
    }
  }

  async invalidate(id: number): Promise<void> {
    await this.cacheManager.invalidate(id);
  }

  async invalidateList(): Promise<void> {
    await this.cacheManager.invalidateList();
  }
}
