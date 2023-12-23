import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Ativo } from './entities/ativo.entity';
import { UpdateAtivoDto } from './dto/update-ativo.dto';
import { CreateAtivoDto } from './dto/create-ativo.dto';

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

  async findOne(id: number): Promise<Ativo> {
    return await this._ativosRepository.findOne({
      where: { id: id },
    });
  }

  async getOrCreate(ativoToSearch: CreateAtivoDto): Promise<Ativo> {
    let ativo = await this._ativosRepository.findOneBy({
      ticker: ativoToSearch.ticker,
    });

    if (!ativo) {
      ativo = await this._ativosRepository.save(ativoToSearch);
    }
    return ativo;
  }

  async create(createAtivoDto: CreateAtivoDto): Promise<Ativo> {
    const ativo = await this._ativosRepository.findOneBy({
      ticker: createAtivoDto.ticker,
    });
    if (ativo) throw Error('Ativo já cadastrado');

    const ativoSaved = await this._ativosRepository.save(createAtivoDto);
    return ativoSaved;
  }

  async update(id: number, updateAtivoDto: UpdateAtivoDto) {
    const ativo = await this._ativosRepository.findOne({
      where: { id: id },
    });
    if (!ativo) throw Error('Ativo não encontrado');

    if (updateAtivoDto.ticker) ativo.ticker = updateAtivoDto.ticker;
    if (updateAtivoDto.tipo) ativo.tipo = updateAtivoDto.tipo;
    if (updateAtivoDto.segmento) ativo.segmento = updateAtivoDto.segmento;
    if (updateAtivoDto.cotacao) ativo.cotacao = updateAtivoDto.cotacao;
    if (updateAtivoDto.dataHoraCotacao)
      ativo.dataHoraCotacao = updateAtivoDto.dataHoraCotacao;

    const result = await this._ativosRepository.update({ id: id }, ativo);
    return result.affected > 0;
  }

  async remove(id: number): Promise<boolean> {
    const result = await this._ativosRepository.delete({ id: id });
    return result.affected > 0;
  }
}
