import { MigrationInterface, QueryRunner } from "typeorm";

export class AddScoreEntity1772198190534 implements MigrationInterface {
    name = 'AddScoreEntity1772198190534'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "scores" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "scoreValue" integer NOT NULL, "metaData" jsonb, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_c36917e6f26293b91d04b8fd521" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "scores" ADD CONSTRAINT "FK_c0508b319d67f890b4118099680" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "scores" DROP CONSTRAINT "FK_c0508b319d67f890b4118099680"`);
        await queryRunner.query(`DROP TABLE "scores"`);
    }

}
