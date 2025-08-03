import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TipoAtivo } from '../../enums/tipo-ativo.enum';
import { ColumnNumericTransformer } from '../../transformers/ColumnNumericTransformer';
import { DateTransformer } from '../../transformers/DateTransformer';
import { ClasseAtivo } from '../../enums/classe-ativo.enum';

@Entity('ativos_renda_fixa')
export class Ativo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titulo: string;

  @Column()
  tipo: TipoAtivo;

  @Column()
  classe: ClasseAtivo;

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

  @Column('date', {
    name: 'data_vencimento',
    transformer: new DateTransformer(),
  })
  dataVencimento: Date;
}
