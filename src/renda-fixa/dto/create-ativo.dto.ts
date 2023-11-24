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
  titulo: string;

  @IsEnum(TipoAtivo)
  tipo?: TipoAtivo;

  @IsString()
  codigo?: string;

  @IsNumber()
  cotacao?: number;

  @IsDate()
  @Type(() => Date)
  dataHoraCotacao?: Date;
}
