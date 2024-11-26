import { Component, Inject, Input, OnInit, PLATFORM_ID } from '@angular/core';
import Highcharts, { Options } from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import More from 'highcharts/highcharts-more'; // For the gauge
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsGauge from 'highcharts/modules/solid-gauge';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { BrokerService } from '../../../service/broker.service';
import createChartOptions from '@src/shared/createChartOptions';
if (typeof Highcharts === 'object') {
  More(Highcharts);
  HighchartsGauge(Highcharts);
  HighchartsExporting(Highcharts);
}

@Component({
  selector: 'app-temperature-chart',
  standalone: true,
  imports: [HighchartsChartModule, CommonModule],
  templateUrl: './temperature-chart.component.html',
  styleUrls: ['./temperature-chart.component.css','../../styles.css'],
})
export class TemperatureChartComponent implements OnInit {
  temperature: number | undefined = undefined;
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
      this.brokerService.temperature.subscribe(this.handleUpdate.bind(this));
    }
  }

  handleUpdate(value: number) {
    this.temperature = value;
    if (this.isBrowser) {
      (this.chartOptions.series![0] as any).data = [value];
      this.updateFlag = true;
    }
  }

  initializeChart(): void {
    this.chartOptions = createChartOptions("Temperature",0,25,35,40,50,"°C")
  }
}
