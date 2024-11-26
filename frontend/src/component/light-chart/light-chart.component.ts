import { Component, Inject, Input, OnInit, PLATFORM_ID } from '@angular/core';
import Highcharts, { Options } from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import More from 'highcharts/highcharts-more'; // For the gauge
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsGauge from 'highcharts/modules/solid-gauge';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';
import { BrokerService } from '../../../service/broker.service';
import createChartOptions from '@src/shared/createChartOptions';
// Initialize the modules
if (typeof Highcharts === 'object') {
  More(Highcharts);
  HighchartsGauge(Highcharts);
  HighchartsExporting(Highcharts);
}

@Component({
  selector: 'app-light-chart',
  standalone: true,
  imports: [HighchartsChartModule, CommonModule],
  templateUrl: './light-chart.component.html',
  styleUrls: ['./light-chart.component.css','../../styles.css']
})
export class LightChartComponent implements OnInit {
  light: number | undefined = undefined;
  isBrowser: boolean;
  Highcharts: typeof Highcharts = Highcharts;
  chart: Highcharts.Chart | undefined;
  chartOptions: Options = {};
  updateFlag: boolean = false;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private brokerService: BrokerService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.initializeChart();
      this.brokerService.light.subscribe(this.handleUpdate.bind(this));
    }
  }

  handleUpdate(value: number) {
    this.light = value;
    if (this.isBrowser) {
      (this.chartOptions.series![0] as any).data = [value];
      this.updateFlag = true;
    }
  }
  initializeChart(): void {
    this.chartOptions = createChartOptions("Light",0,150,300,450,500,"lux")
  }
}
