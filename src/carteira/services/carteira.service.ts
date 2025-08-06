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
import { TipoPeriodo } from '../../enums/tipo-periodo.enum';
import { CarteiraCriptomoedaDto } from '../dto/carteira-criptomoeda.dto';
import { ClasseAtivo } from '../../enums/classe-ativo.enum';

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

    const cotacaoDolar =
      await this._ativosCriptomoedaService.findByCodigo('USD');

    this.calculateComposicao(carteira, cotacaoDolar.cotacao);
    this.calculateTotal(carteira, cotacaoDolar.cotacao);

    return carteira;
  }

  calculateTotal(
    carteira: (
      | CarteiraRendaVariavelDto
      | CarteiraRendaFixaDto
      | CarteiraCriptomoedaDto
    )[],
    cotacaoDolar: number,
  ) {
    const initialKvPair = new Map<
      string,
      CarteiraRendaVariavelDto | CarteiraRendaFixaDto | CarteiraCriptomoedaDto
    >([
      [ClasseAtivo.FUNDO_IMOBILIARIO, new CarteiraRendaVariavelDto('Total')],
      [ClasseAtivo.BOLSA_BRASILEIRA, new CarteiraRendaVariavelDto('Total')],
      [ClasseAtivo.BOLSA_AMERICANA, new CarteiraRendaVariavelDto('Total')],
      [ClasseAtivo.CDB, new CarteiraRendaFixaDto('Total')],
      [ClasseAtivo.TESOURO_DIRETO, new CarteiraRendaFixaDto('Total')],
      [ClasseAtivo.CRIPTOMOEDA, new CarteiraCriptomoedaDto('Total')],
    ]);

    let totalCarteira = 0;

    const totais = carteira.reduce((kvPair, ativo) => {
      const totalDaClasse = kvPair.get(ativo.classeAtivo);

      let precoTotalEmReais = ativo.precoMercadoTotal;
      if (ativo.classeAtivo === ClasseAtivo.BOLSA_AMERICANA) {
        //Calcula o preço em reais dado a cotação do dolar
        precoTotalEmReais = ativo.precoMercadoTotal * cotacaoDolar;
      }

      totalDaClasse.classeAtivo = ativo.classeAtivo;
      totalDaClasse.quantidade = 1;
      totalDaClasse.precoMedio += ativo.precoMedioTotal;
      totalDaClasse.precoMercado += ativo.precoMercadoTotal;
      totalDaClasse.dataHoraCotacao = new Date();

      totalCarteira += precoTotalEmReais;

      if (
        totalDaClasse instanceof CarteiraRendaVariavelDto &&
        ativo instanceof CarteiraRendaVariavelDto
      ) {
        totalDaClasse.dividendosRecebidos += ativo.dividendosRecebidos;
      }

      kvPair.set(ativo.classeAtivo, totalDaClasse);

      return kvPair;
    }, initialKvPair);

    for (const total of totais.values()) {
      let precoTotalEmReais = total.precoMercadoTotal;
      if (total.classeAtivo === ClasseAtivo.BOLSA_AMERICANA) {
        //Calcula o preço em reais dado a cotação do dolar
        precoTotalEmReais = total.precoMercadoTotal * cotacaoDolar;
      }

      total.composicao = 100;
      total.composicaoTotal = toPercentRounded(
        precoTotalEmReais / totalCarteira,
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
    cotacaoDolar: number,
  ): void {
    let totalCarteira = 0;
    const totalPorClasse = carteira.reduce((kvPair, ativo) => {
      const totalClasse = kvPair.get(ativo.classeAtivo) ?? 0;

      let precoTotalEmReais = ativo.precoMercadoTotal;
      if (ativo.classeAtivo === ClasseAtivo.BOLSA_AMERICANA) {
        //Calcula o preço em reais dado a cotação do dolar
        precoTotalEmReais = ativo.precoMercadoTotal * cotacaoDolar;
      }

      kvPair.set(ativo.classeAtivo, totalClasse + precoTotalEmReais);
      totalCarteira += precoTotalEmReais;

      return kvPair;
    }, new Map<string, number>());

    for (const ativo of carteira) {
      let precoTotalEmReais = ativo.precoMercadoTotal;
      if (ativo.classeAtivo === ClasseAtivo.BOLSA_AMERICANA) {
        //Calcula o preço em reais dado a cotação do dolar
        precoTotalEmReais = ativo.precoMercadoTotal * cotacaoDolar;
      }

      ativo.composicao = toPercentRounded(
        precoTotalEmReais / totalPorClasse.get(ativo.classeAtivo),
      );
      ativo.composicaoTotal = toPercentRounded(
        precoTotalEmReais / totalCarteira,
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
    ativoNaCarteira.classeAtivo = ativo.classe;
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
    ativoNaCarteira.classeAtivo = ativo.classe;
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
    ativoNaCarteira.classeAtivo = ativo.classe;
    ativoNaCarteira.quantidade = posicao;
    ativoNaCarteira.precoMedio = precoMedio;

    ativoNaCarteira.precoMercado = ativo.cotacao || 0;
    ativoNaCarteira.dataHoraCotacao = ativo.dataHoraCotacao || new Date();

    return ativoNaCarteira;
  }
}
