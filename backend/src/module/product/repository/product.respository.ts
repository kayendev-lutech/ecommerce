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

    // qb.leftJoinAndSelect('product.variants', 'variants')
    // .leftJoinAndSelect('product.attributeValues', 'attributeValues')
    // .leftJoinAndSelect('attributeValues.attribute', 'attribute');

    if (search?.trim()) {
      qb.andWhere('product.name LIKE :search', { search: `%${search.trim()}%` });
    }

    const validFilterFields = new Set(['category_id', 'is_active', 'is_visible', 'currency_code']);
    Object.entries(filters).forEach(([key, value]) => {
      if (validFilterFields.has(key) && value != null && value !== '') {
        qb.andWhere(`product.${key} = :${key}`, { [key]: value });
      }
    });

    const validSortFields = new Set(['id', 'name', 'price', 'created_at']);
    const finalSortBy = validSortFields.has(sortBy) ? sortBy : 'created_at';

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
