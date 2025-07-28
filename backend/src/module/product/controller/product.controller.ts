import { ProductService } from '@module/product/service/product.service';
import { WrappedRequest } from '@utils/wrapper.util';
import { AppError, InternalServerErrorException } from '@errors/app-error';

export class ProductController {
  private productService = new ProductService();

  async getAll({ query }: WrappedRequest) {
    const { page = 1, limit = 10, search, order = 'ASC' } = query;
    const { data, total } = await this.productService.getAllWithPagination(
      Number(page),
      Number(limit),
      search,
      order,
    );
    const totalPages = Math.ceil(total / Number(limit));
    return {
      status: 200,
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
        hasNextPage: Number(page) < totalPages,
        hasPreviousPage: Number(page) > 1,
      },
    };
  }

  async getById({ params }: WrappedRequest) {
    try {
      const product = await this.productService.getByIdOrFail(params.id);
      return {
        status: 200,
        data: product,
      };
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new InternalServerErrorException(error?.message || 'Failed to get product by id');
    }
  }

  async create({ body }: WrappedRequest) {
    try {
      const created = await this.productService.create(body);
      return {
        status: 201,
        data: created,
        message: 'Product created',
      };
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new InternalServerErrorException(error?.message || 'Failed to create product');
    }
  }

  async update({ params, body }: WrappedRequest) {
    try {
      const updated = await this.productService.update(params.id, body);
      return {
        status: 200,
        data: updated,
        message: 'Product updated',
      };
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new InternalServerErrorException(error?.message || 'Failed to update product');
    }
  }

  async delete({ params }: WrappedRequest) {
    try {
      await this.productService.delete(params.id);
      return {
        status: 200,
        message: 'Product deleted',
      };
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new InternalServerErrorException(error?.message || 'Failed to delete product');
    }
  }
}
