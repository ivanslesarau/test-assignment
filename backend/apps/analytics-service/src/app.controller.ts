import { Controller, Query, Get } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { TrackEventDto } from 'n/shared/dto/analytics.dto';
import { AnalyticsService } from './app.service';
import { ApiResponse, ApiTags, ApiOperation } from '@nestjs/swagger';
import { GetLogsDto } from './dto/get-logs.dto';

@ApiTags('Analytics Logs')
@Controller()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @EventPattern('log_event')
  async handleLogEvent(@Payload() payload: TrackEventDto) {
    await this.analyticsService.saveLog(payload);
  }

  @Get('logs')
  @ApiOperation({
    summary: 'Get logs with filtering and pagination',
  })
  @ApiResponse({ status: 200, description: 'Success getting logs' })
  async getLogs(@Query() query: GetLogsDto) {
    return this.analyticsService.getLogs(query);
  }
}
