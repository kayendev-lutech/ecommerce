import { ProductRepository } from '@module/product/repository/product.respository.js';
import { Product } from '@module/product/entity/product.entity.js';
import { ConflictException, NotFoundException } from '@errors/app-error.js';
import { VariantRepository } from '@module/variant/repository/variant.repository';
import { Variant } from '@module/variant/entity/variant.entity';
import { AppDataSource } from '@config/typeorm.config';
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
import { validateVariantNames, buildVariantData } from '../validate/product.validate';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

export class ProductService {
  private productRepository = new ProductRepository();
  private variantRepository = new VariantRepository();

  public getQueryBuilder(alias: string) {
    return this.productRepository.repository.createQueryBuilder(alias);
  }
  /**
   * Retrieves a paginated list of products with optional search, sorting, and additional filters.
   * @param reqDto ListProductReqDto containing pagination, search, sort, and filter options
   * @returns OffsetPaginatedDto<ProductResDto>
   */
  async getAllWithPagination(
    reqDto: ListProductReqDto,
  ): Promise<OffsetPaginatedDto<ProductResDto>> {
    const { data, total } = await this.productRepository.findWithPagination(reqDto);
    
    const metaDto = new OffsetPaginationDto(total, reqDto);
    
    return new OffsetPaginatedDto(plainToInstance(ProductResDto, data), metaDto);
  }
  /**
   * Retrieves a product by its ID, including its variants.
   * @param id Product ID
   * @returns Product or throws NotFoundException if not found
   */
  async getById(id: number): Promise<Product | null> {
    const product = await this.productRepository.repository.findOne({
      where: { id },
      relations: ['variants'],
    });

    return Optional.of(product)
      .throwIfNullable(new NotFoundException('Product not found'))
      .get<Product>();
  }

  /**
   * Retrieves a product by its ID or throws error if not found.
   * @param id Product ID
   * @returns Product
   */
  async getByIdOrFail(id: number): Promise<Product> {
    return Optional.of(await this.productRepository.findById(id))
      .throwIfNullable(new NotFoundException('Product not found'))
      .get<Product>();
  }
  /**
   * Creates a new product along with its variants in a transactional manner.
   *
   * @param data - Partial product data, optionally including an array of variant data.
   * @returns A promise that resolves to the created product with its associated variants.
   * @throws Will throw an error if the slug already exists, variant validation fails, or any database operation fails.
   */
  async create(data: CreateProductDto): Promise<Product> {
    if (data.slug) {
      Optional.of(await this.productRepository.findBySlug(data.slug)).throwIfPresent(
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

        variantsToCreate = variants.map((v, i) => ({
          ...v,
          currency_code: v.currency_code || productData.currency_code || 'VND',
          price: v.price ?? productData.price ?? 0,
          is_default: v.is_default ?? i === 0,
          is_active: v.is_active ?? true,
          sort_order: v.sort_order ?? i,
        }));
      } else {
        variantsToCreate = [{
          name: `${productData.name} - Default`,
          price: productData.price,
          currency_code: productData.currency_code || 'VND',
          stock: 0,
          is_default: true,
          is_active: true,
          sort_order: 0,
        }];
      }

      const productToCreate = this.productRepository.repository.create({
        ...productData,
        variants: variantsToCreate.map(variantData => 
          this.variantRepository.repository.create(variantData)
        ),
      });

      const createdProduct = await this.productRepository.repository.save(productToCreate);

      return createdProduct;
  }
  /**
   * Update product by ID.
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
      .throwIfNullable(new NotFoundException('Product not found after update attempt'))
      .get<Product>();

    product.variants = await this.variantRepository.findByProductId(id);
    return product;
  }

  /**
   * Delete product by ID.
   */
  async delete(id: number): Promise<void> {
    await this.getByIdOrFail(id);
    await this.productRepository.deleteProduct(id);
  }

  /**
   * Updates the image URL of a product.
   * @param id Product ID
   * @param imageUrl New image URL
   * @returns Updated Product with variants
   */
  async updateProductImage(id: number, imageUrl: string): Promise<Product> {
    try {
      await this.getByIdOrFail(id);

      const updated = await this.productRepository.updateProduct(id, {
        image_url: imageUrl,
      });

      const product = Optional.of(updated)
        .throwIfNullable(new NotFoundException('Product not found after update attempt'))
        .get<Product>();

      return product;
    } catch (error) {
      console.error('Update product image error:', error);
      throw error;
    }
  }
  /**
   * Retrieves products using cursor-based pagination ("load more").
   * @param reqDto LoadMoreProductsReqDto containing limit, afterCursor, beforeCursor
   * @returns CursorPaginatedDto<ProductResDto>
   */
  async loadMoreProducts(
    reqDto: LoadMoreProductsReqDto,
  ): Promise<CursorPaginatedDto<ProductResDto>> {
    const { limit = 10, afterCursor, beforeCursor } = reqDto || {};

    const queryBuilder = this.productRepository.repository.createQueryBuilder('product');

    const paginator = buildPaginator({
      entity: Product,
      alias: 'product',
      paginationKeys: ['created_at'],
      query: {
        limit,
        order: 'DESC',
        afterCursor,
        beforeCursor,
      },
    });

    const { data = [], cursor = {} } = await paginator.paginate(queryBuilder);

    const metaDto = new CursorPaginationDto(
      data.length,
      (cursor as any)?.afterCursor ?? '',
      (cursor as any)?.beforeCursor ?? '',
      reqDto,
    );

    return new CursorPaginatedDto(plainToInstance(ProductResDto, data), metaDto);
  }
}
