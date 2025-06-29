import { Transform } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

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
