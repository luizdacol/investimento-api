import { Injectable } from '@nestjs/common';
import { Operacao } from './entities/operacao.entity';
import { AtivosService } from './ativos.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { CreateOperacaoDto } from './dto/create-operacao.dto';
import { UpdateOperacaoDto } from './dto/update-operacao.dto';

@Injectable()
export class OperacoesService {
  constructor(
    @InjectRepository(Operacao)
    private operacoesRepository: Repository<Operacao>,
    private _ativosService: AtivosService,
  ) {}

  async create(createOperacaoDto: CreateOperacaoDto) {
    const ativo = await this._ativosService.getOrCreate({
      titulo: createOperacaoDto.titulo,
      tipo: createOperacaoDto.tipoAtivo,
      codigo: createOperacaoDto.codigo,
    });

    const operacaoSaved = this.operacoesRepository.save({
      data: createOperacaoDto.data,
      precoTotal:
        createOperacaoDto.precoUnitario * createOperacaoDto.quantidade,
      precoUnitario: createOperacaoDto.precoUnitario,
      quantidade: createOperacaoDto.quantidade,
      tipo: createOperacaoDto.tipoOperacao,
      rentabilidade: createOperacaoDto.rentabilidade,
      dataVencimento: createOperacaoDto.dataVencimento,
      ativo,
    });

    return operacaoSaved;
  }

  async findAll(filters: FindOptionsWhere<Operacao> = {}) {
    const operacoes = await this.operacoesRepository.find({
      where: filters,
      relations: { ativo: true },
      order: { data: 'DESC' },
    });
    return operacoes;
  }

  async findOne(id: number): Promise<Operacao> {
    return await this.operacoesRepository.findOne({
      where: { id: id },
      relations: { ativo: true },
    });
  }

  async update(
    id: number,
    updateAtivoDto: UpdateOperacaoDto,
  ): Promise<boolean> {
    const operacao = await this.findOne(id);
    if (!operacao) throw Error('Operação não encontrada');

    if (updateAtivoDto.data) operacao.data = updateAtivoDto.data;
    if (updateAtivoDto.quantidade)
      operacao.quantidade = updateAtivoDto.quantidade;
    if (updateAtivoDto.precoUnitario)
      operacao.precoUnitario = updateAtivoDto.precoUnitario;
    if (updateAtivoDto.rentabilidade)
      operacao.rentabilidade = updateAtivoDto.rentabilidade;
    if (updateAtivoDto.dataVencimento)
      operacao.dataVencimento = updateAtivoDto.dataVencimento;
    if (updateAtivoDto.tipoOperacao)
      operacao.tipo = updateAtivoDto.tipoOperacao;

    operacao.precoTotal =
      updateAtivoDto.precoUnitario * updateAtivoDto.quantidade;

    const result = await this.operacoesRepository.update({ id: id }, operacao);
    return result.affected > 0;
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.operacoesRepository.delete({ id: id });
    return result.affected > 0;
  }
}
