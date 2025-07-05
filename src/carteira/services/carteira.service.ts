import { Injectable } from '@nestjs/common';
import { OperacoesService as OperacoesRendaVariavelService } from '../../renda-variavel/services/operacoes.service';
import { CarteiraRendaVariavelDto } from '../dto/carteira-renda-variavel.dto';
import { AtivosService as AtivosRendaVariavelService } from '../../renda-variavel/services/ativos.service';
import { ProventosService as ProventosRendaVariavelService } from '../../renda-variavel/services/proventos.service';
import { OperacoesService as OperacoesRendaFixaService } from '../../renda-fixa/services/operacoes.service';
import { AtivosService as AtivosRendaFixaService } from '../../renda-fixa/services/ativos.service';
import { OperacoesService as OperacoesCriptomoedaService } from '../../criptomoedas/services/operacoes.service';
import { AtivosService as AtivosCriptomoedaService } from '../../criptomoedas/services/ativos.service';
import { CarteiraRendaFixaDto } from '../dto/carteira-renda-fixa.dto';
import { Ativo as AtivoRendaVariavel } from '../../renda-variavel/entities/ativo.entity';
import { Ativo as AtivoRendaFixa } from '../../renda-fixa/entities/ativo.entity';
import { Ativo as AtivoCriptomoeda } from '../../criptomoedas/entities/ativo.entity';
import { Provento } from '../../renda-variavel/entities/provento.entity';
import { Operacao as OperacaoRendaVariavel } from '../../renda-variavel/entities/operacao.entity';
import { Operacao as OperacaoRendaFixa } from '../../renda-fixa/entities/operacao.entity';
import { Operacao as OperacaoCriptomoeda } from '../../criptomoedas/entities/operacao.entity';
import { toPercentRounded } from '../../utils/helper';
import { TipoAtivo } from '../../enums/tipo-ativo.enum';
import { TipoPeriodo } from '../../enums/tipo-periodo.enum';
import { CarteiraCriptomoedaDto } from '../dto/carteira-criptomoeda.dto';

@Injectable()
export class CarteiraService {
  constructor(
    private readonly _operacoesRendaVariavelService: OperacoesRendaVariavelService,
    private readonly _ativosRendaVariavelService: AtivosRendaVariavelService,
    private readonly _proventosRendaVariavelService: ProventosRendaVariavelService,
    private readonly _operacoesRendaFixaService: OperacoesRendaFixaService,
    private readonly _ativosRendaFixaService: AtivosRendaFixaService,
    private readonly _ativosCriptomoedaService: AtivosCriptomoedaService,
    private readonly _operacoesCriptomoedaService: OperacoesCriptomoedaService,
  ) {}

  async calculateCarteira(dataDeCorte: Date = new Date()) {
    const [
      { content: operacoesRV },
      ativosRV,
      { content: proventosRV },
      operacoesRF,
      ativosRF,
      { content: operacoesCripto },
      ativosCripto,
    ] = await Promise.all([
      this._operacoesRendaVariavelService.findAll(),
      this._ativosRendaVariavelService.findAll({}),
      this._proventosRendaVariavelService.findAll(),
      this._operacoesRendaFixaService.findAll(),
      this._ativosRendaFixaService.findAll({}),
      this._operacoesCriptomoedaService.findAll(),
      this._ativosCriptomoedaService.findAll({}),
    ]);

    const arrayAtivos = new Array<
      AtivoRendaVariavel | AtivoRendaFixa | AtivoCriptomoeda
    >(...ativosRF, ...ativosRV, ...ativosCripto);

    const carteira: (
      | CarteiraRendaVariavelDto
      | CarteiraRendaFixaDto
      | CarteiraCriptomoedaDto
    )[] = [];

    for (const ativo of arrayAtivos) {
      let ativoNaCarteira:
        | CarteiraRendaVariavelDto
        | CarteiraRendaFixaDto
        | CarteiraCriptomoedaDto;
      if (ativo instanceof AtivoRendaVariavel) {
        ativoNaCarteira = this.calculateAtivoRV(
          ativo,
          operacoesRV.filter((d) => d.data <= dataDeCorte),
          proventosRV.filter((d) => d.dataCom <= dataDeCorte),
        );
      } else if (ativo instanceof AtivoRendaFixa) {
        ativoNaCarteira = this.calculateAtivoRF(
          ativo,
          operacoesRF.filter((d) => d.data <= dataDeCorte),
        );
      } else {
        ativoNaCarteira = this.calculateAtivoCripto(
          ativo,
          operacoesCripto.filter((d) => d.data <= dataDeCorte),
        );
      }

      if (ativoNaCarteira.quantidade > 0) carteira.push(ativoNaCarteira);
    }

    this.calculateComposicao(carteira);
    this.calculateTotal(carteira);

    return carteira;
  }

  calculateTotal(
    carteira: (
      | CarteiraRendaVariavelDto
      | CarteiraRendaFixaDto
      | CarteiraCriptomoedaDto
    )[],
  ) {
    const initialKvPair = new Map<
      string,
      CarteiraRendaVariavelDto | CarteiraRendaFixaDto | CarteiraCriptomoedaDto
    >([
      [TipoAtivo.FII, new CarteiraRendaVariavelDto('Total')],
      [TipoAtivo.ACAO, new CarteiraRendaVariavelDto('Total')],
      [TipoAtivo.BDR, new CarteiraRendaVariavelDto('Total')],
      [TipoAtivo.ETF, new CarteiraRendaVariavelDto('Total')],
      [TipoAtivo.CDB, new CarteiraRendaFixaDto('Total')],
      [TipoAtivo.TESOURO_DIRETO, new CarteiraRendaFixaDto('Total')],
      [TipoAtivo.CRIPTOMOEDA, new CarteiraCriptomoedaDto('Total')],
    ]);

    let totalCarteira = 0;

    const totais = carteira.reduce((kvPair, ativo) => {
      const totalDoTipo = kvPair.get(ativo.tipoAtivo);

      totalDoTipo.tipoAtivo = ativo.tipoAtivo;
      totalDoTipo.quantidade = 1;
      totalDoTipo.precoMedio += ativo.precoMedioTotal;
      totalDoTipo.precoMercado += ativo.precoMercadoTotal;
      totalDoTipo.dataHoraCotacao = new Date();

      totalCarteira += ativo.precoMercadoTotal;

      if (
        totalDoTipo instanceof CarteiraRendaVariavelDto &&
        ativo instanceof CarteiraRendaVariavelDto
      ) {
        totalDoTipo.dividendosRecebidos += ativo.dividendosRecebidos;
      }

      kvPair.set(ativo.tipoAtivo, totalDoTipo);

      return kvPair;
    }, initialKvPair);

    for (const total of totais.values()) {
      total.composicao = 100;
      total.composicaoTotal = toPercentRounded(
        total.precoMercadoTotal / totalCarteira,
      );
    }

    carteira.push(...Array.from(totais.values()));
  }

  calculateComposicao(
    carteira: (
      | CarteiraRendaVariavelDto
      | CarteiraRendaFixaDto
      | CarteiraCriptomoedaDto
    )[],
  ): void {
    let totalCarteira = 0;
    const total = carteira.reduce((kvPair, ativo) => {
      const totalTipo = kvPair.get(ativo.tipoAtivo) ?? 0;

      kvPair.set(ativo.tipoAtivo, totalTipo + ativo.precoMercadoTotal);
      totalCarteira += ativo.precoMercadoTotal;

      return kvPair;
    }, new Map<string, number>());

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
    const ativoNaCarteira = new CarteiraRendaVariavelDto(ativo.ticker);

    const { precoMedio, posicao } =
      this._operacoesRendaVariavelService.calcularResumoOperacoes(
        operacoes,
        ativo.ticker,
        new Date(),
      );

    ativoNaCarteira.tipoAtivo = ativo.tipo;
    ativoNaCarteira.quantidade = posicao;
    ativoNaCarteira.precoMedio = precoMedio;

    const resumoProventos =
      this._proventosRendaVariavelService.calcularResumoProventos(
        proventos.filter((p) => p.ativo.ticker === ativo.ticker),
        operacoes.filter((o) => o.ativo.ticker === ativo.ticker),
        new Date(),
        TipoPeriodo.TUDO,
      );

    ativoNaCarteira.precoMercado = ativo.cotacao || 0;
    ativoNaCarteira.dataHoraCotacao = ativo.dataHoraCotacao;
    ativoNaCarteira.dividendosRecebidos =
      resumoProventos.at(0)?.valorTotal ?? 0;
    ativoNaCarteira.dividendosRecebidosPorUnidade =
      resumoProventos.at(0)?.valorUnitario ?? 0;

    return ativoNaCarteira;
  }

  calculateAtivoRF(
    ativo: AtivoRendaFixa,
    operacoes: OperacaoRendaFixa[],
  ): CarteiraRendaFixaDto {
    const ativoNaCarteira = new CarteiraRendaFixaDto(ativo.titulo);

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
    ativoNaCarteira.dataHoraCotacao = ativo.dataHoraCotacao || new Date();

    return ativoNaCarteira;
  }

  calculateAtivoCripto(
    ativo: AtivoCriptomoeda,
    operacoes: OperacaoCriptomoeda[],
  ): CarteiraCriptomoedaDto {
    const ativoNaCarteira = new CarteiraCriptomoedaDto(ativo.codigo);

    const { precoMedio, posicao } =
      this._operacoesCriptomoedaService.calcularResumoOperacoes(
        operacoes,
        ativo.codigo,
        new Date(),
      );

    ativoNaCarteira.tipoAtivo = 'Criptomoeda';
    ativoNaCarteira.quantidade = posicao;
    ativoNaCarteira.precoMedio = precoMedio;

    ativoNaCarteira.precoMercado = ativo.cotacao || 0;
    ativoNaCarteira.dataHoraCotacao = ativo.dataHoraCotacao || new Date();

    return ativoNaCarteira;
  }
}
