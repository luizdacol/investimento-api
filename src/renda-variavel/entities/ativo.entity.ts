import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Operacao } from './operacao.entity';
import { TipoAtivo } from 'src/enums/tipo-ativo.enum';
import { ColumnNumericTransformer } from 'src/transformers/ColumnNumericTransformer';
import { DateTransformer } from 'src/transformers/DateTransformer';

@Entity('ativos')
export class Ativo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ticker: string;

  @Column()
  tipo: TipoAtivo;

  @Column()
  segmento?: string;

  @Column('numeric', {
    transformer: new ColumnNumericTransformer(),
  })
  cotacao?: number;

  @Column('date', {
    name: 'data_hora_cotacao',
    transformer: new DateTransformer(),
  })
  dataHoraCotacao?: Date;

  @OneToMany(() => Operacao, (operacao) => operacao.ativo)
  operacoes: Operacao[];
}
