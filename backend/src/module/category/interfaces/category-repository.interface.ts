import { Category } from '@module/category/entity/category.entity';

export interface ICategoryRepository {
  findAll(): Promise<Category[]>;
  findById(id: string): Promise<Category | null>;
  createCategory(data: Partial<Category>): Promise<Category>;
  updateCategory(id: string, data: Partial<Category>): Promise<Category | null>;
  findBySlug(slug: string): Promise<Category | null>;
  deleteCategory(id: string): Promise<boolean>;
}