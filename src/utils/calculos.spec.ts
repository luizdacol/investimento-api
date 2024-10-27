import { Operacao } from '../renda-variavel/entities/operacao.entity';
import { calcularFatorDesdobramentoPorData } from './calculos';
import { TipoAtivo } from '../enums/tipo-ativo.enum';
import { TipoOperacao } from '../enums/tipo-operacao.enum';

describe('calculos.spec.ts', () => {
  const ativo = {
    id: 1,
    ticker: 'TEST3',
    tipo: TipoAtivo.ACAO,
    operacoes: [],
  };

  describe('calcularFatorDesdobramentoPorData', () => {
    describe('quando não for passado nenhuma data', () => {
      it('deve retornar um mapa vazio', () => {
        const resultado = calcularFatorDesdobramentoPorData([], []);

        expect(resultado.size).toBe(0);
      });
    });

    describe('quando não houver desdobramento', () => {
      it('deve retornar fator de desdobramento neutro para cada data', () => {
        const fatorEsperado = 1;
        const primeiraData = '2020-01-01T00:00:00.000Z';
        const segundaData = '2021-01-01T00:00:00.000Z';
        const datasBase = [new Date(primeiraData), new Date(segundaData)];
        const resultado = calcularFatorDesdobramentoPorData(datasBase, []);

        expect(resultado.get(primeiraData)).toBe(fatorEsperado);
        expect(resultado.get(segundaData)).toBe(fatorEsperado);
      });
    });

    describe('quando houver 1 desdobramento entre duas datas', () => {
      let fatorDesdobramentoPorData: Map<string, number>;
      const primeiraData = '2020-01-01T00:00:00.000Z';
      const segundaData = '2021-01-01T00:00:00.000Z';

      beforeAll(() => {
        const operacoes: Operacao[] = [
          {
            ativo,
            data: new Date('2020-12-01'),
            id: 1,
            precoUnitario: 0,
            quantidade: 2, // fator de desdobramento
            precoTotal: 0,
            tipo: TipoOperacao.DESDOBRAMENTO,
          },
        ];
        const datasBase = [new Date(primeiraData), new Date(segundaData)];
        fatorDesdobramentoPorData = calcularFatorDesdobramentoPorData(
          datasBase,
          operacoes,
        );
      });

      it('deve retornar o fator de desdobramento para a primeira data', () => {
        const fatorEsperado = 2;
        expect(fatorDesdobramentoPorData.get(primeiraData)).toBe(fatorEsperado);
      });

      it('deve retornar fator de desdobramento neutro para a segunda data', () => {
        const fatorEsperado = 1;
        expect(fatorDesdobramentoPorData.get(segundaData)).toBe(fatorEsperado);
      });
    });

    describe('quando houver mais de um desdobramento entre duas datas', () => {
      let fatorDesdobramentoPorData: Map<string, number>;
      const primeiraData = '2020-01-01T00:00:00.000Z';
      const segundaData = '2021-01-01T00:00:00.000Z';

      beforeAll(() => {
        const operacoes: Operacao[] = [
          {
            ativo,
            data: new Date('2020-11-01'),
            id: 1,
            precoUnitario: 0,
            quantidade: 3, // fator de desdobramento
            precoTotal: 0,
            tipo: TipoOperacao.DESDOBRAMENTO,
          },
          {
            ativo,
            data: new Date('2020-12-01'),
            id: 2,
            precoUnitario: 0,
            quantidade: 2, // fator de desdobramento
            precoTotal: 0,
            tipo: TipoOperacao.DESDOBRAMENTO,
          },
        ];
        const datasBase = [new Date(primeiraData), new Date(segundaData)];
        fatorDesdobramentoPorData = calcularFatorDesdobramentoPorData(
          datasBase,
          operacoes,
        );
      });

      it('deve retornar o produto dos fatores de desdobramento para a primeira data', () => {
        const fatorEsperado = 6;
        expect(fatorDesdobramentoPorData.get(primeiraData)).toBe(fatorEsperado);
      });

      it('deve retornar fator de desdobramento neutro para a segunda data', () => {
        const fatorEsperado = 1;
        expect(fatorDesdobramentoPorData.get(segundaData)).toBe(fatorEsperado);
      });
    });

    describe('quando houver mais de um desdobramento entre duas datas e uma data entre esses desdobramentos', () => {
      let fatorDesdobramentoPorData: Map<string, number>;
      const primeiraData = '2020-01-01T00:00:00.000Z';
      const segundaData = '2020-11-22T00:00:00.000Z';
      const terceiraData = '2021-01-01T00:00:00.000Z';

      beforeAll(() => {
        const operacoes: Operacao[] = [
          {
            ativo,
            data: new Date('2020-11-01'),
            id: 1,
            precoUnitario: 0,
            quantidade: 3, // fator de desdobramento
            precoTotal: 0,
            tipo: TipoOperacao.DESDOBRAMENTO,
          },
          {
            ativo,
            data: new Date('2020-12-01'),
            id: 2,
            precoUnitario: 0,
            quantidade: 2, // fator de desdobramento
            precoTotal: 0,
            tipo: TipoOperacao.DESDOBRAMENTO,
          },
        ];
        const datasBase = [
          new Date(primeiraData),
          new Date(segundaData),
          new Date(terceiraData),
        ];
        fatorDesdobramentoPorData = calcularFatorDesdobramentoPorData(
          datasBase,
          operacoes,
        );
      });

      it('deve retornar o produto dos fatores de desdobramento para a primeira data', () => {
        const fatorEsperado = 6;
        expect(fatorDesdobramentoPorData.get(primeiraData)).toBe(fatorEsperado);
      });

      it('deve retornar o fator do segundo desdobramento para a segunda data', () => {
        const fatorEsperado = 2;
        expect(fatorDesdobramentoPorData.get(segundaData)).toBe(fatorEsperado);
      });

      it('deve retornar fator de desdobramento neutro para a terceira data', () => {
        const fatorEsperado = 1;
        expect(fatorDesdobramentoPorData.get(terceiraData)).toBe(fatorEsperado);
      });
    });
  });
});
