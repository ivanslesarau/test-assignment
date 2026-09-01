import { NestFactory } from '@nestjs/core';
import { DataProcessorModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

dotenv.config({
  path: path.resolve(__dirname, '..', '..', '..', '..', '.env'),
});

async function bootstrap() {
  const app = await NestFactory.create(DataProcessorModule);

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('API for Data Processor Service')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);

  const port = process.env.DATA_PROCESSOR_PORT || 3000;

  await app.listen(port, () =>
    console.log(
      `Data Processor Service is running on port ${port}\nSwagger UI: http://localhost:${port}/api/docs`,
    ),
  );
}
bootstrap();
