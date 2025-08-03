import { Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsDate,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ClasseAtivo } from '../../enums/classe-ativo.enum';

export class CreateAtivoDto {
  @IsString()
  @IsNotEmpty()
  @Transform((param) => param.value.toUpperCase())
  codigo: string;

  @IsEnum(ClasseAtivo)
  classe?: ClasseAtivo;

  @IsString()
  nome?: string;

  @IsNumber()
  @IsOptional()
  cotacao?: number;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dataHoraCotacao?: Date;
}
