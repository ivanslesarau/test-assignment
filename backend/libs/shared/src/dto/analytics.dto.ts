import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsObject,
  IsOptional,
  IsNumber,
  IsString,
} from 'class-validator';

export class SearchEventPayload {
  @ApiProperty({ description: 'Search query string' })
  @IsString()
  query: string;
}

export class PolygonEventPayload {
  @ApiProperty({ description: 'Character ID' })
  @IsNumber()
  characterId: number;

  @ApiProperty({ description: 'Quantity of points in the polygon' })
  @IsNumber()
  pointsCount: number;
}

export class TrackEventDto {
  @ApiProperty({
    enum: ['SEARCH', 'POLYGON_CREATE'],
    description: 'Event type',
  })
  @IsEnum(['SEARCH', 'POLYGON_CREATE'])
  eventType: 'SEARCH' | 'POLYGON_CREATE';

  @ApiProperty({ description: 'Event payload' })
  @IsObject()
  payload: SearchEventPayload | PolygonEventPayload;

  @ApiProperty({ description: 'Timestamp of the event', required: false })
  @IsOptional()
  @IsNumber()
  timestamp?: number;
}
