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
      let findOperator: FindOperator<any>;

      if (operator === 'in') {
        findOperator = In(value.split(','));
      } else if (operator === 'between') {
        const [from, to] = value.split(',');
        if (
          !isNaN(new Date(from).valueOf()) &&
          !isNaN(new Date(to).valueOf())
        ) {
          findOperator = Between(new Date(from), new Date(to));
        } else {
          findOperator = Between(from, to);
        }
      } else if (operator === '=') {
        if (!isNaN(new Date(value).valueOf())) {
          findOperator = Equal(new Date(value));
        } else {
          findOperator = Equal(value);
        }
      }

      const [entityName, entityValue] = this.parseFieldAndValue(
        field,
        findOperator,
      );

      filter[entityName] = entityValue;
    }

    return filter;
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

  parseSortBy() {
    if (!this.sortBy) return null;

    const sortByParsed = {};

    for (const param of this.sortBy) {
      const [field, order] = param.split('|');

      if (field.indexOf('.') === -1) {
        sortByParsed[field] = order;
      } else {
        const entity = {};
        const [entityName, entityField] = field.split('.');
        entity[entityField] = order;

        sortByParsed[entityName] = entity;
      }
    }
    return sortByParsed;
  }
}
