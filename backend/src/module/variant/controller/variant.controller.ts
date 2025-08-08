import { WrappedRequest } from '@utils/wrapper.util';
import { VariantService } from '@module/variant/service/variant.service';
import { HttpResponse } from '@utils/http-response.util';
import { OffsetPaginatedDto } from '@common/dto/offset-pagination/paginated.dto';
import { VariantResDto } from '@module/variant/dto/variant.res.dto';
import { ListVariantReqDto } from '@module/variant/dto/list-variant-req.dto';
import { CursorPaginatedDto } from '@common/dto/cursor-pagination/paginated.dto';

export class VariantController {
  private variantService = new VariantService();

  /**
   * Get variants by product_id (required query param)
   */
  async getAll({ query }: WrappedRequest): Promise<CursorPaginatedDto<VariantResDto>> {
    const {
      limit = 10,
      order = 'DESC',
      afterCursor,
      beforeCursor,
      product_id,
      search,
      is_active,
      is_default,
    } = query;

    const reqDto: ListVariantReqDto = {
      limit: +limit,
      order: order as 'ASC' | 'DESC',
      afterCursor: afterCursor?.toString(),
      beforeCursor: beforeCursor?.toString(),
      product_id: product_id ? +product_id : undefined,
      search: search?.toString(),
      is_active: is_active,
      is_default: is_default,
    };

    const result = await this.variantService.getAllWithPagination(reqDto);
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
