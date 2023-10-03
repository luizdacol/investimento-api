import { Injectable } from '@nestjs/common';
import { CreateOperacaoDto } from './dto/create-operacao.dto';
import { UpdateOperacaoDto } from './dto/update-operacao.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Operacao } from './entities/operacao.entity';
import { TipoOperacao } from 'src/enums/tipo-operacao.enum';
import { AtivosService } from './ativos.service';

@Injectable()
export class OperacoesService {
  constructor(
    @InjectRepository(Operacao)
    private operacoesRepository: Repository<Operacao>,
    private _ativosService: AtivosService,
  ) {}

  async create(createOperacaoDto: CreateOperacaoDto) {
    const ativo = await this._ativosService.getOrCreate({
      ticker: createOperacaoDto.ticker,
      tipo: createOperacaoDto.tipoAtivo,
      segmento: createOperacaoDto.segmento,
    });

    const operacaoSaved = this.operacoesRepository.save({
      data: createOperacaoDto.data,
      precoTotal:
        createOperacaoDto.precoUnitario * createOperacaoDto.quantidade,
      precoUnitario: createOperacaoDto.precoUnitario,
      quantidade: createOperacaoDto.quantidade,
      tipo: createOperacaoDto.tipoOperacao,
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

  public calcularPosicao(
    operacoes: Operacao[],
    ticker: string,
    dataBase: Date = new Date(),
  ): number {
    const posicao = operacoes
      .filter((o) => this.filtroPorTickerEData(o, ticker, dataBase))
      .reduce((posicao, operacaoAtual) => {
        if (operacaoAtual.tipo === TipoOperacao.COMPRA)
          return posicao + operacaoAtual.quantidade;
        else if (operacaoAtual.tipo === TipoOperacao.VENDA)
          return posicao - operacaoAtual.quantidade;
      }, 0);

    return posicao;
  }

  public calcularValorTotal(
    operacoes: Operacao[],
    ticker: string,
    dataBase: Date = new Date(),
  ): number {
    const valorTotal = operacoes
      .filter((o) => this.filtroPorTickerEData(o, ticker, dataBase))
      .reduce((valorTotal, operacaoAtual) => {
        if (operacaoAtual.tipo === TipoOperacao.COMPRA)
          return valorTotal + operacaoAtual.precoTotal;
        else if (operacaoAtual.tipo === TipoOperacao.VENDA)
          return valorTotal - operacaoAtual.precoTotal;
      }, 0);

    return valorTotal;
  }

  private filtroPorTickerEData(o: Operacao, ticker: string, dataBase: Date) {
    return (
      o.ativo.ticker === ticker &&
      o.data.toString() <= dataBase.toISOString().substring(0, 10)
    );
  }
}