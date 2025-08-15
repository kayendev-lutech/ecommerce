import { ProductService } from '@module/product/service/product.service';
import { WrappedRequest } from '@utils/wrapper.util';
import { BadRequestException } from '@errors/app-error';
import { HttpResponse } from '@utils/http-response.util';
import { OffsetPaginatedDto } from '@common/dto/offset-pagination/paginated.dto';
import { CursorPaginatedDto } from '@common/dto/cursor-pagination/paginated.dto';
import { ProductResDto } from '@module/product/dto/product.res.dto';

interface FileUploadRequest extends WrappedRequest {
  file?: Express.Multer.File;
}

export class ProductController {
  private productService = new ProductService();

  async getAll({ query }: WrappedRequest): Promise<OffsetPaginatedDto<ProductResDto>> {
    const { page = 1, limit = 10, search, order = 'DESC', sortBy, ...filters } = query;
    
    const result = await this.productService.getAllWithPagination({
      page: Number(page),
      limit: Number(limit),
      search: search ? String(search) : undefined,
      order,
      sortBy,
      ...filters,
    });

    return result;
  }

  async loadMore({ query }: WrappedRequest): Promise<CursorPaginatedDto<ProductResDto>> {
    const { limit = 10, afterCursor, beforeCursor, ...filters } = query;
    
    const result = await this.productService.loadMoreProducts({
      limit: Number(limit),
      afterCursor,
      beforeCursor,
      ...filters,
    });

    return result;
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

    const imageUrl = file.path; 
    const updatedProduct = await this.productService.updateProductImage(params.id, imageUrl);

    return HttpResponse.ok(updatedProduct, 'Image uploaded successfully');
  }
  async uploadImageAsync({ params, file }: FileUploadRequest) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    const result = await this.productService.uploadProductImageAsync(Number(params.id), file);

    return HttpResponse.accepted(
      { jobId: result.jobId, productId: result.productId },
      result.message,
    );
  }
}