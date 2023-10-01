import { PartialType } from '@nestjs/mapped-types';
import { CreateProventoDto } from './create-provento.dto';

export class UpdateProventoDto extends PartialType(CreateProventoDto) {}
