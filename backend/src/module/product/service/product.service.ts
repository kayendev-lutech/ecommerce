import { Category } from '@module/category/entity/category.entity.js';
import { ProductRepository } from '@module/product/repository/product.respository.js';
import { CategoryRepository } from '@module/category/repository/category.respository.js';
import { Product } from '@module/product/entity/product.entity.js';
import { AppError, ErrorCode, InternalServerErrorException } from '@errors/app-error.js';

export class ProductService {
  private productRepository = new ProductRepository();
  private categoryRepository = new CategoryRepository();

  async getAllWithPagination(
    page: number,
    limit: number,
    search?: string,
    order: 'ASC' | 'DESC' = 'ASC',
  ) {
    try {
      return await this.productRepository.findWithPagination(page, limit, search, order);
    } catch (error: any) {
      throw new InternalServerErrorException(error?.message || 'Failed to get products');
    }
  }

  async getById(id: string): Promise<Product | null> {
    try {
      return await this.productRepository.findById(id);
    } catch (error: any) {
      throw new InternalServerErrorException(error?.message || 'Failed to get product');
    }
  }

  async getByIdOrFail(id: string): Promise<Product> {
    try {
      const product = await this.productRepository.findById(id);
      if (!product) {
        throw new AppError(ErrorCode.NOT_FOUND, 404, 'Product not found');
      }
      return product;
    } catch (error: any) {
      throw new InternalServerErrorException(error?.message || 'Failed to get product');
    }
  }

  async create(data: Partial<Product>): Promise<Product> {
    try {
      if (!data.category_id) {
        throw new AppError(ErrorCode.VALIDATION, 400, 'category_id is required');
      }
      const category = await this.categoryRepository.findById(data.category_id as string);
      if (!category) {
        throw new AppError(ErrorCode.NOT_FOUND, 404, 'Category not found');
      }
      return await this.productRepository.createProduct(data);
    } catch (error: any) {
      if (error?.code === '23505') {
        throw new AppError(ErrorCode.CONFLICT, 409, 'Product already exists');
      }
      throw new InternalServerErrorException(error?.message || 'Failed to create product');
    }
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
    try {
      const updated = await this.productRepository.updateProduct(id, data);
      if (!updated) {
        throw new AppError(ErrorCode.NOT_FOUND, 404, 'Product not found');
      }
      return updated;
    } catch (error: any) {
      throw new InternalServerErrorException(error?.message || 'Failed to update product');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.productRepository.deleteProduct(id);
    } catch (error: any) {
      throw new InternalServerErrorException(error?.message || 'Failed to delete product');
    }
  }
}
