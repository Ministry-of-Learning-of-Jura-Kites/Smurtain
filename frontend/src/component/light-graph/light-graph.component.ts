import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import More from 'highcharts/highcharts-more';
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsGauge from 'highcharts/modules/solid-gauge';
import { CommonModule } from '@angular/common';
import { BrokerService } from '../../../service/broker.service';
import { LIGHT_CONFIG } from '@src/shared/config';
import BaseGraphComponent from '@src/shared/BaseGraphComponent';

if (typeof Highcharts === 'object') {
  More(Highcharts);
  HighchartsGauge(Highcharts);
  HighchartsExporting(Highcharts);
}

@Component({
  selector: 'app-light-graph',
  standalone: true,
  imports: [HighchartsChartModule, CommonModule],
  templateUrl: './light-graph.component.html',
  styleUrl: './light-graph.component.css',
})
export class LightGraphComponent extends BaseGraphComponent implements OnInit {
  override measurementConfig = LIGHT_CONFIG;

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    brokerService: BrokerService
  ) {
    super(platformId, brokerService, brokerService.light);
  }
}
