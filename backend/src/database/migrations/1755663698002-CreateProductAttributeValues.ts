// src/database/migrations/1755591600242-CreateProductAttributeValues.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductAttributeValues1755663698002 implements MigrationInterface {
  name = 'CreateProductAttributeValues1755663698002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create product_attribute_values table
    await queryRunner.query(`
            CREATE TABLE "product_attribute_values" (
                "id" SERIAL NOT NULL,
                "product_id" integer NOT NULL,
                "category_attribute_id" integer NOT NULL,
                "category_attribute_option_id" integer NULL,
                "custom_value" text NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_product_attribute_values" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_product_attribute_unique" UNIQUE ("product_id", "category_attribute_id"),
                CONSTRAINT "CHK_product_attr_value" CHECK (
                    ("category_attribute_option_id" IS NOT NULL AND "custom_value" IS NULL) OR 
                    ("category_attribute_option_id" IS NULL AND "custom_value" IS NOT NULL)
                )
            )
        `);

    // Add foreign key constraints
    await queryRunner.query(`
            ALTER TABLE "product_attribute_values" 
            ADD CONSTRAINT "FK_product_attr_values_product_id" 
            FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);

    await queryRunner.query(`
            ALTER TABLE "product_attribute_values" 
            ADD CONSTRAINT "FK_product_attr_values_attribute_id" 
            FOREIGN KEY ("category_attribute_id") REFERENCES "category_attributes"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);

    await queryRunner.query(`
            ALTER TABLE "product_attribute_values" 
            ADD CONSTRAINT "FK_product_attr_values_option_id" 
            FOREIGN KEY ("category_attribute_option_id") REFERENCES "category_attribute_options"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);

    // Create indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_product_attr_values_product_id" ON "product_attribute_values" ("product_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_product_attr_values_attribute_id" ON "product_attribute_values" ("category_attribute_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_product_attr_values_option_id" ON "product_attribute_values" ("category_attribute_option_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_product_attr_values_option_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_product_attr_values_attribute_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_product_attr_values_product_id"`);
    await queryRunner.query(
      `ALTER TABLE "product_attribute_values" DROP CONSTRAINT "FK_product_attr_values_option_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_attribute_values" DROP CONSTRAINT "FK_product_attr_values_attribute_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_attribute_values" DROP CONSTRAINT "FK_product_attr_values_product_id"`,
    );
    await queryRunner.query(`DROP TABLE "product_attribute_values"`);
  }
}
