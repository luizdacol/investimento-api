import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TipoAtivo } from 'src/enums/tipo-ativo.enum';

@Entity('ativos_renda_fixa')
export class Ativo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titulo: string;

  @Column()
  tipo: TipoAtivo;

  @Column()
  codigo: string;
}
