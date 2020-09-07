import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { DispatchService } from '../../../services/dispatch/dispatch.service';
import { TableComponent, Column, ColumnLinkType, ColumnFilterType } from '@biosimulations/shared/ui';

@Component({
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss'],
})
export class BrowseComponent implements AfterViewInit {
  @ViewChild(TableComponent) table!: TableComponent;

  columns: Column[] = [
    {
      id: 'id',
      heading: "Id",
      key: 'id',
      minWidth: 34
    },
    {
      id: 'name',
      heading: "Name",
      key: 'name',
      minWidth: 34
    },
    {
      id: 'status',
      heading: "Status",
      key: 'status',
      formatter: (value: string): string => {
        if (value) {
          return value.substring(0, 1).toUpperCase() + value.substring(1);
        } else {
          return value;
        }
      },
      comparator: (aVal: any, bVal: any, sign: number): number => {
        if (aVal === 'queued') aVal = 0;
        if (aVal === 'started') aVal = 1;
        if (aVal === 'succeeded') aVal = 2;
        if (aVal === 'failed') aVal = 3;
        if (aVal == null) aVal = 4 * sign;

        if (bVal === 'queued') bVal = 0;
        if (bVal === 'started') bVal = 1;
        if (bVal === 'succeeded') bVal = 2;
        if (bVal === 'failed') bVal = 3;
        if (bVal == null) bVal = 4 * sign;

        if (aVal > bVal) return 1;
        if (aVal < bVal) return -1;
        return 0;
      },
      minWidth: 77,
    },
    {
      id: 'runtime',
      heading: "Runtime",
      key: 'runtime',
      formatter: (value: number): string | null => {
        if (value == null) {
          return null;
        }

        if (value > 7 * 24 * 60 * 60) {
          return (value / (7 * 24 * 60 * 60)).toFixed(1) + ' w';

        } else if (value > 24 * 60 * 60) {
          return (value / (24 * 60 * 60)).toFixed(1) + ' d';

        } else if (value > 60 * 60) {
          return (value / (60 * 60)).toFixed(1) + ' h';

        } else if (value > 60) {
          return (value / 60).toFixed(1) + ' m';

        } else if (value > 1) {
          return (value).toFixed(1) + ' s';

        } else {
          return (value * 1000).toFixed(1) + ' ms';
        }
      },
      filterType: ColumnFilterType.number,
      show: false,
    },
    {
      id: 'submitted',
      heading: "Submitted",
      key: 'submitted',
      formatter: (value: Date): string | null => {
        if (value == null) {
          return null;
        }
        return value.getFullYear().toString()
          + '-' + (value.getMonth() + 1).toString().padStart(2, '0')
          + '-' + value.getDate().toString().padStart(2, '0')
          + ' ' + value.getHours().toString().padStart(2, '0')
          + ':' + value.getMinutes().toString().padStart(2, '0')
          + ':' + value.getSeconds().toString().padStart(2, '0');
      },
      filterType: ColumnFilterType.date,
      minWidth: 140,
    },
    {
      id: 'updated',
      heading: "Last updated",
      key: 'updated',
      formatter: (value: Date): string | null => {
        if (value == null) {
          return null;
        }
        return value.getFullYear().toString()
          + '-' + (value.getMonth() + 1).toString().padStart(2, '0')
          + '-' + value.getDate().toString().padStart(2, '0')
          + ' ' + value.getHours().toString().padStart(2, '0')
          + ':' + value.getMinutes().toString().padStart(2, '0')
          + ':' + value.getSeconds().toString().padStart(2, '0');
      },
      filterType: ColumnFilterType.date,
      minWidth: 140,
    },
    {
      id: 'visualize',
      heading: "Visualize",
      center: true,
      linkType: ColumnLinkType.routerLink,
      routerLink: (element: any): string[] | null => {
        if (element.id) {
          return ['/simulations', element.id];
        } else {
          return null;
        }
      },
      icon: 'chart',
      minWidth: 66,
      filterable: false,
      sortable: false,
    },
    {
      id: 'download',
      heading: "Download",
      center: true,
      linkType: ColumnLinkType.href,
      href: (element: any): string | null => {
        if (element.id) {
          return 'download-results/' + element.id;
        } else {
          return null;
        }
      },
      icon: 'download',
      minWidth: 66,
      filterable: false,
      sortable: false,
    },
    {
      id: 'log',
      heading: "Log",
      center: true,
      linkType: ColumnLinkType.routerLink,
      routerLink: (element: any): string[] | null => {
        if (element.id) {
          return ['/simulations', element.id];
        } else {
          return null;
        }
      },
      icon: 'logs',
      minWidth: 66,
      filterable: false,
      sortable: false,
    },
  ];

  data: any[] = [];

  constructor(private dispatchService: DispatchService) {}

  ngAfterViewInit() {
    this.dispatchService.uuidUpdateEvent.subscribe(
      (uuid: string): void => {
        // TODO: get name, status, runtime, dates from dispatch service
        this.data.push({
          id: uuid,
          name: null,
          status: null,
          runtime: null,
          submitted: null,
          completed: null,
        });
        this.table.setData(this.data);
      },
      (error): void => {
        console.log('Error occured while fetching UUIds: ', error);
      },
    );
  }
}
