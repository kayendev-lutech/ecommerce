import { JsonController, Get, Post, Put, Delete, Param, Body, QueryParams } from 'routing-controllers';
import { Service } from 'typedi';
import { CategoryService } from '@module/category/service/category.service';
import { CreateCategoryDto } from '@module/category/dto/create-category.dto';
import { UpdateCategoryDto } from '@module/category/dto/update-category.dto';
import { HttpResponse } from '@utils/http-response.util';

@Service()
@JsonController('/category')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService
  ) {}

  @Get('/')
  async getAll() {
    const result = await this.categoryService.getAll();
    return HttpResponse.ok(result, 'Categories retrieved successfully');
  }

  @Get('/:id')
  async getById(@Param('id') id: string) {
    try {
      const category = await this.categoryService.getByIdOrFail(id);
      return HttpResponse.ok(category, 'Category retrieved successfully');
    } catch (error: any) {
      console.error(
        `CategoryController.getById error for id=${id}:`,
        error?.message || error,
        error?.stack || ''
      );
      throw error;
    }
  }

  @Post('/')
  async create(@Body() body: CreateCategoryDto) {
    const created = await this.categoryService.create(body);
    return HttpResponse.created(created, 'Category created successfully');
  }

  @Put('/:id')
  async update(@Param('id') id: string, @Body() body: UpdateCategoryDto) {
    const updated = await this.categoryService.update(id, body);
    return HttpResponse.ok(updated, 'Category updated successfully');
  }

  @Delete('/:id')
  async delete(@Param('id') id: string) {
    await this.categoryService.delete(id);
    return HttpResponse.noContent('Category deleted successfully');
  }

  @Get('/parent/:parentId')
  async getByParent(@Param('parentId') parentId: string) {
    const categories = await this.categoryService.getByParentId(parseInt(parentId));
    return HttpResponse.ok(categories, 'Child categories retrieved successfully');
  }
}