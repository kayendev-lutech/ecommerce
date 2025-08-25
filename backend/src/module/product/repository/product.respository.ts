import { AppDataSource } from '@config/typeorm.config';
import { Product } from '@module/product/entity/product.entity';
import { ListProductReqDto } from '../dto/list-product-req.dto';
import { Repository } from 'typeorm';

export class ProductRepository extends Repository<Product> {
  constructor() {
    super(Product, AppDataSource.manager);
  }

  async findAll(): Promise<Product[]> {
    return this.find();
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

    const qb = this.createQueryBuilder('product');

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
    return this.findOne({ where: { id } });
  }
  async findDetailById(id: number): Promise<Product | null> {
    return this.createQueryBuilder('product')
      .leftJoinAndSelect('product.variants', 'variant')
      .leftJoinAndSelect('product.attributeValues', 'attributeValue')
      .leftJoinAndSelect('variant.attributeValues', 'variantAttributeValue')
      .leftJoinAndSelect('variantAttributeValue.categoryAttribute', 'variantAttr')
      .leftJoinAndSelect('variantAttributeValue.categoryAttributeOption', 'variantAttrOption')
      .leftJoinAndSelect('attributeValue.categoryAttribute', 'attr')
      .select([
        'product.id',
        'product.name',
        'product.slug',
        'product.price',
        'product.currency_code',
        'product.image_url',
        'product.is_active',
        'product.is_visible',
        'variant.id',
        'variant.name',
        'variant.price',
        'variant.sku',
        'variant.is_active',
        'variant.is_default',
      ])
      .where('product.id = :id', { id })
      .getOne();
  }
  async findBySlug(slug: string): Promise<Product | null> {
    return this.findOne({ where: { slug } });
  }
  async findByCategoryId(category_id: number): Promise<Product | null> {
    return this.findOne({ where: { category_id } });
  }
  async createProduct(data: Partial<Product>): Promise<Product> {
    const product = this.create(data);
    return this.save(product);
  }

  async updateProduct(id: number, data: Partial<Product>): Promise<Product | null> {
    await this.update({ id }, data);
    return this.findById(id);
  }

  async deleteProduct(id: number): Promise<void> {
    await this.delete({ id });
  }
}
