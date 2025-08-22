import { AppDataSource } from '@config/typeorm.config';
import { ProductAttributeValue } from '@module/product/entity/product-attribute-value.entity';
import { productAttributeValidator } from './product-attribute-validator';
import { BadRequestException } from '@errors/app-error';

export function extractAttributesAsObject(
  attributeValues: ProductAttributeValue[],
): Record<string, any> {
  const result: Record<string, any> = {};
  if (!attributeValues) return result;
  attributeValues.forEach((value) => {
    // Use categoryAttribute instead of attribute, and get value from option or custom_value
    if (value.categoryAttribute) {
      const attrName = value.categoryAttribute.name;
      const dataType = value.categoryAttribute.type;
      // Determine the raw value
      let rawValue: string | null = null;
      if (value.categoryAttributeOption) {
        rawValue = value.categoryAttributeOption.option_value;
      } else if (value.custom_value !== undefined && value.custom_value !== null) {
        rawValue = value.custom_value;
      }
      if (rawValue === null) return;

      switch (dataType) {
        case 'number':
          result[attrName] = parseFloat(rawValue);
          break;
        case 'boolean':
          result[attrName] = rawValue === 'true';
          break;
        case 'date':
          result[attrName] = new Date(rawValue);
          break;
        default:
          result[attrName] = rawValue;
      }
    }
  });
  return result;
}
export function hasAttributes(attributes: any): boolean {
  return attributes && Object.keys(attributes).length > 0;
}
export async function updateProductAttributesTransactional(
  productId: number,
  attributes: Record<string, any>,
): Promise<void> {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    await queryRunner.manager
      .getRepository('ProductAttributeValue')
      .delete({ product_id: productId });
    await productAttributeValidator.saveProductAttributes(productId, attributes);
    await queryRunner.commitTransaction();
  } catch (err) {
    await queryRunner.rollbackTransaction();
    logger.error('Failed to update product attributes in transaction', err);
    throw new BadRequestException('Failed to update product attributes');
  } finally {
    await queryRunner.release();
  }
}
