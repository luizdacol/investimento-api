import { TipoPeriodo } from '../enums/tipo-periodo.enum';

export function toPercentRounded(valor: number) {
  return Math.round(valor * 10000) / 100;
}

export function toRounded(valor: number, casasDecimais: number = 2): number {
  return Number(valor.toFixed(casasDecimais));
}

export function getUltimoDiaPorPeriodo(data: Date, periodo: TipoPeriodo): Date {
  if (periodo === TipoPeriodo.ANUAL) {
    return new Date(data.getUTCFullYear(), 11, 31);
  } else if (periodo === TipoPeriodo.MENSAL) {
    return new Date(data.getUTCFullYear(), data.getUTCMonth() + 1, 0);
  } else {
    return undefined;
  }
}
