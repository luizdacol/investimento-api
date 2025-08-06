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

    const cotacao = new CotacaoRendaVariavelDto();
    cotacao.nome = rootResult.results[0].symbol;
    cotacao.preco = rootResult.results[0].regularMarketPrice;
    cotacao.dataHora = new Date(rootResult.results[0].regularMarketTime);

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
            return of({ data: { results: [] } });
          }),
        ),
    );

    const cotacao = new CotacaoRendaVariavelDto();
    cotacao.nome = data['Global Quote']['01. symbol'];
    cotacao.dataHora = new Date(data['Global Quote']['07. latest trading day']);
    cotacao.dataHora.setHours(21);
    cotacao.preco = +data['Global Quote']['05. price'];

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
  async getCriptoInformation(): Promise<CriptoResponseDto> {
    const data = await firstValueFrom(
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

    return data.data;
  }
}
