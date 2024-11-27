import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import More from 'highcharts/highcharts-more';
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsGauge from 'highcharts/modules/solid-gauge';
import { CommonModule } from '@angular/common';
import { BrokerService } from '../../../service/broker.service';
import { HUMIDITY_CONFIG } from '@src/shared/config';
import BaseGraphComponent from '@src/shared/BaseGraphComponent';

if (typeof Highcharts === 'object') {
  More(Highcharts);
  HighchartsGauge(Highcharts);
  HighchartsExporting(Highcharts);
}

@Component({
  selector: 'app-humidity-graph',
  standalone: true,
  imports: [HighchartsChartModule, CommonModule],
  templateUrl: './humidity-graph.component.html',
  styleUrl: './humidity-graph.component.css',
})
export class HumidityGraphComponent
  extends BaseGraphComponent
  implements OnInit
{
  override measurementConfig = HUMIDITY_CONFIG;

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    brokerService: BrokerService
  ) {
    super(platformId, brokerService,brokerService.humidity);
  }
}
