import { OmitType } from '@nestjs/mapped-types';
import { Operacao } from '../entities/operacao.entity';

export class CreateOperacaoDto extends OmitType(Operacao, ['id']) {}
