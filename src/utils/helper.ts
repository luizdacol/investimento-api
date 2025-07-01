import { FindOptionsWhere, FindOperator, In, Equal, Between } from 'typeorm';
import { TipoPeriodo } from '../enums/tipo-periodo.enum';

export function toPercentRounded(valor: number) {
  return Math.round(valor * 10000) / 100;
}

export function toRounded(valor: number, casasDecimais: number = 2): number {
  return Number(valor.toFixed(casasDecimais));
}

export function getUltimoDiaPorPeriodo(data: Date, periodo: TipoPeriodo): Date {
  if (periodo === TipoPeriodo.ANUAL) {
    return new Date(data.getUTCFullYear(), 11, 31);
  } else if (periodo === TipoPeriodo.MENSAL) {
    return new Date(data.getUTCFullYear(), data.getUTCMonth() + 1, 0);
  } else {
    return undefined;
  }
}

export function parseFilterBy(filterBy?: string[]): FindOptionsWhere<any> {
  if (!filterBy) return null;

  const filter: FindOptionsWhere<any> = {};

  for (const param of filterBy) {
    const [field, operator, value] = param.split('|');
    const findOperator = mapFindOperator(operator, value);

    const [entityName, entityValue] = parseFieldAndValue(field, findOperator);

    filter[entityName] = entityValue;
  }

  return filter;
}

export function parseSortBy(sortBy?: string[]) {
  if (!sortBy) return null;

  const sortByParsed = {};

  for (const param of sortBy) {
    const [field, order] = param.split('|');
    const [entityName, entityValue] = parseFieldAndValue(field, order);

    sortByParsed[entityName] = entityValue;
  }
  return sortByParsed;
}

function mapFindOperator(operator: string, value: string) {
  let findOperator: FindOperator<any>;
  if (operator === 'in') {
    findOperator = In(value.split(','));
  } else if (operator === 'between') {
    findOperator = parseBetweenOperator(value);
  } else if (operator === 'equals') {
    if (!isNaN(new Date(value).valueOf())) {
      findOperator = Equal(new Date(value));
    } else {
      findOperator = Equal(value);
    }
  } else {
    throw new Error('Operador não implementado');
  }

  return findOperator;
}

function parseBetweenOperator(value: string): FindOperator<any> {
  const [from, to] = value.split(',');

  let fromDate = new Date(from);
  let toDate = new Date(to);
  if (isNaN(fromDate.valueOf()) && isNaN(toDate.valueOf())) {
    return Between(from, to);
  }

  fromDate = isNaN(fromDate.valueOf())
    ? new Date('2021-08-01T00:00:00.000Z')
    : fromDate;
  toDate = isNaN(toDate.valueOf()) ? new Date() : toDate;

  return Between(fromDate, toDate);
}

function parseFieldAndValue(field: string, value: any): any {
  const [fieldFirstLevel, fieldSecondLevel] = field.split('.');
  let parsedValue = value;

  if (fieldSecondLevel) {
    parsedValue = {};
    parsedValue[fieldSecondLevel] = value;
  }

  return [fieldFirstLevel, parsedValue];
}
