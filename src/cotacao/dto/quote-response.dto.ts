export class CotacaoRendaVariavelDto {
  constructor(nome: string, preco: number, dataHora: Date) {
    this.nome = nome;
    this.preco = preco;
    this.dataHora = dataHora;
  }

  nome: string;
  preco: number;
  dataHora: Date;
}
