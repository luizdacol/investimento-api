import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Ativo } from './ativo.entity';
import { TipoProvento } from '../../enums/tipo-provento';
import { ColumnNumericTransformer } from '../../transformers/ColumnNumericTransformer';
import { DateTransformer } from '../../transformers/DateTransformer';

@Entity('proventos')
export class Provento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('date', { name: 'data_com', transformer: new DateTransformer() })
  dataCom: Date;

  @Column('date', {
    name: 'data_pagamento',
    transformer: new DateTransformer(),
  })
  dataPagamento: Date;

  @ManyToOne(() => Ativo, (ativo) => ativo.id)
  @JoinColumn({ name: 'ativo_id' })
  ativo: Ativo;

  @Column('numeric', {
    name: 'valor_bruto',
    transformer: new ColumnNumericTransformer(),
  })
  valorBruto: number;

  @Column('numeric', {
    name: 'valor_liquido',
    transformer: new ColumnNumericTransformer(),
  })
  valorLiquido: number;

  @Column()
  posicao: number;

  @Column('numeric', {
    name: 'valor_total',
    transformer: new ColumnNumericTransformer(),
  })
  valorTotal: number;

  @Column()
  tipo: TipoProvento;
}
