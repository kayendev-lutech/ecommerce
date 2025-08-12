export enum CategoryStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

export enum CategoryType {
  MAIN = 'main',
  SUB = 'sub',
  SPECIAL = 'special',
}

export enum ProductStatus {
    DRAFT = 'draft', // Product is being created/edited, not visible to customers
    PUBLISHED = 'published', // Product is live and visible to customers
    ARCHIVED = 'archived', // Product is no longer available for sale
    OUT_OF_STOCK = 'out_of_stock', // Product is temporarily unavailable
    DISCONTINUED = 'discontinued', // Product is permanently removed
}