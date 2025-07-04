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

@Injectable()
export class CotacaoService {
  private readonly _token: string;
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this._token = this.configService.get<string>('BRAPI_TOKEN');
  }

  async getQuoteInformation(quote: string): Promise<QuoteInfoResponseDto> {
    const { data: rootResult } = await firstValueFrom(
      this.httpService
        .get<RootResultDto<QuoteInfoResponseDto>>(
          `https://brapi.dev/api/quote/${quote}?token=${this._token}`,
        )
        .pipe(
          catchError((error: AxiosError) => {
            console.error(error.response.data);
            return of({ data: { results: [] } });
          }),
        ),
    );

    return rootResult.results[0];
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

  async getCriptoInformation(): Promise<any> {
    return Promise.resolve();
  }
}
