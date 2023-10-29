import {
  IsDateString,
  IsNumber,
  IsInt,
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { TipoAtivo } from 'src/enums/tipo-ativo.enum';
import { TipoOperacao } from 'src/enums/tipo-operacao.enum';

export class CreateOperacaoDto {
  @IsDateString()
  data: Date;

  @IsNotEmpty()
  @IsString()
  titulo: string;

  @IsInt()
  quantidade: number;

  @IsNumber()
  precoUnitario: number;

  @IsString()
  rentabilidade?: string;

  @IsDateString()
  dataVencimento: Date;

  @IsString()
  codigo?: string;

  @IsEnum(TipoAtivo)
  tipoAtivo: TipoAtivo;

  @IsEnum(TipoOperacao)
  tipoOperacao: TipoOperacao;
}
