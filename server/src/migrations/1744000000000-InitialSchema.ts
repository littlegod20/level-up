import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1744000000000 implements MigrationInterface {
  name = "InitialSchema1744000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS citext`);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "email" citext NOT NULL,
        "password_hash" character varying(255) NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "habits" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "icon" character varying(64) NOT NULL,
        "color" character varying(32) NOT NULL,
        "frequency" character varying(16) NOT NULL,
        "custom_weekdays" jsonb,
        "reminder_time" character varying(8),
        "xp_reward" integer NOT NULL,
        "archived" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_habits" PRIMARY KEY ("id"),
        CONSTRAINT "FK_habits_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_habits_user_id" ON "habits" ("user_id")`);

    await queryRunner.query(`
      CREATE TABLE "completions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "habit_id" uuid NOT NULL,
        "completion_date" date NOT NULL,
        "completed_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "skipped" boolean NOT NULL DEFAULT false,
        "note" text,
        "xp_awarded" integer NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_completions" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_completions_habit_id_completion_date" UNIQUE ("habit_id", "completion_date"),
        CONSTRAINT "FK_completions_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_completions_habit" FOREIGN KEY ("habit_id") REFERENCES "habits"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_completions_user_id" ON "completions" ("user_id")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_completions_habit_id" ON "completions" ("habit_id")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "completions"`);
    await queryRunner.query(`DROP TABLE "habits"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
