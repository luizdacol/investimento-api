import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlteraColunaVencimentoRf1753034813808
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE ativos_renda_fixa ADD data_vencimento DATE NULL;
            ALTER TABLE operacoes_renda_fixa DROP COLUMN data_vencimento;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
