import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Operacao } from './operacao.entity';
import { TipoAtivo } from 'src/enums/tipo-ativo.enum';
import { ColumnNumericTransformer } from 'src/transformers/ColumnNumericTransformer';

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

  @Column('timestamptz', {
    name: 'data_hora_cotacao',
  })
  dataHoraCotacao?: Date;

  @OneToMany(() => Operacao, (operacao) => operacao.ativo)
  operacoes: Operacao[];
}
