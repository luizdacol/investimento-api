export interface TesouroDiretoResponseV2Dto {
  bonds: TesouroBondV2[];
}

export interface TesouroBondV2 {
  name: string;
  investable: boolean;
  annual_investment_rate: string;
  unitary_investment_value: number;
  minimum_investment_amount: number;
  annual_redemption_rate: string;
  unitary_redemption_value: number;
  maturity: string;
}
