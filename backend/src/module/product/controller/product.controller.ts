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
  async uploadImage({ params, body }: WrappedRequest) {
    // image_url sẽ được lấy từ req.file.path (multer + cloudinary)
    // body không có image, file nằm ở req.file
    // params.id là product id
    // @ts-expect-error: body may contain fileUrl or imageUrl properties not defined in its type
    const imageUrl = body?.fileUrl || body?.imageUrl; // fallback nếu test
    if (!imageUrl && !body?.file && !body?.image && !body?.fileUrl && !body?.imageUrl) {
      throw new Error('No image uploaded');
    }
    // Nếu dùng multer, imageUrl sẽ là req.file.path
    // Nhưng wrappedRequest không truyền req.file, nên cần truyền qua route handler
    // => Xử lý ở route, truyền imageUrl vào body
    // Gọi service để update image_url cho product
    const updated = await this.productService.uploadImage(params.id, { image_url: imageUrl });
    return {
      status: 200,
      data: updated,
      message: 'Image uploaded',
    };
  }
}
