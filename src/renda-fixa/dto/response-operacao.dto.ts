import { Operacao } from '../entities/operacao.entity';

export class ResponseOperacao {
  id: number;
  data: Date;
  titulo: string;
  quantidade: number;
  precoUnitario: number;
  precoTotal: number;
  rentabilidade: string;
  dataVencimento: Date;
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
      dataVencimento: operacao.dataVencimento,
      tipoAtivo: operacao.ativo.tipo,
      tipoOperacao: operacao.tipo,
    } as ResponseOperacao;
  }
}
