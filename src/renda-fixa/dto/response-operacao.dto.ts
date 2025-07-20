import { Operacao } from '../entities/operacao.entity';

export class ResponseOperacao {
  id: number;
  data: Date;
  titulo: string;
  quantidade: number;
  precoUnitario: number;
  precoTotal: number;
  rentabilidade: string;
  tipoAtivo: string;
  tipoOperacao: string;

  public static fromDomain(operacao: Operacao): ResponseOperacao {
    return {
      id: operacao.id,
      data: new Date(operacao.data),
      titulo: operacao.ativo.titulo,
      quantidade: operacao.quantidade,
      precoUnitario: operacao.precoUnitario,
      precoTotal: operacao.precoTotal,
      rentabilidade: operacao.rentabilidade,
      tipoAtivo: operacao.ativo.tipo,
      tipoOperacao: operacao.tipo,
    } as ResponseOperacao;
  }
}
