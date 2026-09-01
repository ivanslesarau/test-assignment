import { Module } from '@nestjs/common';
import {
  Character,
  CharacterSchema,
} from 'n/shared/database/schemas/character.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from 'n/shared/database/database.module';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RedisTimeSeriesService } from './redis-time-series.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../../../../.env',
    }),
    DatabaseModule,
    MongooseModule.forFeature([
      { name: Character.name, schema: CharacterSchema },
    ]),
    HttpModule,
    ClientsModule.register([
      {
        name: 'ANALYTICS_SERVICE_CLIENT',
        transport: Transport.REDIS,
        options: {
          host: process.env.REDIS_HOST || 'localhost',
          port: Number(process.env.REDIS_PORT) || 6379,
        },
      },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, RedisTimeSeriesService],
})
export class AnalyticsModule {}
