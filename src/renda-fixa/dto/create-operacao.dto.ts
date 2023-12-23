import {
  IsDateString,
  IsNumber,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsOptional,
} from 'class-validator';
import { TipoOperacao } from 'src/enums/tipo-operacao.enum';

export class CreateOperacaoDto {
  @IsDateString()
  data: Date;

  @IsNotEmpty()
  @IsString()
  titulo: string;

  @IsNumber()
  quantidade: number;

  @IsNumber()
  precoUnitario: number;

  @IsString()
  rentabilidade?: string;

  @IsDateString()
  dataVencimento: Date;

  @IsString()
  @IsOptional()
  codigo?: string;

  @IsEnum(TipoOperacao)
  tipoOperacao: TipoOperacao;
}
