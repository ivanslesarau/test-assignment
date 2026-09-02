import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from 'n/shared/database/database.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsService } from './app.service';
import { AnalyticsController } from './app.controller';
import {
  EventLog,
  EventLogSchema,
} from 'n/shared/database/schemas/event-log.schema';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../../../../.env' }),
    DatabaseModule,
    MongooseModule.forFeature([
      { name: EventLog.name, schema: EventLogSchema },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsServiceModule {}
