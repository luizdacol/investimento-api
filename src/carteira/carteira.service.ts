import { Injectable } from '@nestjs/common';
import { OperacoesService } from 'src/renda-variavel/operacoes.service';
import { CarteiraRendaVariavelDto } from './dto/carteira-renda-variavel.dto';
import { AtivosService } from 'src/renda-variavel/ativos.service';
import { TipoAtivo } from 'src/enums/tipo-ativo.enum';

@Injectable()
export class CarteiraService {
  constructor(
    private readonly _operacoesService: OperacoesService,
    private readonly _ativosService: AtivosService,
  ) {}

  async calculateCarteiraRendaVariavel(
    tipo: TipoAtivo,
  ): Promise<Map<number, CarteiraRendaVariavelDto>> {
    const operacoes = await this._operacoesService.findAll();
    const ativos = await this._ativosService.findAll({ tipo: tipo });
    const carteira = new Map<number, CarteiraRendaVariavelDto>();

    ativos.forEach((ativo) => {
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
      ativoNaCarteira.dividendosProvisionados = 0;
      ativoNaCarteira.dividendosRecebidos = 0;
      ativoNaCarteira.yieldOnCost = 0;
      ativoNaCarteira.variacao = 0;

      carteira.set(ativo.id, ativoNaCarteira);
    });

    return carteira;
  }
}
