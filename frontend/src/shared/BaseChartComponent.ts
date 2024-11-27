import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import Highcharts, { Options } from 'highcharts';
// For the gauge
import { isPlatformBrowser } from '@angular/common';
import { MeasurementConfig } from '@src/shared/config';
import { Subject } from 'rxjs';
import {BrokerService} from '../../service/broker.service';

@Component({
  selector: 'app-base-chart',
  template: ``,
  styles: [],
})
export abstract class BaseChartComponent implements OnInit {
  isBrowser: boolean;
  Highcharts: typeof Highcharts = Highcharts;
  chart: Highcharts.Chart | undefined;
  chartOptions: Options = {};
  updateFlag = false;
  value: number | undefined = undefined;
  abstract measurementConfig: MeasurementConfig;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private brokerService: BrokerService,
    private subject: Subject<number>
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.initializeChart();
      this.subject.subscribe(this.handleUpdate.bind(this));
    }
  }

  handleUpdate(value: number) {
    if (value >= this.measurementConfig.MAX) {
      value = this.measurementConfig.MAX;
    } else if (value <= this.measurementConfig.MIN) {
      value = this.measurementConfig.MIN;
    }
    this.value = value;
    if (this.isBrowser) {
      (this.chartOptions.series![0] as Highcharts.SeriesSplineOptions).data = [value];
      this.updateFlag = true;
    }
  }

  abstract initializeChart(): void;
}
