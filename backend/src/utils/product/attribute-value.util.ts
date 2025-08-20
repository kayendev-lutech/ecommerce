import { ProductAttributeValue } from '@module/product/entity/product-attribute-value.entity';

export function extractAttributesAsObject(attributeValues: ProductAttributeValue[]): Record<string, any> {
  const result: Record<string, any> = {};
  if (!attributeValues) return result;
  attributeValues.forEach(value => {
    if (value.attribute) {
      const attrName = value.attribute.name;
      const dataType = value.attribute.data_type;
      switch (dataType) {
        case 'number':
          result[attrName] = parseFloat(value.value);
          break;
        case 'boolean':
          result[attrName] = value.value === 'true';
          break;
        case 'date':
          result[attrName] = new Date(value.value);
          break;
        default:
          result[attrName] = value.value;
      }
    }
  });
  return result;
}