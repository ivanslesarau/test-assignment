import { Module } from '@nestjs/common';
import { AnalyticsServiceController } from './app.controller';
import { AnalyticsServiceService } from './app.service';

@Module({
  imports: [],
  controllers: [AnalyticsServiceController],
  providers: [AnalyticsServiceService],
})
export class AnalyticsServiceModule {}
