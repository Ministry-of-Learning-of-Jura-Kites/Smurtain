import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import More from 'highcharts/highcharts-more'; // For the gauge
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsGauge from 'highcharts/modules/solid-gauge';
import { CommonModule } from '@angular/common';
import { BrokerService } from '../../../service/broker.service';
import createChartOptions from '@src/shared/createChartOptions';
import {BaseChartComponent} from '@src/shared/BaseChartComponent';
import {MeasurementConfig, TEMPERATURE_CONFIG} from '@src/shared/config';
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
  styleUrls: ['./temperature-chart.component.css', '../../styles.css'],
})
export class TemperatureChartComponent extends BaseChartComponent implements OnInit {
  override measurementConfig: MeasurementConfig = TEMPERATURE_CONFIG;

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
     brokerService: BrokerService
  ) {
    super(platformId,brokerService,brokerService.light)
  }

  initializeChart(): void {
    this.chartOptions = createChartOptions(this.measurementConfig.TITLE, this.measurementConfig.MIN, 25, 35, 40, this.measurementConfig.MAX, this.measurementConfig.UNIT);
  }
}
