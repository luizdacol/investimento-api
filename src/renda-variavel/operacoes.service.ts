import { Injectable } from '@nestjs/common';
import { CreateOperacaoDto } from './dto/create-operacao.dto';
import { UpdateOperacaoDto } from './dto/update-operacao.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrder, FindOptionsWhere, Repository } from 'typeorm';
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

  async findAll(
    filters: FindOptionsWhere<Operacao> = {},
    orderby: FindOptionsOrder<Operacao> = null,
  ) {
    const operacoes = await this.operacoesRepository.find({
      where: filters,
      relations: { ativo: true },
      order: orderby || { data: 'ASC' },
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

    operacao.precoTotal = operacao.precoUnitario * operacao.quantidade;

    const result = await this.operacoesRepository.update({ id: id }, operacao);
    return result.affected > 0;
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.operacoesRepository.delete({ id: id });
    return result.affected > 0;
  }

  private calcularFatorDesdobramento(
    operacoes: Operacao[],
    ticker: string,
  ): Map<string, number> {
    const operacoesDoAtivo = operacoes.filter((o) => o.ativo.ticker === ticker);
    const desdobramentosDoAtivo = operacoesDoAtivo.filter(
      (a) => a.tipo === TipoOperacao.DESDOBRAMENTO,
    );

    return new Map(
      operacoesDoAtivo.map((operacao) => {
        const fatorDesdobramento = desdobramentosDoAtivo
          .filter((d) => d.data >= operacao.data)
          .reduce<number>((fator, op) => fator * op.quantidade, 1);

        return [operacao.data.toISOString(), fatorDesdobramento];
      }),
    );
  }

  public calcularResumoOperacoes(
    operacoes: Operacao[],
    ticker: string,
    dataBase: Date = new Date(),
  ): {
    precoMedio: number;
    precoTotal: number;
    posicao: number;
  } {
    const fatorDesdobramentoPorData = this.calcularFatorDesdobramento(
      operacoes,
      ticker,
    );

    const operacoesDoAtivo = operacoes.filter((o) =>
      this.filtroPorTickerEData(o, ticker, dataBase),
    );

    return operacoesDoAtivo.reduce(
      (operacaoResumida, operacaoAtual) => {
        if (
          operacaoAtual.tipo === TipoOperacao.COMPRA ||
          operacaoAtual.tipo === TipoOperacao.BONIFICACAO
        ) {
          operacaoResumida.posicao +=
            operacaoAtual.quantidade *
            fatorDesdobramentoPorData.get(operacaoAtual.data.toISOString());

          operacaoResumida.precoTotal += operacaoAtual.precoTotal;
          operacaoResumida.precoMedio =
            operacaoResumida.precoTotal / operacaoResumida.posicao;
        } else if (operacaoAtual.tipo === TipoOperacao.AMORTIZACAO) {
          operacaoResumida.precoTotal -= operacaoAtual.precoTotal;
          operacaoResumida.precoMedio =
            operacaoResumida.precoTotal / operacaoResumida.posicao;
        } else if (operacaoAtual.tipo === TipoOperacao.VENDA) {
          operacaoResumida.posicao -= operacaoAtual.quantidade;
        }

        return operacaoResumida;
      },
      {
        precoTotal: 0,
        precoMedio: 0,
        posicao: 0,
      },
    );
  }

  private filtroPorTickerEData(o: Operacao, ticker: string, dataBase: Date) {
    return o.ativo.ticker === ticker && o.data <= dataBase;
  }
}
