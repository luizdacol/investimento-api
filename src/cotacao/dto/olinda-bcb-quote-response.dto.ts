export interface OlindaBcbQuoteResponseDto {
  value: QuoteInformation[];
}

export interface QuoteInformation {
  cotacaoCompra: number;
  cotacaoVenda: number;
  dataHoraCotacao: string;
}
