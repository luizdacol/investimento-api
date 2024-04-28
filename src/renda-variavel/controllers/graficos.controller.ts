import { Controller, Get, Query } from '@nestjs/common';
import { ProventosService } from '../services/proventos.service';
import { Provento } from '../entities/provento.entity';
import { Between, FindOptionsWhere } from 'typeorm';
import { ProventoComposicaoChartDto } from '../dto/provento-composicao-chart.dto';

@Controller('v1/renda-variavel/graficos')
export class GraficosController {
  constructor(private readonly proventosService: ProventosService) {}

  @Get('proventos')
  async findProventosByDataPagamento(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<ProventoComposicaoChartDto> {
    const filter: FindOptionsWhere<Provento> = {};

    if (!startDate || !endDate) {
      throw new Error('Ambas datas precisam estar preenchidas');
    }

    filter.dataPagamento = Between(new Date(startDate), new Date(endDate));
    const proventos = await this.proventosService.findWithFilters(filter);

    const proventoComposicaoDto = proventos
      .sort((a, b) => b.ativo.tipo.localeCompare(a.ativo.tipo))
      .reduce(
        (chartDto, provento) => {
          const item = chartDto.details.find(
            (c) => c.ativo === provento.ativo.ticker,
          );
          if (item) item.total += provento.valorTotal;
          else {
            chartDto.details.push({
              ativo: provento.ativo.ticker,
              total: provento.valorTotal,
              tipo: provento.ativo.tipo,
            });
          }

          const index = chartDto.labels.indexOf(provento.ativo.tipo);
          if (index === -1) {
            chartDto.labels.push(provento.ativo.tipo);
            chartDto.data.push(provento.valorTotal);
          } else {
            chartDto.data[index] += provento.valorTotal;
          }

          return chartDto;
        },
        { labels: [], data: [], details: [] } as ProventoComposicaoChartDto,
      );

    return proventoComposicaoDto;
  }
}
