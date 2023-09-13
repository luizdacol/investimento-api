import { Ativo } from './ativo';

export type CreateAtivoDto = Omit<Ativo, 'id'>;
