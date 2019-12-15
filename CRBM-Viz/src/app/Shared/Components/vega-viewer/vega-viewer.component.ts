import { Component, Input, ElementRef, ViewChild } from '@angular/core';
import * as vega from 'vega';
import vegaEmbed from 'vega-embed';

@Component({
  selector: 'app-vega-viewer',
  templateUrl: './vega-viewer.component.html',
  styleUrls: ['./vega-viewer.component.sass'],
})
export class VegaViewerComponent {
  private _spec: object;
  private _options: object;
  @ViewChild('vegaContainer', { static: true }) vegaContainer: ElementRef;
  private viewApi;

  @Input()
  set spec(value: object) {
    this._spec = value;

    if (typeof value !== 'string') {
      value['width'] = 'container';
      value['height'] = 'container';
      value['autosize'] = {
        type: 'fit',
        resize: true,
      };
      value['background'] = 'transparent';
    }

    this.loadSpec();
  }

  private _data: object = null;

  @Input()
  set data(value: object) {
    this._data = value;
    this.loadData();
  }

  @Input()
  set options(value: object) {
    this._options = value;
    this.loadSpec();
  }

  constructor() {}

  loadSpec() {
    if (this.vegaContainer && this._spec) {
      // console.log(this._spec);
      vegaEmbed(this.vegaContainer.nativeElement, this._spec, this._options)
        // result.view provides access to the Vega View API
        .then(viewApi => {
          this.viewApi = viewApi;
          this.loadData();
        })
        .catch(console.error);
    }
  }

  loadData() {
    if (this.viewApi && this._data) {
      this._data.forEach((key, val) => {
        const changeSet = vega
          .changeset()
          .remove(vega.truthy)
          .insert(val);
        this.viewApi.view.change(key, changeSet).run();
      });
    }
  }
}
