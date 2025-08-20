// src/database/migrations/1755591600242-CreateAttributeValue.ts
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAttributeValue1755591600242 implements MigrationInterface {
    name = 'CreateAttributeValue1755591600242'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create product_attribute_values table
        await queryRunner.query(`
            CREATE TABLE "product_attribute_values" (
                "id" SERIAL NOT NULL,
                "product_id" integer NOT NULL,
                "attribute_id" integer NOT NULL,
                "value" text NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_product_attribute_values" PRIMARY KEY ("id")
            )
        `);

        // Create unique constraint - one value per product per attribute
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_product_attribute_unique" 
            ON "product_attribute_values" ("product_id", "attribute_id")
        `);

        // Create indexes for better performance
        await queryRunner.query(`CREATE INDEX "IDX_pav_product_id" ON "product_attribute_values" ("product_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_pav_attribute_id" ON "product_attribute_values" ("attribute_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_pav_value" ON "product_attribute_values" ("value")`);

        // Add foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "product_attribute_values" 
            ADD CONSTRAINT "FK_pav_product_id" 
            FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "product_attribute_values" 
            ADD CONSTRAINT "FK_pav_attribute_id" 
            FOREIGN KEY ("attribute_id") REFERENCES "product_attributes"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);

        // Remove metadata column from products table (migrate to EAV)
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "metadata"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Add back metadata column
        await queryRunner.query(`ALTER TABLE "products" ADD "metadata" json`);

        // Drop foreign key constraints
        await queryRunner.query(`ALTER TABLE "product_attribute_values" DROP CONSTRAINT "FK_pav_attribute_id"`);
        await queryRunner.query(`ALTER TABLE "product_attribute_values" DROP CONSTRAINT "FK_pav_product_id"`);

        // Drop indexes
        await queryRunner.query(`DROP INDEX "public"."IDX_pav_value"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_pav_attribute_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_pav_product_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_product_attribute_unique"`);

        // Drop table
        await queryRunner.query(`DROP TABLE "product_attribute_values"`);
    }
}