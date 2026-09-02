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
  DataPoint,
  ReportGeneratorClient,
  ReportRequest,
  TimeSeriesData,
} from './grpc/report.interface';
import { firstValueFrom } from 'rxjs';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private reportGenerator: ReportGeneratorClient;
  private redisClient: Redis;

  constructor(
    @InjectModel(EventLog.name)
    private readonly eventLogModel: Model<EventLogDocument>,
    @Inject('REPORT_PACKAGE')
    private readonly grpcCient: ClientGrpc,
    private readonly configService: ConfigService,
  ) {
    const redisHost = this.configService.get<string>('REDIS_HOST', 'localhost');
    const redisPort = this.configService.get<number>('REDIS_PORT', 6379);

    this.redisClient = new Redis({
      host: redisHost,
      port: redisPort,
    });
  }

  onModuleInit() {
    this.reportGenerator =
      this.grpcCient.getService<ReportGeneratorClient>('ReportGenerator');
  }

  private async fetchTimeSeriesData(key: string): Promise<DataPoint[]> {
    try {
      const rawData = (await this.redisClient.call(
        'TS.RANGE',
        key,
        '-',
        '+',
        'AGGREGATION',
        'sum',
        60000,
      )) as any[];

      return rawData.map((row) => ({
        timestamp: Number(row[0]),
        value: Number(row[1]),
      }));
    } catch (error) {
      this.logger.warn(`Failed to fetch data for key ${key} (possibly empty)`);
      return [];
    }
  }

  async generatePdfReport(): Promise<Uint8Array> {
    this.logger.log('Collecting data from RedisTimeSeries...');

    const searchPoints = await this.fetchTimeSeriesData('timeseries:searches');
    const polygonPoints = await this.fetchTimeSeriesData('timeseries:polygons');

    const metrics: TimeSeriesData[] = [];

    if (searchPoints.length > 0) {
      metrics.push({ metricName: 'Searches', points: searchPoints });
    }
    if (polygonPoints.length > 0) {
      metrics.push({ metricName: 'Polygon Creation', points: polygonPoints });
    }
    console.log(metrics);

    if (metrics.length === 0) {
      metrics.push({
        metricName: 'No Data',
        points: [{ timestamp: Date.now(), value: 0 }],
      });
    }

    const request: ReportRequest = {
      title: 'Analytics Activity Report',
      dateRangeLabel: 'Based on RedisTimeSeries data',
      metrics,
    };

    try {
      this.logger.log('Sending request to Go gRPC service...');
      const response = await firstValueFrom(
        this.reportGenerator.generatePdfReport(request),
      );

      if (response.errorMessage) {
        throw new Error(response.errorMessage);
      }

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
