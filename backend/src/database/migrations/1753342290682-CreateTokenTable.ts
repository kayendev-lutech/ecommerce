import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTokenTable1753342290682 implements MigrationInterface {
  name = 'CreateTokenTable1753342290682';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "tokens" (
        "id" SERIAL NOT NULL,
        "user_id" integer NOT NULL,
        "token" character varying NOT NULL,
        "type" character varying NOT NULL,
        "expires_at" TIMESTAMP NOT NULL,
        "is_revoked" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "created_ip" character varying,
        "user_agent" character varying,
        CONSTRAINT "PK_3001e89ada36263dabf1fb6210a" PRIMARY KEY ("id"),
        CONSTRAINT "FK_tokens_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "tokens"`);
  }
}
