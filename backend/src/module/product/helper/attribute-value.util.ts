import { ProductAttributeValue } from '@module/product/entity/product-attribute-value.entity';

export function extractAttributesAsObject(attributeValues: ProductAttributeValue[]): Record<string, any> {
  const result: Record<string, any> = {};
  if (!attributeValues) return result;
  attributeValues.forEach(value => {
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