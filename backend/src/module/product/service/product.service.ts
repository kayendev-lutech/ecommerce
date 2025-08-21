import { ProductRepository } from '@module/product/repository/product.respository.js';
import { Product } from '@module/product/entity/product.entity.js';
import { BadRequestException, ConflictException, NotFoundException } from '@errors/app-error.js';
import { VariantRepository } from '@module/variant/repository/variant.repository';
import { Variant } from '@module/variant/entity/variant.entity';
import { Optional } from '@utils/optional.utils';
import { OffsetPaginatedDto } from '@common/dto/offset-pagination/paginated.dto';
import { ProductResDto } from '@module/product/dto/product.res.dto';
import { plainToInstance } from 'class-transformer';
import { CursorPaginatedDto } from '@common/dto/cursor-pagination/paginated.dto';
import { LoadMoreProductsReqDto } from '@module/product/dto/load-more-products-req.dto';
import { buildPaginator } from '@utils/cursor-pagination';
import { CursorPaginationDto } from '@common/dto/cursor-pagination/cursor-pagination.dto';
import { ListProductReqDto } from '@module/product/dto/list-product-req.dto';
import { OffsetPaginationDto } from '@common/dto/offset-pagination/offset-pagination.dto';
import { validateVariantNames, buildVariantData, invalidateProductCache, generateListCacheKey } from '@utils/product/product-validate.utils';
import { CreateProductDto } from '@module/product/dto/create-product.dto';
import { UpdateProductDto } from '@module/product/dto/update-product.dto';
import { RedisService } from '@services/redis.service';
import { logger } from '@logger/logger'; 
import { pick } from 'lodash';

import {
  getProductMetaCacheKey,
  getProductPriceCacheKey,
  getVariantsCacheKey,
  getProductListCacheKey,
  getOrSetCache,
  invalidateProductListCache,
} from '@utils/product/product-cache.utils';
import { QueueService } from 'src/queue/services/queue.service';
import { UploadImageJob, UploadImageJobPayload } from 'src/queue/jobs/upload-image.job';
import sharp from 'sharp';
import { CacheManager } from '@cache/managers/cache.manager';
import { ProductCacheStrategy } from '@cache/strategies/product-cache-strategy';
import { CacheInvalidate } from '@cache/decorators/cacheable.decorator';

export class ProductService {
  private productRepository = new ProductRepository();
  private variantRepository = new VariantRepository();
  private queueService = new QueueService();
  private cacheManager = CacheManager.getInstance();
  private productCache: ProductCacheStrategy;

  constructor() {
    this.productCache = this.cacheManager.getProductCache();
  }
  public getQueryBuilder(alias: string) {
    return this.productRepository.repository.createQueryBuilder(alias);
  }
  public get redisService() {
    return this.productCache['redisService'];
  }
  /**
   * Retrieves a paginated list of products with optional search, sorting, and additional filters.
   * Implements cache for product lists based on filters.
   */
  async getAllWithPagination(
  reqDto: ListProductReqDto,
  ): Promise<OffsetPaginatedDto<ProductResDto>> {
    const cacheKey = generateListCacheKey(reqDto);

    const result = await getOrSetCache( this.redisService, cacheKey, this.productCache['config'].listTTL, async () => {
        logger.info(`Product list cache miss, querying DB: ${cacheKey}`);
        const { data, total } = await this.productRepository.findWithPagination(reqDto);
        const metaDto = new OffsetPaginationDto(total, reqDto);
        const result = new OffsetPaginatedDto(plainToInstance(ProductResDto, data), metaDto);
        logger.info(`Product list cached: ${cacheKey}`);
        return result;
      }
    );
    if (!result) {
      throw new NotFoundException('List products not found');
    }
    return result;
  }
  /**
   * Retrieves products using cursor-based pagination ("load more").
   * Implements cache for cursor-based pagination.
   */
  async loadMoreProducts(
    reqDto: LoadMoreProductsReqDto,
  ): Promise<CursorPaginatedDto<ProductResDto>> {
    const { limit = 10, afterCursor, beforeCursor } = reqDto || {};

    // create cache key cursor pagination
    const cursorCacheKey = getProductListCacheKey(
      `cursor:limit:${limit}|after:${afterCursor || ''}|before:${beforeCursor || ''}`
    );

    const result = await getOrSetCache(this.redisService, cursorCacheKey, this.productCache['config'].listTTL, async () => {
        logger.info(`Cursor product list cache miss, querying DB: ${cursorCacheKey}`);
        const queryBuilder = this.productRepository.repository.createQueryBuilder('product');
        const paginator = buildPaginator({
          entity: Product,
          alias: 'product',
          paginationKeys: ['created_at'],
          query: { limit, order: 'DESC', afterCursor, beforeCursor },
        });
        const { data = [], cursor = {} } = await paginator.paginate(queryBuilder);
        const metaDto = new CursorPaginationDto(
          data.length,
          (cursor as any)?.afterCursor ?? '',
          (cursor as any)?.beforeCursor ?? '',
          reqDto,
        );
        const result = new CursorPaginatedDto(plainToInstance(ProductResDto, data), metaDto);
        logger.info(`Cursor product list cached: ${cursorCacheKey}`);
        return result;
      }
    );
    if (result == null) {
      throw new NotFoundException('Cursor product list not found');
    }
    return result;
  }

  /**
   * Retrieves a product by ID or throws NotFoundException if not found.
   */
  async getByIdOrFail(id: number): Promise<Product> {
    return Optional.of(await this.productRepository.findById(id))
      .throwIfNullable(new NotFoundException(`Product with id ${id} not found`))
      .get<Product>();
  }
  /**
   * Retrieves a product by its ID, using optimized cache with lock and parallel set.
   * - Uses cache lock to avoid thundering herd.
   * - Sets meta, price, variants cache in parallel with different TTLs.
   * - Only queries DB if any cache part is missing.
   */
  async getById(id: number): Promise<Product | null> {
    try {
      const cached = await this.productCache.get(id);
      if (cached) {
        return cached;
      }

      const product = await getOrSetCache( this.redisService, `product:${id}:detail`, this.productCache['config'].GetOrSetTTL , async () => {
          const dbProduct = await this.productRepository.repository.findOne({
            where: { id },
            relations: ['variants']
          });
          
          if (!dbProduct) return null;
          
          await this.productCache.set(id, dbProduct);
          
          return dbProduct;
        }
      );

      return product;
    } catch (error) {
      logger.error(`Error getting product ${id}:`, error);
      throw error;
    }
  }
  @CacheInvalidate((args) => ['product:list:*'])
  async create(data: CreateProductDto): Promise<Product> {
    if (data.slug) {
      Optional.of(await this.productRepository.findBySlug(data.slug)).throwIfExist(
        new ConflictException('Slug already exists. Please pick another slug'),
      );
    }

    if (data.category_id) {
      Optional.of(await this.productRepository.findByCategoryId(data.category_id)).throwIfNullable(
        new NotFoundException('Category not found'),
      );
    }
    const { variants = [], ...productData } = data;
    let variantsToCreate: Partial<Variant>[] = [];

    if (variants.length > 0) {
      validateVariantNames(variants);
      variantsToCreate = buildVariantData(variants, productData as any);
    } else {
      variantsToCreate = [
        {
          name: `${productData.name} - Default`,
          price: productData.price,
          currency_code: productData.currency_code || 'VND',
          stock: 0,
          is_default: true,
          is_active: true,
          sort_order: 0,
        },
      ];
    }

    const productToCreate = this.productRepository.repository.create({
      ...productData,
      variants: variantsToCreate.map((variantData) =>
        this.variantRepository.repository.create(variantData),
      ),
    });

    const createdProduct = await this.productRepository.repository.save(productToCreate);

    // Invalidate list cache after creating new product
    await this.productCache.set(createdProduct.id, createdProduct);
    await this.productCache.invalidateList();
    
    logger.info(`Product ${createdProduct.id} created successfully and list cache invalidated`);

    return createdProduct;
  }
  /**
   * Update product by ID.
   * Smart cache invalidation:
   * - Chỉ update price fields → update cache price trực tiếp + invalidate list cache
   * - Update meta fields → update cache meta + invalidate list cache
   * - Update variants → invalidate cache variants + invalidate list cache
   */
  async update(id: number, data: UpdateProductDto): Promise<Product> {
    await this.getByIdOrFail(id);

    if (data.slug) {
      Optional.of(await this.productRepository.findBySlug(data.slug)).throwIfExist(
        new ConflictException('Slug already exists. Please choose another slug.'),
      );
    }
    const updated = await this.productRepository.updateProduct(id, data);
    const product = Optional.of(updated)
      .throwIfNullable(new NotFoundException('Product not found'))
      .get<Product>();

    product.variants = await this.variantRepository.findByProductId(id);

    await this.productCache.smartUpdate(id, data, product);

    return product;
  }

  async delete(id: number): Promise<void> {
    await this.getByIdOrFail(id);
    await this.productRepository.deleteProduct(id);
    // Clear all cache for this product
    await this.productCache.invalidate(id);
    await this.productCache.invalidateList();
    
    logger.info(`Product ${id} deleted and all cache invalidated`);
  }

  async updateProductImage(id: number, imageUrl: string): Promise<Product> {
    try {
      await this.getByIdOrFail(id);

      const updated = await this.productRepository.updateProduct(id, {
        image_url: imageUrl,
      });

      const product = Optional.of(updated)
        .throwIfNullable(new NotFoundException('Product not found after update attempt'))
        .get<Product>();

      await this.productCache.updateMeta(id, {
        image_url: product.image_url,
        updated_at: product.updated_at,
      });
      
      await this.productCache.invalidateList();

      logger.info(`Product ${id} image updated, meta cache refreshed, and list cache invalidated`);
      return product;
    } catch (error) {
      logger.error('Update product image error:', error);
      throw error;
    }
  }
  async uploadProductImageAsync(id: number, file: Express.Multer.File): Promise<{ message: string; jobId: string,productId: number }> {
    try {
      await this.getByIdOrFail(id);

      if (!file || !file.buffer) {
        throw new BadRequestException('Invalid file or file buffer is missing');
      }
      const resizedBuffer = await sharp(file.buffer)
      .resize({
        width: 800,
        height: 800,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toBuffer();

      const imageBuffer = resizedBuffer.toString('base64');
      
      const jobPayload: UploadImageJobPayload = {
        productId: id,
        imageBuffer,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      };

      const job = UploadImageJob.createJob(jobPayload);
      await this.queueService.addJob('image-upload', job);

      logger.info(`Image upload job ${job.id} queued for product ${id}`);
      
      return {
        message: 'Image upload job queued successfully',
        jobId: job.id,
        productId: id
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new ConflictException(`Error queueing image upload: ${errorMessage}`);
    }
  }
}