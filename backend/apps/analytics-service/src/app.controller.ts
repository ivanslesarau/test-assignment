import {
  Controller,
  Query,
  Get,
  Res,
  InternalServerErrorException,
} from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { TrackEventDto } from 'n/shared/dto/analytics.dto';
import { AnalyticsService } from './app.service';
import {
  ApiResponse,
  ApiTags,
  ApiOperation,
  ApiProduces,
} from '@nestjs/swagger';
import { GetLogsDto } from './dto/get-logs.dto';
import type { Response } from 'express';

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

  @Get('report')
  @ApiOperation({
    summary: 'Generate PDF report of analytics activity',
  })
  @ApiProduces('application/pdf')
  @ApiResponse({ status: 200, description: 'PDF report' })
  async downloadReport(@Res() res: Response) {
    try {
      const pdfBytes = await this.analyticsService.generatePdfReport();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'inline; filename="analytics_report.pdf"',
      );
      res.setHeader('Content-Length', pdfBytes.length);

      res.end(Buffer.from(pdfBytes));
    } catch (error) {
      throw new InternalServerErrorException('Error generating report');
    }
  }
}
