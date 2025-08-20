import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateOrderItem1755511919035 implements MigrationInterface {
    name = 'CreateOrderItem1755511919035'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "order_items" (
                "id" SERIAL NOT NULL,
                "order_id" integer NOT NULL,
                "product_id" integer NOT NULL,
                "variant_id" integer,
                "product_name" character varying(255) NOT NULL,
                "variant_name" character varying(255),
                "sku" character varying(100),
                "quantity" integer NOT NULL,
                "unit_price" numeric(10,2) NOT NULL,
                "total_price" numeric(10,2) NOT NULL,
                "currency_code" character varying(3) NOT NULL DEFAULT 'VND',
                "attributes" json,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_order_items_id" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`CREATE INDEX "IDX_order_items_order_id" ON "order_items" ("order_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_order_items_product_id" ON "order_items" ("product_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_order_items_variant_id" ON "order_items" ("variant_id")`);

        // Foreign keys
        await queryRunner.query(`
            ALTER TABLE "order_items"
            ADD CONSTRAINT "FK_order_items_order_id" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "order_items"
            ADD CONSTRAINT "FK_order_items_product_id" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "order_items"
            ADD CONSTRAINT "FK_order_items_variant_id" FOREIGN KEY ("variant_id") REFERENCES "variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT IF EXISTS "FK_order_items_variant_id"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT IF EXISTS "FK_order_items_product_id"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT IF EXISTS "FK_order_items_order_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_order_items_variant_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_order_items_product_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_order_items_order_id"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "order_items"`);
    }
}