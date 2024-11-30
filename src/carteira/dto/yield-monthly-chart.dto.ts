export class YieldMonthlyChartDto {
  data: string;
  chaveData: Date;
  [ticker: string]: string | number | Date;
}
