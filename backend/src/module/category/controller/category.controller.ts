import { CategoryService } from '@module/category/service/category.service';
import { CreateCategoryDto } from '@module/category/dto/create-category.dto';
import { UpdateCategoryDto } from '@module/category/dto/update-category.dto';
import { HttpResponse } from '@utils/http-response.util';
import { WrappedRequest } from '@utils/wrapper.util';

export class CategoryController {
  private categoryService = new CategoryService();

  async getAll() {
    const result = await this.categoryService.getAll();
    return HttpResponse.ok(result, 'Categories retrieved successfully');
  }

  async getById({ params }: WrappedRequest) {
    const category = await this.categoryService.getById(params.id);
    return HttpResponse.ok(category, 'Category retrieved successfully');
  }

  async create({ body }: WrappedRequest) {
    const created = await this.categoryService.create(body as CreateCategoryDto);
    return HttpResponse.created(created, 'Category created successfully');
  }

  async update({ params, body }: WrappedRequest) {
    const updated = await this.categoryService.update(params.id, body as UpdateCategoryDto);
    return HttpResponse.ok(updated, 'Category updated successfully');
  }

  async delete({ params }: WrappedRequest) {
    await this.categoryService.delete(params.id);
    return HttpResponse.noContent('Category deleted successfully');
  }

  async getByParent({ params }: WrappedRequest) {
    const categories = await this.categoryService.getByParentId(parseInt(params.parentId));
    return HttpResponse.ok(categories, 'Child categories retrieved successfully');
  }
}
