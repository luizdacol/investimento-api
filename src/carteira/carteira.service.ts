import { Injectable } from '@nestjs/common';
import { OperacoesService as OperacoesRendaVariavelService } from 'src/renda-variavel/operacoes.service';
import { CarteiraRendaVariavelDto } from './dto/carteira-renda-variavel.dto';
import { AtivosService as AtivosRendaVariavelService } from 'src/renda-variavel/ativos.service';
import { ProventosService as ProventosRendaVariavelService } from 'src/renda-variavel/proventos.service';
import { OperacoesService as OperacoesRendaFixaService } from 'src/renda-fixa/operacoes.service';
import { AtivosService as AtivosRendaFixaService } from 'src/renda-fixa/ativos.service';
import { CarteiraRendaFixaDto } from './dto/carteira-renda-fixa.dto';
import { Ativo as AtivoRendaVariavel } from 'src/renda-variavel/entities/ativo.entity';
import { Ativo as AtivoRendaFixa } from 'src/renda-fixa/entities/ativo.entity';
import { Provento } from 'src/renda-variavel/entities/provento.entity';
import { Operacao as OperacaoRendaVariavel } from 'src/renda-variavel/entities/operacao.entity';
import { Operacao as OperacaoRendaFixa } from 'src/renda-fixa/entities/operacao.entity';
import { toPercentRounded } from 'src/utils/helper';

@Injectable()
export class CarteiraService {
  constructor(
    private readonly _operacoesRendaVariavelService: OperacoesRendaVariavelService,
    private readonly _ativosRendaVariavelService: AtivosRendaVariavelService,
    private readonly _proventosRendaVariavelService: ProventosRendaVariavelService,
    private readonly _operacoesRendaFixaService: OperacoesRendaFixaService,
    private readonly _ativosRendaFixaService: AtivosRendaFixaService,
  ) {}

  async calculateCarteira() {
    const operacoesRV = await this._operacoesRendaVariavelService.findAll();
    const ativosRV = await this._ativosRendaVariavelService.findAll({});
    const proventosRV = await this._proventosRendaVariavelService.findAll();

    const operacoesRF = await this._operacoesRendaFixaService.findAll();
    const ativosRF = await this._ativosRendaFixaService.findAll({});

    const arrayAtivos = new Array<AtivoRendaVariavel | AtivoRendaFixa>(
      ...ativosRF,
      ...ativosRV,
    );

    const carteira: (CarteiraRendaVariavelDto | CarteiraRendaFixaDto)[] = [];
    const total = new Map<string, number>();

    for (const ativo of arrayAtivos) {
      let ativoNaCarteira: CarteiraRendaVariavelDto | CarteiraRendaFixaDto;
      if (ativo instanceof AtivoRendaVariavel) {
        ativoNaCarteira = this.calculateAtivoRV(
          ativo,
          operacoesRV,
          proventosRV,
        );
      } else {
        ativoNaCarteira = this.calculateAtivoRF(ativo, operacoesRF);
      }

      const totalTipo = total.get(ativo.tipo) ?? 0;
      total.set(ativo.tipo, totalTipo + ativoNaCarteira.precoMercadoTotal);

      carteira.push(ativoNaCarteira);
    }

    this.calculateComposicao(carteira, total);

    return carteira;
  }

  calculateComposicao(
    carteira: (CarteiraRendaVariavelDto | CarteiraRendaFixaDto)[],
    total: Map<string, number>,
  ) {
    const totalCarteira = Array.from(total.values()).reduce(
      (pv, cv) => pv + cv,
      0,
    );

    for (const ativo of carteira) {
      ativo.composicao = toPercentRounded(
        ativo.precoMercadoTotal / total.get(ativo.tipoAtivo),
      );
      ativo.composicaoTotal = toPercentRounded(
        ativo.precoMercadoTotal / totalCarteira,
      );
    }
  }

  calculateAtivoRV(
    ativo: AtivoRendaVariavel,
    operacoes: OperacaoRendaVariavel[],
    proventos: Provento[],
  ): CarteiraRendaVariavelDto {
    const ativoNaCarteira = new CarteiraRendaVariavelDto();

    const { precoMedio, posicao } =
      this._operacoesRendaVariavelService.calcularResumoOperacoes(
        operacoes,
        ativo.ticker,
        new Date(),
      );

    ativoNaCarteira.ticker = ativo.ticker;
    ativoNaCarteira.tipoAtivo = ativo.tipo;
    ativoNaCarteira.quantidade = posicao;
    ativoNaCarteira.precoMedio = precoMedio;

    const resumoProventos =
      this._proventosRendaVariavelService.calcularResumoProventos(
        proventos,
        ativo.ticker,
        new Date(),
      );

    ativoNaCarteira.precoMercado = ativo.cotacao || 0;
    ativoNaCarteira.dividendosProvisionados =
      resumoProventos.proventosProvisionados;
    ativoNaCarteira.dividendosRecebidos = resumoProventos.proventosRecebidos;
    ativoNaCarteira.dividendosRecebidosPorUnidade =
      resumoProventos.proventosPorAcao;

    return ativoNaCarteira;
  }

  calculateAtivoRF(
    ativo: AtivoRendaFixa,
    operacoes: OperacaoRendaFixa[],
  ): CarteiraRendaFixaDto {
    const ativoNaCarteira = new CarteiraRendaFixaDto();

    ativoNaCarteira.titulo = ativo.titulo;
    ativoNaCarteira.tipoAtivo = ativo.tipo;
    ativoNaCarteira.quantidade =
      this._operacoesRendaFixaService.calcularPosicao(operacoes, ativo.titulo);

    const valorTotal = this._operacoesRendaFixaService.calcularValorTotal(
      operacoes,
      ativo.titulo,
    );

    ativoNaCarteira.precoMedio =
      ativoNaCarteira.quantidade > 0
        ? valorTotal / ativoNaCarteira.quantidade
        : 0;

    ativoNaCarteira.precoMercado = ativo.cotacao || 0;

    return ativoNaCarteira;
  }
}
