import { Injectable } from '@nestjs/common';
import { CreateAtivoDto } from './dto/create-ativo.dto';
import { UpdateAtivoDto } from './dto/update-ativo.dto';
import { Ativo } from './entities/ativo.entity';

@Injectable()
export class RendaVariavelService {
  private _ativos: Ativo[] = [];

  create(createAtivoDto: CreateAtivoDto) {
    const id = this._ativos.length + 1;
    const createdAtivo = { id, ...createAtivoDto };

    this._ativos.push(createdAtivo);
    return createdAtivo;
  }

  findAll() {
    return this._ativos;
  }

  findOne(id: number) {
    return `This action returns a #${id} rendaVariavel`;
  }

  update(id: number, updateAtivoDto: UpdateAtivoDto) {
    return `This action updates a #${id} rendaVariavel: ${updateAtivoDto}`;
  }

  remove(id: number) {
    return `This action removes a #${id} rendaVariavel`;
  }
}
