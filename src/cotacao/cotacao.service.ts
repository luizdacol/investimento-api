import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RootResult } from './dto/root-result.dto';
import { QuoteInfoResponse } from './dto/quote-info-response.dto';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CotacaoService {
  private readonly _token: string;
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this._token = this.configService.get<string>('BRAPI_TOKEN');
  }

  async getQuoteInformation(quote: string): Promise<QuoteInfoResponse> {
    const { data: rootResult } = await firstValueFrom(
      this.httpService
        .get<RootResult<QuoteInfoResponse>>(
          `https://brapi.dev/api/quote/${quote}?token=${this._token}`,
        )
        .pipe(
          catchError((error: AxiosError) => {
            console.error(error.response.data);
            throw 'An error happened!';
          }),
        ),
    );

    return rootResult.results[0];
  }
}
