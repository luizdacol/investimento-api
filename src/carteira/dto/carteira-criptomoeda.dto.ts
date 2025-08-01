import { Expose } from 'class-transformer';

export class CarteiraCriptomoedaDto {
  constructor(codigo: string) {
    this.codigo = codigo;
  }

  codigo: string;
  tipoAtivo: string;
  quantidade: number = 0;
  precoMedio: number = 0;
  precoMercado: number = 0;
  composicao: number = 0;
  composicaoTotal: number = 0;
  dataHoraCotacao: Date;

  get nome(): string {
    return this.codigo;
  }

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
