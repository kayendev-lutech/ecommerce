import { UpdateCategoryDto } from '@module/category/dto/update-category.dto';
import { CreateCategoryDto } from '@module/category/dto/create-category.dto';
import { Category } from '@module/category/entity/category.entity';
import { ConflictException, NotFoundException } from '@errors/app-error';
import { CategoryRepository } from '@module/category/repository/category.repository';
import { Optional } from '@utils/optional.utils';

export class CategoryService {
  private categoryRepository = new CategoryRepository();

  /**
   * Lấy tất cả category kèm attributes và options.
   * @returns Array of categories with relations
   */
  async getAll(): Promise<Category[]> {
    return this.categoryRepository.findAllWithRelations();
  }

  /**
   * Lấy category theo ID kèm attributes và options.
   * @param id Category ID
   * @returns Category hoặc null nếu không có
   */
  async getById(id: string): Promise<Category | null> {
    return this.categoryRepository.findByIdWithRelations(id);
  }

  /**
   * Tạo mới category với validation slug và parent.
   * @param createCategoryDto Category data
   * @returns Created category
   * @throws ConflictException nếu slug đã tồn tại
   * @throws NotFoundException nếu parent category không tồn tại
   */
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    if (createCategoryDto.parent_id) {
      Optional.of(
        await this.categoryRepository.findById(String(createCategoryDto.parent_id)),
      ).throwIfNullable(new NotFoundException('Parent category not found'));
    }

    if (createCategoryDto.slug) {
      Optional.of(await this.categoryRepository.findBySlug(createCategoryDto.slug)).throwIfExist(
        new ConflictException('Category with this slug already exists'),
      );
    }

    return this.categoryRepository.createCategory(createCategoryDto);
  }

  /**
   * Lấy category theo ID, throw NotFoundException nếu không có.
   * @param id Category ID
   * @returns Category
   * @throws NotFoundException nếu không tìm thấy
   */
  async getByIdOrFail(id: string): Promise<Category> {
    return Optional.of(await this.getById(id))
      .throwIfNullable(new NotFoundException('Category not found'))
      .get<Category>();
  }

  /**
   * Cập nhật category với validation slug và parent.
   * @param id Category ID
   * @param updateCategoryDto Update data
   * @returns Updated category
   * @throws NotFoundException nếu category không tồn tại
   * @throws ConflictException nếu slug đã tồn tại
   */
  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    await this.getByIdOrFail(id);

    if (updateCategoryDto.parent_id) {
      Optional.of(
        await this.categoryRepository.findById(String(updateCategoryDto.parent_id)),
      ).throwIfNullable(new NotFoundException('Parent category not found'));
    }

    if (updateCategoryDto.slug) {
      const existingCategory = await this.categoryRepository.findBySlug(updateCategoryDto.slug);
      if (existingCategory && existingCategory.id !== id) {
        throw new ConflictException('Category with this slug already exists');
      }
    }

    return Optional.of(await this.categoryRepository.updateCategory(id, updateCategoryDto))
      .throwIfNullable(new NotFoundException('Category not found'))
      .get<Category>();
  }

  /**
   * Xóa category theo ID, sẽ tự động xóa attributes/options liên quan (CASCADE).
   * @param id Category ID
   * @throws NotFoundException nếu category không tồn tại
   */
  async delete(id: string): Promise<void> {
    await this.getByIdOrFail(id);

    const deleted = await this.categoryRepository.deleteCategory(id);
    if (!deleted) {
      throw new NotFoundException('Category not found');
    }
  }

  /**
   * Lấy tất cả category con theo parent_id, kèm attributes/options.
   * @param parentId Parent category ID
   * @returns Array of child categories
   */
  async getByParentId(parentId: number): Promise<Category[]> {
    return this.categoryRepository.findByParentIdWithRelations(parentId);
  }
}
