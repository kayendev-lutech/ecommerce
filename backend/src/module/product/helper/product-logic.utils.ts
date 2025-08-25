// Trong file product-logic.utils.ts (tên file mới đề xuất)

import { EntityManager, Repository } from 'typeorm';
import { Variant } from '@module/variant/entity/variant.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { Product } from '../entity/product.entity';
import { Category } from '@module/category/entity/category.entity';
import { BadRequestException, ConflictException, NotFoundException } from '@errors/app-error';
import { productAttributeValidator } from './product-attribute-validator';
import { extractAttributesAsObject, hasAttributes } from './attribute-value.util';
import { validateVariants } from './product-validate.utils';
import { plainToInstance } from 'class-transformer';
import { ProductResDto } from '../dto/product.res.dto';
// ... các import cần thiết khác

/**
 * Validates the entire product creation payload in parallel.
 */
export async function validateProductPayload(
  manager: EntityManager,
  data: CreateProductDto,
): Promise<void> {
  const { slug, category_id, attributes, variants } = data;
  const productRepository = manager.getRepository(Product);
  const categoryRepository = manager.getRepository(Category);

  await Promise.all([
    // ... (các phần validation khác không đổi)
    (async () => {
      if (slug) {
        const existing = await productRepository.findOneBy({ slug });
        if (existing) {
          throw new ConflictException('Slug already exists. Please choose another slug.');
        }
      }
    })(),
    (async () => {
      if (category_id) {
        const category = await categoryRepository.findOneBy({ id: category_id });
        if (!category) {
          throw new NotFoundException(`Category with id ${category_id} not found.`);
        }
      }
    })(),

    // 3. Validate product attributes (ĐÃ SỬA LỖI)
    (async () => {
      // Thêm điều kiện `attributes` để TypeScript hiểu rằng nó không phải là undefined
      if (category_id && attributes && Object.keys(attributes).length > 0) {
        // Bên trong khối `if` này, TypeScript giờ đã chắc chắn `attributes` là `Record<string, any>`
        await productAttributeValidator.validateProductAttributes(category_id, attributes);
      }
    })(),

    // ... (phần validation variants không đổi)
    (async () => {
      if (variants && variants.length > 0) {
        if (category_id === undefined) {
          throw new BadRequestException('Category ID is required to validate variants');
        }
        await validateVariants(category_id, variants);
      }
    })(),
  ]);
}

/**
 * Creates variants and their attributes. Runs all variant creations in parallel.
 */
export async function createValidatedVariants(
  manager: EntityManager,
  productId: number,
  variants: any[],
): Promise<void> {
  const variantRepo = manager.getRepository(Variant);

  if (variants.length === 0) {
    const defaultVariant = variantRepo.create({
      product_id: productId,
      name: `Product ${productId} - Default`,
      price: 0,
      currency_code: 'VND',
      stock: 0,
      is_default: true,
      is_active: true,
      sort_order: 0,
    });
    await variantRepo.save(defaultVariant);
    return;
  }

  await Promise.all(
    variants.map(async (variantData, i) => {
      const { attributes, ...variantInfo } = variantData;

      const variant = variantRepo.create({
        ...variantInfo,
        product_id: productId,
        currency_code: variantInfo.currency_code || 'VND',
        is_default: variantInfo.is_default ?? i === 0,
        sort_order: variantInfo.sort_order ?? i,
      });

      const savedVariantResult = await variantRepo.save(variant);
      const savedVariant = Array.isArray(savedVariantResult)
        ? savedVariantResult[0]
        : savedVariantResult;

      if (attributes && Object.keys(attributes).length > 0 && savedVariant?.id) {
        await saveVariantAttributes(manager, savedVariant.id, attributes);
      }
    }),
  );

  logger.info(`Created ${variants.length} variants for product ${productId}`);
}

/**
 * Saves attributes for a given variant. Runs all attribute saves in parallel.
 */
export async function saveVariantAttributes(
  manager: EntityManager,
  variantId: number,
  attributes: Record<string, any>,
): Promise<void> {
  if (!attributes || Object.keys(attributes).length === 0) return;

  const attributeRepo = manager.getRepository('CategoryAttribute');
  const optionRepo = manager.getRepository('CategoryAttributeOption');
  const valueRepo = manager.getRepository('VariantAttributeValue');

  // Xóa các giá trị cũ nếu cần (logic này phù hợp hơn cho việc update)
  await valueRepo.delete({ variant_id: variantId });

  // Sử dụng Promise.all để tìm và lưu các attribute song song
  await Promise.all(
    Object.entries(attributes).map(async ([attributeName, value]) => {
      const attribute = await attributeRepo.findOne({ where: { name: attributeName } });
      if (!attribute) {
        logger.warn(`Variant attribute ${attributeName} not found, skipping`);
        return; // Bỏ qua nếu không tìm thấy attribute
      }

      let category_attribute_option_id: number | null = null;
      let custom_value: string | null = null;

      if (attribute.type === 'enum') {
        const option = await optionRepo.findOne({
          where: {
            category_attribute_id: attribute.id,
            option_value: value.toString().toLowerCase(),
          },
        });
        if (!option) {
          logger.warn(`Option ${value} for attribute ${attributeName} not found, skipping`);
          return;
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
    }),
  );

  logger.debug(`Saved ${Object.keys(attributes).length} attributes for variant ${variantId}`);
}

/**
 * Saves attributes for a given product.
 * (Tương tự, hàm này cũng cần `manager`)
 */
export async function saveProductAttributes(
  manager: EntityManager,
  productId: number,
  attributes: Record<string, any>,
): Promise<void> {
  if (!attributes || Object.keys(attributes).length === 0) return;

  const attributeRepo = manager.getRepository('CategoryAttribute');
  const optionRepo = manager.getRepository('CategoryAttributeOption');
  const valueRepo = manager.getRepository('ProductAttributeValue');

  await Promise.all(
    Object.entries(attributes).map(async ([attributeName, value]) => {
      const attribute = await attributeRepo.findOne({ where: { name: attributeName } });
      if (!attribute) {
        logger.warn(`Product attribute ${attributeName} not found, skipping`);
        return;
      }

      let category_attribute_option_id: number | null = null;
      let custom_value: string | null = null;

      if (attribute.type === 'enum') {
        const option = await optionRepo.findOne({
          where: {
            category_attribute_id: attribute.id,
            option_value: value.toString().toLowerCase(),
          },
        });
        if (!option) {
          logger.warn(`Option ${value} for attribute ${attributeName} not found, skipping`);
          return;
        }
        category_attribute_option_id = option.id;
      } else {
        custom_value = value.toString();
      }

      const attrValue = valueRepo.create({
        product_id: productId,
        category_attribute_id: attribute.id,
        category_attribute_option_id,
        custom_value,
      });
      await valueRepo.save(attrValue);
    }),
  );
  logger.debug(`Saved ${Object.keys(attributes).length} attributes for product ${productId}`);
}

/**
 * Loads the final product DTO after creation.
 * (Tương tự, hàm này cũng cần `manager`)
 */
export async function loadCreatedProductResult(
  manager: EntityManager,
  productCache: any,
  productId: number,
): Promise<ProductResDto> {
  const productWithRelations = await manager.findOne(Product, {
    where: { id: productId },
    relations: [
      'variants',
      'attributeValues',
      'attributeValues.categoryAttribute',
      'attributeValues.categoryAttribute.options',
      'variants.attributeValues',
      'variants.attributeValues.categoryAttribute',
      'variants.attributeValues.categoryAttributeOption',
    ],
  });
  if (!productWithRelations) {
    throw new BadRequestException('Failed to load created product');
  }

  const productDto = plainToInstance(ProductResDto, productWithRelations);
  productDto.attributes = extractAttributesAsObject(productWithRelations.attributeValues || []);

  productCache.set(productDto.id, productWithRelations).catch((err: any) => {
    logger.error('Failed to cache product after creation', err);
  });

  return productDto;
}
