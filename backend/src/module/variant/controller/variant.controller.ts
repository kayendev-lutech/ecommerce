import { WrappedRequest } from '@utils/wrapper.util';
import { VariantService } from '@module/variant/service/variant.service';
import { HttpResponse } from '@utils/http-response.util';

export class VariantController {
  private variantService = new VariantService();

  /**
   * Get variants by product_id (required query param)
   */
  async getAll({ query }: WrappedRequest) {
    const variants = await this.variantService.getByProductId(query.product_id);
    return HttpResponse.ok(variants, 'Product variants retrieved successfully');
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
