import { RedisService } from '@services/redis.service';
import { Product } from '@module/product/entity/product.entity';
import { Variant } from '@module/variant/entity/variant.entity';
import { pick } from 'lodash';
import { logger } from '@logger/logger';
import {
  getProductMetaCacheKey,
  getProductPriceCacheKey,
  getVariantsCacheKey,
  invalidateProductListCache,
} from '@module/product/helper/product-cache.utils';
import { ICacheConfig } from '@cache/cache.service';
import { BaseCacheStrategy } from '@cache/strategies/base-cache.strategy';

export class ProductCacheService extends BaseCacheStrategy<Product> {
  constructor(redisService: RedisService, config?: Partial<ICacheConfig>) {
    const defaultConfig: ICacheConfig = {
      metaTTL: 60 * 60 * 24, // 1 day
      priceTTL: 300, // 5 minutes
      variantsTTL: 300, // 5 minutes
      listTTL: 180, // 3 minutes
      GetOrSetTTL: 120, // 2 minutes
    };
    super(redisService, { ...defaultConfig, ...config });
  }

  async get(id: number): Promise<Product | null> {
    const metaKey = getProductMetaCacheKey(id);
    const priceKey = getProductPriceCacheKey(id);
    const variantsKey = getVariantsCacheKey(id);

    try {
      const [metaCache, priceCache, variantsCache] = await Promise.all([
        this.safeGet<Partial<Product>>(metaKey),
        this.safeGet<Partial<Product>>(priceKey),
        this.safeGet<Variant[]>(variantsKey),
      ]);

      if (metaCache && priceCache && variantsCache) {
        logger.debug(`Cache hit for product ${id}`);
        return { ...metaCache, ...priceCache, variants: variantsCache } as Product;
      }

      return null;
    } catch (error) {
      logger.error(`Error getting cached product ${id}:`, error);
      return null;
    }
  }

  async set(id: number, product: Product, ttl?: number): Promise<void> {
    const metaKey = getProductMetaCacheKey(id);
    const priceKey = getProductPriceCacheKey(id);
    const variantsKey = getVariantsCacheKey(id);

    const metaData = pick(product, [
      'id',
      'name',
      'slug',
      'description',
      'currency_code',
      'category_id',
      'image_url',
      'created_at',
      'updated_at',
    ]);

    const priceData = pick(product, ['price', 'discount_price', 'is_active', 'is_visible']);
    const variantsData = product.variants || [];

    await Promise.allSettled([
      this.safeSet(metaKey, metaData, this.config.metaTTL),
      this.safeSet(priceKey, priceData, this.config.priceTTL),
      this.safeSet(variantsKey, variantsData, this.config.variantsTTL),
    ]);

    logger.info(`Product ${id} cached successfully`);
  }

  async updateMeta(id: number, product: Partial<Product>): Promise<void> {
    const metaKey = getProductMetaCacheKey(id);
    const cachedMeta = await this.safeGet<Partial<Product>>(metaKey);

    const metaData = pick(product, [
      'id',
      'name',
      'slug',
      'description',
      'currency_code',
      'category_id',
      'image_url',
      'created_at',
      'updated_at',
    ]);

    const newMeta = { ...(cachedMeta || {}), ...metaData };
    await this.safeSet(metaKey, newMeta, this.config.metaTTL);

    logger.info(`Product ${id} meta cache updated`);
  }

  async updatePrice(id: number, product: Partial<Product>): Promise<void> {
    const priceKey = getProductPriceCacheKey(id);
    const priceData = pick(product, ['price', 'discount_price', 'is_active', 'is_visible']);

    await this.safeSet(priceKey, priceData, this.config.priceTTL);
    logger.info(`Product ${id} price cache updated`);
  }

  async updateVariants(id: number, variants: Variant[]): Promise<void> {
    const variantsKey = getVariantsCacheKey(id);
    await this.safeSet(variantsKey, variants, this.config.variantsTTL);
    logger.info(`Product ${id} variants cache updated`);
  }

  async invalidate(id: number): Promise<void> {
    const keys = [
      getProductMetaCacheKey(id),
      getProductPriceCacheKey(id),
      getVariantsCacheKey(id),
      `product:${id}:detail`,
      `product:${id}:lock`,
    ];

    await this.safeDel(keys);
    logger.info(`All cache invalidated for product ${id}`);
  }

  async invalidateList(): Promise<void> {
    await invalidateProductListCache(this.redisService);
  }

  async smartUpdate(id: number, updateData: Partial<Product>, product: Product): Promise<void> {
    const priceFields = ['price', 'discount_price', 'is_active', 'is_visible'];
    const metaFields = ['name', 'slug', 'description', 'currency_code', 'category_id', 'image_url'];

    const updatedFields = Object.keys(updateData);
    const isOnlyPriceUpdate = updatedFields.every((key) => priceFields.includes(key));
    const isOnlyMetaUpdate = updatedFields.every((key) => metaFields.includes(key));

    if (isOnlyPriceUpdate) {
      await this.updatePrice(id, product);
    } else if (isOnlyMetaUpdate) {
      await this.updateMeta(id, product);
    } else {
      await this.invalidate(id);
      logger.info(`Product ${id} all cache invalidated due to mixed field updates`);
    }

    // Always invalidate list cache when product changes
    await this.invalidateList();
    logger.info(`Product list cache invalidated after updating product ${id}`);
  }
}
