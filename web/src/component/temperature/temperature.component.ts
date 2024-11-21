import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import More from 'highcharts/highcharts-more'; // For the gauge
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsGauge from 'highcharts/modules/solid-gauge';
import { FlowbiteService } from '../../../service/flowbite.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
// Initialize the modules
if (typeof Highcharts === 'object') {
  More(Highcharts);
  HighchartsGauge(Highcharts);
  HighchartsExporting(Highcharts);
}

@Component({
  selector: 'app-temperature',
  standalone: true,
  imports: [HighchartsChartModule, CommonModule],
  templateUrl: './temperature.component.html',
  styleUrls: ['./temperature.component.css'],
})
export class TemperatureComponent implements OnInit {
  isBrowser: boolean;
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {};
  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private flowbiteService: FlowbiteService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }
  ngOnInit(): void {
    console.log('gg');
    this.flowbiteService.loadFlowbite((flowbite) => {
      // Your custom code here
      console.log('Flowbite loaded', flowbite);
    });
    if (this.isBrowser) {
      this.initializeChart();
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
        text: 'Speedometer',
      },
      pane: {
        startAngle: -90,
        endAngle: 89.9,
        background: undefined,
        center: ['50%', '75%'],
        size: '110%',
      },
      yAxis: {
        min: 0,
        max: 200,
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
            to: 130,
            color: '#55BF3B',
            thickness: 20,
          },
          {
            from: 150,
            to: 200,
            color: '#DF5353',
            thickness: 20,
          },
          {
            from: 120,
            to: 160,
            color: '#DDDF0D',
            thickness: 20,
          },
        ],
      },
      series: [
        {
          name: 'Speed',
          type: 'gauge',
          data: [80],
          tooltip: {
            valueSuffix: ' km/h',
          },
          dataLabels: {
            format: '{y} km/h',
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

    setInterval(() => {
      const chart = Highcharts.charts[0];
      if (
        chart &&
        chart.series &&
        chart.series[0] &&
        chart.series[0].points[0]
      ) {
        const point = chart.series[0].points[0];
        const currentValue = point.y ?? 0; // Fallback to 0 if point.y is undefined
        const inc = Math.round((Math.random() - 0.5) * 20);
        let newVal = currentValue + inc;
        if (newVal < 0 || newVal > 200) {
          newVal = currentValue - inc;
        }
        point.update(newVal);
      }
    }, 3000);
  }
}
