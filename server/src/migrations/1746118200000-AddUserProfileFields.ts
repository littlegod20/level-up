import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserProfileFields1746118200000 implements MigrationInterface {
  name = "AddUserProfileFields1746118200000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "first_name" character varying(255)`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "last_name" character varying(255)`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "date_of_birth" date`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "date_of_birth"`
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "last_name"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "first_name"`);
  }
}
