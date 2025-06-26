import { Transform } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class OperationParamsDto {
  @Transform((p) => Number(p.value))
  @IsOptional()
  @IsNumber()
  skip?: number;

  @Transform((p) => Number(p.value))
  @IsOptional()
  @IsNumber()
  take?: number;
}
