import { Product } from '@module/product/entity/product.entity';

export interface IProductRepository {
  findAll(): Promise<Product[]>;
  findWithPagination(params: {
    page?: number;
    limit?: number;
    search?: string;
    order?: 'ASC' | 'DESC';
    sortBy?: string;
    [key: string]: any;
  }): Promise<{ data: Product[]; total: number }>;
  findById(id: string): Promise<Product | null>;
  findBySlug(slug: string): Promise<Product | null>;
  createProduct(data: Partial<Product>): Promise<Product>;
  updateProduct(id: string, data: Partial<Product>): Promise<Product | null>;
  deleteProduct(id: string): Promise<void>;
}
