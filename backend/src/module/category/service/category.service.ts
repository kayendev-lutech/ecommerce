import { CategoryRepository } from '@module/category/repository/category.respository';
import { Category } from '@module/category/entity/category.entity';
import { AppError, ErrorCode } from '@errors/app-error';

export class CategoryService {
  private categoryRepository: CategoryRepository;

  constructor() {
    this.categoryRepository = new CategoryRepository();
  }

  async getAll(): Promise<Category[]> {
    return this.categoryRepository.findAll();
  }

  async getById(id: string): Promise<Category | null> {
    return this.categoryRepository.findById(id);
  }

  async create(data: Partial<Category>): Promise<Category> {
    return this.categoryRepository.createCategory(data);
  }

  async getByIdOrFail(id: string): Promise<Category> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new AppError(ErrorCode.NOT_FOUND, 404, 'Category not found');
    }
    return category;
  }

  async update(id: string, data: Partial<Category>): Promise<Category> {
    const updated = await this.categoryRepository.updateCategory(id, data);
    if (!updated) {
      throw new AppError(ErrorCode.NOT_FOUND, 404, 'Category not found');
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.categoryRepository.deleteCategory(id);
    if (!deleted) {
      throw new AppError(ErrorCode.NOT_FOUND, 404, 'Category not found');
    }
  }
  async updateCategoryImage(id: string, imageUrl: string) {
    await this.getByIdOrFail(id);
    return await this.categoryRepository.updateCategory(id, { thumbnail: imageUrl });
  }
}
