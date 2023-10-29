import {
  ManyToOne,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { Ativo } from './ativo.entity';
import { TipoOperacao } from 'src/enums/tipo-operacao.enum';
import { ColumnNumericTransformer } from 'src/transformers/ColumnNumericTransformer';

@Entity('operacoes_renda_fixa')
export class Operacao {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('date')
  data: Date;

  @ManyToOne(() => Ativo, (ativo) => ativo.id)
  @JoinColumn({ name: 'ativo_id' })
  ativo: Ativo;

  @Column({ transformer: new ColumnNumericTransformer() })
  quantidade: number;

  @Column('numeric', {
    name: 'preco_unitario',
    transformer: new ColumnNumericTransformer(),
  })
  precoUnitario: number;

  @Column('numeric', {
    name: 'preco_total',
    transformer: new ColumnNumericTransformer(),
  })
  precoTotal: number;

  @Column()
  rentabilidade: string;

  @Column('date', {
    name: 'data_vencimento',
  })
  dataVencimento: Date;

  @Column()
  tipo: TipoOperacao;
}
