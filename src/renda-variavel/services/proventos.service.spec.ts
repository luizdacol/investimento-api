import { TipoAtivo } from '../../enums/tipo-ativo.enum';
import { TipoOperacao } from '../../enums/tipo-operacao.enum';
import { TipoProvento } from '../../enums/tipo-provento';
import { Operacao } from '../entities/operacao.entity';
import { Provento } from '../entities/provento.entity';
import { ProventosService } from './proventos.service';

describe('ProventosService (Renda Variavel)', () => {
  const ativo = {
    id: 1,
    ticker: 'TEST3',
    tipo: TipoAtivo.ACAO,
    operacoes: [],
  };

  const proventosService: ProventosService = new ProventosService(
    null,
    null,
    null,
    null,
  );

  describe('calcularResumoProventos', () => {
    describe('quando houver apenas 1 provento pago', () => {
      const operacoes: Operacao[] = [];

      const proventos: Provento[] = [
        {
          id: 1,
          ativo,
          dataCom: new Date('2021-01-10'),
          dataPagamento: new Date('2021-01-15'),
          posicao: 100,
          valorBruto: 1,
          valorLiquido: 1,
          valorTotal: 100,
          tipo: TipoProvento.DIVIDENDO,
        },
      ];

      const resumoProventos = proventosService.calcularResumoProventos(
        proventos,
        operacoes,
        ativo.ticker,
      );

      it('proventosPorAcao deve ser igual ao valor unitario do provento', () => {
        expect(resumoProventos.proventosPorAcao).toBe(1);
      });
      it('proventosRecebidos deve ser igual ao valor total do provento', () => {
        expect(resumoProventos.proventosRecebidos).toBe(100);
      });
    });

    describe('quando houver mais de 1 provento pago', () => {
      const operacoes: Operacao[] = [];

      const proventos: Provento[] = [
        {
          id: 1,
          ativo,
          dataCom: new Date('2021-01-10'),
          dataPagamento: new Date('2021-01-15'),
          posicao: 100,
          valorBruto: 1,
          valorLiquido: 1,
          valorTotal: 100,
          tipo: TipoProvento.DIVIDENDO,
        },

        {
          id: 2,
          ativo,
          dataCom: new Date('2021-02-10'),
          dataPagamento: new Date('2021-02-15'),
          posicao: 100,
          valorBruto: 0.5,
          valorLiquido: 0.5,
          valorTotal: 50,
          tipo: TipoProvento.DIVIDENDO,
        },
      ];

      const resumoProventos = proventosService.calcularResumoProventos(
        proventos,
        operacoes,
        ativo.ticker,
      );

      it('proventosPorAcao deve ser igual à soma dos valores unitarios dos proventos', () => {
        expect(resumoProventos.proventosPorAcao).toBe(1.5);
      });
      it('proventosRecebidos deve ser igual à soma dos valores totais dos proventos', () => {
        expect(resumoProventos.proventosRecebidos).toBe(150);
      });
    });

    describe('quando houver desdobramento', () => {
      const operacoes: Operacao[] = [
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

      const proventos: Provento[] = [
        {
          id: 1,
          ativo,
          dataCom: new Date('2021-01-10'),
          dataPagamento: new Date('2021-01-15'),
          posicao: 100,
          valorBruto: 1,
          valorLiquido: 1,
          valorTotal: 100,
          tipo: TipoProvento.DIVIDENDO,
        },

        {
          id: 2,
          ativo,
          dataCom: new Date('2021-02-10'),
          dataPagamento: new Date('2021-02-15'),
          posicao: 100,
          valorBruto: 0.5,
          valorLiquido: 0.5,
          valorTotal: 50,
          tipo: TipoProvento.DIVIDENDO,
        },
      ];

      const resumoProventos = proventosService.calcularResumoProventos(
        proventos,
        operacoes,
        ativo.ticker,
      );

      it('proventosPorAcao deve ser igual à soma dos valores unitarios dos proventos considerando o fator de desdobramento', () => {
        expect(resumoProventos.proventosPorAcao).toBe(1);
      });
      it('proventosRecebidos deve ser igual à soma dos valores totais dos proventos', () => {
        expect(resumoProventos.proventosRecebidos).toBe(150);
      });
    });

    describe('quando for informada uma data base', () => {
      const operacoes: Operacao[] = [];

      const proventos: Provento[] = [
        {
          id: 1,
          ativo,
          dataCom: new Date('2021-01-10'),
          dataPagamento: new Date('2021-01-15'),
          posicao: 100,
          valorBruto: 1,
          valorLiquido: 1,
          valorTotal: 100,
          tipo: TipoProvento.DIVIDENDO,
        },

        {
          id: 2,
          ativo,
          dataCom: new Date('2021-02-10'),
          dataPagamento: new Date('2021-02-15'),
          posicao: 100,
          valorBruto: 0.5,
          valorLiquido: 0.5,
          valorTotal: 50,
          tipo: TipoProvento.DIVIDENDO,
        },
      ];

      const resumoProventos = proventosService.calcularResumoProventos(
        proventos,
        operacoes,
        ativo.ticker,
        new Date('2021-02-01'),
      );

      it('proventosPorAcao deve ser igual à soma dos valores unitarios dos proventos até da data base informada', () => {
        expect(resumoProventos.proventosPorAcao).toBe(1);
      });
      it('proventosRecebidos deve ser igual à soma dos valores totais dos proventos até da data base informada', () => {
        expect(resumoProventos.proventosRecebidos).toBe(100);
      });
    });
  });
});
