import { Controller, Post, Body, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { TrackEventDto } from './dto/analytics.dto';
import { RedisTimeSeriesService } from './redis-time-series.service';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(
    @Inject('ANALYTICS_SERVICE_CLIENT')
    private readonly messageClient: ClientProxy,
    private readonly redisTsService: RedisTimeSeriesService,
  ) {}

  @Post('event')
  @ApiOperation({ summary: 'Publish event from frontend' })
  @ApiResponse({ status: 201, description: 'Event successfully published' })
  async trackEvent(@Body() dto: TrackEventDto) {
    const eventWithTimestamp = { ...dto, timestamp: Date.now() };

    this.messageClient.emit('log_event', eventWithTimestamp);

    if (dto.eventType === 'SEARCH') {
      await this.redisTsService.incrementMetric('timeseries:searches');
    } else if (dto.eventType === 'POLYGON_CREATE') {
      await this.redisTsService.incrementMetric('timeseries:polygons');
    }

    return { success: true };
  }
}
