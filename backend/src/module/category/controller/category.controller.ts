import { WrappedRequest } from '@utils/wrapper.util';
import { HttpResponse } from '@utils/http-response.util';
import { ICategoryService } from '@module/category/interfaces/category-service.interface';
import { Container } from '@container/container';
import { Inject, Service } from 'typedi';
import { CategoryService } from '../service/category.service';

@Service()
export class CategoryController {
  constructor(
    @Inject(() => CategoryService)
    private readonly categoryService: CategoryService,
  ) {}

  async getAll(_req: WrappedRequest) {
    const result = await this.categoryService.getAll();
    return HttpResponse.ok(result, 'Categories retrieved successfully');
  }

  async getById({ params }: WrappedRequest) {
    const category = await this.categoryService.getByIdOrFail(params.id);
    return HttpResponse.ok(category, 'Category retrieved successfully');
  }

  async create({ body }: WrappedRequest) {
    const created = await this.categoryService.create(body);
    return HttpResponse.created(created, 'Category created successfully');
  }

  async update({ params, body }: WrappedRequest) {
    const updated = await this.categoryService.update(params.id, body);
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
