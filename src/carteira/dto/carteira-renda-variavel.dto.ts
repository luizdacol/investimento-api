import { Expose } from 'class-transformer';
import { toPercentRounded } from 'src/utils/helper';

export class CarteiraRendaVariavelDto {
  ticker: string;
  tipoAtivo: string;
  quantidade: number;
  precoMedio: number;
  precoMercado: number;
  composicao: number;
  composicaoTotal: number;
  dividendosRecebidos: number;
  dividendosProvisionados: number;
  dividendosRecebidosPorUnidade: number;

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
