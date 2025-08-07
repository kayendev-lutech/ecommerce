import { WrappedRequest } from '@utils/wrapper.util';
import { VariantService } from '@module/variant/service/variant.service';
import { HttpResponse } from '@utils/http-response.util';
import { OffsetPaginatedDto } from '@common/dto/offset-pagination/paginated.dto';
import { VariantResDto } from '../dto/variant.res.dto';

export class VariantController {
  private variantService = new VariantService();

  /**
   * Get variants by product_id (required query param)
   */
  async getAll({ query }: WrappedRequest): Promise<OffsetPaginatedDto<VariantResDto>> {
    const { page = 1, limit = 10, search, order = 'DESC', sortBy, ...filters } = query;
    
    const result = await this.variantService.getAllWithPagination({
      page: Number(page),
      limit: Number(limit),
      search: search ? String(search) : undefined,
      order,
      sortBy,
      ...filters,
    });

    return result;
  }

  /**
   * Get variant by ID
   */
  async getById({ params }: WrappedRequest) {
    const variant = await this.variantService.getById(params.id);
    return HttpResponse.ok(variant, 'Variant retrieved successfully');
  }

  /**
   * Create new variant (standalone)
   */
  async create({ body }: WrappedRequest) {
    const created = await this.variantService.create(body);
    return HttpResponse.created(created, 'Variant created successfully');
  }

  /**
   * Update variant by ID
   */
  async update({ params, body }: WrappedRequest) {
    const updated = await this.variantService.update(params.id, body);
    return HttpResponse.ok(updated, 'Variant updated successfully');
  }

  /**
   * Delete variant by ID
   */
  async delete({ params }: WrappedRequest) {
    await this.variantService.delete(params.id);
    return HttpResponse.noContent('Variant deleted successfully');
  }
}
