import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsNumber,
  IsDate,
  IsOptional,
} from 'class-validator';
import { TipoAtivo } from '../../enums/tipo-ativo.enum';

export class CreateAtivoDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsEnum(TipoAtivo)
  tipo?: TipoAtivo;

  @IsString()
  @IsOptional()
  codigo?: string;

  @IsNumber()
  @IsOptional()
  cotacao?: number;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dataHoraCotacao?: Date;

  @IsDate()
  @Type(() => Date)
  dataVencimento: Date;
}
