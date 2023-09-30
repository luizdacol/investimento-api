import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProventoTable1696115539802 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE proventos (
                id serial PRIMARY KEY,
                ativo_id INT NOT NULL,
                data_com DATE NOT NULL,
                data_pagamento DATE NOT NULL,
                valor_bruto NUMERIC(15,8)  NOT NULL,
                valor_liquido NUMERIC(15,8)  NOT NULL,
                posicao INT NOT NULL,
                valor_total NUMERIC(15,8)  NOT NULL,
                tipo VARCHAR(30) NOT NULL,
                FOREIGN KEY (ativo_id) REFERENCES ativos (id)
            );`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE proventos`);
  }
}
