import { Category } from '@module/category/entity/category.entity';
import { ConflictException } from '@errors/app-error';
import { ensureFound, ensureNotExist } from '@utils/entity-check.util';
import { Inject, Service } from 'typedi';
import { CategoryRepository } from '@module/category/repository/category.respository';

@Service()
export class CategoryService {
  constructor(
    @Inject(() => CategoryRepository)
    private readonly categoryRepository: CategoryRepository,
  ) {}
  /**
   * Retrieves all categories.
   * @returns Array of categories
   */
  async getAll(): Promise<Category[]> {
    return this.categoryRepository.findAll();
  }

  /**
   * Finds a category by ID.
   * @param id Category ID
   * @returns Category or null if not found
   */
  async getById(id: string): Promise<Category | null> {
    return this.categoryRepository.findById(id);
  }

  /**
   * Creates a new category.
   * @param data Category data
   * @returns Created category
   * @throws ConflictException if category with same slug already exists
   */
  async create(data: Partial<Category>): Promise<Category> {
    if (data.slug) {
      const existingCategory = await this.categoryRepository.findBySlug(data.slug);
      ensureNotExist(existingCategory, 'Category with this slug already exists');
    }
    return this.categoryRepository.createCategory(data);
  }

  /**
   * Finds a category by ID or throws an error if not found.
   * @param id Category ID
   * @returns Category
   * @throws NotFoundException if category not found
   */
  async getByIdOrFail(id: string): Promise<Category> {
    const category = await this.getById(id);
    return ensureFound(category, 'Category not found');
  }

  /**
   * Updates a category by ID.
   * @param id Category ID
   * @param data Update data
   * @returns Updated category
   * @throws NotFoundException if category not found
   * @throws ConflictException if slug already exists
   */
  async update(id: string, data: Partial<Category>): Promise<Category> {
    await this.getByIdOrFail(id);

    // Check conflict
    if (data.slug) {
      const existingCategory = await this.categoryRepository.findBySlug(data.slug);
      if (existingCategory && existingCategory.id !== id) {
        throw new ConflictException('Category with this slug already exists');
      }
    }

    const updated = await this.categoryRepository.updateCategory(id, data);
    return ensureFound(updated, 'Category not found');
  }

  /**
   * Deletes a category by ID.
   * @param id Category ID
   * @throws NotFoundException if category not found
   */
  async delete(id: string): Promise<void> {
    // Check if category exists first
    await this.getByIdOrFail(id);

    const deleted = await this.categoryRepository.deleteCategory(id);
    ensureFound(deleted, 'Category not found');
  }
  async getByParentId(parentId: number): Promise<Category[]> {
    return this.categoryRepository.findByParentId(parentId);
  }
  /**
   * Updates a category's thumbnail image.
   * @param id Category ID
   * @param imageUrl New image URL
   * @returns Updated category
   * @throws NotFoundException if category not found
   */
  // async updateCategoryImage(id: string, imageUrl: string): Promise<Category> {
  //   await this.getByIdOrFail(id);
  //   const updated = await this.categoryRepository.updateCategory(id, { thumbnail: imageUrl });
  //   return ensureFound(updated, 'Category not found');
  // }
}
