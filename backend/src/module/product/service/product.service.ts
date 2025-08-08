import { validate } from 'class-validator';
import { ProductRepository } from '@module/product/repository/product.respository.js';
import { Product } from '@module/product/entity/product.entity.js';
import { ConflictException, NotFoundException } from '@errors/app-error.js';
import { VariantRepository } from '@module/variant/repository/variant.repository';
import { Variant } from '@module/variant/entity/variant.entity';
import { AppDataSource } from '@config/typeorm.config';
import { Optional } from '@utils/optional.utils';
import { OffsetPaginatedDto } from '@common/dto/offset-pagination/paginated.dto';
import { ProductResDto } from '@module/product/dto/product.res.dto';
import { paginate } from '@utils/offset-pagination';
import { plainToInstance } from 'class-transformer';
import { CursorPaginatedDto } from '@common/dto/cursor-pagination/paginated.dto';
import { LoadMoreProductsReqDto } from '@module/product/dto/load-more-products-req.dto';
import { buildPaginator } from '@utils/cursor-pagination';
import { CursorPaginationDto } from '@common/dto/cursor-pagination/cursor-pagination.dto';
import { ListProductReqDto } from '@module/product/dto/list-product-req.dto';
import { OffsetPaginationDto } from '@common/dto/offset-pagination/offset-pagination.dto';
import { validateVariantNames, buildVariantData } from '../validate/product.validate';
import { CreateProductDto } from '../dto/create-product.dto';

export class ProductService {
  private productRepository = new ProductRepository();
  private variantRepository = new VariantRepository();

  public getQueryBuilder(alias: string) {
    return this.productRepository.repository.createQueryBuilder(alias);
  }
  /**
   * Retrieves a paginated list of products with optional search, sorting, and additional filters.
   */
  async getAllWithPagination(
    reqDto: ListProductReqDto,
  ): Promise<OffsetPaginatedDto<ProductResDto>> {
    const { data, total } = await this.productRepository.findWithPagination(reqDto);
    
    const metaDto = new OffsetPaginationDto(total, reqDto);
    
    return new OffsetPaginatedDto(plainToInstance(ProductResDto, data), metaDto);
  }
  /**
   * Get product by ID.
   */
  async getById(id: number): Promise<Product | null> {
    const product = Optional.of(await this.productRepository.findById(id))
      .throwIfNullable(new NotFoundException('Product not found'))
      .get() as Product;

    product.variants = await this.variantRepository.findByProductId(id);
    return product;
  }

  /**
   * Get product by ID or throw error if not found.
   */
  async getByIdOrFail(id: number): Promise<Product> {
    return Optional.of(await this.productRepository.findById(id))
      .throwIfNullable(new NotFoundException('Product not found'))
      .get() as Product;
  }
  /**
   * Creates a new product along with its variants in a transactional manner.
   *
   * @param data - Partial product data, optionally including an array of variant data.
   * @returns A promise that resolves to the created product with its associated variants.
   * @throws Will throw an error if the slug already exists, variant validation fails, or any database operation fails.
   */
  async create(data: CreateProductDto): Promise<Product> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (data.slug) {
        Optional.of(await this.productRepository.findBySlug(data.slug)).throwIfPresent(
          new ConflictException('Slug đã tồn tại. Vui lòng chọn slug khác.'),
        );
      }

      const { variants = [], ...productData } = data;
      const createdProduct = await queryRunner.manager.save(
        queryRunner.manager.create(Product, productData),
      );

      let createdVariants: Variant[];

      if (variants.length > 0) {
        validateVariantNames(variants);

        const variantData = buildVariantData(variants, createdProduct);
        createdVariants = await queryRunner.manager.save(
          queryRunner.manager.create(Variant, variantData),
        );
      } else {
        const defaultVariant = queryRunner.manager.create(Variant, {
          product: createdProduct,
          name: `${createdProduct.name} - Default`,
          price: createdProduct.price,
          currency_code: createdProduct.currency_code,
          stock: 0,
          is_default: true,
          is_active: true,
        });
        createdVariants = [await queryRunner.manager.save(defaultVariant)];
      }

      createdProduct.variants = createdVariants;

      await queryRunner.commitTransaction();
      return createdProduct;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  /**
   * Update product by ID.
   */
  async update(id: number, data: Partial<Product>): Promise<Product> {
    await this.getByIdOrFail(id);

    if (data.slug) {
      Optional.of(await this.productRepository.findBySlug(data.slug)).throwIfExist(
        new ConflictException('Slug already exists. Please choose another slug.'),
      );
    }

    const updated = await this.productRepository.updateProduct(id, data);
    const product = Optional.of(updated)
      .throwIfNullable(new NotFoundException('Product not found after update attempt'))
      .get() as Product;

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
   * Update product image URL.
   */
  async updateProductImage(id: number, imageUrl: string): Promise<Product> {
    try {
      await this.getByIdOrFail(id);

      const updated = await this.productRepository.updateProduct(id, {
        image_url: imageUrl,
      });

      const product = Optional.of(updated)
        .throwIfNullable(new NotFoundException('Product not found after update attempt'))
        .get() as Product;

      product.variants = await this.variantRepository.findByProductId(id);
      return product;
    } catch (error) {
      console.error('Update product image error:', error);
      throw error;
    }
  }
  async loadMoreProducts(
    reqDto: LoadMoreProductsReqDto, 
  ): Promise<CursorPaginatedDto<ProductResDto>> {
    console.log('LoadMoreProducts reqDto:', reqDto); 

    const queryBuilder = this.productRepository.repository.createQueryBuilder('product');
    
    const safeReqDto = {
      limit: reqDto?.limit || 10,
      afterCursor: reqDto?.afterCursor || null,
      beforeCursor: reqDto?.beforeCursor || null,
    };

    console.log('SafeReqDto:', safeReqDto); 

    const paginator = buildPaginator({
      entity: Product,
      alias: 'product',
      paginationKeys: ['created_at'],
      query: {
        limit: safeReqDto.limit, 
        order: 'DESC',
        afterCursor: safeReqDto.afterCursor ?? undefined, 
        beforeCursor: safeReqDto.beforeCursor ?? undefined, 
      },
    });

    const { data = [], cursor } = await paginator.paginate(queryBuilder);

    const products = Array.isArray(data) ? data : [];

    const metaDto = new CursorPaginationDto(
      products.length,
      cursor.afterCursor ?? '',
      cursor.beforeCursor ?? '',
      reqDto,
    );

    return new CursorPaginatedDto(plainToInstance(ProductResDto, products), metaDto);
  }
}
