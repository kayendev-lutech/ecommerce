import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateVariantsTable1753342251332 implements MigrationInterface {
  name = 'CreateVariantsTable1753342251332';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "variants" (
                "id" SERIAL PRIMARY KEY,
                "product_id" integer NOT NULL,
                "name" character varying NOT NULL,
                "sku" character varying,
                "barcode" character varying,
                "price" numeric(12,2),
                "discount_price" numeric(12,2),
                "currency_code" character varying,
                "stock" integer,
                "stock_reserved" integer,
                "low_stock_threshold" integer,
                "weight" numeric(12,2),
                "image_url" character varying,
                "attributes" json,
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "FK_variants_product_id" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "variants"`);
  }
}
