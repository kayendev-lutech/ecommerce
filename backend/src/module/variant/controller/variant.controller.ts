import { WrappedRequest } from '@utils/wrapper.util';
import { VariantService } from '@module/variant/service/variant.service';

export class VariantController {
  private variantService = new VariantService();
  async getAll({ query }: WrappedRequest) {
    if (query.product_id) {
      return {
        status: 200,
        data: await this.variantService.getByProductId(query.product_id),
      };
    }
    return {
      status: 200,
      data: await this.variantService.getAll(),
    };
  }

  async getById({ params }: WrappedRequest) {
    return {
      status: 200,
      data: await this.variantService.getById(params.id),
    };
  }

  async create({ body }: WrappedRequest) {
    return {
      status: 201,
      data: await this.variantService.create(body),
      message: 'Variant created',
    };
  }

  async update({ params, body }: WrappedRequest) {
    return {
      status: 200,
      data: await this.variantService.update(params.id, body),
      message: 'Variant updated',
    };
  }

  async delete({ params }: WrappedRequest) {
    await this.variantService.delete(params.id);
    return {
      status: 200,
      message: 'Variant deleted',
    };
  }
}
