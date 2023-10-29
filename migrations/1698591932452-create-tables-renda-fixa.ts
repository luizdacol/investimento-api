import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTablesRendaFixa1698591932452 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE ativos_renda_fixa (
                  id serial PRIMARY KEY,
                  titulo VARCHAR(30) UNIQUE NOT NULL,
                  tipo VARCHAR(20) NOT NULL,
                  codigo VARCHAR(5) NULL
              );`,
    );

    await queryRunner.query(
      `CREATE TABLE operacoes_renda_fixa (
                    id serial PRIMARY KEY,
                    ativo_id INT NOT NULL,
                    data DATE NOT NULL,
                    preco_unitario NUMERIC(15,8)  NOT NULL,
                    quantidade INT NOT NULL,
                    preco_total NUMERIC(15,8) NOT NULL,
                    rentabilidade VARCHAR(50) NULL,
                    data_vencimento DATE NOT NULL,
                    tipo VARCHAR(30) NOT NULL,
                    FOREIGN KEY (ativo_id) REFERENCES ativos_renda_fixa (id)
                );`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE operacoes_renda_fixa`);
    await queryRunner.query(`DROP TABLE ativos_renda_fixa`);
  }
}
