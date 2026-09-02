import { NestFactory } from '@nestjs/core';
import { AnalyticsServiceModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({
  path: path.resolve(__dirname, '..', '..', '..', '..', '.env'),
});

async function bootstrap() {
  const app = await NestFactory.create(AnalyticsServiceModule);

  app.enableCors();

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Analytics Service API')
    .setVersion('1.0')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);

  await app.startAllMicroservices();

  const port = process.env.ANALYTICS_SERVICE_PORT || 3002;

  await app.listen(port, () =>
    console.log(
      `Analytics Service is running on port ${port}\nSwagger UI: http://localhost:${port}/api/docs`,
    ),
  );
}
bootstrap();
