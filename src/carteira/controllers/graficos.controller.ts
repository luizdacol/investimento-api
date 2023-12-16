import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  UseInterceptors,
} from '@nestjs/common';
import { CarteiraService } from '../carteira.service';
import { CarteiraRendaVariavelDto } from '../dto/carteira-renda-variavel.dto';
import { CarteiraRendaFixaDto } from '../dto/carteira-renda-fixa.dto';
import { TipoAtivo } from 'src/enums/tipo-ativo.enum';
import { ComposicaoChartDto } from '../dto/composicao-chart.dto';
import { ProventosService } from 'src/renda-variavel/proventos.service';
import { ProventosChartDto } from '../dto/proventos-chart.dto';
import { Provento } from 'src/renda-variavel/entities/provento.entity';

@Controller('v1/graficos')
export class GraficosController {
  constructor(
    private readonly carteiraService: CarteiraService,
    private readonly proventosService: ProventosService,
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
}
