interface AttributeValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface VariantAttributeData {
  [attributeName: string]: string | number | boolean;
}
