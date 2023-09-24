import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialTables1695247420287 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE ativos (
            id serial PRIMARY KEY,
            ticker VARCHAR(6) UNIQUE NOT NULL,
            tipo VARCHAR(20) NOT NULL,
            segmento VARCHAR(100) NULL
        );`,
    );

    await queryRunner.query(
      `CREATE TABLE operacoes (
              id serial PRIMARY KEY,
              ativo_id INT NOT NULL,
              data timestamptz NOT NULL,
              preco_unitario NUMERIC(15,8)  NOT NULL,
              quantidade INT NOT NULL,
              preco_total NUMERIC(15,8) NOT NULL,
              tipo VARCHAR(30) NOT NULL,
              FOREIGN KEY (ativo_id) REFERENCES ativos (id)
          );`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE operacoes`);
    await queryRunner.query(`DROP TABLE ativos`);
  }
}
