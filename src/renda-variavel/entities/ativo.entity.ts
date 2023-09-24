import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Operacao } from './operacao.entity';
import { TipoAtivo } from 'src/enums/tipo-ativo.enum';

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

  @OneToMany(() => Operacao, (operacao) => operacao.ativo)
  operacoes: Operacao[];
}
