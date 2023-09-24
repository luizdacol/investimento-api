import { Injectable } from '@nestjs/common';
import { CreateOperacaoDto } from './dto/create-operacao.dto';
import { UpdateOperacaoDto } from './dto/update-operacao.dto';
import { Ativo } from './entities/ativo.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Operacao } from './entities/operacao.entity';

@Injectable()
export class RendaVariavelService {
  constructor(
    @InjectRepository(Operacao)
    private operacoesRepository: Repository<Operacao>,

    @InjectRepository(Ativo)
    private ativosRepository: Repository<Ativo>,
  ) {}

  async create(createOperacaoDto: CreateOperacaoDto) {
    let ativo = await this.ativosRepository.findOneBy({
      ticker: createOperacaoDto.ticker,
    });

    if (!ativo) {
      ativo = await this.ativosRepository.save({
        ticker: createOperacaoDto.ticker,
        tipo: createOperacaoDto.tipoAtivo,
        segmento: createOperacaoDto.segmento,
      });
    }

    const operacaoSaved = this.operacoesRepository.save({
      data: createOperacaoDto.data,
      precoTotal: createOperacaoDto.precoTotal,
      precoUnitario: createOperacaoDto.precoUnitario,
      quantidade: createOperacaoDto.quantidade,
      tipo: createOperacaoDto.tipoOperacao,
      ativo,
    });

    return operacaoSaved;
  }

  async findAll() {
    const operacoes = await this.operacoesRepository.find({
      relations: { ativo: true },
    });
    return operacoes;
  }

  findOne(id: number) {
    return `This action returns a #${id} rendaVariavel`;
  }

  update(id: number, updateAtivoDto: UpdateOperacaoDto) {
    return `This action updates a #${id} rendaVariavel: ${updateAtivoDto}`;
  }

  remove(id: number) {
    return `This action removes a #${id} rendaVariavel`;
  }
}
