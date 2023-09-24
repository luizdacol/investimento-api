import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Operacao } from './operacao.entity';

@Entity('ativos')
export class Ativo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ticker: string;

  @Column()
  tipo: string;

  @Column()
  segmento?: string;

  @OneToMany(() => Operacao, (operacao) => operacao.ativo)
  operacoes: Operacao[];
}
