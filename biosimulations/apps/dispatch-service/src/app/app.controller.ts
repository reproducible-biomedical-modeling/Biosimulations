import {
  Controller,
  Get,
  Logger,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Inject,
} from '@nestjs/common';
import { MessagePattern, ClientProxy } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import { HpcService } from './services/hpc/hpc.service';
import { SbatchService } from './services/sbatch/sbatch.service';
import { SimulationDispatchSpec } from '@biosimulations/dispatch/datamodel';
import { v4 as uuid } from 'uuid';
import path from 'path';
import * as csv2Json from 'csv2json';
import {
  Cron,
  CronExpression,
  Interval,
  SchedulerRegistry,
  Timeout,
} from '@nestjs/schedule';
import { CronJob } from 'cron';
import { MQDispatch } from '@biosimulations/messages/dispatch'

@Controller()
export class AppController {
  constructor(
    private readonly configService: ConfigService,
    private hpcService: HpcService,
    private sbatchService: SbatchService,
    @Inject('DISPATCH_MQ') private messageClient: ClientProxy,
    private schedulerRegistry: SchedulerRegistry
  ) {}
  private logger = new Logger(AppController.name);

  @MessagePattern(MQDispatch.dispatch)
  async uploadFile(data: SimulationDispatchSpec) {
    this.logger.log('Data received: ' + JSON.stringify(data));
    // TODO: Replace with fileStorage URL from configModule (BiosimulationsConfig)
    const fileStorage = process.env.FILE_STORAGE;
    const sbatchStorage = `${fileStorage}/SBATCH/ID`;

    if (
      data.simulator !== 'COPASI' &&
      data.simulator !== 'VCell' &&
      data.simulator !== 'Tellurium' &&
      data.simulator !== 'CobraPy' &&
      data.simulator !== 'BioNetGen'
    ) {
      return { message: 'Unsupported simulator was provided!' };
    }

    const omexPath = data.filepathOnDataStore;
    const sbatchName = `${uuid()}.sbatch`;
    const sbatchPath = path.join(sbatchStorage, sbatchName);

    this.logger.log('SBatch path: ' + sbatchPath);

    // Generate SBATCH script
    const simulatorString = `biosimulations_${data.simulator.toLowerCase()}_${
      data.simulatorVersion
    }`;
    const hpcTempDirPath = `${this.configService.get('hpc').simDirBase}/${
      data.uniqueFilename.split('.')[0]
    }`;
    const sbatchString = this.sbatchService.generateSbatch(
      hpcTempDirPath,
      simulatorString,
      data.filename
    );
    await this.writeFile(sbatchPath, sbatchString);

    this.logger.log('HPC Temp basedir: ' + hpcTempDirPath);

    this.hpcService.dispatchJob(
      hpcTempDirPath,
      sbatchPath,
      omexPath,
      data.filename
    );

    return { message: 'Simulation dispatch started.' };
  }

  // TODO: Add API to send required info dispatch_finish pattern to NATS
  @MessagePattern(MQDispatch.finish)
  async dispatchFinish(uuid: string) {
    const fileStorage = process.env.FILE_STORAGE || '';
    // const simDirSplit = data['simDir'].split('/');

    const resDir = path.join(fileStorage, 'simulations', uuid, 'out');

    // this.logger.log('Log message data: ' + JSON.stringify(data));
    this.logger.log('Output directory: ' + resDir);

    const directoryList = await this.readDir(resDir);

    // NOTE: job.output is the Log file generated by the SBATCH simulation job
    const logFileIndex = directoryList.indexOf('job.output');
    directoryList.splice(logFileIndex);

    for (const directoryName of directoryList) {
      this.readDir(path.join(resDir, directoryName)).then((fileList: any) => {
        for (const filename of fileList) {
          if (filename.endsWith('csv')) {
            const filePath = path.join(resDir, directoryName, filename);
            this.logger.log('Reading file: ' + filePath);

            const jsonPath = filePath.split('.csv')[0] + '.json';

            fs.createReadStream(filePath)
              .pipe(
                csv2Json.default({
                  separator: ',',
                })
              )
              .pipe(fs.createWriteStream(jsonPath))
              .on('close', () => {
                // Convert CSV to chart JSON
                const chartJsonPath =
                  jsonPath.split('.json')[0] + '_chart.json';
                this.readFile(jsonPath).then((jsonData: any) => {
                  const chartResults = this.convertJsonDataToChartData(
                    JSON.parse(jsonData)
                  );
                  this.writeFile(
                    chartJsonPath,
                    JSON.stringify(chartResults)
                  ).then(() => {

                    this.messageClient.emit(MQDispatch.result, {
                      uuid: true,
                    });
                  });
                });
              })
              .on('error', (err) => {
                console.log('Error occured in file writing', err);
              });
          }
        }
      });
    }
  }

  @MessagePattern(MQDispatch.log)
  async dispatchLog(data: any) {
    const slurmjobId = data['hpcOutput']['stdout'].match(/\d+/)[0];
    const simDirSplit = data['simDir'].split('/');
    const uuid = simDirSplit[simDirSplit.length - 1];
    // TODO: research more for better duration
    this.jobMonitorCronJob(slurmjobId, uuid, 30);
  }

  async jobMonitorCronJob(jobId: string, uuid: string, seconds: number) {
    const job = new CronJob(`${seconds.toString()} * * * * *`, async () => {
      const squeueRes = await this.hpcService.squeueStatus(jobId);
      const jobMatch = squeueRes.stdout.match(/\d+/);
      const isJobRunning = jobMatch !== null && jobMatch[0] === jobId;
      if (!isJobRunning) {
        this.messageClient.emit(MQDispatch.finish, uuid);
        this.schedulerRegistry.getCronJob(jobId).stop();
      }
    });

    this.schedulerRegistry.addCronJob(jobId, job);
    job.start();
  }

  convertJsonDataToChartData(data: any) {
    const finalRes: any = {};

    const taskKeys = Object.keys(data[0]);
    taskKeys.splice(taskKeys.indexOf('time'), 1);

    for (const taskKey of taskKeys) {
      finalRes[taskKey] = {};
      finalRes[taskKey]['x'] = [];
      finalRes[taskKey]['y'] = [];
      finalRes[taskKey]['type'] = 'scatter';
    }

    for (const dataObj of data) {
      for (const taskKey of taskKeys) {
        finalRes[taskKey]['x'].push(dataObj['time']);
        finalRes[taskKey]['y'].push(dataObj[taskKey]);
      }
    }

    return finalRes;
  }

  readDir(dirPath: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      fs.readdir(dirPath, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  readFile(filePath: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      fs.readFile(filePath, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  writeFile(path: string, data: Buffer | string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      fs.writeFile(path, data, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
