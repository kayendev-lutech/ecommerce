// src/database/migrations/1755591574564-CreateProductAttribute.ts
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProductAttribute1755591574564 implements MigrationInterface {
    name = 'CreateProductAttribute1755591574564'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enum for data types
        await queryRunner.query(`
            CREATE TYPE "public"."product_attributes_data_type_enum" AS ENUM('text', 'number', 'boolean', 'date', 'select')
        `);

        // Create product_attributes table
        await queryRunner.query(`
            CREATE TABLE "product_attributes" (
                "id" SERIAL NOT NULL,
                "name" character varying(100) NOT NULL,
                "display_name" character varying(100) NOT NULL,
                "data_type" "public"."product_attributes_data_type_enum" NOT NULL,
                "options" json,
                "is_required" boolean NOT NULL DEFAULT true,
                "is_filterable" boolean NOT NULL DEFAULT true,
                "sort_order" integer NOT NULL DEFAULT '0',
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_product_attributes_name" UNIQUE ("name"),
                CONSTRAINT "PK_product_attributes" PRIMARY KEY ("id")
            )
        `);

        // Create indexes
        await queryRunner.query(`CREATE INDEX "IDX_product_attributes_sort_order" ON "product_attributes" ("sort_order")`);
        await queryRunner.query(`CREATE INDEX "IDX_product_attributes_filterable" ON "product_attributes" ("is_filterable")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_product_attributes_filterable"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_product_attributes_sort_order"`);
        await queryRunner.query(`DROP TABLE "product_attributes"`);
        await queryRunner.query(`DROP TYPE "public"."product_attributes_data_type_enum"`);
    }
}