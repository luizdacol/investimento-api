import { TipoAtivo } from '../../enums/tipo-ativo.enum';
import { TipoOperacao } from '../../enums/tipo-operacao.enum';
import { TipoPeriodo } from '../../enums/tipo-periodo.enum';
import { TipoProvento } from '../../enums/tipo-provento';
import { Operacao } from '../entities/operacao.entity';
import { Provento } from '../entities/provento.entity';
import { ProventosService } from './proventos.service';
import '../../utils/tests';

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

  describe('calcularResumoProventosAux', () => {
    describe('quando o tipo de periodo for TUDO', () => {
      describe('e a data base for a data atual', () => {
        const dataBase = new Date();
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
            dataBase,
            TipoPeriodo.TUDO,
          );

          it('deve retornar apenas 1 item', () => {
            expect(resumoProventos.length).toBe(1);
          });
          it('valorUnitario deve ser igual ao valor unitario do provento', () => {
            expect(resumoProventos[0].valorUnitario).toBe(1);
          });
          it('valorTotal deve ser igual ao valor total do provento', () => {
            expect(resumoProventos[0].valorTotal).toBe(100);
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
            dataBase,
            TipoPeriodo.TUDO,
          );

          it('deve retornar apenas 1 item', () => {
            expect(resumoProventos.length).toBe(1);
          });
          it('valorUnitario deve ser igual à soma dos valores unitarios dos proventos', () => {
            expect(resumoProventos[0].valorUnitario).toBe(1.5);
          });
          it('valorTotal deve ser igual à soma dos valores totais dos proventos', () => {
            expect(resumoProventos[0].valorTotal).toBe(150);
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
            dataBase,
            TipoPeriodo.TUDO,
          );

          it('deve retornar apenas 1 item', () => {
            expect(resumoProventos.length).toBe(1);
          });
          it('valorUnitario deve ser igual à soma dos valores unitarios dos proventos considerando o fator de desdobramento', () => {
            expect(resumoProventos[0].valorUnitario).toBe(1);
          });
          it('valorTotal deve ser igual à soma dos valores totais dos proventos', () => {
            expect(resumoProventos[0].valorTotal).toBe(150);
          });
        });
      });

      describe('e a data base for uma data do passado', () => {
        const dataBase = new Date('2021-01-20');
        describe('quando houver apenas provento pago posterior à data informada', () => {
          const operacoes: Operacao[] = [];

          const proventos: Provento[] = [
            {
              id: 1,
              ativo,
              dataCom: new Date('2021-01-10'),
              dataPagamento: new Date('2021-02-15'),
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
            dataBase,
            TipoPeriodo.TUDO,
          );

          it('deve retornar apenas lista vazia', () => {
            expect(resumoProventos.length).toBe(0);
          });
        });

        describe('quando houver proventos pagos antes e depois da data informada', () => {
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
              dataCom: new Date('2021-01-11'),
              dataPagamento: new Date('2021-01-16'),
              posicao: 100,
              valorBruto: 1,
              valorLiquido: 1,
              valorTotal: 100,
              tipo: TipoProvento.DIVIDENDO,
            },
            {
              id: 3,
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
            dataBase,
            TipoPeriodo.TUDO,
          );

          it('deve retornar apenas 1 item', () => {
            expect(resumoProventos.length).toBe(1);
          });
          it('valorUnitario deve ser igual à soma dos valores unitarios dos proventos pagos antes da data informada', () => {
            expect(resumoProventos[0].valorUnitario).toBe(2);
          });
          it('valorTotal deve ser igual à soma dos valores totais dos proventos pagos antes da data informada', () => {
            expect(resumoProventos[0].valorTotal).toBe(200);
          });
        });

        describe('quando houver desdobramento antes de depois da data informada', () => {
          const operacoes: Operacao[] = [
            {
              ativo,
              data: new Date('2021-01-19'),
              id: 1,
              precoUnitario: 0,
              quantidade: 2,
              precoTotal: 0,
              tipo: TipoOperacao.DESDOBRAMENTO,
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
              dataCom: new Date('2021-01-11'),
              dataPagamento: new Date('2021-01-16'),
              posicao: 100,
              valorBruto: 1,
              valorLiquido: 1,
              valorTotal: 100,
              tipo: TipoProvento.DIVIDENDO,
            },
            {
              id: 3,
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
            dataBase,
            TipoPeriodo.TUDO,
          );

          it('deve retornar apenas 1 item', () => {
            expect(resumoProventos.length).toBe(1);
          });
          it('valorUnitario deve ser igual à soma dos valores unitarios dos proventos antes da data informada considerando o fator de desdobramento antes da data informada', () => {
            expect(resumoProventos[0].valorUnitario).toBe(1);
          });
          it('valorTotal deve ser igual à soma dos valores totais dos proventos antes da data informada', () => {
            expect(resumoProventos[0].valorTotal).toBe(200);
          });
        });
      });
    });

    describe('quando o tipo de periodo for MENSAL', () => {
      describe('e a data base for a data atual', () => {
        const dataBase = new Date();
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
            dataBase,
            TipoPeriodo.MENSAL,
          );

          it('deve retornar apenas 1 item', () => {
            expect(resumoProventos.length).toBe(1);
          });
          it('valorUnitario deve ser igual ao valor unitario do provento', () => {
            expect(resumoProventos[0].valorUnitario).toBe(1);
          });
          it('valorTotal deve ser igual ao valor total do provento', () => {
            expect(resumoProventos[0].valorTotal).toBe(100);
          });
        });

        describe('quando houver mais de 1 provento pago no mesmo mês', () => {
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
              dataCom: new Date('2021-01-11'),
              dataPagamento: new Date('2021-01-16'),
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
            dataBase,
            TipoPeriodo.MENSAL,
          );

          it('deve retornar apenas 1 item', () => {
            expect(resumoProventos.length).toBe(1);
          });
          it('valorUnitario deve ser igual à soma dos valores unitarios dos proventos', () => {
            expect(resumoProventos[0].valorUnitario).toBe(1.5);
          });
          it('valorTotal deve ser igual à soma dos valores totais dos proventos', () => {
            expect(resumoProventos[0].valorTotal).toBe(150);
          });
        });

        describe('quando houver proventos pago em meses diferentes', () => {
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
              valorBruto: 1,
              valorLiquido: 1,
              valorTotal: 100,
              tipo: TipoProvento.DIVIDENDO,
            },
            {
              id: 3,
              ativo,
              dataCom: new Date('2021-02-11'),
              dataPagamento: new Date('2021-02-16'),
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
            dataBase,
            TipoPeriodo.MENSAL,
          );

          it('deve retornar 1 item por mes', () => {
            expect(resumoProventos.length).toBe(2);
          });

          it('valorUnitario e valorTotal devem ser iguais à soma dos valores agrupados por mês', () => {
            expect(resumoProventos).toEqual(
              expect.arrayContaining([
                expect.objectContaining({
                  data: new Date('2021-01-31T03:00:00.000Z'),
                  valorUnitario: 1,
                  valorTotal: 100,
                }),
                expect.objectContaining({
                  data: new Date('2021-02-28T03:00:00.000Z'),
                  valorUnitario: 1.5,
                  valorTotal: 150,
                }),
              ]),
            );
          });
        });

        describe('quando houver desdobramento', () => {
          const operacoes: Operacao[] = [
            {
              ativo,
              data: new Date('2021-01-25'),
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
              dataCom: new Date('2021-01-26'),
              dataPagamento: new Date('2021-01-27'),
              posicao: 100,
              valorBruto: 1,
              valorLiquido: 1,
              valorTotal: 100,
              tipo: TipoProvento.DIVIDENDO,
            },
            {
              id: 3,
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
            dataBase,
            TipoPeriodo.MENSAL,
          );

          it('deve retornar 1 item por mes', () => {
            expect(resumoProventos.length).toBe(2);
          });

          it('valorUnitario e valorTotal devem ser iguais à soma dos valores, considerando o fator de desdobramento, agrupados por mês', () => {
            expect(resumoProventos).toEqual(
              expect.arrayContaining([
                expect.objectContaining({
                  data: new Date('2021-01-31T03:00:00.000Z'),
                  valorUnitario: 1.5,
                  valorTotal: 200,
                }),
                expect.objectContaining({
                  data: new Date('2021-02-28T03:00:00.000Z'),
                  valorUnitario: 0.5,
                  valorTotal: 50,
                }),
              ]),
            );
          });
        });
      });

      describe('e a data base for uma data do passado', () => {
        const dataBase = new Date('2021-01-20');
        describe('quando houver apenas provento pago posterior à data informada', () => {
          const operacoes: Operacao[] = [];

          const proventos: Provento[] = [
            {
              id: 1,
              ativo,
              dataCom: new Date('2021-01-10'),
              dataPagamento: new Date('2021-02-15'),
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
            dataBase,
            TipoPeriodo.MENSAL,
          );

          it('deve retornar apenas lista vazia', () => {
            expect(resumoProventos.length).toBe(0);
          });
        });

        describe('quando houver proventos pagos antes e depois da data informada', () => {
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
              dataCom: new Date('2021-01-11'),
              dataPagamento: new Date('2021-01-25'),
              posicao: 100,
              valorBruto: 1,
              valorLiquido: 1,
              valorTotal: 100,
              tipo: TipoProvento.DIVIDENDO,
            },
            {
              id: 3,
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
            dataBase,
            TipoPeriodo.MENSAL,
          );

          it('deve retornar 1 item para cada mes anterior à data informada', () => {
            expect(resumoProventos.length).toBe(1);
          });
          it('valorUnitario e valorTotal devem ser iguais à soma dos valores, anteriores à data informada, agrupados por mês', () => {
            expect(resumoProventos).toEqual(
              expect.arrayContaining([
                expect.objectContaining({
                  data: new Date('2021-01-31T03:00:00.000Z'),
                  valorUnitario: 1,
                  valorTotal: 100,
                }),
              ]),
            );
          });
        });

        describe('quando houver desdobramento antes de depois da data informada', () => {
          const operacoes: Operacao[] = [
            {
              ativo,
              data: new Date('2021-01-19'),
              id: 1,
              precoUnitario: 0,
              quantidade: 2,
              precoTotal: 0,
              tipo: TipoOperacao.DESDOBRAMENTO,
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
              dataCom: new Date('2021-01-11'),
              dataPagamento: new Date('2021-01-25'),
              posicao: 100,
              valorBruto: 1,
              valorLiquido: 1,
              valorTotal: 100,
              tipo: TipoProvento.DIVIDENDO,
            },
            {
              id: 3,
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
            dataBase,
            TipoPeriodo.MENSAL,
          );

          it('deve retornar 1 item para cada mes anterior à data informada', () => {
            expect(resumoProventos.length).toBe(1);
          });
          it('valorUnitario e valorTotal devem ser iguais à soma dos valores, anteriores à data informada e considerando o fator de desdobramento, agrupados por mês', () => {
            expect(resumoProventos).toEqual(
              expect.arrayContaining([
                expect.objectContaining({
                  data: new Date('2021-01-31T03:00:00.000Z'),
                  valorUnitario: 0.5,
                  valorTotal: 100,
                }),
              ]),
            );
          });
        });
      });
    });

    describe('quando o tipo de periodo for ANUAL', () => {
      describe('e a data base for a data atual', () => {
        const dataBase = new Date();
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
            dataBase,
            TipoPeriodo.ANUAL,
          );

          it('deve retornar apenas 1 item', () => {
            expect(resumoProventos.length).toBe(1);
          });
          it('valorUnitario deve ser igual ao valor unitario do provento', () => {
            expect(resumoProventos[0].valorUnitario).toBe(1);
          });
          it('valorTotal deve ser igual ao valor total do provento', () => {
            expect(resumoProventos[0].valorTotal).toBe(100);
          });
        });

        describe('quando houver mais de 1 provento pago no mesmo ano', () => {
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
              dataCom: new Date('2021-05-11'),
              dataPagamento: new Date('2021-05-16'),
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
            dataBase,
            TipoPeriodo.ANUAL,
          );

          it('deve retornar apenas 1 item', () => {
            expect(resumoProventos.length).toBe(1);
          });
          it('valorUnitario deve ser igual à soma dos valores unitarios dos proventos', () => {
            expect(resumoProventos[0].valorUnitario).toBe(1.5);
          });
          it('valorTotal deve ser igual à soma dos valores totais dos proventos', () => {
            expect(resumoProventos[0].valorTotal).toBe(150);
          });
        });

        describe('quando houver proventos pago em anos diferentes', () => {
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
              dataCom: new Date('2022-02-10'),
              dataPagamento: new Date('2022-02-15'),
              posicao: 100,
              valorBruto: 1,
              valorLiquido: 1,
              valorTotal: 100,
              tipo: TipoProvento.DIVIDENDO,
            },
            {
              id: 3,
              ativo,
              dataCom: new Date('2022-02-11'),
              dataPagamento: new Date('2022-02-16'),
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
            dataBase,
            TipoPeriodo.ANUAL,
          );

          it('deve retornar 1 item por mes', () => {
            expect(resumoProventos.length).toBe(2);
          });

          it('valorUnitario e valorTotal devem ser iguais à soma dos valores agrupados por mês', () => {
            expect(resumoProventos).toEqual(
              expect.arrayContaining([
                expect.objectContaining({
                  data: new Date('2021-12-31T03:00:00.000Z'),
                  valorUnitario: 1,
                  valorTotal: 100,
                }),
                expect.objectContaining({
                  data: new Date('2022-12-31T03:00:00.000Z'),
                  valorUnitario: 1.5,
                  valorTotal: 150,
                }),
              ]),
            );
          });
        });

        describe('quando houver desdobramento', () => {
          const operacoes: Operacao[] = [
            {
              ativo,
              data: new Date('2021-01-25'),
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
              dataCom: new Date('2021-01-26'),
              dataPagamento: new Date('2021-01-27'),
              posicao: 100,
              valorBruto: 1,
              valorLiquido: 1,
              valorTotal: 100,
              tipo: TipoProvento.DIVIDENDO,
            },
            {
              id: 3,
              ativo,
              dataCom: new Date('2022-02-10'),
              dataPagamento: new Date('2022-02-15'),
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
            dataBase,
            TipoPeriodo.ANUAL,
          );

          it('deve retornar 1 item por mes', () => {
            expect(resumoProventos.length).toBe(2);
          });

          it('valorUnitario e valorTotal devem ser iguais à soma dos valores, considerando o fator de desdobramento, agrupados por mês', () => {
            expect(resumoProventos).toEqual(
              expect.arrayContaining([
                expect.objectContaining({
                  data: new Date('2021-12-31T03:00:00.000Z'),
                  valorUnitario: 1.5,
                  valorTotal: 200,
                }),
                expect.objectContaining({
                  data: new Date('2022-12-31T03:00:00.000Z'),
                  valorUnitario: 0.5,
                  valorTotal: 50,
                }),
              ]),
            );
          });
        });
      });

      describe('e a data base for uma data do passado', () => {
        const dataBase = new Date('2021-01-20');
        describe('quando houver apenas provento pago posterior à data informada', () => {
          const operacoes: Operacao[] = [];

          const proventos: Provento[] = [
            {
              id: 1,
              ativo,
              dataCom: new Date('2022-01-10'),
              dataPagamento: new Date('2022-02-15'),
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
            dataBase,
            TipoPeriodo.ANUAL,
          );

          it('deve retornar apenas lista vazia', () => {
            expect(resumoProventos.length).toBe(0);
          });
        });

        describe('quando houver proventos pagos antes e depois da data informada', () => {
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
              dataCom: new Date('2022-01-11'),
              dataPagamento: new Date('2022-01-25'),
              posicao: 100,
              valorBruto: 1,
              valorLiquido: 1,
              valorTotal: 100,
              tipo: TipoProvento.DIVIDENDO,
            },
            {
              id: 3,
              ativo,
              dataCom: new Date('2022-02-10'),
              dataPagamento: new Date('2022-02-15'),
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
            dataBase,
            TipoPeriodo.ANUAL,
          );

          it('deve retornar 1 item para cada mes anterior à data informada', () => {
            expect(resumoProventos.length).toBe(1);
          });
          it('valorUnitario e valorTotal devem ser iguais à soma dos valores, anteriores à data informada, agrupados por mês', () => {
            expect(resumoProventos).toEqual(
              expect.arrayContaining([
                expect.objectContaining({
                  data: new Date('2021-12-31T03:00:00.000Z'),
                  valorUnitario: 1,
                  valorTotal: 100,
                }),
              ]),
            );
          });
        });

        describe('quando houver desdobramento antes de depois da data informada', () => {
          const operacoes: Operacao[] = [
            {
              ativo,
              data: new Date('2021-01-19'),
              id: 1,
              precoUnitario: 0,
              quantidade: 2,
              precoTotal: 0,
              tipo: TipoOperacao.DESDOBRAMENTO,
            },
            {
              ativo,
              data: new Date('2022-02-01'),
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
              dataCom: new Date('2021-01-11'),
              dataPagamento: new Date('2021-01-25'),
              posicao: 100,
              valorBruto: 1,
              valorLiquido: 1,
              valorTotal: 100,
              tipo: TipoProvento.DIVIDENDO,
            },
            {
              id: 3,
              ativo,
              dataCom: new Date('2022-02-10'),
              dataPagamento: new Date('2022-02-15'),
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
            dataBase,
            TipoPeriodo.ANUAL,
          );

          it('deve retornar 1 item para cada mes anterior à data informada', () => {
            expect(resumoProventos.length).toBe(1);
          });
          it('valorUnitario e valorTotal devem ser iguais à soma dos valores, anteriores à data informada e considerando o fator de desdobramento, agrupados por mês', () => {
            expect(resumoProventos).toEqual(
              expect.arrayContaining([
                expect.objectContaining({
                  data: new Date('2021-12-31T03:00:00.000Z'),
                  valorUnitario: 0.5,
                  valorTotal: 100,
                }),
              ]),
            );
          });
        });
      });
    });
  });
});
