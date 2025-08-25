import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrdersTable1755510579821 implements MigrationInterface {
  name = 'CreateOrdersTable1755510579821';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."orders_status_enum" AS ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."orders_payment_status_enum" AS ENUM('pending', 'paid', 'failed', 'refunded', 'partial_refund')
    `);
    await queryRunner.query(`
      CREATE TABLE "orders" (
        "id" SERIAL NOT NULL,
        "user_id" INTEGER, -- Thêm dòng này
        "order_number" VARCHAR(50) NOT NULL UNIQUE,
        "customer_name" VARCHAR(100) NOT NULL,
        "customer_email" VARCHAR(255) NOT NULL,
        "customer_phone" VARCHAR(20),
        "shipping_address" TEXT NOT NULL,
        "billing_address" TEXT,
        "status" "public"."orders_status_enum" NOT NULL DEFAULT 'pending',
        "payment_status" "public"."orders_payment_status_enum" NOT NULL DEFAULT 'pending',
        "payment_method" VARCHAR(50),
        "subtotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
        "tax_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
        "shipping_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
        "discount_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
        "total_amount" DECIMAL(10,2) NOT NULL,
        "currency_code" VARCHAR(3) NOT NULL DEFAULT 'VND',
        "notes" TEXT,
        "shipped_at" TIMESTAMP,
        "delivered_at" TIMESTAMP,
        "cancelled_at" TIMESTAMP,
        "cancel_reason" VARCHAR(255),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_orders_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "orders"
      ADD CONSTRAINT "FK_orders_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
    `);
    await queryRunner.query(`CREATE INDEX "IDX_orders_order_number" ON "orders" ("order_number")`);
    await queryRunner.query(`CREATE INDEX "IDX_orders_status" ON "orders" ("status")`);
    await queryRunner.query(
      `CREATE INDEX "IDX_orders_payment_status" ON "orders" ("payment_status")`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_orders_created_at" ON "orders" ("created_at")`);
    await queryRunner.query(`CREATE INDEX "IDX_orders_user_id" ON "orders" ("user_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "FK_orders_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orders_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orders_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orders_payment_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orders_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orders_order_number"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "orders"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."orders_payment_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."orders_status_enum"`);
  }
}
