import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { CarteiraService } from '../services/carteira.service';
import { CarteiraRendaVariavelDto } from '../dto/carteira-renda-variavel.dto';
import { CarteiraRendaFixaDto } from '../dto/carteira-renda-fixa.dto';
import { TipoAtivo } from '../../enums/tipo-ativo.enum';
import {
  ComposicaoChartDto,
  ComposicaoV2ChartDto,
} from '../dto/composicao-chart.dto';
import { ProventosService } from '../../renda-variavel/services/proventos.service';
import { ProventosChartDto } from '../dto/proventos-chart.dto';
import { Provento } from '../../renda-variavel/entities/provento.entity';
import { toPercentRounded, toRounded } from '../../utils/helper';
import { YieldMonthlyChartDto } from '../dto/yield-monthly-chart.dto';
import { OperacoesService } from 'src/renda-variavel/services/operacoes.service';
import { AtivosService } from 'src/renda-variavel/services/ativos.service';

@Controller('v1/graficos')
export class GraficosController {
  constructor(
    private readonly carteiraService: CarteiraService,
    private readonly proventosService: ProventosService,
    private readonly operacoesService: OperacoesService,
    private readonly ativosService: AtivosService,
  ) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('composicao')
  async getCarteira(): Promise<ComposicaoChartDto[]> {
    const carteira = await this.carteiraService.calculateCarteira();

    const initialValue = Object.values<string>(TipoAtivo)
      .concat('Carteira')
      .map((tipo) => {
        return { tipo: tipo, labels: [], data: [] } as ComposicaoChartDto;
      });

    const composicaoDto = carteira.reduce(
      (
        chartDto: ComposicaoChartDto[],
        itemCarteira: CarteiraRendaVariavelDto | CarteiraRendaFixaDto,
      ) => {
        let nome =
          'ticker' in itemCarteira ? itemCarteira.ticker : itemCarteira.titulo;

        let item = chartDto.find((c) => c.tipo === itemCarteira.tipoAtivo);
        let data = itemCarteira.composicao;

        if (nome === 'Total') {
          item = chartDto.find((c) => c.tipo === 'Carteira');
          data = itemCarteira.composicaoTotal;
          nome = itemCarteira.tipoAtivo;
        }

        item.labels.push(nome);
        item.data.push(data);

        return chartDto;
      },
      initialValue,
    );

    return composicaoDto;
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('composicao/:categoria')
  async getComposicao(
    @Param('categoria') categoria: TipoAtivo & 'Carteira',
  ): Promise<ComposicaoV2ChartDto[]> {
    const carteira = await this.carteiraService.calculateCarteira();

    if (categoria !== 'Carteira') {
      return carteira
        .filter((c) => c.tipoAtivo === categoria && c.nome !== 'Total')
        .map((c) => {
          return {
            name: c.nome.replace('Tesouro ', ''),
            value: toRounded(c.composicao),
          };
        })
        .sort((a, b) => b.value - a.value);
    } else {
      return carteira
        .filter((c) => c.nome === 'Total' && c.composicaoTotal !== 0)
        .map((c) => {
          return {
            name: c.tipoAtivo,
            value: toRounded(c.composicaoTotal),
          };
        })
        .sort((a, b) => b.value - a.value);
    }
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('proventos')
  async getProventos(): Promise<ProventosChartDto[]> {
    const proventos = await this.proventosService.findAll();

    const initialValue = [];
    const startDate = new Date('2021-08-01T00:00:00.000Z');
    const endDate = new Date();
    while (startDate < endDate) {
      initialValue.push({
        data: new Date(startDate),
        fii: 0,
        acao: 0,
        bdr: 0,
        carteira: 0,
      } as ProventosChartDto);
      startDate.setMonth(startDate.getMonth() + 1);
    }

    const proventosDto = proventos.reduce(
      (chartDto: ProventosChartDto[], item: Provento) => {
        const proventoMes = chartDto.find(
          (c) =>
            c.data.getUTCMonth() === item.dataPagamento.getUTCMonth() &&
            c.data.getUTCFullYear() === item.dataPagamento.getUTCFullYear(),
        );

        if (!proventoMes) return chartDto;

        proventoMes.carteira += item.valorTotal;
        if (item.ativo.tipo === TipoAtivo.ACAO) {
          proventoMes.acao += item.valorTotal;
        } else if (item.ativo.tipo === TipoAtivo.FII) {
          proventoMes.fii += item.valorTotal;
        } else if (item.ativo.tipo === TipoAtivo.BDR) {
          proventoMes.bdr += item.valorTotal;
        }

        return chartDto;
      },
      initialValue,
    );

    return proventosDto;
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('proventos/yield')
  async getYieldMonthly(): Promise<YieldMonthlyChartDto[]> {
    const [proventos, operacoes, ativos] = await Promise.all([
      this.proventosService.findAll(
        // { ativo: { ticker: In(['BRCO11', 'KNCR11']) } },
        {},
        { dataPagamento: 'ASC' },
      ),
      this.operacoesService.findAll(),
      this.ativosService.findAll(),
    ]);

    const dadosPorMes: YieldMonthlyChartDto[] =
      this.inicializarArrayYieldMensal();

    for (const ativo of ativos) {
      const proventosPorAtivoMes =
        this.proventosService.calcularResumoProventosPorMes(
          proventos,
          operacoes,
          ativo.ticker,
        );

      if (proventosPorAtivoMes.length === 0) continue;

      dadosPorMes.forEach((item) => {
        const proventoMes = proventosPorAtivoMes.find(
          (p) =>
            item.data ===
            p.data.toLocaleString('pt-BR', {
              month: 'numeric',
              year: 'numeric',
              timeZone: 'UTC',
            }),
        );
        if (!proventoMes) {
          item[ativo.ticker] = 0;
        } else {
          const { precoMedio } = this.operacoesService.calcularResumoOperacoes(
            operacoes,
            ativo.ticker,
            proventoMes.data,
          );

          const yieldOnCost =
            precoMedio !== 0
              ? toPercentRounded(proventoMes.total / precoMedio)
              : 0;

          item[ativo.ticker] = yieldOnCost;
        }
      });
    }

    return dadosPorMes;
  }

  private inicializarArrayYieldMensal(): YieldMonthlyChartDto[] {
    const yieldMensal: YieldMonthlyChartDto[] = [];

    const dataInicial = new Date('2021-08-01T00:00:00.000Z');
    const dataFinal = new Date();
    while (dataInicial < dataFinal) {
      yieldMensal.push({
        data: dataInicial.toLocaleString('pt-BR', {
          month: 'numeric',
          year: 'numeric',
          timeZone: 'UTC',
        }),
      });
      dataInicial.setMonth(dataInicial.getMonth() + 1);
    }

    return yieldMensal;
  }
}
