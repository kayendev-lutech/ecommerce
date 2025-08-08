import { Category } from '@module/category/entity/category.entity';

export interface ICategoryService {
  getAll(): Promise<Category[]>;
  getById(id: string): Promise<Category | null>;
  create(data: Partial<Category>): Promise<Category>;
  update(id: string, data: Partial<Category>): Promise<Category>;
  delete(id: string): Promise<void>;
}
