import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ResultsService } from './results.service';

@Controller('results')
@ApiTags('Results')
export class ResultsController {
  constructor(private service: ResultsService) {}
  @Get()
  getResults() {
    return this.service.getResults();
  }

  @Get(':id')
  getResult(@Param('') id: string) {
    return this.service.getResult(id);
  }

  @Get(':id/download')
  downloadResult(@Param('id') id: string) {
    return this.service.download(id);
  }

  @Post()
  addResult(@Body() results: any) {
    return this.service.addResults(results);
  }
  @Put(':id')
  editResults(
    @Param('id')
    id: string,
    @Body() results: any
  ) {
    return this.service.editResults(id, results);
  }

  @Delete()
  deleteResults() {
    return this.service.deleteAll();
  }
  @Delete(':id')
  deleteResult(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
