import { Component, Inject, Input, OnInit, PLATFORM_ID } from '@angular/core';
import { MeasurementConfig } from '@src/shared/config';
import { BrokerService } from '../../../service/broker.service';
import createGraphOptions from '@src/shared/createGraphOptions';
import { Subject } from 'rxjs';
import Highcharts, { SeriesLineOptions } from 'highcharts';
import { isPlatformBrowser, NgIf } from '@angular/common';
import { HighchartsChartModule } from 'highcharts-angular';

@Component({
  selector: 'app-status-graph',
  standalone: true,
  imports: [HighchartsChartModule, NgIf],
  templateUrl: './status-graph.component.html',
  styleUrl: './status-graph.component.css',
})
export class StatusGraphComponent implements OnInit {
  @Input({ required: true })
  measurementConfig!: MeasurementConfig;
  // @Input({ required: true })
  // subjectKey!: ;
  @Input({ required: true })
  subject!: Subject<number>;

  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {};
  updateFlag: boolean = false;
  isBrowser: boolean;
  liveData$ = new Subject<number>();

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private brokerService: BrokerService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.initializeChart();
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
