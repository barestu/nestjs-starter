import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserProfileFields1778700000000 implements MigrationInterface {
    name = 'AddUserProfileFields1778700000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "name" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "avatar" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "deletedAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "avatar"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "name"`);
    }
}
