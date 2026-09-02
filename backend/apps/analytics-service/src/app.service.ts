import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter } from 'mongoose';
import {
  EventLog,
  EventLogDocument,
} from 'n/shared/database/schemas/event-log.schema';
import { TrackEventDto } from 'n/shared/dto/analytics.dto';
import { GetLogsDto } from './dto/get-logs.dto';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectModel(EventLog.name)
    private readonly eventLogModel: Model<EventLogDocument>,
  ) {}

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
