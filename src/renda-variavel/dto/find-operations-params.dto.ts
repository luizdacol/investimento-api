import { Transform } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';
import { Between, Equal, FindOperator, FindOptionsWhere, In } from 'typeorm';

export class FindOperationsParamsDto {
  @Transform((p) => Number(p.value))
  @IsOptional()
  @IsNumber()
  skip?: number;

  @Transform((p) => Number(p.value))
  @IsOptional()
  @IsNumber()
  take?: number;

  @IsOptional()
  sortBy?: string[];

  @IsOptional()
  filterBy?: string[];

  parseFilterBy(): FindOptionsWhere<any> {
    if (!this.filterBy) return null;

    const filter: FindOptionsWhere<any> = {};

    for (const param of this.filterBy) {
      const [field, operator, value] = param.split('|');
      const findOperator = this.mapFindOperator(operator, value);

      const [entityName, entityValue] = this.parseFieldAndValue(
        field,
        findOperator,
      );

      filter[entityName] = entityValue;
    }

    return filter;
  }

  parseSortBy() {
    if (!this.sortBy) return null;

    const sortByParsed = {};

    for (const param of this.sortBy) {
      const [field, order] = param.split('|');
      const [entityName, entityValue] = this.parseFieldAndValue(field, order);

      sortByParsed[entityName] = entityValue;
    }
    return sortByParsed;
  }

  mapFindOperator(operator: string, value: string) {
    let findOperator: FindOperator<any>;
    if (operator === 'in') {
      findOperator = In(value.split(','));
    } else if (operator === 'between') {
      findOperator = this.parseBetweenOperator(value);
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

  parseBetweenOperator(value: string): FindOperator<any> {
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

  parseFieldAndValue(field: string, value: any): any {
    const [fieldFirstLevel, fieldSecondLevel] = field.split('.');
    let parsedValue = value;

    if (fieldSecondLevel) {
      parsedValue = {};
      parsedValue[fieldSecondLevel] = value;
    }

    return [fieldFirstLevel, parsedValue];
  }
}
