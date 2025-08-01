import { CategoryRepository } from '@module/category/repository/category.respository';
import { Category } from '@module/category/entity/category.entity';
import { AppError, ErrorCode, NotFoundException, InternalServerErrorException } from '@errors/app-error';

/**
 * Service handling business logic for category management.
 */
export class CategoryService {
  private categoryRepository: CategoryRepository;

  constructor() {
    this.categoryRepository = new CategoryRepository();
  }

  /**
   * Retrieves all categories.
   * @returns Array of categories
   * @throws InternalServerErrorException if database operation fails
   */
  async getAll(): Promise<Category[]> {
    try {
      return await this.categoryRepository.findAll();
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve categories');
    }
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
   * @throws InternalServerErrorException if creation fails
   */
  async create(data: Partial<Category>): Promise<Category> {
    try {
      return await this.categoryRepository.createCategory(data);
    } catch (error: any) {
      if (error?.code === '23505') {
        throw new AppError(ErrorCode.CONFLICT, 409, 'Category with this slug already exists');
      }
      throw new InternalServerErrorException('Failed to create category');
    }
  }

  /**
   * Finds a category by ID or throws an error if not found.
   * @param id Category ID
   * @returns Category
   * @throws NotFoundException if category not found
   */
  async getByIdOrFail(id: string): Promise<Category> {
    const category = await this.getById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  /**
   * Updates a category by ID.
   * @param id Category ID
   * @param data Update data
   * @returns Updated category
   * @throws NotFoundException if category not found
   */
  async update(id: string, data: Partial<Category>): Promise<Category> {
    const updated = await this.categoryRepository.updateCategory(id, data);
    if (!updated) {
      throw new NotFoundException('Category not found');
    }
    return updated;
  }

  /**
   * Deletes a category by ID.
   * @param id Category ID
   * @throws NotFoundException if category not found
   */
  async delete(id: string): Promise<void> {
    const deleted = await this.categoryRepository.deleteCategory(id);
    if (!deleted) {
      throw new NotFoundException('Category not found');
    }
  }

  /**
   * Updates a category's thumbnail image.
   * @param id Category ID
   * @param imageUrl New image URL
   * @returns Updated category
   * @throws NotFoundException if category not found
   */
  // async updateCategoryImage(id: string, imageUrl: string): Promise<Category | null> {
  //   await this.getByIdOrFail(id);
  //   return this.categoryRepository.updateCategory(id, { thumbnail: imageUrl });
  // }
}