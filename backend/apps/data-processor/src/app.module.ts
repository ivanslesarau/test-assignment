import { Module } from '@nestjs/common';
import { DataProcessorController } from './app.controller';
import { DataProcessorService } from './app.service';
import {
  Character,
  CharacterSchema,
} from 'n/shared/database/schemas/character.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from 'n/shared/database/database.module';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../../../../.env' }),
    DatabaseModule,
    MongooseModule.forFeature([
      { name: Character.name, schema: CharacterSchema },
    ]),
    HttpModule,
  ],
  controllers: [DataProcessorController],
  providers: [DataProcessorService],
})
export class DataProcessorModule {}
