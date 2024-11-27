import { Options } from 'highcharts';
import {MeasurementConfig} from './config';

export default function createGraphOptions(measurementConfig: MeasurementConfig): Options {
  return {
    chart: {
      type: 'areaspline',
      animation: true,
    },
    title: {
      text: measurementConfig.TITLE + ' Data',
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
        },
      },
    },
    yAxis: {
      title: {
        text: `${measurementConfig.TITLE} (${measurementConfig.UNIT})`,
      },
      min: 0,
      max: 100,
    },
    tooltip: {
      shared: true,
      valueSuffix: ' %',
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
          ${measurementConfig.TITLE}: <b>${this.y} ${measurementConfig.UNIT}</b>
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
    credits: {
      enabled: false,
    },
    series: [
      {
        name: `${measurementConfig.TITLE} Data`,
        type: 'areaspline',
        data: [],
      },
    ],
  };
}
