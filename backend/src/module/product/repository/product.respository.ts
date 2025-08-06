import { AppDataSource } from '@config/typeorm.config';
import { Product } from '@module/product/entity/product.entity';

export class ProductRepository {
  private repo = AppDataSource.getRepository(Product);

  async findAll(): Promise<Product[]> {
    return this.repo.find();
  }
  async findWithPagination(params: {
    page?: number;
    limit?: number;
    search?: string;
    order?: 'ASC' | 'DESC';
    sortBy?: string;
    [key: string]: any;
  }): Promise<{ data: Product[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      search,
      order = 'ASC',
      sortBy = 'created_at',
      ...filters
    } = params;

    const qb = this.repo.createQueryBuilder('product');

    if (search) {
      qb.andWhere('product.name LIKE :search', { search: `%${search.trim()}%` });
    }
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        qb.andWhere(`product.${key} = :${key}`, { [key]: value });
      }
    }
    const validSortFields = ['id', 'name', 'price', 'created_at'];
    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'created_at';

    qb.orderBy(`product.${finalSortBy}`, order)
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total };
  }
  async findById(id: string): Promise<Product | null> {
    return this.repo.findOne({ where: { id } });
  }
  async findBySlug(slug: string): Promise<Product | null> {
    return this.repo.findOne({ where: { slug } });
  }
  async createProduct(data: Partial<Product>): Promise<Product> {
    const product = this.repo.create(data);
    return this.repo.save(product);
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product | null> {
    await this.repo.update({ id }, data);
    return this.findById(id);
  }

  async deleteProduct(id: string): Promise<void> {
    await this.repo.delete({ id });
  }
}
