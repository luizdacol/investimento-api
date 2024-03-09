export class ProventoComposicaoChartDto {
  labels: string[];
  data: number[];
  details: {
    ativo: string;
    total: number;
    tipo: string;
  }[];
}
