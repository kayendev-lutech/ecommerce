import { ProductService } from '@module/product/service/product.service';
import { WrappedRequest } from '@utils/wrapper.util';
import { BadRequestException } from '@errors/app-error';

interface FileUploadRequest extends WrappedRequest {
  file?: Express.Multer.File;
}

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
      success: 200,
      message: 'Operation successful',
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
    const product = await this.productService.getByIdOrFail(params.id);
    return {
      status: 200,
      data: product,
    };
  }

  async create({ body }: WrappedRequest) {
    const created = await this.productService.create(body);
    return {
      status: 201,
      data: created,
      message: 'Product created',
    };
  }

  async update({ params, body }: WrappedRequest) {
    const updated = await this.productService.update(params.id, body);
    return {
      status: 200,
      data: updated,
      message: 'Product updated',
    };
  }

  async delete({ params }: WrappedRequest) {
    await this.productService.delete(params.id);
    return {
      status: 200,
      message: 'Product deleted',
    };
  }

  async uploadImage({ params, file }: FileUploadRequest) {
    if (!file) {
      throw new BadRequestException('No image file uploaded.');
    }
    const imageUrl = file?.path;

    if (!imageUrl) {
      throw new BadRequestException('No image file uploaded or upload failed.');
    }

    const updatedProduct = await this.productService.updateProductImage(params.id, imageUrl);

    return {
      status: 200,
      data: updatedProduct,
      message: 'Image uploaded successfully',
    };
  }
}
