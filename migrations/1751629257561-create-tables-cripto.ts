import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTablesCripto1751629257561 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE ativos_cripto (
                  id serial PRIMARY KEY,
                  codigo VARCHAR(10) UNIQUE NOT NULL,
                  nome VARCHAR(50) NOT NULL,
                  cotacao NUMERIC(15,2) null,
                  data_hora_cotacao timestamptz NULL
              )`);

    await queryRunner.query(
      `CREATE TABLE operacoes_cripto (
                    id serial PRIMARY KEY,
                    ativo_id INT NOT NULL,
                    data DATE NOT NULL,
                    preco_unitario NUMERIC(15,2)  NOT NULL,
                    quantidade NUMERIC(15,8) NOT NULL,
                    valor_total_bruto NUMERIC(15,2) NOT NULL,
                    taxa NUMERIC(15,8) NOT NULL,
                    valor_total_liquido NUMERIC(15,2) NOT NULL,
                    tipo VARCHAR(30) NOT NULL,
                    FOREIGN KEY (ativo_id) REFERENCES ativos_cripto (id)
                );`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
