import { CategoryService } from '@module/category/service/category.service';
import { WrappedRequest } from '@utils/wrapper.util';

export class CategoryController {
  private categoryService = new CategoryService();

  async getAll(_req: WrappedRequest) {
    const result = await this.categoryService.getAll();
    return {
      status: 200,
      data: result,
    };
  }

  async getById({ params }: WrappedRequest) {
    const category = await this.categoryService.getByIdOrFail(params.id);
    return {
      status: 200,
      data: category,
    };
  }

  async update({ params, body }: WrappedRequest) {
    const updated = await this.categoryService.update(params.id, body);
    return {
      status: 200,
      data: updated,
      message: 'Category updated',
    };
  }

  async delete({ params }: WrappedRequest) {
    await this.categoryService.delete(params.id);
    return {
      status: 200,
      message: 'Category deleted',
    };
  }

  async create({ body }: WrappedRequest) {
    const created = await this.categoryService.create(body);
    return {
      status: 201,
      data: created,
      message: 'Category created',
    };
  }
}
