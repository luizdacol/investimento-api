import { OmitType } from '@nestjs/mapped-types';
import { Ativo } from '../entities/ativo.entity';

export class CreateAtivoDto extends OmitType(Ativo, ['id']) {}
