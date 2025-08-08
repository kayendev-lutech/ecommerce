import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateVariantsTable1753342251332 implements MigrationInterface {
  name = 'CreateVariantsTable1753342251332';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "variants" (
        "id" SERIAL PRIMARY KEY,
        "product_id" integer NOT NULL,
        "name" character varying NOT NULL,
        "sku" character varying UNIQUE,
        "barcode" character varying,
        "price" numeric(12,2),
        "discount_price" numeric(12,2),
        "currency_code" character varying DEFAULT 'VND',
        "stock" integer DEFAULT 0,
        "stock_reserved" integer DEFAULT 0,
        "low_stock_threshold" integer DEFAULT 0,
        "weight" numeric(12,2),
        "image_url" character varying,
        "attributes" json,
        "is_active" boolean NOT NULL DEFAULT true,
        "is_default" boolean NOT NULL DEFAULT false,
        "sort_order" integer DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "FK_variants_product_id" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "UQ_variants_product_name" UNIQUE ("product_id", "name")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "variants"`);
  }
}
