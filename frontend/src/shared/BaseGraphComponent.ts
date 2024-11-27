import { SeriesLineOptions } from 'highcharts';
import { MeasurementConfig } from './config';
import createGraphOptions from './createGraphOptions';
import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {BrokerService} from '../../service/broker.service';
import {isPlatformBrowser} from '@angular/common';
import {Subject} from 'rxjs';
import Highcharts from 'highcharts';

@Component({
  selector: 'app-base-graph',
  template: ``,
  styles: [
  ]
})
export default abstract class BaseGraphComponent
implements OnInit {
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options={};
  abstract measurementConfig: MeasurementConfig;
  updateFlag: boolean = false;
  isBrowser: boolean;
  liveData$ = new Subject<number>();

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private brokerService: BrokerService,
    private subject: Subject<number>
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.initializeChart();

      // this.brokerService.getData('temperature').then((data) => {

      //     const fiveMinutesInMilliseconds = 5 * 60 * 1000;
      //     const currentTime = new Date().getTime();

      //     const filteredData = data.filter(
      //         (item) => currentTime - item.Time <= fiveMinutesInMilliseconds
      //     );

      //     const chartSeriesData = filteredData.map((item) => [
      //         item.Time,
      //         item.Data,
      //     ]);

      //     this.chartOptions.series = [
      //         {
      //             name: 'Live Data',
      //             type: 'areaspline',
      //             data: chartSeriesData,
      //         },
      //     ];
      //     this.updateFlag = true;
      // }).catch((err) => {
      //     console.error('Error fetching data from IndexedDB:', err);
      // });
      this.subject.subscribe((value: number) => {
        this.liveData$.next(value);
      });

      this.liveData$.subscribe((value) => {
        this.graphUpdateHandler(value);
      });
    }
  }

  graphUpdateHandler(value: number): void {
    if (value >= this.measurementConfig.MAX) {
      value = this.measurementConfig.MAX;
    } else if (value <= this.measurementConfig.MIN) {
      value = this.measurementConfig.MIN;
    }
    const series = this.chartOptions.series?.[0] as SeriesLineOptions;
    if (series) {
      const currentTime = new Date().getTime();
      const fiveMinutesInMilliseconds = 5 * 60 * 1000;

      if (!series.data) {
        series.data = [];
      }
      (series.data as [number, number][]).push([currentTime, value]);

      series.data = (series.data as [number, number][]).filter(
        (point) => currentTime - point[0] <= fiveMinutesInMilliseconds
      );

      this.updateFlag = true;
    }
  }
  initializeChart(): void {
    this.chartOptions = createGraphOptions(this.measurementConfig);
  }
}
