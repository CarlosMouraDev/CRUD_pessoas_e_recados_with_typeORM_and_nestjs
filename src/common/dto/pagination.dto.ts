import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationDto {
  @Type(() => Number)
  @Min(0)
  @Max(50)
  @IsInt()
  @IsOptional()
  limit: number;

  @Type(() => Number)
  @IsOptional()
  @Min(0)
  @IsInt()
  offset: number;
}
