import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import More from 'highcharts/highcharts-more'; // For the gauge
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsGauge from 'highcharts/modules/solid-gauge';
import { CommonModule } from '@angular/common';
import { BrokerService } from '../../../service/broker.service';
import createChartOptions from '@src/shared/createChartOptions';
import {LIGHT_CONFIG} from '@src/shared/config';
import {BaseChartComponent} from '@src/shared/BaseChartComponent';
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
  styleUrls: ['./light-chart.component.css', '../../styles.css']
})
export class LightChartComponent extends BaseChartComponent implements OnInit {
  measurementConfig = LIGHT_CONFIG;

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
     brokerService: BrokerService
  ) {
    super(platformId,brokerService,brokerService.light)
  }
  initializeChart(): void {
    this.chartOptions = createChartOptions(this.measurementConfig.TITLE, this.measurementConfig.MIN, 40, 70, 80, this.measurementConfig.MAX, this.measurementConfig.UNIT);
  }
}
