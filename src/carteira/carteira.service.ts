import { Injectable } from '@nestjs/common';
import { OperacoesService } from 'src/renda-variavel/operacoes.service';
import { CarteiraRendaVariavelDto } from './dto/carteira-renda-variavel.dto';
import { AtivosService } from 'src/renda-variavel/ativos.service';
import { TipoAtivo } from 'src/enums/tipo-ativo.enum';
import { ProventosService } from 'src/renda-variavel/proventos.service';

@Injectable()
export class CarteiraService {
  constructor(
    private readonly _operacoesService: OperacoesService,
    private readonly _ativosService: AtivosService,
    private readonly _proventosService: ProventosService,
  ) {}

  async calculateCarteiraRendaVariavel(
    tipo: TipoAtivo,
  ): Promise<Map<number, CarteiraRendaVariavelDto>> {
    const operacoes = await this._operacoesService.findAll();
    const ativos = await this._ativosService.findAll({ tipo: tipo });
    const carteira = new Map<number, CarteiraRendaVariavelDto>();

    for (const ativo of ativos) {
      const ativoNaCarteira = new CarteiraRendaVariavelDto();

      ativoNaCarteira.ticker = ativo.ticker;
      ativoNaCarteira.quantidade = this._operacoesService.calcularPosicao(
        operacoes,
        ativo.ticker,
      );

      const valorTotal = this._operacoesService.calcularValorTotal(
        operacoes,
        ativo.ticker,
      );

      const proventos = await this._proventosService.findAll();

      const proventosRecebidos = this._proventosService.calcularValorRecebido(
        proventos,
        ativo.ticker,
      );
      const proventosProvisionados =
        this._proventosService.calcularValorProvisionado(
          proventos,
          ativo.ticker,
        );

      ativoNaCarteira.precoMedio =
        ativoNaCarteira.quantidade > 0
          ? valorTotal / ativoNaCarteira.quantidade
          : 0;
      ativoNaCarteira.precoMedioTotal =
        ativoNaCarteira.precoMedio * ativoNaCarteira.quantidade;

      ativoNaCarteira.composicao = 0;
      ativoNaCarteira.composicaoTotal = 0;
      ativoNaCarteira.precoMercado = 0;
      ativoNaCarteira.precoMercadoTotal = 0;
      ativoNaCarteira.dividendosProvisionados = proventosProvisionados;
      ativoNaCarteira.dividendosRecebidos = proventosRecebidos;
      ativoNaCarteira.yieldOnCost = 0;
      ativoNaCarteira.variacao = 0;

      carteira.set(ativo.id, ativoNaCarteira);
    }

    return carteira;
  }
}
