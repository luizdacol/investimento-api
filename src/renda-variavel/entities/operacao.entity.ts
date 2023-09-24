import {
  ManyToOne,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { Ativo } from './ativo.entity';
import { TipoOperacao } from 'src/enums/tipo-operacao.enum';

@Entity('operacoes')
export class Operacao {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('timestamptz')
  data: Date;

  @ManyToOne(() => Ativo, (ativo) => ativo.id)
  @JoinColumn({ name: 'ativo_id' })
  ativo: Ativo;

  @Column('numeric', { name: 'preco_unitario' })
  precoUnitario: number;

  @Column()
  quantidade: number;

  @Column('numeric', { name: 'preco_total' })
  precoTotal: number;

  @Column()
  tipo: TipoOperacao;
}
