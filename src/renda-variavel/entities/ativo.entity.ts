import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Operacao } from './operacao.entity';
import { TipoAtivo } from '../../enums/tipo-ativo.enum';
import { ColumnNumericTransformer } from '../../transformers/ColumnNumericTransformer';
import { ClasseAtivo } from '../../enums/classe-ativo.enum';

@Entity('ativos')
export class Ativo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ticker: string;

  @Column()
  tipo: TipoAtivo;

  @Column()
  classe: ClasseAtivo;

  @Column()
  segmento?: string;

  @Column('numeric', {
    transformer: new ColumnNumericTransformer(),
  })
  cotacao?: number;

  @Column('timestamptz', {
    name: 'data_hora_cotacao',
  })
  dataHoraCotacao?: Date;

  @OneToMany(() => Operacao, (operacao) => operacao.ativo)
  operacoes: Operacao[];
}
