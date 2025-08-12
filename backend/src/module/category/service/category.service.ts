import { UpdateCategoryDto } from './../dto/update-category.dto';
import { CreateCategoryDto } from './../dto/create-category.dto';
import { Category } from '@module/category/entity/category.entity';
import { ConflictException, NotFoundException } from '@errors/app-error';
import { Inject, Service } from 'typedi';
import { CategoryRepository } from '@module/category/repository/category.respository';
import { Container } from 'typedi';
import { Optional } from '@utils/optional.utils';

@Service()
export class CategoryService {
  private readonly categoryRepository: CategoryRepository;

  constructor() {
    this.categoryRepository = Container.get(CategoryRepository);
  }

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
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    if (createCategoryDto.slug) {
      Optional.of(await this.categoryRepository.findBySlug(createCategoryDto.slug))
        .throwIfExist(new ConflictException('Category with this slug already exists'));
    }
    return this.categoryRepository.createCategory(createCategoryDto);
  }

  /**
   * Finds a category by ID or throws an error if not found.
   * @param id Category ID
   * @returns Category
   * @throws NotFoundException if category not found
   */
  async getByIdOrFail(id: string): Promise<Category> {
    return Optional.of(await this.getById(id))
      .throwIfNullable(new NotFoundException('Category not found'))
      .get() as Category;
  }

  /**
   * Updates a category by ID.
   * @param id Category ID
   * @param data Update data
   * @returns Updated category
   * @throws NotFoundException if category not found
   * @throws ConflictException if slug already exists
   */
  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    await this.getByIdOrFail(id);

    // Check conflict
    if (updateCategoryDto.slug) {
      const existingCategory = await this.categoryRepository.findBySlug(updateCategoryDto.slug);
      if (existingCategory && existingCategory.id !== id) {
        throw new ConflictException('Category with this slug already exists');
      }
    }

    return Optional.of(await this.categoryRepository.updateCategory(id, updateCategoryDto))
      .throwIfNullable(new NotFoundException('Category not found'))
      .get() as Category;
  }

  /**
   * Deletes a category by ID.
   * @param id Category ID
   * @throws NotFoundException if category not found
   */
  async delete(id: string): Promise<void> {
    // Check if category exists first
    await this.getByIdOrFail(id);

    Optional.of(await this.categoryRepository.deleteCategory(id))
      .throwIfNullable(new NotFoundException('Category not found'));
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
