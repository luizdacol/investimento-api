import { Controller, Patch } from '@nestjs/common';
import { AtivosService } from './ativos.service';
import { CotacaoService } from 'src/cotacao/cotacao.service';

@Controller('v1/renda-variavel/ativos')
export class AtivosController {
  constructor(
    private readonly _ativosService: AtivosService,
    private _cotacaoService: CotacaoService,
  ) {}

  @Patch('/update-prices')
  async updatePrices(): Promise<boolean> {
    const ativos = await this._ativosService.findAll();

    const cotacoesPromise = ativos.map((ativo) =>
      this._cotacaoService.getQuoteInformation(ativo.ticker),
    );
    const cotacoes = await Promise.all(cotacoesPromise);

    cotacoes.forEach((cotacao) => {
      const ativo = ativos.find((ativo) => ativo.ticker === cotacao.symbol);
      this._ativosService.update(ativo.id, {
        cotacao: cotacao.regularMarketPrice,
        dataHoraCotacao: new Date(cotacao.regularMarketTime),
      });
    });

    return true;
  }
}
