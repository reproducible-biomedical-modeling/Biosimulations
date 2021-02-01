import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  DispatchService,
  SimulatorSpecsMap,
} from '../../../services/dispatch/dispatch.service';
import { SimulationService } from '../../../services/simulation/simulation.service';
import { Simulation } from '../../../datamodel';
import { SimulationRunStatus } from '@biosimulations/datamodel/common';
import { combineLatest } from 'rxjs';
import { ConfigService } from '@biosimulations/shared/services';

interface SimulatorIdDisabled {
  id: string;
  disabled: boolean;
}

@Component({
  selector: 'biosimulations-dispatch',
  templateUrl: './dispatch.component.html',
  styleUrls: ['./dispatch.component.scss'],
})
export class DispatchComponent implements OnInit {
  formGroup: FormGroup;
  simulators: SimulatorIdDisabled[] = [];
  simulatorVersions: string[] = [];

  simulatorSpecsMap: SimulatorSpecsMap | undefined = undefined;

  simulationId: string | undefined = undefined;

  exampleCombineArchiveUrl: string;
  exampleCombineArchivesUrl: string;

  constructor(
    private config: ConfigService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private dispatchService: DispatchService,
    private simulationService: SimulationService,
  ) {
    this.formGroup = formBuilder.group({
      projectFile: ['', [Validators.required]],
      simulator: ['', [Validators.required]],
      simulatorVersion: ['', [Validators.required]],
      name: ['', [Validators.required]],
      email: ['', [Validators.email]],
    });

    this.exampleCombineArchivesUrl =
      'https://github.com/' +
      config.appConfig.exampleCombineArchives.repoOwnerName +
      '/tree' +
      '/' +
      config.appConfig.exampleCombineArchives.repoRef +
      '/' +
      config.appConfig.exampleCombineArchives.repoPath;
    this.exampleCombineArchiveUrl =
      'https://github.com/' +
      config.appConfig.exampleCombineArchives.repoOwnerName +
      '/raw' +
      '/' +
      config.appConfig.exampleCombineArchives.repoRef +
      '/' +
      config.appConfig.exampleCombineArchives.repoPath +
      config.appConfig.exampleCombineArchives.examplePath;
  }

  ngOnInit(): void {
    this.formGroup.controls.simulator.disable();
    this.formGroup.controls.simulatorVersion.disable();

    combineLatest([
      this.dispatchService.getSimulatorsFromDb(),
      this.route.queryParams,
    ]).subscribe((observerableValues: [SimulatorSpecsMap, Params]): void => {
      const simulatorSpecsMap = observerableValues[0];
      const params = observerableValues[1];

      this.simulatorSpecsMap = simulatorSpecsMap;
      this.simulators = Object.keys(this.simulatorSpecsMap)
        .map((id: string): SimulatorIdDisabled => {
          return {id: id, disabled: false};
        });

      this.simulators.sort((a: SimulatorIdDisabled, b: SimulatorIdDisabled): number => {
        return a.id.localeCompare(b.id, undefined, { numeric: true });
      });

      this.formGroup.controls.simulator.enable();

      // process query arguments
      // const projectUrl = params?.projectUrl; // TODO: support loading COMBINE archive URL by query argument

      let modelFormat = params?.modelFormat?.toLowerCase();
      if (modelFormat) {
        const match = modelFormat.match(/^(format[:_])?(\d{1,4})$/)
        if (match) {
          modelFormat = 'format_' + '0'.repeat(4 - match[2].length) + match[2];
        }
      }

      let modelingFramework = params?.modelingFramework?.toUpperCase();
      if (modelingFramework) {
        const match = modelingFramework.match(/^(SBO[:_])?(\d{1,7})$/)
        if (match) {
          modelingFramework = 'SBO_' + '0'.repeat(7 - match[2].length) + match[2];
        }
      }

      const simulator: string = params?.simulator?.toLowerCase();
      const simulatorVersion: string = params?.simulatorVersion;

      if (modelFormat || modelingFramework) {
        this.simulators.forEach((simulatorIdDisabled: SimulatorIdDisabled): void => {
          let enabled = false;
          for (const modelingFrameworksForModelFormats of simulatorSpecsMap[simulatorIdDisabled.id].modelingFrameworksForModelFormats) {
            if (
              (!modelFormat || modelingFrameworksForModelFormats.formatEdamIds.includes(modelFormat)) &&
              (!modelingFramework || modelingFrameworksForModelFormats.frameworkSboIds.includes(modelingFramework))
            ) {
              enabled = true;
              break;
            }
          }
          simulatorIdDisabled.disabled = !enabled;
        });
      }

      if (simulator) {
        this.formGroup.controls.simulator.setValue(simulator);
        this.onSimulatorChange({ value: simulator });
        if (simulatorVersion) {
          this.formGroup.controls.simulatorVersion.setValue(simulatorVersion);
        }
      }
    });
  }

  onFormSubmit() {
    this.simulationId = undefined;

    if (!this.formGroup.valid) {
      return;
    }

    const projectFile: File = this.formGroup.value.projectFile;
    const simulator: string = this.formGroup.value.simulator;
    const simulatorVersion: string = this.formGroup.value.simulatorVersion;
    const name: string = this.formGroup.value.name;
    const email: string = this.formGroup.value.email;

    this.dispatchService
      .submitJob(projectFile, simulator, simulatorVersion, name, email)
      .subscribe((data: any) => {
        const simulationId = data['id'];
        this.dispatchService.uuidsDispatched.push(simulationId);
        this.dispatchService.uuidUpdateEvent.next(simulationId);
        this.simulationId = simulationId;

        const simulation: Simulation = {
          id: simulationId,
          name: name,
          email: email,
          simulator: simulator,
          simulatorVersion: simulatorVersion,
          submittedLocally: true,
          status: SimulationRunStatus.QUEUED,
          runtime: undefined,
          submitted: new Date(),
          updated: new Date(),
        };
        this.simulationService.storeNewLocalSimulation(simulation);
      });
  }

  onSimulatorChange($event: any) {
    if (this.simulatorSpecsMap !== undefined) {
      this.simulatorVersions = this.simulatorSpecsMap[$event.value].versions;
      this.formGroup.controls.simulatorVersion.enable();
      this.formGroup.controls.simulatorVersion.setValue(
        this.simulatorVersions[0],
      );
    }
  }
}
