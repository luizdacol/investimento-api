import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnClasseAtivo1754255940546 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE ativos ADD classe varchar(50);
             ALTER TABLE ativos_renda_fixa ADD classe varchar(50); 
             ALTER TABLE ativos_cripto ADD classe varchar(50); 
            `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
