import { PartialType } from '@nestjs/mapped-types';
import { CreateOperacaoDto } from './create-operacao.dto';

export class UpdateOperacaoDto extends PartialType(CreateOperacaoDto) {}
