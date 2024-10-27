import { TipoOperacao } from '../enums/tipo-operacao.enum';
import { Operacao } from '../renda-variavel/entities/operacao.entity';

export function calcularFatorDesdobramentoPorData(
  datasBase: Date[],
  operacoes: Operacao[],
): Map<string, number> {
  const desdobramentos = operacoes.filter(
    (a) => a.tipo === TipoOperacao.DESDOBRAMENTO,
  );

  // Busca todos os desdobramentos que aconteceram depois da dataBase
  // E multiplica o fator de desdobramento de todas elas (op.quantidade), iniciando com o fator neutro (fator = 1)
  const fatorDesdobramentoPorData: [string, number][] = datasBase.map(
    (dataBase) => {
      const fatorDesdobramento = desdobramentos
        .filter((d) => d.data >= dataBase)
        .reduce<number>((fator, op) => fator * op.quantidade, 1);

      return [dataBase.toISOString(), fatorDesdobramento];
    },
  );

  return new Map(fatorDesdobramentoPorData);
}
