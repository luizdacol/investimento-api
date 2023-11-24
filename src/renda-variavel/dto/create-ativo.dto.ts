import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsNumber,
  IsDate,
} from 'class-validator';
import { TipoAtivo } from 'src/enums/tipo-ativo.enum';

export class CreateAtivoDto {
  @IsString()
  @IsNotEmpty()
  ticker: string;

  @IsEnum(TipoAtivo)
  tipo: TipoAtivo;

  @IsString()
  segmento?: string;

  @IsNumber()
  cotacao?: number;

  @IsDate()
  @Type(() => Date)
  dataHoraCotacao?: Date;
}
