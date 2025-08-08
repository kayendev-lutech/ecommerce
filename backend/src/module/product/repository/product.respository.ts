import { AppDataSource } from '@config/typeorm.config';
import { Product } from '@module/product/entity/product.entity';
import { ListProductReqDto } from '../dto/list-product-req.dto';

export class ProductRepository {
  private repo = AppDataSource.getRepository(Product);

  get repository() {
    return this.repo;
  }

  async findAll(): Promise<Product[]> {
    return this.repo.find();
  }
  async findWithPagination(params: ListProductReqDto): Promise<{ data: Product[]; total: number }> {
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
    const validFilterFields = ['category_id', 'is_active', 'is_visible', 'currency_code'];
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '' && validFilterFields.includes(key)) {
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
  async findById(id: number): Promise<Product | null> {
    return this.repo.findOne({ where: { id } });
  }
  async findBySlug(slug: string): Promise<Product | null> {
    return this.repo.findOne({ where: { slug } });
  }
  async findByCategoryId(category_id: number): Promise<Product | null> {
    return this.repo.findOne({ where: { category_id } });
  }
  async createProduct(data: Partial<Product>): Promise<Product> {
    const product = this.repo.create(data);
    return this.repo.save(product);
  }

  async updateProduct(id: number, data: Partial<Product>): Promise<Product | null> {
    await this.repo.update({ id }, data);
    return this.findById(id);
  }

  async deleteProduct(id: number): Promise<void> {
    await this.repo.delete({ id });
  }
}
