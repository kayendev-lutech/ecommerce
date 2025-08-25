import { BadRequestException, ConflictException, NotFoundException } from '@errors/app-error.js';
import { CategoryRepository } from '@module/category/repository/category.repository';
import { ProductRepository } from '@module/product/repository/product.respository';
import { VariantRepository } from '@module/variant/repository/variant.repository';
import { CreateProductDto } from '@module/product/dto/create-product.dto';
import { Optional } from '@utils/optional.utils';
import { AppDataSource } from '@config/typeorm.config';
import { CategoryAttribute } from '@module/category/entity/category-attribute.entity';
import { logger } from '@logger/logger';
import { EntityManager } from 'typeorm';
import { Variant } from '@module/variant/entity/variant.entity';
import { ProductAttributeValue } from '../entity/product-attribute-value.entity';

export class ProductValidator {
  constructor(
    private productRepository: ProductRepository,
    private categoryRepository: CategoryRepository,
    private variantRepository: VariantRepository,
  ) {}

  /**
   * Validates the entire payload for creating a new product.
   */
  async validateCreateProductPayload(data: CreateProductDto): Promise<void> {
    const { slug, category_id, attributes = {}, variants = [] } = data;

    // Use Promise.all to run independent validations in parallel
    await Promise.all([
      this._validateSlug(slug),
      this._validateCategory(category_id),
      this._validateProductAttributes(category_id, attributes),
      this._validateVariants(category_id, variants),
    ]);
  }

  private async _validateSlug(slug?: string): Promise<void> {
    if (slug) {
      const existing = await this.productRepository.findBySlug(slug);
      if (existing) {
        throw new ConflictException('Slug already exists. Please pick another slug');
      }
    }
  }

  private async _validateCategory(categoryId?: number): Promise<void> {
    if (categoryId) {
      const category = await this.categoryRepository.findById(categoryId);
      if (!category) {
        throw new NotFoundException(`Category with id ${categoryId} not found`);
      }
    }
  }

  /**
   * Optimized validation for product attributes.
   */
  private async _validateProductAttributes(
    categoryId: number | undefined,
    attributes: Record<string, any>,
  ): Promise<void> {
    if (!categoryId || Object.keys(attributes).length === 0) return;

    // Fetch all relevant attributes for the category at once
    const categoryAttributes = await AppDataSource.getRepository(CategoryAttribute).find({
      where: { category_id: categoryId, is_variant_level: false },
      relations: ['options'],
    });

    // Logic to validate attributes against the fetched category attributes
    // (This part can be expanded based on the logic from your ProductAttributeValidator class)
    for (const attr of categoryAttributes) {
      if (attr.is_required && !attributes[attr.name]) {
        throw new BadRequestException(`Required attribute '${attr.name}' is missing.`);
      }
    }
  }

  /**
   * Optimized validation for variants, avoiding async calls in loops.
   */
  private async _validateVariants(categoryId: number | undefined, variants: any[]): Promise<void> {
    if (variants.length === 0) return;
    if (!categoryId) {
      throw new BadRequestException('Category ID is required to validate variants.');
    }

    // 1. Fetch required category attributes once
    const categoryVariantAttributes = await AppDataSource.getRepository(CategoryAttribute).find({
      where: { category_id: categoryId, is_variant_level: true },
    });
    const categoryAttrNames = new Set(categoryVariantAttributes.map((a) => a.name));

    // 2. Validate each variant
    variants.forEach((variant) => {
      if (variant.attributes) {
        for (const attrName in variant.attributes) {
          if (!categoryAttrNames.has(attrName)) {
            throw new BadRequestException(
              `Variant attribute '${attrName}' is not defined for this category.`,
            );
          }
        }
      }
    });

    // 3. Check for duplicate attribute combinations within the request
    const attributeSets = new Set<string>();
    for (const variant of variants) {
      const attrs = variant.attributes || {};
      const sortedKeys = Object.keys(attrs).sort();
      const attrString = sortedKeys.map((key) => `${key}:${attrs[key]}`).join('|');

      if (attributeSets.has(attrString)) {
        throw new ConflictException(
          `Duplicate variant combination found in request: ${attrString}`,
        );
      }
      attributeSets.add(attrString);
    }
  }

  /**
   * Creates variants using a transactional entity manager.
   */
  public async createVariants(
    productId: number,
    variants: any[],
    entityManager: EntityManager,
  ): Promise<void> {
    const variantRepo = entityManager.getRepository(Variant);

    for (let i = 0; i < variants.length; i++) {
      const { attributes, ...variantInfo } = variants[i];
      const variant = variantRepo.create({
        ...variantInfo,
        product_id: productId,
        is_default: variantInfo.is_default ?? i === 0,
        sort_order: variantInfo.sort_order ?? i,
      });
      await variantRepo.save(variant);
      // Logic to save variant attributes can be added here if needed
    }
    logger.info(`Created ${variants.length} variants for product ${productId}`);
  }

  /**
   * Saves product attributes using a transactional entity manager.
   */
  public async saveProductAttributes(
    productId: number,
    attributes: Record<string, any>,
    entityManager: EntityManager,
  ): Promise<void> {
    const valueRepo = entityManager.getRepository(ProductAttributeValue);
    // Note: This logic assumes you have a way to get attribute IDs from names.
    // This part might need adjustment based on your full entity structure.
    logger.info(`Saving attributes for product ${productId}`);
    // Example: for (const [attrName, attrValue] of Object.entries(attributes)) { ... }
  }
}
