import { WrappedRequest } from '@utils/wrapper.util';
import { VariantService } from '@module/variant/service/variant.service';
import { HttpResponse } from '@utils/http-response.util';

export class VariantController {
  private variantService = new VariantService();
  async getById({ params }: WrappedRequest) {
    const variant = await this.variantService.getById(params.id);
    return HttpResponse.ok(variant, 'Variant retrieved successfully');
  }

  async update({ params, body }: WrappedRequest) {
    const updated = await this.variantService.update(params.id, body);
    return HttpResponse.ok(updated, 'Variant updated successfully');
  }

  async delete({ params }: WrappedRequest) {
    await this.variantService.delete(params.id);
    return HttpResponse.noContent('Variant deleted successfully');
  }
}