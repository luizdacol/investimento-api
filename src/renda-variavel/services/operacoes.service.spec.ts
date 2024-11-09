import { OperacoesService } from './operacoes.service';
import { Operacao } from '../entities/operacao.entity';
import { TipoAtivo } from '../../enums/tipo-ativo.enum';
import { TipoOperacao } from '../../enums/tipo-operacao.enum';

describe('OperacoesService (Renda Variavel)', () => {
  const ativo = {
    id: 1,
    ticker: 'TEST3',
    tipo: TipoAtivo.ACAO,
    operacoes: [],
  };

  const operacoesService: OperacoesService = new OperacoesService(null, null);

  describe('calcularResumoOperacoes', () => {
    describe('quando houver apenas 1 compra', () => {
      const operacoes: Operacao[] = [
        {
          ativo,
          data: new Date('2021-01-01'),
          id: 1,
          precoUnitario: 10,
          quantidade: 100,
          precoTotal: 1000,
          tipo: TipoOperacao.COMPRA,
        },
      ];
      const resumoOperacao = operacoesService.calcularResumoOperacoes(
        operacoes,
        ativo.ticker,
      );

      it('posicao deve ser igual à quantidade da compra', () => {
        expect(resumoOperacao.posicao).toBe(100);
      });
      it('preco total deve ser igual ao preco total da compra', () => {
        expect(resumoOperacao.precoTotal).toBe(1000);
      });
      it('preco medio deve ser o preco total dividido pela posicao', () => {
        expect(resumoOperacao.precoMedio).toBe(10);
      });
    });

    describe('quando houver mais de 1 compra', () => {
      const operacoes: Operacao[] = [
        {
          ativo,
          data: new Date('2021-01-01'),
          id: 1,
          precoUnitario: 10,
          quantidade: 100,
          precoTotal: 1000,
          tipo: TipoOperacao.COMPRA,
        },
        {
          ativo,
          data: new Date('2021-02-01'),
          id: 1,
          precoUnitario: 12,
          quantidade: 100,
          precoTotal: 1200,
          tipo: TipoOperacao.COMPRA,
        },
      ];
      const resumoOperacao = operacoesService.calcularResumoOperacoes(
        operacoes,
        ativo.ticker,
      );

      it('posicao deve ser a soma das quantidades de todas as compras', () => {
        expect(resumoOperacao.posicao).toBe(200);
      });
      it('preco total deve ser a soma do preco total de todas as compras', () => {
        expect(resumoOperacao.precoTotal).toBe(2200);
      });
      it('preco medio deve ser o preco total dividido pela posicao', () => {
        expect(resumoOperacao.precoMedio).toBe(11);
      });
    });

    describe('quando houver bonificação', () => {
      const operacoes: Operacao[] = [
        {
          ativo,
          data: new Date('2021-01-01'),
          id: 1,
          precoUnitario: 10,
          quantidade: 100,
          precoTotal: 1000,
          tipo: TipoOperacao.COMPRA,
        },
        {
          ativo,
          data: new Date('2021-02-01'),
          id: 1,
          precoUnitario: 12,
          quantidade: 100,
          precoTotal: 1200,
          tipo: TipoOperacao.BONIFICACAO,
        },
      ];
      const resumoOperacao = operacoesService.calcularResumoOperacoes(
        operacoes,
        ativo.ticker,
      );

      it('posicao deve ser a soma da quantidades atual mais a quantidade da bonificação', () => {
        expect(resumoOperacao.posicao).toBe(200);
      });
      it('preco total deve ser a soma do preco total atual mais o preço total da bonificação', () => {
        expect(resumoOperacao.precoTotal).toBe(2200);
      });
      it('preco medio deve ser o preco total dividido pela posicao', () => {
        expect(resumoOperacao.precoMedio).toBe(11);
      });
    });

    describe('quando houver desdobramentos', () => {
      const operacoes: Operacao[] = [
        {
          ativo,
          data: new Date('2021-01-01'),
          id: 1,
          precoUnitario: 10,
          quantidade: 100,
          precoTotal: 1000,
          tipo: TipoOperacao.COMPRA,
        },
        {
          ativo,
          data: new Date('2021-02-01'),
          id: 1,
          precoUnitario: 0,
          quantidade: 2,
          precoTotal: 0,
          tipo: TipoOperacao.DESDOBRAMENTO,
        },
      ];
      const resumoOperacao = operacoesService.calcularResumoOperacoes(
        operacoes,
        ativo.ticker,
      );

      it('posicao deve ser a quantidade atual vezes o fator do desdobramento', () => {
        expect(resumoOperacao.posicao).toBe(200);
      });
      it('preco total deve se manter o mesmo', () => {
        expect(resumoOperacao.precoTotal).toBe(1000);
      });
      it('preco medio deve ser o preco total dividido pela posicao', () => {
        expect(resumoOperacao.precoMedio).toBe(5);
      });
    });

    describe('quando houver amortizacoes', () => {
      const operacoes: Operacao[] = [
        {
          ativo,
          data: new Date('2021-01-01'),
          id: 1,
          precoUnitario: 10,
          quantidade: 100,
          precoTotal: 1000,
          tipo: TipoOperacao.COMPRA,
        },
        {
          ativo,
          data: new Date('2021-02-01'),
          id: 1,
          precoUnitario: 1,
          quantidade: 100,
          precoTotal: 100,
          tipo: TipoOperacao.AMORTIZACAO,
        },
      ];
      const resumoOperacao = operacoesService.calcularResumoOperacoes(
        operacoes,
        ativo.ticker,
      );

      it('posicao deve se manter a mesma', () => {
        expect(resumoOperacao.posicao).toBe(100);
      });
      it('preco total deve ser o preco total atual menos o preco total da amortizacao', () => {
        expect(resumoOperacao.precoTotal).toBe(900);
      });
      it('preco medio deve ser o preco total dividido pela posicao', () => {
        expect(resumoOperacao.precoMedio).toBe(9);
      });
    });

    describe('quando houver vendas', () => {
      const operacoes: Operacao[] = [
        {
          ativo,
          data: new Date('2021-01-01'),
          id: 1,
          precoUnitario: 10,
          quantidade: 100,
          precoTotal: 1000,
          tipo: TipoOperacao.COMPRA,
        },
        {
          ativo,
          data: new Date('2021-02-01'),
          id: 1,
          precoUnitario: 12,
          quantidade: 50,
          precoTotal: 600,
          tipo: TipoOperacao.VENDA,
        },
      ];
      const resumoOperacao = operacoesService.calcularResumoOperacoes(
        operacoes,
        ativo.ticker,
      );

      it('posicao deve ser a quantidade atual menos a quantidade da venda', () => {
        expect(resumoOperacao.posicao).toBe(50);
      });
      it('preco total deve ser a posicao vezes o preco medio', () => {
        expect(resumoOperacao.precoTotal).toBe(500);
      });
      it('preco medio deve se manter o mesmo', () => {
        expect(resumoOperacao.precoMedio).toBe(10);
      });
    });

    describe('quando for informada uma data base', () => {
      const operacoes: Operacao[] = [
        {
          ativo,
          data: new Date('2021-01-01'),
          id: 1,
          precoUnitario: 10,
          quantidade: 100,
          precoTotal: 1000,
          tipo: TipoOperacao.COMPRA,
        },
        {
          ativo,
          data: new Date('2021-02-01'),
          id: 1,
          precoUnitario: 12,
          quantidade: 100,
          precoTotal: 1200,
          tipo: TipoOperacao.COMPRA,
        },
      ];
      const resumoOperacao = operacoesService.calcularResumoOperacoes(
        operacoes,
        ativo.ticker,
        new Date('2021-01-10'),
      );

      it('posicao deve considerar tudo antes da data base informada', () => {
        expect(resumoOperacao.posicao).toBe(100);
      });
      it('preco total deve considerar tudo antes da data base informada', () => {
        expect(resumoOperacao.precoTotal).toBe(1000);
      });
      it('preco medio deve considerar tudo antes da data base informada', () => {
        expect(resumoOperacao.precoMedio).toBe(10);
      });
    });
  });
});
