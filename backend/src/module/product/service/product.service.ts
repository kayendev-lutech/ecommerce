import { ProductRepository } from '@module/product/repository/product.respository.js';
import { Product } from '@module/product/entity/product.entity.js';
import {
  ConflictException,
} from '@errors/app-error.js';
import { ensureFound, ensureNotExist } from '@utils/entity-check.util';
import { VariantRepository } from '@module/variant/repository/variant.repository';
import { Variant } from '@module/variant/entity/variant.entity';
import { AppDataSource } from '@config/typeorm.config';

export class ProductService {
  private productRepository = new ProductRepository();
  private variantRepository = new VariantRepository();
  // private categoryRepository = new CategoryRepository();

  /**
   * Get all products with pagination, search, and order.
   */
  async getAllWithPagination(
    page: number,
    limit: number,
    search?: string,
    order: 'ASC' | 'DESC' = 'ASC',
  ) {
    return this.productRepository.findWithPagination(page, limit, search, order);
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
  async create(data: Partial<Product> & { variants?: Partial<Variant>[] }): Promise<Product & { variants: Variant[] }> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (data.slug) {
        ensureNotExist(
          await this.productRepository.findBySlug(data.slug),
          'Slug đã tồn tại. Vui lòng chọn slug khác.'
        );
      }

      const { variants = [], ...productData } = data;
      const createdProduct = await queryRunner.manager.save(
        queryRunner.manager.create(Product, productData)
      );

      let createdVariants: Variant[];

      if (variants.length > 0) {
        this.validateVariantNames(variants);
        await this.ensureUniqueSkus(variants);

        const variantData = this.buildVariantData(variants, createdProduct);
        createdVariants = await queryRunner.manager.save(
          queryRunner.manager.create(Variant, variantData)
        );
      } else {
        const defaultVariant: Partial<Variant> = {
          product_id: createdProduct.id,
          name: `${createdProduct.name} - Default`,
          price: createdProduct.price,
          currency_code: createdProduct.currency_code,
          stock: 0,
          is_default: true,
          is_active: true
        };

        createdVariants = [
          await queryRunner.manager.save(
            queryRunner.manager.create(Variant, defaultVariant)
          )
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
  async update(
    id: string,
    data: Partial<Product> & { variants?: Partial<Variant>[] }
  ): Promise<Product & { variants: Variant[] }> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = await this.productRepository.findById(id);
      ensureFound(product, 'Không tìm thấy sản phẩm.');

      if (data.slug) {
        const exist = await this.productRepository.findBySlug(data.slug);
        if (exist && exist.id !== id) {
          throw new ConflictException('Slug này đã được sử dụng cho sản phẩm khác.');
        }
      }

      await queryRunner.manager.update(Product, id, data);

      let updatedVariants: Variant[] = [];

      if (data.variants) {
        await queryRunner.manager.delete(Variant, { product_id: id });

        this.validateVariantNames(data.variants);
        await this.ensureUniqueSkus(data.variants, id);

        const variantData = this.buildVariantData(data.variants, { id, ...product, ...data });
        updatedVariants = await queryRunner.manager.save(
          queryRunner.manager.create(Variant, variantData)
        );
      } else {
        updatedVariants = await this.variantRepository.findByProductId(id);
      }

      await queryRunner.commitTransaction();

      const updatedProduct = await this.productRepository.findById(id);
      ensureFound(updatedProduct, 'Không tìm thấy sản phẩm sau khi cập nhật.');

      return { ...(updatedProduct as Product), variants: updatedVariants };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
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
    await this.getByIdOrFail(id);

    const updated = await this.productRepository.updateProduct(id, { image_url: imageUrl });
    return ensureFound(updated, 'Product not found after update attempt');
  }
  private validateVariantNames(variants: Partial<Variant>[]) {
    const names = variants.map(v => v.name?.trim()).filter(Boolean);
    const uniqueNames = new Set(names);
    if (uniqueNames.size !== names.length) {
      throw new ConflictException('Tên các phiên bản (variant) trong cùng một sản phẩm phải là duy nhất.');
    }
  }
  private async ensureUniqueSkus(variants: Partial<Variant>[], currentProductId?: string) {
    for (const v of variants) {
      if (v.sku) {
        const existing = await this.variantRepository.findBySku(v.sku);
        if (existing && existing.product_id !== currentProductId) {
          throw new ConflictException(`SKU '${v.sku}' đã được sử dụng bởi sản phẩm khác.`);
        }
      }
    }
  }
  private buildVariantData(
    variants: Partial<Variant>[],
    product: Partial<Product> & { id: string }
  ): Partial<Variant>[] {
    return variants.map((v, i) => ({
      ...v,
      product_id: product.id,
      currency_code: v.currency_code || product.currency_code || 'VND',
      price: v.price ?? product.price ?? 0,
      is_default: v.is_default ?? i === 0,
      sort_order: v.sort_order ?? i
    }));
  }
}