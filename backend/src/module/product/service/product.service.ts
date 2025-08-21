import { CategoryRepository } from '@module/category/repository/category.repository';
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
import { ProductCacheStrategy } from '@cache/strategies/product-cache-strategy';
import { CacheInvalidate } from '@cache/decorators/cacheable.decorator';
import { AppDataSource } from '@config/typeorm.config';
import { ProductAttribute } from '../entity/product-attribute.entity';
import { ProductAttributeValue } from '../entity/product-attribute-value.entity';
import { extractAttributesAsObject, hasAttributes } from '@module/product/helper/attribute-value.util';
import { productAttributeValidator } from '@module/product/helper/product-attribute-validator';
import { createValidatedVariants, generateListCacheKey, loadCreatedProductResult, saveVariantAttributes, validateCreateProduct, validateVariants } from '../helper/product-validate.utils';

export class ProductService {
  private productRepository = new ProductRepository();
  private categoryRepository = new CategoryRepository();
  private variantRepository = new VariantRepository();
  private queueService = new QueueService();
  private cacheManager = CacheManager.getInstance();
  private productCache: ProductCacheStrategy;

  private attributeRepository = AppDataSource.getRepository(ProductAttribute);
  private attributeValueRepository = AppDataSource.getRepository(ProductAttributeValue);


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
   * @param reqDto ListProductReqDto containing pagination, search, sort, and filter options
   * @returns OffsetPaginatedDto<ProductResDto>
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
   * Retrieves a product by its ID, including its variants.
   * @param id Product ID
   * @returns Product or throws NotFoundException if not found
   */
  async getById(id: number): Promise<Product | null> {
    try {
      const cached = await this.productCache.get(id);
      if (cached) return cached;

      const product = await getOrSetCache( this.redisService, `product:${id}:detail`, this.productCache['config'].GetOrSetTTL , async () => {
          const dbProduct = await this.productRepository.repository.findOne({ where: { id },
            relations: [
              'variants',
              'attributeValues',
              'attributeValues.categoryAttribute', 
            ]
          });
          
          if (!dbProduct) return null;
          
          await this.productCache.set(id, dbProduct);
          
          return dbProduct;
        }
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
      await validateCreateProduct(this.productRepository, this.categoryRepository, data);

      const { variants = [], attributes = {}, ...productData } = data;

      // Validate attributes
      if (hasAttributes(attributes) && data.category_id) {
        await productAttributeValidator.validateProductAttributes(data.category_id, attributes);
      }

      // Validate variants
      if (variants.length > 0) {
        if (data.category_id === undefined) {
          throw new BadRequestException('Category ID is required to validate variants');
        }
        await validateVariants(data.category_id, variants);
      }

      const productToCreate = this.productRepository.repository.create(productData);
      const savedProduct = Optional.of(await this.productRepository.repository.save(productToCreate))
        .throwIfNullable(new BadRequestException('Failed to save product'))
        .get<Product>();
      logger.info('Product saved successfully', { productId: savedProduct.id });

      // Create variants
      await createValidatedVariants(
        this.variantRepository,
        saveVariantAttributes,
        savedProduct.id,
        variants
      );

      // Save attributes nếu có
      if (hasAttributes(attributes)) {
        await productAttributeValidator.saveProductAttributes(savedProduct.id, attributes);
      }

      const result = await loadCreatedProductResult(
        this.productRepository,
        this.productCache,
        savedProduct.id
      );
      logger.info(`Product ${result.id} created successfully`);

      return result;
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
      await AppDataSource.getRepository('ProductAttributeValue').delete({ product_id: id });
      await productAttributeValidator.saveProductAttributes(id, attributes);
    }

    const productWithAttributes = await this.productRepository.repository.findOne({
      where: { id },
      relations: ['variants', 'attributeValues', 'attributeValues.categoryAttribute'],
    });

    if (!productWithAttributes) {
      throw new NotFoundException('Product not found after update');
    }

    const productDto = plainToInstance(ProductResDto, productWithAttributes);
    productDto.attributes = extractAttributesAsObject(productWithAttributes.attributeValues || []);

    await this.productCache.smartUpdate(id, data, productWithAttributes);

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
  /**
   * Retrieves products using cursor-based pagination ("load more").
   * @param reqDto LoadMoreProductsReqDto containing limit, afterCursor, beforeCursor
   * @returns CursorPaginatedDto<ProductResDto>
   */
  async uploadProductImageAsync(id: number, file: Express.Multer.File): Promise<{ message: string; jobId: string,productId: number }> {
    try {
      const product = await this.getByIdOrFail(id);

      if (!file || !file.buffer) {
        throw new BadRequestException('Invalid file or file buffer is missing');
      }

      let oldPublicId: string | undefined = undefined;
      if (product.image_url) {
        const urlParts = product.image_url.split('/');
        const uploadIndex = urlParts.findIndex(part => part === 'upload');
        if (uploadIndex !== -1 && uploadIndex + 2 < urlParts.length) {
          const fileNameWithExt = urlParts[uploadIndex + 2];
          oldPublicId = fileNameWithExt.split('.')[0];
          if (urlParts[uploadIndex + 1].startsWith('v')) {
            oldPublicId = urlParts.slice(uploadIndex + 2).join('/').split('.')[0];
          }
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
        oldPublicId
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
