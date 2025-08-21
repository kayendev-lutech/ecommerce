import { ConflictException, NotFoundException, BadRequestException } from '@errors/app-error';
import { Product } from '@module/product/entity/product.entity';
import { Variant } from '@module/variant/entity/variant.entity';
import { RedisService } from '@services/redis.service';
import { logger } from '@logger/logger';
import { ProductCacheStrategy } from '@cache/strategies/product-cache-strategy';
import { getProductListCacheKey } from './product-cache.utils';
import { AppDataSource } from '@config/typeorm.config';
import { productAttributeValidator } from './product-attribute-validator';
import { plainToInstance } from 'class-transformer';
import { ProductResDto } from '../dto/product.res.dto';
import { extractAttributesAsObject } from './attribute-value.util';
import { Optional } from '@utils/optional.utils';

export function validateVariantNames(variants: Partial<Variant>[]) {
  const names = variants.map((v) => v.name?.trim()).filter(Boolean);
  const uniqueNames = new Set(names);
  if (uniqueNames.size !== names.length) {
    throw new ConflictException('Variant names within the same product must be unique.');
  }
}

export function buildVariantData(
  variants: Partial<Variant>[],
  product: Partial<Product> & { id: number },
): Partial<Variant>[] {
  return variants.map((v, i) => ({
    ...v,
    product_id: product.id,
    currency_code: v.currency_code || product.currency_code || 'VND',
    price: v.price ?? product.price ?? 0,
    is_default: v.is_default ?? i === 0,
    sort_order: v.sort_order ?? i,
  }));
}

/**
 * Invalidate all product cache (meta, price, variants)
 */
export async function invalidateProductCache(
  productCache: ProductCacheStrategy,
  productId: number
): Promise<void> {
  await productCache.invalidate(productId);
}

export function generateListCacheKey(reqDto: {
  page?: number;
  limit?: number;
  search?: string;
  order?: string;
  sortBy?: string;
}): string {
  const {
    page = 1,
    limit = 10,
    search,
    order = 'ASC',
    sortBy = 'created_at',
  } = reqDto;

  const keyParts = [
    `page:${page}`,
    `limit:${limit}`,
    search ? `search:${search.trim()}` : '',
    `order:${order}`,
    `sort:${sortBy}`,
  ].filter(Boolean).join('|');

  return getProductListCacheKey(keyParts);
}

export async function validateCreateProduct(productRepository: any, categoryRepository: any, data: any): Promise<void> {
  // Check slug uniqueness
  if (data.slug) {
    Optional.of(await productRepository.findBySlug(data.slug)).throwIfExist(
      new ConflictException('Slug already exists. Please pick another slug'),
    );
  }

  // Check category exists
  if (data.category_id) {
    Optional.of(await productRepository.findByCategoryId(data.category_id)).throwIfNullable(
      new NotFoundException('Category not found'),
    );
  }
}

export async function validateVariants(categoryId: number, variants: any[]): Promise<void> {
  // Validate từng variant
  for (let i = 0; i < variants.length; i++) {
    const variant = variants[i];
    if (variant.attributes && Object.keys(variant.attributes).length > 0) {
      // Validate variant attributes theo category
      const categoryAttributes = await AppDataSource.getRepository('CategoryAttribute').find({
        where: { category_id: categoryId, is_variant_level: true },
        relations: ['options']
      });

      for (const [attrName, value] of Object.entries(variant.attributes)) {
        const categoryAttr = categoryAttributes.find((a: any) => a.name === attrName);
        if (!categoryAttr) {
          throw new BadRequestException(`Variant attribute '${attrName}' is not defined for this category`);
        }
      }
    }
  }

  // Check duplicate combinations within variants
  checkDuplicateVariantCombinations(variants);
}

export function checkDuplicateVariantCombinations(variants: any[]): void {
  for (let i = 0; i < variants.length; i++) {
    for (let j = i + 1; j < variants.length; j++) {
      const attrs1 = variants[i].attributes || {};
      const attrs2 = variants[j].attributes || {};

      if (compareAttributeCombinations(attrs1, attrs2)) {
        const attrStr = Object.entries(attrs1).map(([k, v]) => `${k}=${v}`).join(', ');
        throw new BadRequestException(`Duplicate variant combination: {${attrStr}}`);
      }
    }
  }
}

export function compareAttributeCombinations(attrs1: Record<string, any>, attrs2: Record<string, any>): boolean {
  const keys1 = Object.keys(attrs1).sort();
  const keys2 = Object.keys(attrs2).sort();

  if (keys1.length !== keys2.length) return false;
  if (keys1.join(',') !== keys2.join(',')) return false;

  return keys1.every(key =>
    attrs1[key]?.toString().toLowerCase() === attrs2[key]?.toString().toLowerCase()
  );
}

export async function createValidatedVariants(
  variantRepository: any,
  saveVariantAttributes: (variantId: number, attributes: Record<string, any>) => Promise<void>,
  productId: number,
  variants: any[]
): Promise<void> {
  if (variants.length === 0) {
    // Create default variant
    const defaultVariant = variantRepository.repository.create({
      product_id: productId,
      name: `Product ${productId} - Default`,
      price: 0,
      currency_code: 'VND',
      stock: 0,
      is_default: true,
      is_active: true,
      sort_order: 0,
    });
    await variantRepository.repository.save(defaultVariant);
    return;
  }

  // Create variants (đã validate rồi nên không cần try-catch)
  for (let i = 0; i < variants.length; i++) {
    const variantData = variants[i];
    const { attributes, ...variantInfo } = variantData;

    const variant = variantRepository.repository.create({
      ...variantInfo,
      product_id: productId,
      currency_code: variantInfo.currency_code || 'VND',
      is_default: variantInfo.is_default ?? (i === 0),
      sort_order: variantInfo.sort_order ?? i,
    });

    const savedVariant = await variantRepository.repository.save(variant);

    if (attributes && Object.keys(attributes).length > 0) {
      await saveVariantAttributes(savedVariant.id, attributes);
    }
  }
  logger.info(`Created ${variants.length} variants for product ${productId}`);
}

export async function loadCreatedProductResult(
  productRepository: any,
  productCache: any,
  productId: number
): Promise<ProductResDto> {
  const productWithRelations = await productRepository.repository.findOne({
    where: { id: productId },
    relations: ['variants', 'attributeValues', 'attributeValues.categoryAttribute'],
  });

  if (!productWithRelations) {
    throw new BadRequestException('Failed to load created product');
  }

  const productDto = plainToInstance(ProductResDto, productWithRelations);
  productDto.attributes = extractAttributesAsObject(productWithRelations.attributeValues || []);

  // Update cache (không cần try-catch vì cache fail không ảnh hưởng business logic)
  productCache.set(productDto.id, productWithRelations).catch((err: any) => {
    logger.error('Failed to cache product after creation', err);
  });

  return productDto;
}

export async function saveVariantAttributes(
  variantId: number,
  attributes: Record<string, any>
): Promise<void> {
  const attributeRepo = AppDataSource.getRepository('CategoryAttribute');
  const optionRepo = AppDataSource.getRepository('CategoryAttributeOption');
  const valueRepo = AppDataSource.getRepository('VariantAttributeValue');

  // Xóa cũ (nếu update)
  await valueRepo.delete({ variant_id: variantId });

  for (const [attributeName, value] of Object.entries(attributes)) {
    const attribute = await attributeRepo.findOne({ where: { name: attributeName } });
    if (!attribute) {
      logger.warn(`Variant attribute ${attributeName} not found, skipping`);
      continue;
    }

    let category_attribute_option_id: number | null = null;
    let custom_value: string | null = null;

    if (attribute.type === 'enum') {
      const option = await optionRepo.findOne({
        where: { category_attribute_id: attribute.id, option_value: value.toString().toLowerCase() }
      });
      if (!option) {
        logger.warn(`Option ${value} for attribute ${attributeName} not found, skipping`);
        continue;
      }
      category_attribute_option_id = option.id;
    } else {
      custom_value = value.toString();
    }

    const attrValue = valueRepo.create({
      variant_id: variantId,
      category_attribute_id: attribute.id,
      category_attribute_option_id,
      custom_value,
    });
    await valueRepo.save(attrValue);
  }
  logger.debug(`Saved ${Object.keys(attributes).length} attributes for variant ${variantId}`);
}