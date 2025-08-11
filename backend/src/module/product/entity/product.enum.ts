export enum CurrencyCode {
    VND = 'VND', // Vietnamese Dong
    USD = 'USD', // US Dollar
    EUR = 'EUR', // Euro
    GBP = 'GBP', // British Pound
    JPY = 'JPY', // Japanese Yen
    AUD = 'AUD', // Australian Dollar
    CAD = 'CAD', // Canadian Dollar
}

export enum ProductStatus {
    DRAFT = 'draft', // Product is being created/edited, not visible to customers
    PUBLISHED = 'published', // Product is live and visible to customers
    ARCHIVED = 'archived', // Product is no longer available for sale
    OUT_OF_STOCK = 'out_of_stock', // Product is temporarily unavailable
    DISCONTINUED = 'discontinued', // Product is permanently removed
}