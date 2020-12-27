import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { BiosimulationsConfigModule } from "@biosimulations/config/nest"
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MailServiceClientModule } from '@biosimulations/mail-service/client'
import { DispatchNestClientModule } from '@biosimulations/dispatch/nest-client'
import { SharedNatsClientModule } from '@biosimulations/shared/nats-client'
@Module({
  imports: [
    BiosimulationsConfigModule,
    DispatchNestClientModule,
    MailServiceClientModule,
    SharedNatsClientModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
