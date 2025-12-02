import { Body, Controller, Get, Post } from '@nestjs/common';
import { PinoLoggerService } from 'src/common/logger/pino.service';

import { CatsService } from './cats.service';
import { CreateCatDto } from './dto/create-cat.dto';
import { Cat } from './interfaces/cat.interface';

@Controller('cats')
export class CatsController {
  constructor(
    private catsService: CatsService,
    private logger: PinoLoggerService,
  ) {}

  @Post()
  async create(@Body() createCatDto: CreateCatDto) {
    try {
      this.logger.log(`create | Creating a new cat with the body request: `, CatsController.name);
      this.catsService.create(createCatDto);
      this.logger.log(`create | Created the cat successfully`, CatsController.name);
    } catch (error) {
      this.logger.error(
        `create | Failed to create the cat with the error: ${error}`,
        CatsController.name,
      );
    }
  }

  @Get()
  async findAll(): Promise<Cat[]> {
    this.logger.log('Fetching all cats...', CatsController.name);
    const cats = await this.catsService.findAll();
    this.logger.log(`Found ${cats.length} cats.`, CatsController.name);
    return cats;
  }
}
