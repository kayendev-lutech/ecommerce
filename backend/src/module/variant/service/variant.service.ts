import { VariantRepository } from '@module/variant/repository/variant.repository';
import { Variant } from '@module/variant/entity/variant.entity';
import { AppError, ErrorCode, InternalServerErrorException } from '@errors/app-error';

export class VariantService {
  private variantRepository = new VariantRepository();

  async getAll(): Promise<Variant[]> {
    return this.variantRepository.findAll();
  }

  async getById(id: string): Promise<Variant> {
    try {
      const variant = await this.variantRepository.findById(id);
      if (!variant) {
        throw new AppError(ErrorCode.NOT_FOUND, 404, 'Variant not found');
      }
      return variant;
    } catch (error: any) {
      throw new InternalServerErrorException(error?.message || 'Failed to get variant');
    }
  }
  async create(data: Partial<Variant>): Promise<Variant> {
    try {
      return await this.variantRepository.createVariant(data);
    } catch (error: any) {
      throw new InternalServerErrorException(error?.message || 'Failed to create variant');
    }
  }

  async getByProductId(product_id: string): Promise<Variant[]> {
    try {
      return await this.variantRepository.findByProductId(product_id);
    } catch (error: any) {
      throw new InternalServerErrorException(
        error?.message || 'Failed to get variants by product id',
      );
    }
  }

  async update(id: string, data: Partial<Variant>): Promise<Variant | null> {
    try {
      const updated = await this.variantRepository.updateVariant(id, data);
      if (!updated) {
        throw new AppError(ErrorCode.NOT_FOUND, 404, 'Variant not found');
      }
      return updated;
    } catch (error: any) {
      throw new InternalServerErrorException(error?.message || 'Failed to update variant');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.variantRepository.deleteVariant(id);
    } catch (error: any) {
      throw new InternalServerErrorException(error?.message || 'Failed to delete variant');
    }
  }
}
