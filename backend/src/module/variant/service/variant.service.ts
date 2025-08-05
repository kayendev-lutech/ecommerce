import { VariantRepository } from '@module/variant/repository/variant.repository';
import { Variant } from '@module/variant/entity/variant.entity';
import { ConflictException } from '@errors/app-error';
import { ensureFound, ensureNotExist } from '@utils/entity-check.util';
import { ProductRepository } from '@module/product/repository/product.respository';

export class VariantService {
  private variantRepository = new VariantRepository();
  private productRepository = new ProductRepository();

  /**
   * Get variant by ID or throw error if not found
   */
  async getById(id: string): Promise<Variant> {
    const variant = await this.variantRepository.findById(id);
    return ensureFound(variant, 'Variant not found');
  }

  /**
   * Get all variants for a specific product
   */
  async getByProductId(id: string): Promise<Variant[]> {
    const product = await this.productRepository.findById(id);
    ensureFound(product, 'Product not found');

    return this.variantRepository.findByProductId(id);
  }
  /**
   * Update variant by ID
   */
  async update(id: string, data: Partial<Variant>): Promise<Variant> {
    const variant = await this.getById(id);

    if (data.name) {
      const exist = await this.variantRepository.findByNameAndProductId(
        data.name,
        variant.product_id,
      );
      if (exist && exist.id !== id) {
        throw new ConflictException('Variant name must be unique within a product');
      }
    }

    if (data.sku) {
      const existSku = await this.variantRepository.findBySku(data.sku);
      if (existSku && existSku.id !== id) {
        throw new ConflictException('SKU already exists');
      }
    }

    const updated = await this.variantRepository.updateVariant(id, data);
    return ensureFound(updated, 'Variant not found');
  }
  /**
   * Create a new variant for a product
   * @param data Thông tin biến thể
   * @returns Variant đã tạo
   * @throws ConflictException nếu tên hoặc SKU bị trùng
   */
  async create(data: Partial<Variant>): Promise<Variant> {
    const product = await this.productRepository.findById(data.product_id as string);
    ensureFound(product, 'Product not found');

    if (data.name) {
      const exist = await this.variantRepository.findByNameAndProductId(
        data.name,
        data.product_id as string,
      );
      ensureNotExist(exist, 'Variant name must be unique within a product');
    }

    if (data.sku) {
      const existSku = await this.variantRepository.findBySku(data.sku);
      ensureNotExist(existSku, 'SKU already exists');
    }

    const variantData = {
      ...data,
      currency_code: data.currency_code || product?.currency_code || 'VND',
      price: data.price ?? product?.price,
      is_active: data.is_active ?? true,
      is_default: data.is_default ?? false,
      sort_order: data.sort_order ?? 0,
    };

    return this.variantRepository.createVariant(variantData);
  }
  /**
   * Delete variant by ID
   * Note: When deleting a product, all variants are automatically deleted via CASCADE
   */
  async delete(id: string): Promise<void> {
    await this.getById(id);
    await this.variantRepository.deleteVariant(id);
  }

  /**
   * Get variant by SKU
   */
  async getBySku(sku: string): Promise<Variant> {
    const variant = await this.variantRepository.findBySku(sku);
    return ensureFound(variant, 'Variant not found');
  }
}
