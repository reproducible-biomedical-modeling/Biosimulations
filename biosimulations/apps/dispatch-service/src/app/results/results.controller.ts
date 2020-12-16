import {
  DispatchFinishedPayload,
  DispatchMessage,
} from '@biosimulations/messages/messages';
import { Controller, Logger } from '@nestjs/common';

import { MessagePattern } from '@nestjs/microservices';
import { ResultsService } from './results.service';

@Controller()
export class ResultsController {
  constructor(private service: ResultsService) {}

  private logger = new Logger(ResultsController.name);

  @MessagePattern(DispatchMessage.finished)
  private async processResults(data: DispatchFinishedPayload): Promise<void> {
    const id = data.id;
    const transpose = data.transpose;
    this.logger.log(`Simulation ${id} Finished`);
    this.service.createResults(id, transpose);
  }
}
