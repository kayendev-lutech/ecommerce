import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCategoryAttributeOptions1755663563455 implements MigrationInterface {
  name = 'CreateCategoryAttributeOptions1755663563455';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create category_attribute_options table
    await queryRunner.query(`
            CREATE TABLE "category_attribute_options" (
                "id" SERIAL NOT NULL,
                "category_attribute_id" integer NOT NULL,
                "option_value" character varying(100) NOT NULL,
                "display_name" character varying(100) NOT NULL,
                "sort_order" integer NOT NULL DEFAULT '0',
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_category_attribute_options" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_attribute_option_value" UNIQUE ("category_attribute_id", "option_value")
            )
        `);

    // Add foreign key constraint
    await queryRunner.query(`
            ALTER TABLE "category_attribute_options" 
            ADD CONSTRAINT "FK_attribute_options_attribute_id" 
            FOREIGN KEY ("category_attribute_id") REFERENCES "category_attributes"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);

    // Create indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_attribute_options_attribute_id" ON "category_attribute_options" ("category_attribute_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_attribute_options_sort_order" ON "category_attribute_options" ("sort_order")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_attribute_options_sort_order"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_attribute_options_attribute_id"`);
    await queryRunner.query(
      `ALTER TABLE "category_attribute_options" DROP CONSTRAINT "FK_attribute_options_attribute_id"`,
    );
    await queryRunner.query(`DROP TABLE "category_attribute_options"`);
  }
}
