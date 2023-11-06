import { Expose } from 'class-transformer';

export class CarteiraRendaVariavelDto {
  ticker: string;
  quantidade: number;
  precoMedio: number;
  precoMercado: number;
  composicao: number;
  composicaoTotal: number;
  dividendosRecebidos: number;
  yieldOnCost: number;
  dividendosProvisionados: number;

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
    return Math.round((this.precoMercado / this.precoMedio - 1) * 10000) / 100;
  }
}
