import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter } from 'mongoose';
import {
  EventLog,
  EventLogDocument,
} from 'n/shared/database/schemas/event-log.schema';
import { TrackEventDto } from 'n/shared/dto/analytics.dto';
import { GetLogsDto } from './dto/get-logs.dto';
import type { ClientGrpc } from '@nestjs/microservices';
import {
  ReportGeneratorClient,
  ReportRequest,
  TimeSeriesData,
} from './grpc/report.interface';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private reportGenerator: ReportGeneratorClient;

  constructor(
    @InjectModel(EventLog.name)
    private readonly eventLogModel: Model<EventLogDocument>,
    @Inject('REPORT_PACKAGE')
    private readonly grpcCient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.reportGenerator =
      this.grpcCient.getService<ReportGeneratorClient>('ReportGenerator');
  }

  async generatePdfReport(): Promise<Uint8Array> {
    this.logger.log('Collecting data...');

    // TODO: request real data from the database or other sources
    // For now, use mock data for demonstration purposes
    const mockMetrics: TimeSeriesData[] = [
      {
        metricName: 'Search queries',
        points: [
          { timestamp: Date.now() - 3600000 * 2, value: 15 },
          { timestamp: Date.now() - 3600000 * 1, value: 42 },
          { timestamp: Date.now(), value: 30 },
        ],
      },
    ];

    const request: ReportRequest = {
      title: 'Analytics ActivityReport',
      dateRangeLabel: 'For last 24 hours',
      metrics: mockMetrics,
    };

    try {
      this.logger.log('Sending request to Go gRPC service...');
      const response = await firstValueFrom(
        this.reportGenerator.generatePdfReport(request),
      );

      if (response.errorMessage) {
        throw new Error(`Error from Report service: ${response.errorMessage}`);
      }

      this.logger.log('Report generated successfully.');
      return response.pdfContent;
    } catch (error) {
      this.logger.error('Failure during report generation', error);
      throw error;
    }
  }

  async saveLog(dto: TrackEventDto): Promise<void> {
    try {
      const newLog = new this.eventLogModel({
        eventType: dto.eventType,
        payload: dto.payload,
        timestamp: dto.timestamp || Date.now(),
      });

      await newLog.save();
      this.logger.log(`Event [${dto.eventType}] saved successfully to DB`);
    } catch (error) {
      this.logger.error(`Error saving log: ${(error as Error).message}`);
    }
  }

  async getLogs(queryDto: GetLogsDto) {
    const { eventType, startDate, endDate, page = 1, limit = 40 } = queryDto;

    const filter: QueryFilter<EventLogDocument> = {};

    if (eventType) {
      filter.eventType = eventType;
    }

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = startDate;
      if (endDate) filter.timestamp.$lte = endDate;
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.eventLogModel
        .find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.eventLogModel.countDocuments(filter).exec(),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
