import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RootResult } from './dto/root-result.dto';
import { QuoteInfoResponse } from './dto/quote-info-response.dto';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class CotacaoService {
  constructor(private readonly httpService: HttpService) {}

  async getQuoteInformation(quote: string): Promise<QuoteInfoResponse> {
    const token = '1c2koveY28Arb28baoyrpJ';

    const { data: rootResult } = await firstValueFrom(
      this.httpService
        .get<RootResult<QuoteInfoResponse>>(
          `https://brapi.dev/api/quote/${quote}?token=${token}`,
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
