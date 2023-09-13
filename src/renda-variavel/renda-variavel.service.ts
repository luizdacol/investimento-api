import { Injectable } from '@nestjs/common';
import { Ativo } from './models/ativo';
import { CreateAtivoDto } from './models/create-ativo.dto';

@Injectable()
export class RendaVariavelService {
  private _ativos: Ativo[] = [];

  getAtivos(): Ativo[] {
    return this._ativos;
  }

  saveAtivo(createAtivoDto: CreateAtivoDto): Ativo {
    const id = this._ativos.length + 1;
    const createdAtivo = { id, ...createAtivoDto };

    this._ativos.push(createdAtivo);
    return createdAtivo;
  }
}
