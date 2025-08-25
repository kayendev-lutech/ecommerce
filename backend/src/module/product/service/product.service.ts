// import { ProductCacheService } from '@cache/strategies/product-cache-strategy';
import { CategoryRepository } from '@module/category/repository/category.repository';
import { ProductRepository } from '@module/product/repository/product.respository.js';
import { Product } from '@module/product/entity/product.entity.js';
import { BadRequestException, ConflictException, NotFoundException } from '@errors/app-error.js';
import { VariantRepository } from '@module/variant/repository/variant.repository';
import { Optional } from '@utils/optional.utils';
import { DataSource, EntityManager } from 'typeorm';
import { OffsetPaginatedDto } from '@common/dto/offset-pagination/paginated.dto';
import { ProductResDto } from '@module/product/dto/product.res.dto';
import { plainToInstance } from 'class-transformer';
import { CursorPaginatedDto } from '@common/dto/cursor-pagination/paginated.dto';
import { LoadMoreProductsReqDto } from '@module/product/dto/load-more-products-req.dto';
import { buildPaginator } from '@utils/cursor-pagination';
import { CursorPaginationDto } from '@common/dto/cursor-pagination/cursor-pagination.dto';
import { ListProductReqDto } from '@module/product/dto/list-product-req.dto';
import { OffsetPaginationDto } from '@common/dto/offset-pagination/offset-pagination.dto';
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
} from '@module/product/helper/product-cache.utils';
import { QueueService } from 'src/queue/services/queue.service';
import { UploadImageJob, UploadImageJobPayload } from 'src/queue/jobs/upload-image.job';
import sharp from 'sharp';
import { CacheManager } from '@cache/managers/cache.manager';
import { CacheInvalidate } from '@cache/decorators/cacheable.decorator';
import {
  extractAttributesAsObject,
  hasAttributes,
  updateProductAttributesTransactional,
} from '@module/product/helper/attribute-value.util';
import { AppDataSource } from '@config/typeorm.config';
import {
  createValidatedVariants,
  loadCreatedProductResult,
  saveProductAttributes,
  validateProductPayload,
} from '../helper/product-logic.utils';
import { generateListCacheKey } from '../helper/product-validate.utils';
import { ProductCacheService } from './product-cache.service';

export class ProductService {
  private productRepository = new ProductRepository();
  private queueService = new QueueService();
  private cacheManager = CacheManager.getInstance();
  private productCache: ProductCacheService;

  constructor(private dataSource: DataSource = AppDataSource) {
    this.productCache = this.cacheManager.getProductCache();
  }
  public getQueryBuilder(alias: string) {
    return this.productRepository.createQueryBuilder(alias);
  }
  public get redisService() {
    return this.productCache['redisService'];
  }
  /**
   * Retrieves a paginated list of products with optional search, sorting, and additional filters.
   * @param reqDto ListProductReqDto containing pagination, search, sort, and filter options
   * @returns OffsetPaginatedDto<ProductResDto>
   */
  async getAllWithPagination(
    reqDto: ListProductReqDto,
  ): Promise<OffsetPaginatedDto<ProductResDto>> {
    const cacheKey = generateListCacheKey(reqDto);

    const result = await getOrSetCache(
      this.redisService,
      cacheKey,
      this.productCache['config'].listTTL,
      async () => {
        logger.info(`Product list cache miss, querying DB: ${cacheKey}`);
        const { data, total } = await this.productRepository.findWithPagination(reqDto);
        const metaDto = new OffsetPaginationDto(total, reqDto);
        const result = new OffsetPaginatedDto(plainToInstance(ProductResDto, data), metaDto);
        logger.info(`Product list cached: ${cacheKey}`);
        return result;
      },
    );
    if (!result) {
      const metaDto = new OffsetPaginationDto(0, reqDto);
      return new OffsetPaginatedDto([], metaDto);
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
    const { limit = 10, afterCursor, beforeCursor, ...filter } = reqDto || {};

    const cursorCacheKey = buildCacheKey('cursor', { limit, afterCursor, beforeCursor, ...filter });

    const result = await getOrSetCache(
      this.redisService,
      cursorCacheKey,
      this.productCache['config'].listTTL,
      async () => {
        logger.info(`Cursor product list cache miss, querying DB: ${cursorCacheKey}`);
        const queryBuilder = this.productRepository.createQueryBuilder('product');
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
      },
    );
    if (!result) {
      const metaDto = new CursorPaginationDto(0, '', '', reqDto);
      return new CursorPaginatedDto([], metaDto);
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
   * Retrieves a product by its ID, including its variants.
   * @param id Product ID
   * @returns Product or throws NotFoundException if not found
   */
  async getById(id: number): Promise<Product | null> {
    try {
      const cached = await this.productCache.get(id);
      if (cached) return cached;

      const product = await getOrSetCache(
        this.redisService,
        `product:${id}:detail`,
        this.productCache['config'].GetOrSetTTL,
        async () => {
          const dbProduct = await this.productRepository.findDetailById(id);

          if (!dbProduct) return null;

          await this.productCache.set(id, dbProduct);

          return dbProduct;
        },
      );

      return Optional.of(product)
        .throwIfNullable(new NotFoundException('Product not found'))
        .get<Product>();
    } catch (error) {
      logger.error(`Error getting product ${id}:`, error);
      throw error;
    }
  }
  /**
   * Creates a new product along with its variants in a transactional manner.
   *
   * @param data - Partial product data, optionally including an array of variant data.
   * @returns A promise that resolves to the created product with its associated variants.
   * @throws Will throw an error if the slug already exists, variant validation fails, or any database operation fails.
   */
  @CacheInvalidate((args) => ['product:list:*'])
  async create(data: CreateProductDto): Promise<ProductResDto> {
    return await this.dataSource.transaction(async (manager: EntityManager) => {
      const { variants = [], attributes = {}, ...productData } = data;

      await validateProductPayload(manager, data);

      // Bước 2: Tạo và lưu sản phẩm chính
      const productRepo = manager.getRepository(Product);
      const productToCreate = productRepo.create(productData);
      const savedProduct = await productRepo.save(productToCreate);

      if (!savedProduct) {
        throw new BadRequestException('Failed to save product');
      }

      await Promise.all([
        saveProductAttributes(manager, savedProduct.id, attributes),
        createValidatedVariants(manager, savedProduct.id, variants),
      ]);

      // Bước 4: Lấy kết quả cuối cùng và cập nhật cache
      const result = await loadCreatedProductResult(manager, this.productCache, savedProduct.id);
      logger.info(`Product ${result.id} created successfully`);

      return result;
    });
  }

  /**
   * Cập nhật sản phẩm theo id, update attribute, invalidate cache thông minh.
   * @param id ID sản phẩm
   * @param data Dữ liệu cập nhật
   * @returns ProductResDto đã cập nhật
   * @throws NotFoundException nếu không tìm thấy
   * @throws ConflictException nếu slug trùng
   */
  async update(id: number, data: UpdateProductDto): Promise<ProductResDto> {
    await this.getByIdOrFail(id);

    if (data.slug) {
      Optional.of(await this.productRepository.findBySlug(data.slug)).throwIfExist(
        new ConflictException('Slug already exists. Please choose another slug.'),
      );
    }

    const { attributes, ...updateData } = data;

    await this.productRepository.updateProduct(id, updateData);

    if (attributes !== undefined) {
      await updateProductAttributesTransactional(id, attributes);
    }

    const productWithAttributes = await this.productRepository.findOne({
      where: { id },
      relations: ['variants', 'attributeValues', 'attributeValues.categoryAttribute'],
    });

    const checkedProduct = Optional.of(productWithAttributes)
      .throwIfNullable(new NotFoundException('Product not found after update attempt'))
      .get<Product>();

    const productDto = plainToInstance(ProductResDto, checkedProduct);
    productDto.attributes = extractAttributesAsObject(checkedProduct.attributeValues || []);

    await this.productCache.smartUpdate(id, data, checkedProduct);

    return productDto;
  }

  /**
   * Xóa sản phẩm theo id, xóa toàn bộ cache liên quan.
   * @param id ID product
   * @throws NotFoundException nếu không tìm thấy
   */
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
  async uploadProductImageAsync(
    id: number,
    file: Express.Multer.File,
  ): Promise<{ message: string; jobId: string; productId: number }> {
    const product = await this.getByIdOrFail(id);

    if (!file || !file.buffer) {
      throw new BadRequestException('Invalid file or file buffer is missing');
    }

    let oldPublicId: string | undefined;
    if (product.image_url) {
      const matches = product.image_url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z]+$/);
      if (matches?.[1]) {
        oldPublicId = matches[1];
        logger.info(`Found old image public_id for deletion: ${oldPublicId}`);
      }
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
      oldPublicId,
    };

    const job = UploadImageJob.createJob(jobPayload);
    await this.queueService.addJob('image-upload', job);

    logger.info(`Image upload job ${job.id} queued for product ${id}`);

    return {
      message: 'Image upload job queued successfully',
      jobId: job.id,
      productId: id,
    };
  }
}
