import { Type } from 'class-transformer';
import {
  IsNumber,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDate,
} from 'class-validator';
import { TipoOperacao } from 'src/enums/tipo-operacao.enum';

export class CreateOperacaoDto {
  @IsDate()
  @Type(() => Date)
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

  @IsDate()
  @Type(() => Date)
  dataVencimento: Date;

  @IsString()
  @IsOptional()
  codigo?: string;

  @IsEnum(TipoOperacao)
  tipoOperacao: TipoOperacao;
}
