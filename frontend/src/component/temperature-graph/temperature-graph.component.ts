import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import More from 'highcharts/highcharts-more';
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsGauge from 'highcharts/modules/solid-gauge';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';
import { BrokerService } from '../../../service/broker.service';

if (typeof Highcharts === 'object') {
  More(Highcharts);
  HighchartsGauge(Highcharts);
  HighchartsExporting(Highcharts);
}

@Component({
  selector: 'app-temperature-graph',
  standalone: true,
  imports: [HighchartsChartModule,CommonModule],
  templateUrl: './temperature-graph.component.html',
  styleUrls: ['./temperature-graph.component.css'],
})
export class TemperatureGraphComponent implements OnInit {
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {};
  updateFlag = false;
  liveData$ = new Subject<number>();
  isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private brokerService: BrokerService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
        this.initializeChart();

        this.brokerService.getData('temperature').then((data) => {

            const fiveMinutesInMilliseconds = 5 * 60 * 1000;
            const currentTime = new Date().getTime();

            const filteredData = data.filter(
                (item) => currentTime - item.Time <= fiveMinutesInMilliseconds
            );

            const chartSeriesData = filteredData.map((item) => [
                item.Time,
                item.Data,
            ]);

            this.chartOptions.series = [
                {
                    name: 'Live Data',
                    type: 'areaspline',
                    data: chartSeriesData,
                },
            ];
            this.updateFlag = true;
        }).catch((err) => {
            console.error('Error fetching data from IndexedDB:', err);
        });

        this.brokerService.temperature.subscribe((value) => {
            this.liveData$.next(value);
        });

        this.liveData$.subscribe((value) => {
            this.handleUpdate(value);
        });
    }
}

handleUpdate(value: number): void {
    const series = this.chartOptions.series?.[0] as Highcharts.SeriesLineOptions;
    if (series) {
        const currentTime = new Date().getTime();
        const fiveMinutesInMilliseconds = 5 * 60 * 1000;

        if (!series.data) {
            series.data = [];
        }
        (series.data as any).push([currentTime, value]);

        series.data = (series.data as any).filter(
            (point: any) => currentTime - point[0] <= fiveMinutesInMilliseconds
        );

        this.updateFlag = true;
    }
}

  
  

  initializeChart(): void {
    this.chartOptions = {
      chart: {
        type: 'areaspline',
        animation: true,
      },
      title: {
        text: 'Temperature Data',
      },
      xAxis: {
        type: 'datetime',
        tickPixelInterval: 150,
        labels: {
          formatter: function () {
            const date = new Date(this.value);
            return date.toLocaleString('th-TH', {
              hour: '2-digit',
              minute: '2-digit',
            });
          }
        }
      },
      yAxis: {
        title: {
          text: 'Temperature (°C)',
        },
        min: 0,
        max: 50,
      },
      tooltip: {
        shared: true,
        valueSuffix: ' °C',
        xDateFormat: '%A, %b %e, %Y %H:%M:%S',
        formatter: function (this: Highcharts.TooltipFormatterContextObject) {
          const date = new Date(this.x ?? 0);
          const formattedDate = date.toLocaleString('th-TH', {
            timeZone: 'Asia/Bangkok',
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });
  
          return `
            <b>${formattedDate}</b><br>
            Temperature: <b>${this.y} °C</b>
          `;
        },
      },
      plotOptions: {
        areaspline: {
          fillColor: {
            linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
            stops: [
              [0, '#32CD32'],
              [1, 'rgba(50, 205, 50, 0)'],
            ],
          },
          marker: {
            radius: 2,
          },
          lineWidth: 1,
          states: {
            hover: {
              lineWidth: 1,
            },
          },
          threshold: null,
        },
      },
      series: [
        {
          name: 'Temperature Data',
          type: 'areaspline',
          data: [],
        },
      ],
    };
  }
  
}
