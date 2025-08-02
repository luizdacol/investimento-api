export class LucrosPrejuizosDto {
  classeAtivo: string;
  saldoParaCompensar: number;
  balancoMensal: {
    id: number;
    data: Date;
    lucro: number;
    prejuizo: number;
    prejuizoCompensado: number;
  }[];
}
