import { Transform, Type } from 'class-transformer';
import {
  IsNumber,
  IsInt,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsDate,
} from 'class-validator';
import { TipoOperacao } from 'src/enums/tipo-operacao.enum';

export class CreateOperacaoDto {
  @IsDate()
  @Type(() => Date)
  data: Date;

  @IsNotEmpty()
  @IsString()
  @Transform((param) => param.value.toUpperCase())
  ticker: string;

  @IsNumber()
  precoUnitario: number;

  @IsInt()
  quantidade: number;

  @IsEnum(TipoOperacao)
  tipoOperacao: TipoOperacao;
}
