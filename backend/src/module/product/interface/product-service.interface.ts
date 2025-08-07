import { Product } from '@module/product/entity/product.entity';
import { Variant } from '@module/variant/entity/variant.entity';

export interface IProductService {
  getAllWithPagination(params: {
    page?: number;
    limit?: number;
    search?: string;
    order?: 'ASC' | 'DESC';
    sortBy?: string;
    [key: string]: any;
  }): Promise<{ data: Product[]; total: number }>;
  getById(id: string): Promise<(Product & { variants: Variant[] }) | null>;
  getByIdOrFail(id: string): Promise<Product>;
  create(
    data: Partial<Product> & { variants?: Partial<Variant>[] },
  ): Promise<Product & { variants: Variant[] }>;
  update(id: string, data: Partial<Product>): Promise<Product>;
  delete(id: string): Promise<void>;
  updateProductImage(id: string, imageUrl: string): Promise<Product>;
}
