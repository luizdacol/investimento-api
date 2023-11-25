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

@Controller('v1/graficos')
export class GraficosController {
  constructor(private readonly carteiraService: CarteiraService) {}

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
}
