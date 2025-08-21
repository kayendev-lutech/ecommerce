import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductTable1753342236992 implements MigrationInterface {
  name = 'CreateProductTable1753342236992';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "products" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                "slug" character varying NOT NULL,
                "description" text,
                "price" numeric(12,2) NOT NULL,
                "discount_price" numeric(12,2),
                "currency_code" character varying NOT NULL DEFAULT 'VND',
                "category_id" integer,
                "image_url" character varying,
                "is_active" boolean NOT NULL DEFAULT true,
                "is_visible" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "UQ_464f927ae360106b783ed0b4106" UNIQUE ("slug"),
                CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"),
                CONSTRAINT "FK_products_category_id" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "products"`);
  }
}
