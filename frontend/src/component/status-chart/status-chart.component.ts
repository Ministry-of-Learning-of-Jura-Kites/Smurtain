import { Component, Inject, Input, OnInit, PLATFORM_ID } from '@angular/core';
import Highcharts, { Options } from 'highcharts';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MeasurementConfig } from '@src/shared/config';
import { Subject } from 'rxjs';
import { BrokerService } from '../../../service/broker.service';
import { HighchartsChartModule } from 'highcharts-angular';
import More from 'highcharts/highcharts-more';
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsGauge from 'highcharts/modules/solid-gauge';
import createChartOptions from '@src/shared/createChartOptions';

if (typeof Highcharts === 'object') {
  More(Highcharts);
  HighchartsGauge(Highcharts);
  HighchartsExporting(Highcharts);
}

@Component({
  selector: 'app-status-chart',
  standalone: true,
  imports: [HighchartsChartModule, CommonModule],
  templateUrl: './status-chart.component.html',
  styleUrls: ['./status-chart.component.css', '../../styles.css'],
})
export class StatusChartComponent implements OnInit {
  isBrowser: boolean;
  Highcharts: typeof Highcharts = Highcharts;
  chart: Highcharts.Chart | undefined;
  chartOptions: Options = {};
  updateFlag = false;
  value: number | undefined = undefined;
  @Input({ required: true }) measurementConfig!: MeasurementConfig | undefined;
  @Input({ required: true }) subject!: Subject<number>;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private brokerService: BrokerService
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
    if (value >= this.measurementConfig!.MAX) {
      value = this.measurementConfig!.MAX;
    } else if (value <= this.measurementConfig!.MIN) {
      value = this.measurementConfig!.MIN;
    }
    this.value = value;
    if (this.isBrowser) {
      (this.chartOptions.series![0] as Highcharts.SeriesSplineOptions).data = [
        value,
      ];
      this.updateFlag = true;
    }
  }

  initializeChart(): void {
    this.chartOptions = createChartOptions(
      this.measurementConfig!.TITLE,
      this.measurementConfig!.MIN,
      this.measurementConfig!.LEVEL1,
      this.measurementConfig!.LEVEL2,
      this.measurementConfig!.LEVEL3,
      this.measurementConfig!.MAX,
      this.measurementConfig!.UNIT
    );
  }
}
