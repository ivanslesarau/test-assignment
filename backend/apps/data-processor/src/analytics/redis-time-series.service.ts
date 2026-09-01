import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisTimeSeriesService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisTimeSeriesService.name);
  private redisClient: Redis;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST') || 'localhost';
    const port = this.configService.get<number>('REDIS_PORT') || 6379;

    this.redisClient = new Redis({ host, port });

    this.redisClient.on('connect', () => {
      this.logger.log('Successful connection to Redis (TimeSeries)');
    });

    this.redisClient.on('error', (err: Error) => {
      this.logger.error('Error connecting to Redis:', err.message);
    });
  }

  onModuleDestroy() {
    this.redisClient.quit();
  }

  async incrementMetric(key: string, value: number = 1): Promise<void> {
    try {
      await this.redisClient.call('TS.ADD', key, '*', value);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Cannot increment metric ${key}: ${error.message}`);
      }
    }
  }
}
