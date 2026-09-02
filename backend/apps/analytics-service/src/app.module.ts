import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from 'n/shared/database/database.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsService } from './app.service';
import { AnalyticsController } from './app.controller';
import {
  EventLog,
  EventLogSchema,
} from 'n/shared/database/schemas/event-log.schema';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../../../../.env' }),
    DatabaseModule,
    MongooseModule.forFeature([
      { name: EventLog.name, schema: EventLogSchema },
    ]),
    ClientsModule.registerAsync([
      {
        name: 'REPORT_PACKAGE',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'report',
            protoPath: join(__dirname, '../../../../shared/proto/report.proto'),
            url: configService.get<string>(
              'REPORT_SERVICE_URL',
              'localhost:50051',
            ),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsServiceModule {}
