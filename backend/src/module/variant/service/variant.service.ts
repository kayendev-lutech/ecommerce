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
  async getByProductId(product_id: string): Promise<Variant[]> {
    // Ensure product exists
    const product = await this.productRepository.findById(product_id);
    ensureFound(product, 'Product not found');
    
    return this.variantRepository.findByProductId(product_id);
  }
  /**
   * Update variant by ID
   */
  async update(id: string, data: Partial<Variant>): Promise<Variant> {
    const variant = await this.getById(id);

    if (data.name) {
      const exist = await this.variantRepository.findByNameAndProductId(
        data.name, 
        variant.product_id
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

  /**
   * Check if variant name is unique within a product
   */
  async isNameUniqueInProduct(name: string, productId: string, excludeVariantId?: string): Promise<boolean> {
    const existing = await this.variantRepository.findByNameAndProductId(name, productId);
    if (!existing) return true;
    if (excludeVariantId && existing.id === excludeVariantId) return true;
    return false;
  }

  /**
   * Check if SKU is globally unique
   */
  async isSkuUnique(sku: string, excludeVariantId?: string): Promise<boolean> {
    const existing = await this.variantRepository.findBySku(sku);
    if (!existing) return true;
    if (excludeVariantId && existing.id === excludeVariantId) return true;
    return false;
  }
}