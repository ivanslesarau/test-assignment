import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HttpService } from '@nestjs/axios';
import { Model } from 'mongoose';
import * as fs from 'fs';
import * as readline from 'readline';
import { firstValueFrom } from 'rxjs';
import {
  Character,
  CharacterDocument,
} from 'n/shared/database/schemas/character.schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DataProcessorService {
  private readonly logger = new Logger(DataProcessorService.name);
  private readonly filePath = './characters.jsonl';

  constructor(
    @InjectModel(Character.name)
    private readonly characterModel: Model<CharacterDocument>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async fetchAndSaveToFile(): Promise<void> {
    this.logger.log('Start fetching data from public API...');
    const writeStream = fs.createWriteStream(this.filePath);

    let nextUrl =
      this.configService.get<string>('PUBLIC_API_URL') ||
      'https://rickandmortyapi.com/api/character';

    while (nextUrl) {
      let success = false;
      let retries = 0;
      const maxRetries = 5;
      let currentWaitTime = 30000;

      while (!success && retries < maxRetries) {
        try {
          const response = await firstValueFrom(this.httpService.get(nextUrl));
          const data = response.data;

          for (const item of data.results) {
            const characterData = {
              externalId: item.id,
              name: item.name,
              species: item.species,
              imageUrl: item.image,
            };
            writeStream.write(JSON.stringify(characterData) + '\n');
          }

          nextUrl = data.info.next;
          success = true;

          if (nextUrl) {
            await this.sleep(1000);
          }
        } catch (error: any) {
          if (error.response && error.response.status === 429) {
            retries++;
            this.logger.warn(
              `Rate limit hit (429). Waiting ${currentWaitTime / 1000} sec... (Attempt ${retries}/${maxRetries})`,
            );
            await this.sleep(currentWaitTime);
            currentWaitTime *= 2;
          } else {
            this.logger.error(`Error: ${error.message}`);
            throw error;
          }
        }
      }
    }

    writeStream.end();
    this.logger.log('File successfully saved!');
  }

  private async parseAndInsertData(): Promise<void> {
    this.logger.log('Starting stream insertion into MongoDB...');

    const fileStream = fs.createReadStream(this.filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    let batch: any[] = [];
    const BATCH_SIZE = 100;

    for await (const line of rl) {
      if (!line) continue;

      const char = JSON.parse(line);

      batch.push({
        updateOne: {
          filter: { externalId: char.externalId },
          update: { $set: char },
          upsert: true,
        },
      });

      if (batch.length >= BATCH_SIZE) {
        await this.characterModel.bulkWrite(batch);
        batch = [];
      }
    }

    if (batch.length > 0) {
      await this.characterModel.bulkWrite(batch);
    }

    this.logger.log('Data successfully loaded into the database!');
  }

  async searchCharacters(
    query: string | undefined,
    page: number,
    limit: number,
  ) {
    const skip = (page - 1) * limit;
    let filter: any = {};

    if (query && query.trim()) {
      const cleanQuery = query.trim();
      filter = {
        $or: [
          { name: { $regex: cleanQuery, $options: 'i' } },
          { species: { $regex: cleanQuery, $options: 'i' } },
        ],
      };
    }

    const [items, total] = await Promise.all([
      this.characterModel.find(filter).skip(skip).limit(limit).exec(),
      this.characterModel.countDocuments(filter).exec(),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async syncAllData(): Promise<void> {
    await this.fetchAndSaveToFile();
    await this.parseAndInsertData();
  }
}
