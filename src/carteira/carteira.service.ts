import { Injectable } from '@nestjs/common';
import { OperacoesService as OperacoesRendaVariavelService } from 'src/renda-variavel/operacoes.service';
import { CarteiraRendaVariavelDto } from './dto/carteira-renda-variavel.dto';
import { AtivosService as AtivosRendaVariavelService } from 'src/renda-variavel/ativos.service';
import { TipoAtivo } from 'src/enums/tipo-ativo.enum';
import { ProventosService as ProventosRendaVariavelService } from 'src/renda-variavel/proventos.service';
import { OperacoesService as OperacoesRendaFixaService } from 'src/renda-fixa/operacoes.service';
import { AtivosService as AtivosRendaFixaService } from 'src/renda-fixa/ativos.service';
import { CarteiraRendaFixaDto } from './dto/carteira-renda-fixa.dto';

@Injectable()
export class CarteiraService {
  constructor(
    private readonly _operacoesRendaVariavelService: OperacoesRendaVariavelService,
    private readonly _ativosRendaVariavelService: AtivosRendaVariavelService,
    private readonly _proventosRendaVariavelService: ProventosRendaVariavelService,
    private readonly _operacoesRendaFixaService: OperacoesRendaFixaService,
    private readonly _ativosRendaFixaService: AtivosRendaFixaService,
  ) {}

  async calculateCarteiraRendaVariavel(
    tipo: TipoAtivo,
  ): Promise<Map<number, CarteiraRendaVariavelDto>> {
    const operacoes = await this._operacoesRendaVariavelService.findAll();
    const ativos = await this._ativosRendaVariavelService.findAll({
      tipo: tipo,
    });
    const carteira = new Map<number, CarteiraRendaVariavelDto>();

    for (const ativo of ativos) {
      const ativoNaCarteira = new CarteiraRendaVariavelDto();

      ativoNaCarteira.ticker = ativo.ticker;
      ativoNaCarteira.quantidade =
        this._operacoesRendaVariavelService.calcularPosicao(
          operacoes,
          ativo.ticker,
        );

      const valorTotal = this._operacoesRendaVariavelService.calcularValorTotal(
        operacoes,
        ativo.ticker,
      );

      const proventos = await this._proventosRendaVariavelService.findAll();

      const proventosRecebidos =
        this._proventosRendaVariavelService.calcularValorRecebido(
          proventos,
          ativo.ticker,
        );
      const proventosProvisionados =
        this._proventosRendaVariavelService.calcularValorProvisionado(
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

  async calculateCarteiraRendaFixa(
    tipo: TipoAtivo,
  ): Promise<Map<number, CarteiraRendaFixaDto>> {
    const operacoes = await this._operacoesRendaFixaService.findAll();
    const ativos = await this._ativosRendaFixaService.findAll({
      tipo: tipo,
    });
    const carteira = new Map<number, CarteiraRendaFixaDto>();

    for (const ativo of ativos) {
      const ativoNaCarteira = new CarteiraRendaFixaDto();

      ativoNaCarteira.titulo = ativo.titulo;
      ativoNaCarteira.quantidade =
        this._operacoesRendaFixaService.calcularPosicao(
          operacoes,
          ativo.titulo,
        );

      const valorTotal = this._operacoesRendaFixaService.calcularValorTotal(
        operacoes,
        ativo.titulo,
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
      ativoNaCarteira.variacao = 0;

      carteira.set(ativo.id, ativoNaCarteira);
    }

    return carteira;
  }
}
