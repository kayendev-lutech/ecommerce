import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCategoryAttribute1755663509639 implements MigrationInterface {
    name = 'CreateCategoryAttribute1755663509639'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enum for attribute types
        await queryRunner.query(`
            CREATE TYPE "public"."category_attributes_type_enum" AS ENUM('text', 'number', 'boolean', 'enum')
        `);

        // Create category_attributes table
        await queryRunner.query(`
            CREATE TABLE "category_attributes" (
                "id" SERIAL NOT NULL,
                "category_id" integer NOT NULL,
                "name" character varying(100) NOT NULL,
                "type" "public"."category_attributes_type_enum" NOT NULL,
                "is_required" boolean NOT NULL DEFAULT false,
                "is_variant_level" boolean NOT NULL DEFAULT false,
                "sort_order" integer NOT NULL DEFAULT '0',
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_category_attributes" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_category_attributes_name_category" UNIQUE ("category_id", "name")
            )
        `);

        // Add foreign key constraint
        await queryRunner.query(`
            ALTER TABLE "category_attributes" 
            ADD CONSTRAINT "FK_category_attributes_category_id" 
            FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);

        // Create indexes
        await queryRunner.query(`CREATE INDEX "IDX_category_attributes_category_id" ON "category_attributes" ("category_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_category_attributes_sort_order" ON "category_attributes" ("sort_order")`);
        await queryRunner.query(`CREATE INDEX "IDX_category_attributes_variant_level" ON "category_attributes" ("is_variant_level")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_category_attributes_variant_level"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_category_attributes_sort_order"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_category_attributes_category_id"`);
        await queryRunner.query(`ALTER TABLE "category_attributes" DROP CONSTRAINT "FK_category_attributes_category_id"`);
        await queryRunner.query(`DROP TABLE "category_attributes"`);
        await queryRunner.query(`DROP TYPE "public"."category_attributes_type_enum"`);
    }
}