import { urls } from '@biosimulations/config/common';
import { Component, ViewChild, OnInit } from '@angular/core';
import { Simulation } from '../../../datamodel';
import { SimulationRunStatus } from '../../../datamodel';
import { SimulationService } from '../../../services/simulation/simulation.service';
import { SimulationStatusService } from '../../../services/simulation/simulation-status.service';
import {
  TableComponent,
  Column,
  ColumnActionType,
  ColumnFilterType,
} from '@biosimulations/shared/ui';
import { ConfigService } from '@biosimulations/shared/services';
import { Observable } from 'rxjs';

@Component({
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss'],
})
export class BrowseComponent implements OnInit {
  @ViewChild(TableComponent) table!: TableComponent;

  columns: Column[] = [
    {
      id: 'id',
      heading: 'Id',
      key: 'id',
      centerAction: ColumnActionType.routerLink,
      centerRouterLink: (simulation: Simulation): string[] => {
        return ['/simulations', simulation.id];
      },
      minWidth: 34,
      maxWidth: 100,
      filterable: false,
      showStacked: false,
    },
    {
      id: 'name',
      heading: 'Name',
      key: 'name',
      minWidth: 34,
    },
    {
      id: 'simulator',
      heading: 'Simulator',
      getter: (simulation: Simulation): string => {
        return simulation.simulator + ' ' + simulation.simulatorVersion;
      },
      centerAction: ColumnActionType.href,
      centerHref: (simulation: Simulation): string => {
        return `${this.config.simulatorsAppUrl}simulators/${simulation.simulator}/${simulation.simulatorVersion}`;
      },
      minWidth: 34,
      show: false,
    },
    {
      id: 'status',
      heading: 'Status',
      key: 'status',
      formatter: (value: SimulationRunStatus): string => {
        return SimulationStatusService.getSimulationStatusMessage(value, false);
      },
      filterFormatter: (value: SimulationRunStatus): string => {
        return SimulationStatusService.getSimulationStatusMessage(value, true);
      },
      rightIcon: (value: SimulationRunStatus): string => {
        if (SimulationStatusService.isSimulationStatusRunning(value)) {
          return 'spinner';
        } else {
          return 'spinner';
        }
      },
      comparator: (
        a: SimulationRunStatus,
        b: SimulationRunStatus,
        sign: number
      ): number => {
        const aVal = SimulationStatusService.getSimulationStatusOrder(a);
        const bVal = SimulationStatusService.getSimulationStatusOrder(b);
        if (aVal > bVal) return 1;
        if (aVal < bVal) return -1;
        return 0;
      },
      minWidth: 98,
      maxWidth: 98,
    },
    {
      id: 'runtime',
      heading: 'Runtime',
      key: 'runtime',
      //formatter: SimulationStatusService.formatRuntime.bind(null),
      getter: (simulation: Simulation): number | null => {
        if (simulation.runtime == null || simulation.runtime === undefined) {
          return null;
        } else {
          return simulation.runtime / 1000;
        }
      },
      formatter: (valueSec: number | null): string | null => {
        return SimulationStatusService.formatTime(null, valueSec);
      },
      stackedFormatter: (valueSec: number | null): string => {
        return SimulationStatusService.formatTime('N/A', valueSec) as string;
      },
      filterType: ColumnFilterType.number,
      show: false,
    },
    {
      id: 'submitted',
      heading: 'Submitted',
      key: 'submitted',
      formatter: (value: Date): string => {
        return (
          value.getFullYear().toString() +
          '-' +
          (value.getMonth() + 1).toString().padStart(2, '0') +
          '-' +
          value.getDate().toString().padStart(2, '0') +
          ' ' +
          value.getHours().toString().padStart(2, '0') +
          ':' +
          value.getMinutes().toString().padStart(2, '0') +
          ':' +
          value.getSeconds().toString().padStart(2, '0')
        );
      },
      filterType: ColumnFilterType.date,
      minWidth: 142,
      maxWidth: 142,
    },
    {
      id: 'updated',
      heading: 'Last updated',
      key: 'updated',
      formatter: (value: Date): string => {
        return (
          value.getFullYear().toString() +
          '-' +
          (value.getMonth() + 1).toString().padStart(2, '0') +
          '-' +
          value.getDate().toString().padStart(2, '0') +
          ' ' +
          value.getHours().toString().padStart(2, '0') +
          ':' +
          value.getMinutes().toString().padStart(2, '0') +
          ':' +
          value.getSeconds().toString().padStart(2, '0')
        );
      },
      filterType: ColumnFilterType.date,
      minWidth: 142,
      maxWidth: 142,
    },
    {
      id: 'submittedLocally',
      heading: 'Submitted locally',
      key: 'submittedLocally',
      formatter: (value: boolean): string => {
        return value ? 'Yes' : 'No';
      },
      minWidth: 134,
      center: true,
      show: false,
    },
    {
      id: 'visualize',
      heading: 'Viz',
      key: 'status',
      center: true,
      leftIcon: 'chart',
      leftAction: ColumnActionType.routerLink,
      leftRouterLink: (simulation: Simulation): string[] | null => {
        if (SimulationStatusService.isSimulationStatusSucceeded(simulation.status)) {
          return ['/simulations', simulation.id, "#design-viz"];
        } else {
          return null;
        }
      },
      centerAction: ColumnActionType.routerLink,
      centerRouterLink: (simulation: Simulation): string[] | null => {
        if (SimulationStatusService.isSimulationStatusSucceeded(simulation.status)) {
          return ['/simulations', simulation.id, "#design-viz"];
        } else {
          return null;
        }
      },
      formatter: (status: SimulationRunStatus): null => {
        return null;
      },
      stackedFormatter: (status: SimulationRunStatus): string | null => {
        if (SimulationStatusService.isSimulationStatusSucceeded(status)) {
          return 'visualize results';
        } else {
          return 'N/A';
        }
      },
      minWidth: 61,
      maxWidth: 61,
      filterable: false,
      comparator: (
        a: SimulationRunStatus,
        b: SimulationRunStatus,
        sign: number
      ): number => {
        const aVal = SimulationStatusService.isSimulationStatusSucceeded(a) ? 0 : 1;
        const bVal = SimulationStatusService.isSimulationStatusSucceeded(b) ? 0 : 1;
        if (aVal > bVal) return 1;
        if (aVal < bVal) return -1;
        return 0;
      },
    },
    {
      id: 'download',
      heading: 'Export',
      key: 'status',
      center: true,
      leftIcon: 'download',
      leftAction: ColumnActionType.href,
      leftHref: (simulation: Simulation): string | null => {
        if (SimulationStatusService.isSimulationStatusSucceeded(simulation.status)) {
          return `${urls.dispatchApi}download/result/${simulation.id}`;
        } else {
          return null;
        }
      },
      centerAction: ColumnActionType.href,
      centerHref: (simulation: Simulation): string | null => {
        if (SimulationStatusService.isSimulationStatusSucceeded(simulation.status)) {
          return `${urls.dispatchApi}download/result/${simulation.id}`;
        } else {
          return null;
        }
      },
      formatter: (status: SimulationRunStatus): null => {
        return null;
      },
      stackedFormatter: (status: SimulationRunStatus): string | null => {
        if (SimulationStatusService.isSimulationStatusSucceeded(status)) {
          return 'download results';
        } else {
          return 'N/A';
        }
      },
      minWidth: 61,
      maxWidth: 61,
      filterable: false,
      comparator: (
        a: SimulationRunStatus,
        b: SimulationRunStatus,
        sign: number
      ): number => {
        const aVal = SimulationStatusService.isSimulationStatusSucceeded(a) ? 0 : 1;
        const bVal = SimulationStatusService.isSimulationStatusSucceeded(b) ? 0 : 1;
        if (aVal > bVal) return 1;
        if (aVal < bVal) return -1;
        return 0;
      },
    },
    {
      id: 'log',
      heading: 'Log',
      key: 'status',
      center: true,
      leftIcon: 'logs',
      leftAction: ColumnActionType.routerLink,
      leftRouterLink: (simulation: Simulation): string[] | null => {
        if (!SimulationStatusService.isSimulationStatusRunning(simulation.status)) {
          return ['/simulations', simulation.id, "#log"];
        } else {
          return null;
        }
      },
      centerAction: ColumnActionType.routerLink,
      centerRouterLink: (simulation: Simulation): string[] | null => {
        if (!SimulationStatusService.isSimulationStatusRunning(simulation.status)) {
          return ['/simulations', simulation.id, '#log'];
        } else {
          return null;
        }
      },
      formatter: (status: SimulationRunStatus): null => {
        return null;
      },
      stackedFormatter: (status: SimulationRunStatus): string | null => {
        if (!SimulationStatusService.isSimulationStatusRunning(status)) {
          return 'view logs';
        } else {
          return 'N/A';
        }
      },
      minWidth: 61,
      maxWidth: 61,
      filterable: false,
      comparator: (
        a: SimulationRunStatus,
        b: SimulationRunStatus,
        sign: number
      ): number => {
        const aVal = !SimulationStatusService.isSimulationStatusRunning(a) ? 0 : 1;
        const bVal = !SimulationStatusService.isSimulationStatusRunning(b) ? 0 : 1;
        if (aVal > bVal) return 1;
        if (aVal < bVal) return -1;
        return 0;
      },
    },
  ];
  simulations!: Observable<Simulation[]>;

  constructor(private config: ConfigService, private simulationService: SimulationService) {}

  ngOnInit() {
    this.simulations = this.simulationService.simulations$;
  }

  getStackedHeading(simulation: Simulation): string {
    return simulation.name + ' (' + simulation.id + ')';
  }

  getStackedHeadingMoreInfoRouterLink(simulation: Simulation): string[] {
    return ['/simulations', simulation.id];
  }

  exportSimulations() {
    const simulations = this.simulationService.getSimulations();
    
    const blob = new Blob([JSON.stringify(simulations, null, 2)], {
      type: 'application/json',
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'simulations.json';
    a.click();
  }

  importSimulations() {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.onchange = () => {
      if (input.files == null || input.files.length === 0) {
        return;
      }
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target == null || typeof e.target.result !== 'string') {
          return;
        }

        const simulations = JSON.parse(e.target.result);
        this.simulationService.storeExistingExternalSimulations(simulations);
      };
      reader.readAsText(file);
    };
    input.click();
  }
}
