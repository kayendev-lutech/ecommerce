import { ProductRepository } from '@module/product/repository/product.respository.js';
import { Product } from '@module/product/entity/product.entity.js';
import { ConflictException } from '@errors/app-error.js';
import { ensureFound, ensureNotExist } from '@utils/entity-check.util';
import { VariantRepository } from '@module/variant/repository/variant.repository';
import { Variant } from '@module/variant/entity/variant.entity';
import { AppDataSource } from '@config/typeorm.config';

export class ProductService {
  private productRepository = new ProductRepository();
  private variantRepository = new VariantRepository();
  /**
   * Retrieves a paginated list of products with optional search, sorting, and additional filters.
   *
   * @param params - The parameters for pagination and filtering.
   * @param params.page - The page number to retrieve (optional).
   * @param params.limit - The number of items per page (optional).
   * @param params.search - A search query to filter products (optional).
   * @param params.order - The order direction, either 'ASC' or 'DESC' (optional).
   * @param params.sortBy - The field to sort by (optional).
   * @param params.[key] - Additional filter parameters specific to the product entity.
   * @returns A promise resolving to the paginated list of products.
   */
  async getAllWithPagination(params: {
    page?: number;
    limit?: number;
    search?: string;
    order?: 'ASC' | 'DESC';
    sortBy?: string;
    [key: string]: any;
  }) {
    return this.productRepository.findWithPagination(params);
  }
  /**
   * Get product by ID.
   */
  async getById(id: string): Promise<(Product & { variants: Variant[] }) | null> {
    const product = await this.productRepository.findById(id);
    ensureFound(product, 'Product not found');
    const variants = await this.variantRepository.findByProductId(id);
    return { ...(product as Product), variants };
  }

  /**
   * Get product by ID or throw error if not found.
   */
  async getByIdOrFail(id: string): Promise<Product> {
    const product = await this.productRepository.findById(id);
    return ensureFound(product, 'Product not found');
  }

  /**
   * Create a new product.
   * @throws ConflictException if product with same slug or variant SKU exists, or variant names are not unique
   */
  async create(
    data: Partial<Product> & { variants?: Partial<Variant>[] },
  ): Promise<Product & { variants: Variant[] }> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (data.slug) {
        ensureNotExist(
          await this.productRepository.findBySlug(data.slug),
          'Slug đã tồn tại. Vui lòng chọn slug khác.',
        );
      }

      const { variants = [], ...productData } = data;
      const createdProduct = await queryRunner.manager.save(
        queryRunner.manager.create(Product, productData),
      );

      let createdVariants: Variant[];

      if (variants.length > 0) {
        this.validateVariantNames(variants);
        await this.ensureUniqueSkus(variants);

        const variantData = this.buildVariantData(variants, createdProduct);
        createdVariants = await queryRunner.manager.save(
          queryRunner.manager.create(Variant, variantData),
        );
      } else {
        const defaultVariant: Partial<Variant> = {
          product_id: createdProduct.id,
          name: `${createdProduct.name} - Default`,
          price: createdProduct.price,
          currency_code: createdProduct.currency_code,
          stock: 0,
          is_default: true,
          is_active: true,
        };

        createdVariants = [
          await queryRunner.manager.save(queryRunner.manager.create(Variant, defaultVariant)),
        ];
      }

      await queryRunner.commitTransaction();
      return { ...createdProduct, variants: createdVariants };
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
  async update(id: string, data: Partial<Product>): Promise<Product> {
    await this.getByIdOrFail(id);

    if (data.slug) {
      const existingProduct = await this.productRepository.findBySlug(data.slug);
      if (existingProduct && existingProduct.id !== id) {
        throw new ConflictException('Slug already exists. Please choose another slug.');
      }
    }

    const updated = await this.productRepository.updateProduct(id, data);
    return ensureFound(updated, 'Product not found after update attempt');
  }

  /**
   * Delete product by ID.
   */
  async delete(id: string): Promise<void> {
    await this.getByIdOrFail(id);
    await this.productRepository.deleteProduct(id);
  }

  /**
   * Update product image URL.
   */
  async updateProductImage(id: string, imageUrl: string): Promise<Product> {
    try {
      // Ensure product exists
      await this.getByIdOrFail(id);

      // Update product with new image URL
      const updated = await this.productRepository.updateProduct(id, {
        image_url: imageUrl,
      });

      return ensureFound(updated, 'Product not found after update attempt');
    } catch (error) {
      console.error('Update product image error:', error);
      throw error;
    }
  }
  private validateVariantNames(variants: Partial<Variant>[]) {
    const names = variants.map((v) => v.name?.trim()).filter(Boolean);
    const uniqueNames = new Set(names);
    if (uniqueNames.size !== names.length) {
      throw new ConflictException('Variant names within the same product must be unique.');
    }
  }
  private async ensureUniqueSkus(variants: Partial<Variant>[], currentProductId?: string) {
    const skus = variants.map((v) => v.sku).filter(Boolean) as string[];
    if (skus.length === 0) return;

    const existingVariants = await this.variantRepository.findManyBySkus(skus);
    for (const existing of existingVariants) {
      if (!currentProductId || existing.product_id !== currentProductId) {
        throw new ConflictException(`SKU '${existing.sku}' đã được sử dụng bởi sản phẩm khác.`);
      }
    }
  }
  private buildVariantData(
    variants: Partial<Variant>[],
    product: Partial<Product> & { id: string },
  ): Partial<Variant>[] {
    return variants.map((v, i) => ({
      ...v,
      product_id: product.id,
      currency_code: v.currency_code || product.currency_code || 'VND',
      price: v.price ?? product.price ?? 0,
      is_default: v.is_default ?? i === 0,
      sort_order: v.sort_order ?? i,
    }));
  }
}
