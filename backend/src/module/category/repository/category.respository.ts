import { Category } from '@module/category/entity/category.entity';
import { ICategoryRepository } from '@module/category/interfaces/category-repository.interface';
import { DataSource } from 'typeorm';

export class CategoryRepository implements ICategoryRepository {
  constructor(private dataSource: DataSource) {}
  private get repo() {
    return this.dataSource.getRepository(Category);
  }
  async findAll(): Promise<Category[]> {
    return this.repo.find();
  }

  async findById(id: string): Promise<Category | null> {
    return this.repo.findOne({ where: { id } });
  }

  async createCategory(data: Partial<Category>): Promise<Category> {
    const category = this.repo.create(data);
    return this.repo.save(category);
  }

  async updateCategory(id: string, data: Partial<Category>): Promise<Category | null> {
    await this.repo.update({ id }, data);
    return this.findById(id);
  }
  async findBySlug(slug: string): Promise<Category | null> {
    return this.repo.findOne({ where: { slug } });
  }
  async deleteCategory(id: string): Promise<boolean> {
    const result = await this.repo.delete({ id });
    return (result.affected ?? 0) > 0;
  }
}
