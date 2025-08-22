import { AppDataSource } from '@config/typeorm.config';
import { CategoryAttribute } from '@module/category/entity/category-attribute.entity';
import { CategoryAttributeOption } from '@module/category/entity/category-attribute-option.entity';
import { VariantAttributeValue } from '@module/variant/entity/variant-attribute-value.entity';
import { Product } from '@module/product/entity/product.entity';
import { logger } from '@logger/logger';

export class ProductAttributeValidator {
  private categoryAttributeRepo = AppDataSource.getRepository(CategoryAttribute);
  private categoryAttributeOptionRepo = AppDataSource.getRepository(CategoryAttributeOption);
  private variantAttributeValueRepo = AppDataSource.getRepository(VariantAttributeValue);
  private productRepo = AppDataSource.getRepository(Product);

  /**
   * Validate product attributes (product-level)
   */
  async validateProductAttributes(
    categoryId: number,
    attributes: Record<string, any>,
  ): Promise<AttributeValidationResult> {
    const result: AttributeValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    const categoryAttributes = await this.categoryAttributeRepo.find({
      where: {
        category_id: categoryId,
        is_variant_level: false,
      },
      relations: ['options'],
    });

    // Check required attributes
    for (const categoryAttr of categoryAttributes) {
      if (categoryAttr.is_required && !attributes[categoryAttr.name]) {
        result.errors.push(`Required attribute '${categoryAttr.name}' is missing`);
        result.isValid = false;
      }
    }

    for (const [attrName, attrValue] of Object.entries(attributes)) {
      const categoryAttr = categoryAttributes.find((a) => a.name === attrName);

      if (!categoryAttr) {
        result.warnings.push(`Attribute '${attrName}' is not defined for this category`);
        continue;
      }

      // Validate attribute value based on type
      const valueValidation = await this.validateAttributeValue(categoryAttr, attrValue);
      if (!valueValidation.isValid) {
        result.errors.push(...valueValidation.errors);
        result.isValid = false;
      }
    }

    return result;
  }

  /**
   * Validate variant attributes and check for duplicates
   */
  async validateVariantAttributes(
    productId: number,
    variantId: number | null,
    attributes: Record<string, any>,
  ): Promise<AttributeValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const product = await this.productRepo.findOne({ where: { id: productId } });
    if (!product) {
      return { isValid: false, errors: ['Product not found'], warnings };
    }

    const categoryAttributes = await this.categoryAttributeRepo.find({
      where: { category_id: product.category_id, is_variant_level: true },
      relations: ['options'],
    });

    if (categoryAttributes.length === 0) {
      warnings.push('No variant-level attributes defined for this category');
      return { isValid: true, errors, warnings };
    }

    const attrMap = new Map(categoryAttributes.map((a) => [a.name, a]));

    for (const attr of categoryAttributes) {
      if (attr.is_required && !attributes[attr.name]) {
        errors.push(`Required variant attribute '${attr.name}' is missing`);
      }
    }

    for (const [name, value] of Object.entries(attributes)) {
      const categoryAttr = attrMap.get(name);
      if (!categoryAttr) {
        errors.push(`Variant attribute '${name}' is not defined for this category`);
        continue;
      }

      const { isValid, errors: valErrors } = await this.validateAttributeValue(categoryAttr, value);
      if (!isValid) errors.push(...valErrors);
    }

    if (errors.length === 0) {
      const duplicateCheck = await this.checkDuplicateVariant(productId, variantId, attributes);
      if (!duplicateCheck.isValid) errors.push(...duplicateCheck.errors);
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate single attribute value
   */
  private async validateAttributeValue(
    categoryAttribute: CategoryAttribute,
    value: any,
  ): Promise<AttributeValidationResult> {
    const result: AttributeValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    const { type, name, options } = categoryAttribute;

    switch (type) {
      case 'enum':
        if (!options || options.length === 0) {
          result.errors.push(`Attribute '${name}' is enum type but has no options defined`);
          result.isValid = false;
          break;
        }

        const validOption = options.find(
          (opt) => opt.option_value === value.toString().toLowerCase(),
        );
        if (!validOption) {
          const availableOptions = options.map((opt) => opt.option_value).join(', ');
          result.errors.push(
            `Invalid value '${value}' for attribute '${name}'. Available options: ${availableOptions}`,
          );
          result.isValid = false;
        }
        break;

      case 'number':
        if (isNaN(Number(value))) {
          result.errors.push(`Attribute '${name}' must be a number, got '${value}'`);
          result.isValid = false;
        }
        break;

      case 'boolean':
        if (
          typeof value !== 'boolean' &&
          !['true', 'false', '1', '0'].includes(value.toString().toLowerCase())
        ) {
          result.errors.push(`Attribute '${name}' must be a boolean, got '${value}'`);
          result.isValid = false;
        }
        break;

      case 'text':
        if (typeof value !== 'string' && typeof value !== 'number') {
          result.errors.push(`Attribute '${name}' must be text, got '${typeof value}'`);
          result.isValid = false;
        }
        break;

      default:
        result.warnings.push(`Unknown attribute type '${type}' for attribute '${name}'`);
    }

    return result;
  }

  /**
   * Check if variant with same attribute combination already exists
   */
  private async checkDuplicateVariant(
    productId: number,
    currentVariantId: number | null,
    newAttributes: Record<string, any>,
  ): Promise<AttributeValidationResult> {
    const result: AttributeValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    try {
      // Lấy tất cả variants hiện có của product này (trừ variant đang update)
      let query = this.variantAttributeValueRepo
        .createQueryBuilder('vav')
        .innerJoin('vav.variant', 'v')
        .innerJoin('vav.categoryAttribute', 'ca')
        .leftJoin('vav.categoryAttributeOption', 'cao')
        .where('v.product_id = :productId', { productId })
        .andWhere('ca.is_variant_level = :isVariantLevel', { isVariantLevel: true });

      if (currentVariantId) {
        query = query.andWhere('v.id != :currentVariantId', { currentVariantId });
      }

      const existingVariantAttributes = await query
        .select([
          'v.id as variant_id',
          'ca.name as attribute_name',
          'COALESCE(cao.option_value, vav.custom_value) as attribute_value',
        ])
        .getRawMany();

      // Group by variant_id để tạo map các variant và attributes của chúng
      const variantAttributeMap = new Map<number, Record<string, string>>();

      for (const row of existingVariantAttributes) {
        const variantId = row.variant_id;
        const attrName = row.attribute_name;
        const attrValue = row.attribute_value;

        if (!variantAttributeMap.has(variantId)) {
          variantAttributeMap.set(variantId, {});
        }

        variantAttributeMap.get(variantId)![attrName] = attrValue;
      }

      // Check if new attribute combination matches any existing variant
      for (const [variantId, existingAttrs] of variantAttributeMap.entries()) {
        const isMatch = this.compareAttributeCombinations(newAttributes, existingAttrs);

        if (isMatch) {
          const attrStr = Object.entries(newAttributes)
            .map(([key, value]) => `${key}=${value}`)
            .join(', ');

          result.errors.push(
            `Duplicate variant combination detected. A variant with attributes {${attrStr}} already exists (Variant ID: ${variantId})`,
          );
          result.isValid = false;
          break;
        }
      }
    } catch (error) {
      logger.error('Error checking duplicate variant:', error);
      result.errors.push('Error validating variant uniqueness');
      result.isValid = false;
    }

    return result;
  }
  async saveProductAttributes(productId: number, attributes: Record<string, any>): Promise<void> {
    const attributeRepo = AppDataSource.getRepository('CategoryAttribute');
    const optionRepo = AppDataSource.getRepository('CategoryAttributeOption');
    const valueRepo = AppDataSource.getRepository('ProductAttributeValue');

    for (const [attributeName, value] of Object.entries(attributes)) {
      const attribute = await attributeRepo.findOne({ where: { name: attributeName } });
      if (!attribute) {
        logger.warn(`Product attribute ${attributeName} not found, skipping`);
        continue;
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
          continue;
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
    }
    logger.debug(`Saved ${Object.keys(attributes).length} attributes for product ${productId}`);
  }
  /**
   * Compare two attribute combinations for exact match
   */
  private compareAttributeCombinations(
    attrs1: Record<string, any>,
    attrs2: Record<string, any>,
  ): boolean {
    const keys1 = Object.keys(attrs1).sort();
    const keys2 = Object.keys(attrs2).sort();

    // Must have same number of attributes
    if (keys1.length !== keys2.length) {
      return false;
    }

    // Must have same attribute names
    if (keys1.join(',') !== keys2.join(',')) {
      return false;
    }

    // Must have same values for each attribute
    for (const key of keys1) {
      const value1 = attrs1[key]?.toString().toLowerCase();
      const value2 = attrs2[key]?.toString().toLowerCase();

      if (value1 !== value2) {
        return false;
      }
    }

    return true;
  }

  /**
   * Validate multiple variants at once (for batch operations)
   */
  async validateMultipleVariants(
    productId: number,
    variantsData: Array<{ variantId?: number; attributes: Record<string, any> }>,
  ): Promise<AttributeValidationResult> {
    const result: AttributeValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    // Validate each variant individually
    for (let i = 0; i < variantsData.length; i++) {
      const { variantId, attributes } = variantsData[i];

      const validation = await this.validateVariantAttributes(
        productId,
        variantId || null,
        attributes,
      );

      if (!validation.isValid) {
        validation.errors.forEach((error) => {
          result.errors.push(`Variant ${i + 1}: ${error}`);
        });
        result.isValid = false;
      }

      result.warnings.push(...validation.warnings);
    }

    // Check for duplicates within the batch itself
    for (let i = 0; i < variantsData.length; i++) {
      for (let j = i + 1; j < variantsData.length; j++) {
        if (
          this.compareAttributeCombinations(variantsData[i].attributes, variantsData[j].attributes)
        ) {
          const attrStr = Object.entries(variantsData[i].attributes)
            .map(([key, value]) => `${key}=${value}`)
            .join(', ');

          result.errors.push(
            `Duplicate variants in request: Variant ${i + 1} and Variant ${j + 1} have same attributes {${attrStr}}`,
          );
          result.isValid = false;
        }
      }
    }

    return result;
  }
}

export const productAttributeValidator = new ProductAttributeValidator();
