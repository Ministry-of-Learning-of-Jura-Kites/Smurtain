import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import More from 'highcharts/highcharts-more'; // For the gauge
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsGauge from 'highcharts/modules/solid-gauge';
import { CommonModule } from '@angular/common';
import { BrokerService } from '../../../service/broker.service';
import createChartOptions from '@src/shared/createChartOptions';
import {HUMIDITY_CONFIG, MeasurementConfig} from '@src/shared/config';
import {BaseChartComponent} from '@src/shared/BaseChartComponent';
// Initialize the modules
if (typeof Highcharts === 'object') {
  More(Highcharts);
  HighchartsGauge(Highcharts);
  HighchartsExporting(Highcharts);
}

@Component({
  selector: 'app-humidity-chart',
  standalone: true,
  imports: [HighchartsChartModule, CommonModule],
  templateUrl: './humidity-chart.component.html',
  styleUrls: ['./humidity-chart.component.css', '../../styles.css'],
})
export class HumidityChartComponent extends BaseChartComponent implements OnInit {
  override measurementConfig: MeasurementConfig = HUMIDITY_CONFIG;

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    brokerService: BrokerService
  ) {
    super(platformId,brokerService,brokerService.humidity)
  }

  initializeChart(): void {
    this.chartOptions = createChartOptions(this.measurementConfig.TITLE, HUMIDITY_CONFIG.MIN, 40, 70, 80, HUMIDITY_CONFIG.MAX, HUMIDITY_CONFIG.UNIT);
  }
}
