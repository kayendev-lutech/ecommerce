import { ProductRepository } from '@module/product/repository/product.respository.js';
import { CategoryRepository } from '@module/category/repository/category.respository.js';
import { Product } from '@module/product/entity/product.entity.js';
import {
  AppError,
  ErrorCode,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@errors/app-error.js';

export class ProductService {
  private productRepository = new ProductRepository();
  private categoryRepository = new CategoryRepository();

  /**
   * Get all products with pagination, search, and order.
   * @param page Current page number
   * @param limit Number of products per page
   * @param search Search keyword for product name
   * @param order Sort order ('ASC' or 'DESC')
   * @returns Paginated products and total count
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
   * @param id Product ID
   * @returns Product or null if not found
   */
  async getById(id: string): Promise<Product | null> {
    return this.productRepository.findById(id);
  }

  /**
   * Get product by ID or throw error if not found.
   * @param id Product ID
   * @returns Product
   * @throws NotFoundException if product not found
   */
  async getByIdOrFail(id: string): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  /**
   * Create a new product.
   * @param data Product data
   * @returns Created product
   * @throws BadRequestException if category_id is missing
   * @throws NotFoundException if category not found
   * @throws ConflictException if product with same name exists
   */
  async create(data: Partial<Product>): Promise<Product> {
    try {
      if (!data.category_id) {
        throw new BadRequestException('category_id is required');
      }

      const category = await this.categoryRepository.findById(data.category_id as string);
      if (!category) {
        throw new NotFoundException('Category not found');
      }

      return await this.productRepository.createProduct(data);
    } catch (error: any) {
      if (error?.code === '23505') {
        // Unique constraint violation
        throw new ConflictException('Product with this name already exists');
      }
      throw error; // Re-throw AppErrors and other errors
    }
  }

  /**
   * Update product by ID.
   * @param id Product ID
   * @param data Product update data
   * @returns Updated product
   * @throws BadRequestException if update data is empty
   * @throws NotFoundException if product not found
   */
  async update(id: string, data: Partial<Product>): Promise<Product> {
    if (Object.keys(data).length === 0) {
      throw new BadRequestException('No data provided for update');
    }

    // Will throw NotFoundException if product doesn't exist
    await this.getByIdOrFail(id);

    const updated = await this.productRepository.updateProduct(id, data);
    return updated!;
  }

  /**
   * Delete product by ID.
   * @param id Product ID
   * @throws NotFoundException if product not found
   */
  async delete(id: string): Promise<void> {
    await this.getByIdOrFail(id);
    await this.productRepository.deleteProduct(id);
  }

  /**
   * Update product image URL.
   * @param id Product ID
   * @param imageUrl New image URL
   * @returns Updated product
   * @throws NotFoundException if product not found
   */
  async updateProductImage(id: string, imageUrl: string): Promise<Product> {
    await this.getByIdOrFail(id);

    const updated = await this.productRepository.updateProduct(id, { image_url: imageUrl });
    if (!updated) {
      throw new NotFoundException('Product not found after update attempt');
    }

    return updated;
  }
}
