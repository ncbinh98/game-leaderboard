import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLeaderboardAndEntry1772248083105 implements MigrationInterface {
    name = 'AddLeaderboardAndEntry1772248083105'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."leaderboards_status_enum" AS ENUM('active', 'inactive', 'deleted')`);
        await queryRunner.query(`CREATE TABLE "leaderboards" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "status" "public"."leaderboards_status_enum" NOT NULL DEFAULT 'active', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_190f95e31621935228328d6c20a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "leaderboard_entries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "leaderboardId" uuid NOT NULL, "bestScore" integer NOT NULL DEFAULT '0', "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_51854f22e8f6671a373c0229366" UNIQUE ("userId", "leaderboardId"), CONSTRAINT "PK_a3187f7d37819756a5519336665" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "leaderboard_entries" ADD CONSTRAINT "FK_e0e0d8d4021f8b3dc45d98d67c0" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "leaderboard_entries" ADD CONSTRAINT "FK_7903b15109be5940fe833425676" FOREIGN KEY ("leaderboardId") REFERENCES "leaderboards"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "leaderboard_entries" DROP CONSTRAINT "FK_7903b15109be5940fe833425676"`);
        await queryRunner.query(`ALTER TABLE "leaderboard_entries" DROP CONSTRAINT "FK_e0e0d8d4021f8b3dc45d98d67c0"`);
        await queryRunner.query(`DROP TABLE "leaderboard_entries"`);
        await queryRunner.query(`DROP TABLE "leaderboards"`);
        await queryRunner.query(`DROP TYPE "public"."leaderboards_status_enum"`);
    }

}
