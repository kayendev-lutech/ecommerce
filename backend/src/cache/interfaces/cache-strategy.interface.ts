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
