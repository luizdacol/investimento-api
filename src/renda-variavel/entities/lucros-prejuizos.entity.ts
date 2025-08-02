import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TipoAtivo } from '../../enums/tipo-ativo.enum';
import { ColumnNumericTransformer } from '../../transformers/ColumnNumericTransformer';

@Entity('lucros_prejuizos')
export class LucrosPrejuizos {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('timestamptz', {
    name: 'data',
  })
  data?: Date;

  @Column('numeric', {
    transformer: new ColumnNumericTransformer(),
  })
  lucro?: number;

  @Column('numeric', {
    transformer: new ColumnNumericTransformer(),
  })
  prejuizo?: number;

  @Column('numeric', {
    transformer: new ColumnNumericTransformer(),
    name: 'prejuizo_compensado',
  })
  prejuizoCompensado?: number;

  @Column()
  tipo: TipoAtivo;
}
