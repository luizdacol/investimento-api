import { Injectable } from '@nestjs/common';
import { CreateOperacaoDto } from '../dto/create-operacao.dto';
import { UpdateOperacaoDto } from '../dto/update-operacao.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOptionsOrder,
  FindOptionsWhere,
  In,
  Repository,
} from 'typeorm';
import { Operacao } from '../entities/operacao.entity';
import { TipoOperacao } from '../../enums/tipo-operacao.enum';
import { AtivosService } from './ativos.service';
import { TaxasNegociacaoDto } from '../dto/taxas-negociacao.dto';
import { calcularFatorDesdobramentoPorData } from '../../utils/calculos';
import { PaginatedDto } from '../dto/paginated.dto';
import { TipoAtivo } from '../../enums/tipo-ativo.enum';
import { getUltimoDiaPorPeriodo } from '../../utils/helper';
import { TipoPeriodo } from '../../enums/tipo-periodo.enum';
import { LucrosPrejuizos } from '../entities/lucros-prejuizos.entity';
import { LucrosPrejuizosDto } from '../dto/lucros-prejuizos.dto';

@Injectable()
export class OperacoesService {
  constructor(
    @InjectRepository(Operacao)
    private operacoesRepository: Repository<Operacao>,
    @InjectRepository(LucrosPrejuizos)
    private lucrosPrejuizosRepository: Repository<LucrosPrejuizos>,
    private _ativosService: AtivosService,
  ) {}

  async create(createOperacaoDto: CreateOperacaoDto) {
    const ativo = await this._ativosService.findByTicker(
      createOperacaoDto.ticker,
    );
    if (!ativo) throw Error('Ativo não encontrado');

    const operacaoSaved = await this.operacoesRepository.save({
      data: createOperacaoDto.data,
      precoTotal:
        createOperacaoDto.precoUnitario * createOperacaoDto.quantidade,
      precoUnitario: createOperacaoDto.precoUnitario,
      quantidade: createOperacaoDto.quantidade,
      tipo: createOperacaoDto.tipoOperacao,
      ativo,
    });

    if (createOperacaoDto.tipoOperacao === TipoOperacao.VENDA) {
      await this.calcularLucrosPrejuizos(createOperacaoDto.data, ativo.tipo);
    }

    return operacaoSaved;
  }

  async findAll(
    filters: FindOptionsWhere<Operacao> = {},
    orderby: FindOptionsOrder<Operacao> = null,
    skip: number = 0,
    take: number = null,
  ): Promise<PaginatedDto<Operacao>> {
    const [operacoes, totalRecords] =
      await this.operacoesRepository.findAndCount({
        skip: skip,
        take: take,
        where: filters,
        relations: { ativo: true },
        order: orderby || { data: 'ASC' },
      });

    return new PaginatedDto<Operacao>(operacoes, totalRecords, skip, take);
  }

  async findOne(id: number): Promise<Operacao> {
    return await this.operacoesRepository.findOne({
      where: { id: id },
      relations: { ativo: true },
    });
  }

  async update(
    id: number,
    updateOperacaooDto: UpdateOperacaoDto,
  ): Promise<boolean> {
    const operacao = await this.findOne(id);
    if (!operacao) throw Error('Operação não encontrada');

    const mesAntesDaAlteracao = operacao.data;

    if (updateOperacaooDto.data) operacao.data = updateOperacaooDto.data;
    if (updateOperacaooDto.quantidade)
      operacao.quantidade = updateOperacaooDto.quantidade;
    if (updateOperacaooDto.precoUnitario)
      operacao.precoUnitario = updateOperacaooDto.precoUnitario;
    if (updateOperacaooDto.tipoOperacao)
      operacao.tipo = updateOperacaooDto.tipoOperacao;

    operacao.precoTotal = operacao.precoUnitario * operacao.quantidade;

    const result = await this.operacoesRepository.update({ id: id }, operacao);

    // Decisão tomada de recalcular apenas quando for VENDA por questão de simplicidade do código
    // visto que no momento da venda, os precos de compra terão sido validados já e dificilmente estarão errados
    if (updateOperacaooDto.tipoOperacao === TipoOperacao.VENDA) {
      await this.calcularLucrosPrejuizos(
        updateOperacaooDto.data,
        operacao.ativo.tipo,
      );

      // Se mudar o mes da venda, tem que recalcular o saldo do mes de antes da alteração também
      if (
        updateOperacaooDto.data.getMonth() !== mesAntesDaAlteracao.getMonth()
      ) {
        await this.calcularLucrosPrejuizos(
          mesAntesDaAlteracao,
          operacao.ativo.tipo,
        );
      }
    }

    return result.affected > 0;
  }

  async remove(id: number): Promise<boolean> {
    const operacao = await this.findOne(id);
    if (!operacao) throw Error('Operação não encontrada');

    const result = await this.operacoesRepository.delete({ id: id });

    if (operacao.tipo === TipoOperacao.VENDA) {
      await this.calcularLucrosPrejuizos(operacao.data, operacao.ativo.tipo);
    }
    return result.affected > 0;
  }

  async calcularTaxas(operacoes: Operacao[]): Promise<TaxasNegociacaoDto[]> {
    const initialArray: TaxasNegociacaoDto[] = [];

    const taxasNegociacaoDto = operacoes
      .filter(
        (op) =>
          op.tipo === TipoOperacao.COMPRA || op.tipo === TipoOperacao.VENDA,
      )
      .reduce((negociacoes, op) => {
        const item = negociacoes.find(
          (n) => n.data.getTime() === op.data.getTime(),
        );
        if (item) item.valorTotal += op.precoTotal;
        else {
          const taxa = new TaxasNegociacaoDto();
          taxa.data = op.data;
          taxa.valorTotal = op.precoTotal;
          negociacoes.push(taxa);
        }

        return negociacoes;
      }, initialArray);

    return taxasNegociacaoDto.sort(
      (a, b) => b.data.getTime() - a.data.getTime(),
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
    const fatorDesdobramentoPorData = calcularFatorDesdobramentoPorData(
      operacoes.filter((o) => o.ativo.ticker === ticker).map((o) => o.data),
      operacoes.filter((o) => o.ativo.ticker === ticker),
    );

    const operacoesDoAtivo = operacoes.filter((o) =>
      this.filtroPorTickerEData(o, ticker, dataBase),
    );

    return operacoesDoAtivo.reduce(
      (operacaoResumida, operacaoAtual) => {
        if (
          operacaoAtual.tipo === TipoOperacao.COMPRA ||
          operacaoAtual.tipo === TipoOperacao.BONIFICACAO ||
          operacaoAtual.tipo === TipoOperacao.ATUALIZACAO
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
          operacaoResumida.precoTotal =
            operacaoResumida.posicao * operacaoResumida.precoMedio;
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

  async calcularLucrosPrejuizos(dataVenda: Date, tipoAtivo: TipoAtivo) {
    console.log(
      `Calculando lucros e prejuizos do mes ${dataVenda.toLocaleDateString(
        'pt-BR',
        {
          timeZone: 'UTC',
          month: '2-digit',
          year: 'numeric',
        },
      )}`,
    );

    const startDate = new Date(
      dataVenda.getUTCFullYear(),
      dataVenda.getUTCMonth(),
      1,
    );
    const endDate = getUltimoDiaPorPeriodo(dataVenda, TipoPeriodo.MENSAL);

    const grupoAcao = [TipoAtivo.ACAO, TipoAtivo.BDR, TipoAtivo.ETF];
    const tiposAtivo = grupoAcao.includes(tipoAtivo) ? grupoAcao : [tipoAtivo];

    const [
      { content: operacoes },
      { content: operacoesVendaDoMes },
      lucroPrejuizoMes,
    ] = await Promise.all([
      this.findAll(),
      this.findAll({
        tipo: TipoOperacao.VENDA,
        data: Between(startDate, endDate),
        ativo: { tipo: In(tiposAtivo) },
      }),
      this.lucrosPrejuizosRepository.findOneBy({
        data: endDate,
        tipo: grupoAcao.includes(tipoAtivo) ? TipoAtivo.ACAO : tipoAtivo,
      }),
    ]);

    const balancoDoMes = {
      data: endDate,
      lucro: 0,
      prejuizo: 0,
      prejuizoCompensado: 0,
      tipo: grupoAcao.includes(tipoAtivo) ? TipoAtivo.ACAO : tipoAtivo,
    } as LucrosPrejuizos;

    for (const venda of operacoesVendaDoMes) {
      const dataAntesDaVenda = new Date(venda.data.getTime());
      dataAntesDaVenda.setDate(venda.data.getDate() - 1);

      const { precoMedio } = this.calcularResumoOperacoes(
        operacoes,
        venda.ativo.ticker,
        dataAntesDaVenda,
      );
      const saldoOperacao =
        (venda.precoUnitario - precoMedio) * venda.quantidade;
      if (saldoOperacao > 0) {
        balancoDoMes.lucro += saldoOperacao;
      } else {
        balancoDoMes.prejuizo += saldoOperacao;
      }
    }

    if (lucroPrejuizoMes) {
      await this.lucrosPrejuizosRepository.update(
        { id: lucroPrejuizoMes.id },
        balancoDoMes,
      );
    } else {
      await this.lucrosPrejuizosRepository.save(balancoDoMes);
    }
  }

  async getLucrosPrejuizosPorClasse(): Promise<LucrosPrejuizosDto[]> {
    const lucrosPrejuizos = await this.lucrosPrejuizosRepository.find({
      order: {
        tipo: 'ASC',
        data: 'ASC',
      },
    });

    const lucroPrejuizoDto: LucrosPrejuizosDto[] = [];
    for (const item of lucrosPrejuizos) {
      let lucroPrejuizoPorClasse = lucroPrejuizoDto.find(
        (lp) => lp.classeAtivo === item.tipo,
      );
      if (!lucroPrejuizoPorClasse) {
        lucroPrejuizoDto.push({
          classeAtivo: item.tipo,
          saldoParaCompensar: 0,
          balancoMensal: [],
        });
        lucroPrejuizoPorClasse = lucroPrejuizoDto.find(
          (lp) => lp.classeAtivo === item.tipo,
        );
      }

      lucroPrejuizoPorClasse.balancoMensal.push({
        id: item.id,
        data: item.data,
        lucro: item.lucro,
        prejuizo: item.prejuizo,
        prejuizoCompensado: item.prejuizoCompensado,
      });

      const saldoDoMes = item.prejuizoCompensado + item.prejuizo;
      if (saldoDoMes < 0 || lucroPrejuizoPorClasse.saldoParaCompensar < 0) {
        lucroPrejuizoPorClasse.saldoParaCompensar += saldoDoMes;
      }

      if (lucroPrejuizoPorClasse.saldoParaCompensar > 0)
        lucroPrejuizoPorClasse.saldoParaCompensar = 0;
    }

    return lucroPrejuizoDto;
  }

  async updatePrejuizoCompensado(
    id: number,
    prejuizoCompensado: number,
  ): Promise<boolean> {
    const result = await this.lucrosPrejuizosRepository.update(
      { id: id },
      { prejuizoCompensado: prejuizoCompensado },
    );

    return result.affected > 0;
  }
}
