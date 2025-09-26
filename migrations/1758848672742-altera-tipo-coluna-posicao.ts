import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlteraTipoColunaPosicao1758848672742
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE proventos
        ALTER COLUMN posicao TYPE NUMERIC(15,8)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
