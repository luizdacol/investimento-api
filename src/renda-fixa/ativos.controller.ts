import { Controller, Patch } from '@nestjs/common';
import { AtivosService } from './ativos.service';
import { CotacaoService } from 'src/cotacao/cotacao.service';

@Controller('v1/renda-fixa/ativos')
export class AtivosController {
  constructor(
    private readonly _ativosService: AtivosService,
    private _cotacaoService: CotacaoService,
  ) {}

  @Patch('/update-prices')
  async updatePrices(): Promise<boolean> {
    const ativos = await this._ativosService.findAll();

    const cotacoesPromise = ativos
      .filter((ativo) => !!ativo.codigo)
      .map((ativo) => this._cotacaoService.getTesouroInformation(ativo.codigo));
    const cotacoes = await Promise.all(cotacoesPromise);

    cotacoes.forEach((cotacao) => {
      const ativo = ativos.find(
        (ativo) => ativo.codigo === cotacao.cd.toString(),
      );
      this._ativosService.update(ativo.id, {
        cotacao: cotacao.PrcgLst.at(-1).untrRedVal,
        dataHoraCotacao: new Date(),
      });
    });

    return true;
  }
}
