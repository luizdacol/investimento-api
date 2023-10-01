import {
  IsDateString,
  IsNotEmpty,
  IsString,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { TipoProvento } from 'src/enums/tipo-provento';

export class CreateProventoDto {
  @IsDateString()
  dataCom: Date;

  @IsDateString()
  dataPagamento: Date;

  @IsNotEmpty()
  @IsString()
  ticker: string;

  @IsEnum(TipoProvento)
  tipo: TipoProvento;

  @IsNumber()
  valorBruto: number;
}
