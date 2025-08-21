import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateVariantAttributeValues1755663753140 implements MigrationInterface {
    name = 'CreateVariantAttributeValues1755663753140'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create variant_attribute_values table
        await queryRunner.query(`
            CREATE TABLE "variant_attribute_values" (
                "id" SERIAL NOT NULL,
                "variant_id" integer NOT NULL,
                "category_attribute_id" integer NOT NULL,
                "category_attribute_option_id" integer NULL,
                "custom_value" text NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_variant_attribute_values" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_variant_attribute_unique" UNIQUE ("variant_id", "category_attribute_id"),
                CONSTRAINT "CHK_variant_attr_value" CHECK (
                    ("category_attribute_option_id" IS NOT NULL AND "custom_value" IS NULL) OR 
                    ("category_attribute_option_id" IS NULL AND "custom_value" IS NOT NULL)
                )
            )
        `);

        // Add foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "variant_attribute_values" 
            ADD CONSTRAINT "FK_variant_attr_values_variant_id" 
            FOREIGN KEY ("variant_id") REFERENCES "variants"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "variant_attribute_values" 
            ADD CONSTRAINT "FK_variant_attr_values_attribute_id" 
            FOREIGN KEY ("category_attribute_id") REFERENCES "category_attributes"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "variant_attribute_values" 
            ADD CONSTRAINT "FK_variant_attr_values_option_id" 
            FOREIGN KEY ("category_attribute_option_id") REFERENCES "category_attribute_options"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);

        // Create indexes
        await queryRunner.query(`CREATE INDEX "IDX_variant_attr_values_variant_id" ON "variant_attribute_values" ("variant_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_variant_attr_values_attribute_id" ON "variant_attribute_values" ("category_attribute_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_variant_attr_values_option_id" ON "variant_attribute_values" ("category_attribute_option_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_variant_attr_values_option_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_variant_attr_values_attribute_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_variant_attr_values_variant_id"`);
        await queryRunner.query(`ALTER TABLE "variant_attribute_values" DROP CONSTRAINT "FK_variant_attr_values_option_id"`);
        await queryRunner.query(`ALTER TABLE "variant_attribute_values" DROP CONSTRAINT "FK_variant_attr_values_attribute_id"`);
        await queryRunner.query(`ALTER TABLE "variant_attribute_values" DROP CONSTRAINT "FK_variant_attr_values_variant_id"`);
        await queryRunner.query(`DROP TABLE "variant_attribute_values"`);
    }
}