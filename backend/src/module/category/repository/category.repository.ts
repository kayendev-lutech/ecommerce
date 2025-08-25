import { Category } from '@module/category/entity/category.entity';
import { ICategoryRepository } from '@module/category/interfaces/category-repository.interface';
import { Repository } from 'typeorm';
// import { Service } from 'typedi';
import { AppDataSource } from '@config/typeorm.config';
import { CreateCategoryDto } from '../dto/create-category.dto';

// @Service()
export class CategoryRepository extends Repository<Category> {
  constructor() {
    super(Category, AppDataSource.manager);
  }
  async findAll(): Promise<Category[]> {
    return this.find();
  }

  async findById(id: number): Promise<Category | null> {
    return this.findOne({ where: { id } });
  }

  async createCategory(data: CreateCategoryDto): Promise<Category> {
    const category = this.create(data);
    return this.save(category);
  }
  async findAllWithRelations(): Promise<Category[]> {
    return this.find({
      relations: ['attributes', 'attributes.options'],
      order: { sort_order: 'ASC' },
    });
  }
  async findByParentIdWithRelations(parentId: number): Promise<Category[]> {
    return this.find({
      where: { parent_id: parentId },
      relations: ['attributes', 'attributes.options'],
      order: { sort_order: 'ASC' },
    });
  }
  async findByIdWithRelations(id: number): Promise<Category | null> {
    return this.findOne({
      where: { id },
      relations: ['attributes', 'attributes.options'],
    });
  }
  async updateCategory(id: number, data: Partial<Category>): Promise<Category | null> {
    await this.update({ id }, data);
    return this.findById(id);
  }
  async findBySlug(slug: string): Promise<Category | null> {
    return this.findOne({ where: { slug } });
  }
  async findByParentId(parentId: number): Promise<Category[]> {
    return this.find({
      where: { parent_id: parentId },
      order: { sort_order: 'ASC' },
    });
  }
  async deleteCategory(id: number): Promise<boolean> {
    const result = await this.delete({ id });
    return (result.affected ?? 0) > 0;
  }
}
