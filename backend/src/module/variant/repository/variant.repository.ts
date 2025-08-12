import { AppDataSource } from '@config/typeorm.config';
import { Variant } from '@module/variant/entity/variant.entity';
import { ListVariantReqDto } from '../dto/list-variant-req.dto';
import { buildPaginator } from '@utils/cursor-pagination';
import { CreateVariantDto } from '../dto/create-variant.dto';

export class VariantRepository {
  private repo = AppDataSource.getRepository(Variant);

  get repository() {
    return this.repo;
  }

  async findWithPagination(params: ListVariantReqDto): Promise<{ data: Variant[]; total: number }> {
    const {
      limit = 10,
      order = 'DESC',
      afterCursor,
      beforeCursor,
      product_id,
      search,
      is_active,
      is_default,
    } = params;

    const qb = this.repo.createQueryBuilder('variant');

    if (product_id !== undefined && product_id !== null) {
      qb.andWhere('variant.product_id = :product_id', { product_id });
    }

    if (search && search.trim() !== '') {
      qb.andWhere('variant.name ILIKE :search', { search: `%${search.trim()}%` });
    }

    if (is_active !== undefined && is_active !== null) {
      qb.andWhere('variant.is_active = :is_active', { is_active });
    }

    if (is_default !== undefined && is_default !== null) {
      qb.andWhere('variant.is_default = :is_default', { is_default });
    }

    const paginator = buildPaginator({
      entity: Variant,
      alias: 'variant',
      paginationKeys: ['created_at', 'id'],
      query: {
        limit,
        order,
        afterCursor,
        beforeCursor,
      },
    });

    const result = await paginator.paginate(qb);
    return {
      data: result.data,
      total: result.data.length,
    };
  }

  async findById(id: number): Promise<Variant | null> {
    return this.repo.findOne({ where: { id: id } });
  }
  async findByProductId(product_id: number): Promise<Variant[]> {
    return this.repo.find({ where: { product_id: product_id } });
  }
  async createVariant(data: CreateVariantDto): Promise<Variant> {
    const variant = this.repo.create(data);
    return this.repo.save(variant);
  }
  async findByNameAndProductId(name: string, product_id: number): Promise<Variant | null> {
    return this.repo.findOne({ where: { name, product_id: product_id } });
  }
  async updateVariant(id: number, data: Partial<Variant>): Promise<Variant | null> {
    await this.repo.update({ id: id }, data);
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
