import { logger } from '@logger/logger';
import { AppDataSource } from '../config/typeorm.config';

export class DatabaseSeeder {
  private static instance: DatabaseSeeder;

  private constructor() {}

  static getInstance(): DatabaseSeeder {
    if (!DatabaseSeeder.instance) {
      DatabaseSeeder.instance = new DatabaseSeeder();
    }
    return DatabaseSeeder.instance;
  }

  async runAllSeeds(): Promise<void> {
    try {
      // Initialize database connection
      await AppDataSource.initialize();
      logger.info('Starting database seed...');
      // Import all seed files
      const roles = await import('./seeds/001-roles.seed');
      const users = await import('./seeds/002-users.seed');
      const categories = await import('./seeds/003-categories.seed');
      const products = await import('./seeds/004-products.seed');
      const variants = await import('./seeds/005-variants.seed');
      const tokens = await import('./seeds/006-tokens.seed');
      const orders = await import('./seeds/007-order.seed');
      const orderItems = await import('./seeds/008-order-item.seed');
      const categoryAttributes = await import('./seeds/009-category-attributes.seed');
      const categoryAttributeOptions = await import('./seeds/010-category-attribute-options.seed');
      const productAttributesValues = await import('./seeds/011-product-attributes-values.seed');
      const variantAttributeValues = await import('./seeds/012-variants-attributes-values.seed');

      // Run seeds in order
      await roles.seedRoles();
      await users.seedUsers();
      await categories.seedCategories();
      await products.seedProducts();
      await variants.seedVariants();
      await tokens.seedTokens();
      await orders.seedOrders();
      await orderItems.seedOrderItems();
      await categoryAttributes.seedCategoryAttributes();
      await categoryAttributeOptions.seedCategoryAttributeOptions();
      await productAttributesValues.seedProductAttributeValues();
      await variantAttributeValues.seedVariantAttributeValues();

      logger.info('✅ All seeds completed successfully');
    } catch (error) {
      logger.error('❌ Error running seeds:', error);
      throw error;
    } finally {
      await AppDataSource.destroy();
    }
  }
}

async function run() {
  const seeder = DatabaseSeeder.getInstance();
  await seeder.runAllSeeds();
}
run().catch(console.error);
