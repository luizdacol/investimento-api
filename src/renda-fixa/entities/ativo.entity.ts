import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TipoAtivo } from '../../enums/tipo-ativo.enum';
import { ColumnNumericTransformer } from '../../transformers/ColumnNumericTransformer';

@Entity('ativos_renda_fixa')
export class Ativo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titulo: string;

  @Column()
  tipo: TipoAtivo;

  @Column()
  codigo: string;

  @Column('numeric', {
    transformer: new ColumnNumericTransformer(),
  })
  cotacao?: number;

  @Column('timestamptz', {
    name: 'data_hora_cotacao',
  })
  dataHoraCotacao?: Date;
}
