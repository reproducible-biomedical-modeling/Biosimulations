import { Module } from '@nestjs/common';
import { SimulatorsController } from './simulators.controller';
import { SimulatorsService } from './simulators.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Simulator, SimulatorSchema } from './simulator.model';
@Module({
  controllers: [SimulatorsController],
  providers: [SimulatorsService],
  imports: [
    MongooseModule.forFeature([
      { name: Simulator.name, schema: SimulatorSchema },
    ]),
  ],
})
export class SimulatorsModule {}
