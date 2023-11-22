import { Expose } from 'class-transformer';
import { toPercentRounded } from 'src/utils/helper';

export class CarteiraRendaVariavelDto {
  constructor(ticker: string) {
    this.ticker = ticker;
  }

  ticker: string;
  tipoAtivo: string;
  quantidade: number = 0;
  precoMedio: number = 0;
  precoMercado: number = 0;
  composicao: number = 0;
  composicaoTotal: number = 0;
  dividendosRecebidos: number = 0;
  dividendosProvisionados: number = 0;
  dividendosRecebidosPorUnidade: number = 0;

  @Expose()
  get precoMedioTotal(): number {
    return this.precoMedio * this.quantidade;
  }

  @Expose()
  get precoMercadoTotal(): number {
    return this.precoMercado * this.quantidade;
  }

  @Expose()
  get variacao(): number {
    if (this.precoMedio === 0) return 0;

    return toPercentRounded(this.precoMercado / this.precoMedio - 1);
  }

  @Expose()
  get yieldOnCost(): number {
    if (this.precoMedio === 0) return 0;

    return toPercentRounded(
      this.dividendosRecebidosPorUnidade / this.precoMedio,
    );
  }
}
