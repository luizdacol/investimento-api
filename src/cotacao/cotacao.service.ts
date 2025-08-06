import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RootResultDto } from './dto/root-result.dto';
import { QuoteInfoResponseDto } from './dto/quote-info-response.dto';
import { catchError, firstValueFrom, of } from 'rxjs';
import { AxiosError } from 'axios';
import { ConfigService } from '@nestjs/config';
import {
  TesouroDiretoResponseDto,
  TreasureBondTradeList,
} from './dto/tesouro-direto-response.dto';
import { CriptoResponseDto } from './dto/cripto-response.dto';
import { AlphaQuoteInfoResponseDto } from './dto/alpha-quote-info-response.dto';
import { CotacaoRendaVariavelDto } from './dto/quote-response.dto';
import { ClasseAtivo } from '../enums/classe-ativo.enum';
import { OlindaBcbQuoteResponseDto } from './dto/olinda-bcb-quote-response.dto';

@Injectable()
export class CotacaoService {
  private readonly _brapiToken: string;
  private readonly _alphaToken: string;
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this._brapiToken = this.configService.get<string>('BRAPI_TOKEN');
    this._alphaToken = this.configService.get<string>('ALPHA_TOKEN');
  }

  async getQuoteInformation(
    quote: string,
    classeAtivo: ClasseAtivo,
  ): Promise<CotacaoRendaVariavelDto> {
    if (classeAtivo === ClasseAtivo.BOLSA_AMERICANA) {
      return this.getQuoteFromUSA(quote);
    } else {
      return this.getQuoteFromB3(quote);
    }
  }

  async getQuoteFromB3(quote: string): Promise<CotacaoRendaVariavelDto> {
    const { data: rootResult } = await firstValueFrom(
      this.httpService
        .get<RootResultDto<QuoteInfoResponseDto>>(
          `https://brapi.dev/api/quote/${quote}?token=${this._brapiToken}`,
        )
        .pipe(
          catchError((error: AxiosError) => {
            console.error(error.response.data);
            return of({ data: { results: [] } });
          }),
        ),
    );

    if (rootResult.results.length === 0) return undefined;

    const cotacao = new CotacaoRendaVariavelDto(
      rootResult.results[0].symbol,
      rootResult.results[0].regularMarketPrice,
      new Date(rootResult.results[0].regularMarketTime),
    );

    return cotacao;
  }

  async getQuoteFromUSA(quote: string): Promise<CotacaoRendaVariavelDto> {
    const { data } = await firstValueFrom(
      this.httpService
        .get<AlphaQuoteInfoResponseDto>(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${quote}&apikey=${this._alphaToken}`,
        )
        .pipe(
          catchError((error: AxiosError) => {
            console.error(error.response.data);
            return of({ data: { 'Global Quote': undefined } });
          }),
        ),
    );

    if (!data['Global Quote']) return undefined;

    const cotacao = new CotacaoRendaVariavelDto(
      data['Global Quote']['01. symbol'],
      +data['Global Quote']['05. price'],
      new Date(
        data['Global Quote']['07. latest trading day'] + 'T21:00:00.000Z',
      ),
    );

    return cotacao;
  }

  async getQuoteDollar(): Promise<CotacaoRendaVariavelDto> {
    const dataHojeFormatada = new Date()
      .toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      })
      .replace(/\//g, '-');

    const { data } = await firstValueFrom(
      this.httpService
        .get<OlindaBcbQuoteResponseDto>(
          `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarDia(dataCotacao=@dataCotacao)?@dataCotacao='${dataHojeFormatada}'&$format=json`,
        )
        .pipe(
          catchError((error: AxiosError) => {
            console.error(error.response.data);
            return of({ data: { value: [] } });
          }),
        ),
    );

    if (data.value.length === 0) return undefined;

    const cotacao = new CotacaoRendaVariavelDto(
      'USD',
      data.value[0].cotacaoCompra,
      new Date(data.value[0].dataHoraCotacao),
    );

    return cotacao;
  }

  async getTesouroInformation(): Promise<TreasureBondTradeList[]> {
    const { data: tesouroDiretoJson } = await firstValueFrom(
      this.httpService
        .get<TesouroDiretoResponseDto>('https://api.radaropcoes.com/bonds.json')
        .pipe(
          catchError((error: AxiosError) => {
            console.error(error.response.data);
            throw 'An error happened!';
          }),
        ),
    );

    return tesouroDiretoJson.response.TrsrBdTradgList;
  }

  //Método preparado para buscar apenas a cotação de BTC
  async getCriptoInformation(): Promise<CotacaoRendaVariavelDto> {
    const { data } = await firstValueFrom(
      this.httpService
        .get<CriptoResponseDto>(
          'https://cointradermonitor.com/api/pbb/v1/ticker',
        )
        .pipe(
          catchError((error: AxiosError) => {
            console.error(error.response.data);
            throw 'An error happened!';
          }),
        ),
    );

    const cotacao = new CotacaoRendaVariavelDto(
      'BTC',
      data.last,
      new Date(data.time),
    );

    return cotacao;
  }
}
