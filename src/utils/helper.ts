export function toPercentRounded(valor: number) {
  return Math.round(valor * 10000) / 100;
}

export function toRounded(valor: number, casasDecimais: number = 2): number {
  return Number(valor.toFixed(casasDecimais));
}
