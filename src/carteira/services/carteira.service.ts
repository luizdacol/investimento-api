import { Injectable } from '@nestjs/common';
import { OperacoesService as OperacoesRendaVariavelService } from 'src/renda-variavel/services/operacoes.service';
import { CarteiraRendaVariavelDto } from '../dto/carteira-renda-variavel.dto';
import { AtivosService as AtivosRendaVariavelService } from 'src/renda-variavel/services/ativos.service';
import { ProventosService as ProventosRendaVariavelService } from 'src/renda-variavel/services/proventos.service';
import { OperacoesService as OperacoesRendaFixaService } from 'src/renda-fixa/services/operacoes.service';
import { AtivosService as AtivosRendaFixaService } from 'src/renda-fixa/services/ativos.service';
import { CarteiraRendaFixaDto } from '../dto/carteira-renda-fixa.dto';
import { Ativo as AtivoRendaVariavel } from 'src/renda-variavel/entities/ativo.entity';
import { Ativo as AtivoRendaFixa } from 'src/renda-fixa/entities/ativo.entity';
import { Provento } from 'src/renda-variavel/entities/provento.entity';
import { Operacao as OperacaoRendaVariavel } from 'src/renda-variavel/entities/operacao.entity';
import { Operacao as OperacaoRendaFixa } from 'src/renda-fixa/entities/operacao.entity';
import { toPercentRounded } from 'src/utils/helper';
import { TipoAtivo } from 'src/enums/tipo-ativo.enum';

@Injectable()
export class CarteiraService {
  constructor(
    private readonly _operacoesRendaVariavelService: OperacoesRendaVariavelService,
    private readonly _ativosRendaVariavelService: AtivosRendaVariavelService,
    private readonly _proventosRendaVariavelService: ProventosRendaVariavelService,
    private readonly _operacoesRendaFixaService: OperacoesRendaFixaService,
    private readonly _ativosRendaFixaService: AtivosRendaFixaService,
  ) {}

  async calculateCarteira(dataDeCorte: Date = new Date()) {
    const [operacoesRV, ativosRV, proventosRV, operacoesRF, ativosRF] =
      await Promise.all([
        this._operacoesRendaVariavelService.findAll(),
        this._ativosRendaVariavelService.findAll({}),
        this._proventosRendaVariavelService.findAll(),
        this._operacoesRendaFixaService.findAll(),
        this._ativosRendaFixaService.findAll({}),
      ]);

    const arrayAtivos = new Array<AtivoRendaVariavel | AtivoRendaFixa>(
      ...ativosRF,
      ...ativosRV,
    );

    const carteira: (CarteiraRendaVariavelDto | CarteiraRendaFixaDto)[] = [];

    for (const ativo of arrayAtivos) {
      let ativoNaCarteira: CarteiraRendaVariavelDto | CarteiraRendaFixaDto;
      if (ativo instanceof AtivoRendaVariavel) {
        ativoNaCarteira = this.calculateAtivoRV(
          ativo,
          operacoesRV.filter((d) => d.data <= dataDeCorte),
          proventosRV.filter((d) => d.dataCom <= dataDeCorte),
        );
      } else {
        ativoNaCarteira = this.calculateAtivoRF(
          ativo,
          operacoesRF.filter((d) => d.data <= dataDeCorte),
        );
      }

      if (ativoNaCarteira.quantidade > 0) carteira.push(ativoNaCarteira);
    }

    this.calculateComposicao(carteira);
    this.calculateTotal(carteira);

    return carteira;
  }

  calculateTotal(
    carteira: (CarteiraRendaVariavelDto | CarteiraRendaFixaDto)[],
  ) {
    const initialKvPair = new Map<
      string,
      CarteiraRendaVariavelDto | CarteiraRendaFixaDto
    >([
      [TipoAtivo.FII, new CarteiraRendaVariavelDto('Total')],
      [TipoAtivo.ACAO, new CarteiraRendaVariavelDto('Total')],
      [TipoAtivo.BDR, new CarteiraRendaVariavelDto('Total')],
      [TipoAtivo.CDB, new CarteiraRendaFixaDto('Total')],
      [TipoAtivo.TESOURO_DIRETO, new CarteiraRendaFixaDto('Total')],
    ]);

    const totais = carteira.reduce((kvPair, ativo) => {
      const totalDoTipo = kvPair.get(ativo.tipoAtivo);

      totalDoTipo.tipoAtivo = ativo.tipoAtivo;
      totalDoTipo.quantidade = 1;
      totalDoTipo.precoMedio += ativo.precoMedioTotal;
      totalDoTipo.precoMercado += ativo.precoMercadoTotal;
      totalDoTipo.composicao += ativo.composicao;
      totalDoTipo.composicaoTotal += ativo.composicaoTotal;
      totalDoTipo.dataHoraCotacao = new Date();

      if (
        totalDoTipo instanceof CarteiraRendaVariavelDto &&
        ativo instanceof CarteiraRendaVariavelDto
      ) {
        totalDoTipo.dividendosRecebidos += ativo.dividendosRecebidos;
      }

      kvPair.set(ativo.tipoAtivo, totalDoTipo);

      return kvPair;
    }, initialKvPair);

    carteira.push(...Array.from(totais.values()));
  }

  calculateComposicao(
    carteira: (CarteiraRendaVariavelDto | CarteiraRendaFixaDto)[],
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
        proventos,
        operacoes,
        ativo.ticker,
        new Date(),
      );

    ativoNaCarteira.precoMercado = ativo.cotacao || 0;
    ativoNaCarteira.dataHoraCotacao = ativo.dataHoraCotacao;
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
}
