import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Ativo } from './entities/ativo.entity';
import { UpdateAtivoDto } from './dto/update-ativo.dto';

@Injectable()
export class AtivosService {
  constructor(
    @InjectRepository(Ativo)
    private _ativosRepository: Repository<Ativo>,
  ) {}

  async findAll(filters: FindOptionsWhere<Ativo> = {}): Promise<Ativo[]> {
    const ativos = await this._ativosRepository.find({
      where: filters,
    });
    return ativos;
  }

  async getOrCreate(ativoToSearch: Partial<Ativo>): Promise<Ativo> {
    let ativo = await this._ativosRepository.findOneBy({
      titulo: ativoToSearch.titulo,
    });

    if (!ativo) {
      ativo = await this._ativosRepository.save(ativoToSearch);
    }
    return ativo;
  }

  async update(id: number, updateAtivoDto: UpdateAtivoDto) {
    const ativo = await this._ativosRepository.findOne({
      where: { id: id },
    });
    if (!ativo) throw Error('Ativo não encontrado');

    if (updateAtivoDto.titulo) ativo.titulo = updateAtivoDto.titulo;
    if (updateAtivoDto.tipo) ativo.tipo = updateAtivoDto.tipo;
    if (updateAtivoDto.codigo) ativo.codigo = updateAtivoDto.codigo;
    if (updateAtivoDto.cotacao) ativo.cotacao = updateAtivoDto.cotacao;
    if (updateAtivoDto.dataHoraCotacao)
      ativo.dataHoraCotacao = updateAtivoDto.dataHoraCotacao;

    const result = await this._ativosRepository.update({ id: id }, ativo);
    return result.affected > 0;
  }
}
