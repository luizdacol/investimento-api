import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Ativo } from './entities/ativo.entity';

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
      ticker: ativoToSearch.ticker,
    });

    if (!ativo) {
      ativo = await this._ativosRepository.save(ativoToSearch);
    }
    return ativo;
  }
}
