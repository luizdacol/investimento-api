import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsNumber,
  IsDate,
} from 'class-validator';
import { TipoProvento } from 'src/enums/tipo-provento';

export class CreateProventoDto {
  @IsDate()
  @Type(() => Date)
  dataCom: Date;

  @IsDate()
  @Type(() => Date)
  dataPagamento: Date;

  @IsNotEmpty()
  @IsString()
  ticker: string;

  @IsEnum(TipoProvento)
  tipo: TipoProvento;

  @IsNumber()
  valorBruto: number;
}
