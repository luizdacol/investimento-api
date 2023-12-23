import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsNumber,
  IsDate,
  IsOptional,
} from 'class-validator';
import { TipoAtivo } from 'src/enums/tipo-ativo.enum';

export class CreateAtivoDto {
  @IsString()
  @IsNotEmpty()
  ticker: string;

  @IsEnum(TipoAtivo)
  tipo?: TipoAtivo;

  @IsString()
  segmento?: string;

  @IsNumber()
  @IsOptional()
  cotacao?: number;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dataHoraCotacao?: Date;
}
