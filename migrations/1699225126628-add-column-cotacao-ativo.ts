import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnCotacaoAtivo1699225126628 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE ativos ADD cotacao NUMERIC(7,2);          
        ALTER TABLE ativos ADD data_hora_cotacao timestamptz;
        
        ALTER TABLE ativos_renda_fixa ADD cotacao NUMERIC(7,2);          
        ALTER TABLE ativos_renda_fixa ADD data_hora_cotacao timestamptz;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE ativos DROP COLUMN cotacao;          
          ALTER TABLE ativos DROP COLUMN data_hora_cotacao;
          
          ALTER TABLE ativos_renda_fixa DROP COLUMN cotacao;          
          ALTER TABLE ativos_renda_fixa DROP COLUMN data_hora_cotacao;`,
    );
  }
}
