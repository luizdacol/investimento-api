import { PartialType } from '@nestjs/mapped-types';
import { CreateAtivoDto } from './create-ativo.dto';

export class UpdateAtivoDto extends PartialType(CreateAtivoDto) {}
