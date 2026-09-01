import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AnalyticsService {
  constructor(
    @Inject('ANALYTICS_SERVICE_CLIENT')
    private readonly messageClient: ClientProxy,
  ) {}

  async publishEvent(eventData: any) {
    this.messageClient.emit('log_event', eventData);
  }
}
