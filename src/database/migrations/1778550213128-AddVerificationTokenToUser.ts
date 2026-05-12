import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVerificationTokenToUser1778550213128 implements MigrationInterface {
    name = 'AddVerificationTokenToUser1778550213128'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "verificationToken" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "verificationTokenExpiry" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "verificationTokenExpiry"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "verificationToken"`);
    }

}
