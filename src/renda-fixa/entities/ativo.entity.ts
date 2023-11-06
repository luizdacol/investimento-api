import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TipoAtivo } from 'src/enums/tipo-ativo.enum';
import { ColumnNumericTransformer } from 'src/transformers/ColumnNumericTransformer';
import { DateTransformer } from 'src/transformers/DateTransformer';

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

  @Column('date', {
    name: 'data_hora_cotacao',
    transformer: new DateTransformer(),
  })
  dataHoraCotacao?: Date;
}
