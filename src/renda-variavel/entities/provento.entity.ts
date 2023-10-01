import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Ativo } from './ativo.entity';
import { TipoProvento } from 'src/enums/tipo-provento';

@Entity('proventos')
export class Provento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('date', { name: 'data_com' })
  dataCom: Date;

  @Column('date', { name: 'data_pagamento' })
  dataPagamento: Date;

  @ManyToOne(() => Ativo, (ativo) => ativo.id)
  @JoinColumn({ name: 'ativo_id' })
  ativo: Ativo;

  @Column('numeric', { name: 'valor_bruto' })
  valorBruto: number;

  @Column('numeric', { name: 'valor_liquido' })
  valorLiquido: number;

  @Column()
  posicao: number;

  @Column('numeric', { name: 'valor_total' })
  valorTotal: number;

  @Column()
  tipo: TipoProvento;
}
