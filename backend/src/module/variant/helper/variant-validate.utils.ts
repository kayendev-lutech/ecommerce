import { ConflictException, NotFoundException, BadRequestException } from '@errors/app-error';
import { Variant } from '@module/variant/entity/variant.entity';
import { AppDataSource } from '@config/typeorm.config';
import { productAttributeValidator } from '@module/product/helper/product-attribute-validator';
import { logger } from '@logger/logger';
import { plainToInstance } from 'class-transformer';
import { VariantResDto } from '../dto/variant.res.dto';
import { extractVariantAttributesAsObject } from './variant-attribute-value.util';

export async function validateCreateVariant(
  variantRepository: any,
  productRepository: any,
  data: any
): Promise<void> {
  // Validate product exists
  const product = await productRepository.findById(data.product_id);
  if (!product) {
    throw new NotFoundException('Product not found');
  } 

  // Validate variant name uniqueness within product
  if (data.name) {
    const existingVariant = await variantRepository.findByNameAndProductId(data.name, data.product_id);
    if (existingVariant) { 
      throw new ConflictException('Variant name must be unique within a product');
    }
  }

  // Validate SKU uniqueness globally
  if (data.sku) {
    const existingSku = await variantRepository.findBySku(data.sku);
    if (existingSku) {
      throw new ConflictException('SKU already exists');
    }
  }
}

export async function validateUpdateVariant(
  variantRepository: any,
  variantId: number,
  data: any,
  currentVariant: Variant
): Promise<void> {
  // Validate variant name uniqueness (exclude current variant)
  if (data.name && data.name !== currentVariant.name) {
    const existingVariant = await variantRepository.findByNameAndProductId(data.name, currentVariant.product_id);
    if (existingVariant && existingVariant.id !== variantId) {
      throw new ConflictException('Variant name must be unique within a product');
    }
  }

  // Validate SKU uniqueness (exclude current variant)
  if (data.sku && data.sku !== currentVariant.sku) {
    const existingSku = await variantRepository.findBySku(data.sku);
    if (existingSku && existingSku.id !== variantId) {
      throw new ConflictException('SKU already exists');
    }
  }
}

export async function validateVariantAttributes(
  productId: number,
  variantId: number | null,
  attributes: Record<string, any>
): Promise<void> {
  if (!attributes || Object.keys(attributes).length === 0) {
    return;
  }

  const validation = await productAttributeValidator.validateVariantAttributes(
    productId,
    variantId,
    attributes
  );

  if (!validation.isValid) {
    logger.error('Variant attribute validation failed', { errors: validation.errors });
    throw new BadRequestException(`Variant attribute validation failed: ${validation.errors.join(', ')}`);
  }

  if (validation.warnings.length > 0) {
    logger.warn('Variant attribute warnings:', validation.warnings);
  }
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

export async function loadVariantWithAttributes(
  variantRepository: any,
  variantId: number
): Promise<VariantResDto> {
  const variantWithRelations = await variantRepository.repository.findOne({
    where: { id: variantId },
    relations: ['attributeValues', 'attributeValues.categoryAttribute', 'attributeValues.categoryAttributeOption'],
  });

  if (!variantWithRelations) {
    throw new BadRequestException('Failed to load variant');
  }

  const variantDto = plainToInstance(VariantResDto, variantWithRelations);
  variantDto.attributes = extractVariantAttributesAsObject(variantWithRelations.attributeValues || []);

  return variantDto;
}