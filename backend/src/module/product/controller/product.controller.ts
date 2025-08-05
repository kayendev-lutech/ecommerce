import { ProductService } from '@module/product/service/product.service';
import { WrappedRequest } from '@utils/wrapper.util';
import { BadRequestException } from '@errors/app-error';
import { HttpResponse } from '@utils/http-response.util';

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

    return HttpResponse.paginated(
      data,
      total,
      Number(page),
      Number(limit),
      'Products retrieved successfully',
    );
  }

  async getById({ params }: WrappedRequest) {
    const product = await this.productService.getById(params.id);
    return HttpResponse.ok(product, 'Product retrieved successfully');
  }

  async create({ body }: WrappedRequest) {
    const created = await this.productService.create(body);
    return HttpResponse.created(created, 'Product created successfully');
  }

  async update({ params, body }: WrappedRequest) {
    const updated = await this.productService.update(params.id, body);
    return HttpResponse.ok(updated, 'Product updated successfully');
  }

  async delete({ params }: WrappedRequest) {
    await this.productService.delete(params.id);
    return HttpResponse.noContent('Product deleted successfully');
  }

  async uploadImage({ params, file }: FileUploadRequest) {
    if (!file || !file.path) {
      throw new BadRequestException('No image file provided');
    }

    const imageUrl = file.path; // Cloudinary URL
    const updatedProduct = await this.productService.updateProductImage(params.id, imageUrl);

    return HttpResponse.ok(updatedProduct, 'Image uploaded successfully');
  }
}
