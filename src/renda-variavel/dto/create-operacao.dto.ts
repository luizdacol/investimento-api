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
  ticker: string;

  @IsEnum(TipoAtivo)
  tipoAtivo: TipoAtivo;

  @IsString()
  segmento?: string;

  @IsNumber()
  precoUnitario: number;

  @IsInt()
  quantidade: number;

  @IsNumber()
  precoTotal: number;

  @IsEnum(TipoOperacao)
  tipoOperacao: TipoOperacao;
}
