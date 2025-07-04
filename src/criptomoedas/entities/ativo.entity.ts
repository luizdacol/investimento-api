import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ColumnNumericTransformer } from '../../transformers/ColumnNumericTransformer';
import { Operacao } from './operacao.entity';

@Entity('ativos_cripto')
export class Ativo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  codigo: string;

  @Column()
  nome: string;

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
