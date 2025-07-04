import { Transform, Type } from 'class-transformer';
import {
  IsNumber,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsDate,
} from 'class-validator';
import { TipoOperacao } from '../../enums/tipo-operacao.enum';

export class CreateOperacaoDto {
  @IsDate()
  @Type(() => Date)
  data: Date;

  @IsNotEmpty()
  @IsString()
  @Transform((param) => param.value.toUpperCase())
  codigo: string;

  @IsNumber()
  precoUnitario: number;

  @IsNumber()
  taxa: number;

  @IsNumber()
  valorTotalBruto: number;

  @IsEnum(TipoOperacao)
  tipoOperacao: TipoOperacao;
}
