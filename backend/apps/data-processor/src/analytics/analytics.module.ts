import { Module } from '@nestjs/common';
import {
  Character,
  CharacterSchema,
} from 'n/shared/database/schemas/character.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from 'n/shared/database/database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RedisTimeSeriesService } from './redis-time-series.service';
import { join } from 'path';

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
    ClientsModule.registerAsync([
      {
        name: 'ANALYTICS_SERVICE_CLIENT',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.REDIS,
          options: {
            host: configService.get<string>('REDIS_HOST', 'localhost'),
            port: configService.get<number>('REDIS_PORT', 6379),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, RedisTimeSeriesService],
})
export class AnalyticsModule {}
