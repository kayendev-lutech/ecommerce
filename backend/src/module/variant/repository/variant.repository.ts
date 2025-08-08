import { AppDataSource } from '@config/typeorm.config';
import { Variant } from '@module/variant/entity/variant.entity';
import { ListVariantReqDto } from '../dto/list-variant-req.dto';

export class VariantRepository {
  private repo = AppDataSource.getRepository(Variant);

  async findWithPagination(params: ListVariantReqDto): Promise<{ data: Variant[]; total: number }> {
      const {
        page = 1,
        limit = 10,
        search,
        order = 'ASC',
        sortBy = 'created_at',
        ...filters
      } = params;
  
      const qb = this.repo.createQueryBuilder('variant');
  
      if (search) {
        qb.andWhere('product.name LIKE :search', { search: `%${search.trim()}%` });
      }
      const validFilterFields = ['product_id', 'is_active'];
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null && value !== '' && validFilterFields.includes(key)) {
          qb.andWhere(`product.${key} = :${key}`, { [key]: value });
        }
      }
      const validSortFields = ['id', 'name', 'created_at'];
      const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'created_at';
  
      qb.orderBy(`variant.${finalSortBy}`, order)
        .skip((page - 1) * limit)
        .take(limit);
  
      const [data, total] = await qb.getManyAndCount();
  
      return { data, total };
    }

  async findById(id: number): Promise<Variant | null> {
    return this.repo.findOne({ where: { id: id.toString() } });
  }
  async findByProductId(product_id: number): Promise<Variant[]> {
    return this.repo.find({ where: { product_id: product_id.toString() } });
  }
  async createVariant(data: Partial<Variant>): Promise<Variant> {
    const variant = this.repo.create(data);
    return this.repo.save(variant);
  }
  async findByNameAndProductId(name: string, product_id: number): Promise<Variant | null> {
    return this.repo.findOne({ where: { name, product_id: product_id.toString() } });
  }
  async updateVariant(id: number, data: Partial<Variant>): Promise<Variant | null> {
    await this.repo.update({ id: id.toString() }, data);
    return this.findById(id);
  }

  async deleteVariant(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  async findBySku(sku: string): Promise<Variant | null> {
    return this.repo.findOne({ where: { sku } });
  }
  async findManyBySkus(skus: string[]): Promise<Variant[]> {
    if (!skus.length) return [];
    return await this.repo.find({
      where: skus.map((sku) => ({ sku })),
    });
  }
}
