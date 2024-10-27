import {
  ManyToOne,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { Ativo } from './ativo.entity';
import { TipoOperacao } from '../../enums/tipo-operacao.enum';
import { ColumnNumericTransformer } from '../../transformers/ColumnNumericTransformer';
import { DateTransformer } from '../../transformers/DateTransformer';

@Entity('operacoes')
export class Operacao {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('date', {
    transformer: new DateTransformer(),
  })
  data: Date;

  @ManyToOne(() => Ativo, (ativo) => ativo.id)
  @JoinColumn({ name: 'ativo_id' })
  ativo: Ativo;

  @Column('numeric', {
    name: 'preco_unitario',
    transformer: new ColumnNumericTransformer(),
  })
  precoUnitario: number;

  @Column({ transformer: new ColumnNumericTransformer() })
  quantidade: number;

  @Column('numeric', {
    name: 'preco_total',
    transformer: new ColumnNumericTransformer(),
  })
  precoTotal: number;

  @Column()
  tipo: TipoOperacao;
}
