import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableLucrosPrejuizos1753480360835
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE lucros_prejuizos (
                  id serial PRIMARY KEY,
                  data timestamptz NOT NULL,
                  lucro NUMERIC(15,2) NOT NULL,
                  prejuizo NUMERIC(15,2) NOT NULL,
                  prejuizo_compensado NUMERIC(15,2) NOT NULL,
                  tipo VARCHAR(30) NOT NULL
              )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
