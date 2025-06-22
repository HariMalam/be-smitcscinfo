import { Transform } from 'class-transformer';
import { IsOptional, IsPositive } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @IsPositive()
  @Transform(({ value }) => parseInt(String(value)) || 1)
  page?: number;

  @IsOptional()
  @IsPositive()
  @Transform(({ value }) => parseInt(String(value)) || 10)
  limit?: number;
}
