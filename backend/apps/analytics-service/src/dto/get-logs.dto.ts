import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Min, Max, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class GetLogsDto {
  @ApiProperty({
    required: false,
    enum: ['SEARCH', 'POLYGON_CREATE'],
    description: 'Filter by event type',
  })
  @IsOptional()
  @IsEnum(['SEARCH', 'POLYGON_CREATE'])
  eventType?: 'SEARCH' | 'POLYGON_CREATE';

  @ApiProperty({
    required: false,
    description: 'Start timestamp (milliseconds)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  startDate?: number;

  @ApiProperty({
    required: false,
    description: 'End timestamp (milliseconds)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  endDate?: number;

  @ApiProperty({ required: false, default: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    required: false,
    default: 20,
    description: 'Items per page (max 100)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 40;
}
