import { Component, Inject, Input, OnInit, PLATFORM_ID } from '@angular/core';
import Highcharts, { Options } from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import More from 'highcharts/highcharts-more'; // For the gauge
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsGauge from 'highcharts/modules/solid-gauge';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';
import { BrokerService } from '../../../service/broker.service';
// Initialize the modules
if (typeof Highcharts === 'object') {
  More(Highcharts);
  HighchartsGauge(Highcharts);
  HighchartsExporting(Highcharts);
}

@Component({
  selector: 'app-humidity',
  standalone: true,
  imports: [HighchartsChartModule, CommonModule],
  templateUrl: './humidity.component.html',
  styleUrls: ['./humidity.component.css'],
})
export class HumidityComponent implements OnInit {
  humidity: number | undefined = undefined;
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
      this.brokerService.humidity.subscribe(this.handleUpdate.bind(this));
    }
  }

  handleUpdate(value: number) {
    this.humidity = value;
    if (this.isBrowser) {
      (this.chartOptions.series![0] as any).data = [value];
      this.updateFlag = true;
    }
  }

  initializeChart(): void {
    this.chartOptions = {
      chart: {
        type: 'solidgauge',
        plotBackgroundColor: undefined,
        plotBackgroundImage: undefined,
        plotBorderWidth: 0,
        plotShadow: false,
        height: '80%',
      },
      title: {
        text: 'Humidity',
      },
      pane: {
        startAngle: -90,
        endAngle: 90,
        background: undefined,
        center: ['50%', '75%'],
        size: '130%',
      },
      credits: {
        enabled: false,
      },
      yAxis: {
        min: 0,
        max: 50,
        tickPixelInterval: 72,
        tickPosition: 'inside',
        tickColor:
          (Highcharts.defaultOptions?.chart?.backgroundColor as string) ||
          '#FFFFFF',
        tickLength: 20,
        tickWidth: 2,
        minorTickInterval: undefined,
        labels: {
          distance: 20,
          style: {
            fontSize: '14px',
          },
        },
        lineWidth: 0,
        plotBands: [
          {
            from: 0,
            to: 25,
            color: '#55BF3B',
            thickness: 20,
          },
          {
            from: 25,
            to: 35,
            color: '#DDDF0D',
            thickness: 20,
          },
          {
            from: 35,
            to: 40,
            color: '#ff3300',
            thickness: 20,
          },
          {
            from: 40,
            to: 50,
            color: '#DF5353',
            thickness: 20,
          },
        ],
      },
      series: [
        {
          name: 'Speed',
          type: 'gauge',
          data: [],
          tooltip: {
            valueSuffix: ' °C',
          },
          dataLabels: {
            format: '{y} °C',
            borderWidth: 0,
            color:
              (Highcharts.defaultOptions.title &&
                Highcharts.defaultOptions.title.style &&
                Highcharts.defaultOptions.title.style.color) ||
              '#333333',
            style: {
              fontSize: '16px',
            },
          },
          dial: {
            radius: '80%',
            backgroundColor: 'gray',
            baseWidth: 12,
            baseLength: '0%',
            rearLength: '0%',
          },
          pivot: {
            backgroundColor: 'gray',
            radius: 6,
          },
        },
      ],
    };
  }
}
