import {
  Controller,
  Get,
  Post,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DataProcessorService } from './app.service';
import { SearchQueryDto } from './dto/search-query.dto';

@ApiTags('Characters Data')
@Controller('characters')
export class DataProcessorController {
  constructor(private readonly dataProcessorService: DataProcessorService) {}

  @Post('sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start data synchronization process' })
  @ApiResponse({
    status: 200,
    description: 'Data synchronization completed successfully',
  })
  async syncData() {
    await this.dataProcessorService.syncAllData();
    return { message: 'Data synchronization completed successfully' };
  }

  @Get('search')
  @ApiOperation({ summary: 'Search characters with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Successfull return of character list',
  })
  async search(@Query() searchQueryDto: SearchQueryDto) {
    return this.dataProcessorService.searchCharacters(
      searchQueryDto.query,
      searchQueryDto.page,
      searchQueryDto.limit,
    );
  }
}
