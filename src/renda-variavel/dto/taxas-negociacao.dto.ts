import { Expose } from 'class-transformer';

export class TaxasNegociacaoDto {
  data: Date;

  @Expose()
  valorTotal: number;

  @Expose()
  get emolumentos(): number {
    return Math.round(this.valorTotal * 0.00005 * 100) / 100;
  }

  @Expose()
  get taxaLiquidacao(): number {
    return Math.round(this.valorTotal * 0.00025 * 100) / 100;
  }

  @Expose()
  get total(): number {
    return Math.round((this.emolumentos + this.taxaLiquidacao) * 100) / 100;
  }
}
