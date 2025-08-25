import { Category } from '@module/category/entity/category.entity';
import { ICategoryRepository } from '@module/category/interfaces/category-repository.interface';
import { Repository } from 'typeorm';
// import { Service } from 'typedi';
import { AppDataSource } from '@config/typeorm.config';
import { CreateProductDto } from '@module/product/dto/create-product.dto';
import { CreateCategoryDto } from '../dto/create-category.dto';

// @Service()
export class CategoryRepository implements ICategoryRepository {
  private repo: Repository<Category>;

  constructor() {
    this.repo = AppDataSource.getRepository(Category);
  }
  async findAll(): Promise<Category[]> {
    return this.repo.find();
  }

  async findById(id: string): Promise<Category | null> {
    return this.repo.findOne({ where: { id } });
  }

  async createCategory(data: CreateCategoryDto): Promise<Category> {
    const category = this.repo.create(data);
    return this.repo.save(category);
  }
  async findAllWithRelations(): Promise<Category[]> {
    return this.repo.find({
      relations: ['attributes', 'attributes.options'],
      order: { sort_order: 'ASC' },
    });
  }
  async findByParentIdWithRelations(parentId: number): Promise<Category[]> {
    return this.repo.find({
      where: { parent_id: parentId },
      relations: ['attributes', 'attributes.options'],
      order: { sort_order: 'ASC' },
    });
  }
  async findByIdWithRelations(id: string): Promise<Category | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['attributes', 'attributes.options'],
    });
  }
  async updateCategory(id: string, data: Partial<Category>): Promise<Category | null> {
    await this.repo.update({ id }, data);
    return this.findById(id);
  }
  async findBySlug(slug: string): Promise<Category | null> {
    return this.repo.findOne({ where: { slug } });
  }
  async findByParentId(parentId: number): Promise<Category[]> {
    return this.repo.find({
      where: { parent_id: parentId },
      order: { sort_order: 'ASC' },
    });
  }
  async deleteCategory(id: string): Promise<boolean> {
    const result = await this.repo.delete({ id });
    return (result.affected ?? 0) > 0;
  }
}
