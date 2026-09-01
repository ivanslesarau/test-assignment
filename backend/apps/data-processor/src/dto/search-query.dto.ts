import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class SearchQueryDto {
  @ApiPropertyOptional({ description: 'Text for searching by name or species' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ description: 'Number of page', default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Elements per page',
    default: 20,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit: number = 20;
}
