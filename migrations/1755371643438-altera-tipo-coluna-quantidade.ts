import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlteraTipoColunaQuantidade1755371643438
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE operacoes
        ALTER COLUMN quantidade TYPE NUMERIC(15,8)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
