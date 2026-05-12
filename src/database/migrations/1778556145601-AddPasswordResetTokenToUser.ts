import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPasswordResetTokenToUser1778556145601 implements MigrationInterface {
    name = 'AddPasswordResetTokenToUser1778556145601'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "resetPasswordToken" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "resetPasswordTokenExpiry" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "resetPasswordTokenExpiry"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "resetPasswordToken"`);
    }

}
