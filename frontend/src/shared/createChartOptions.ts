import Highcharts from 'highcharts';

const baseChartOptions: Highcharts.Options = {
  chart: {
    type: 'solidgauge',
    plotBackgroundColor: undefined,
    plotBackgroundImage: undefined,
    plotBorderWidth: 0,
    plotShadow: false,
  },
  pane: {
    startAngle: -90,
    endAngle: 90,
    background: undefined,
    center: ['50%', '50%'],
    // size: '130%',
  },
  credits: {
    enabled: false,
  },
};

const baseChartSeriesOptions: Highcharts.SeriesOptionsType = {
  name: 'Speed',
  type: 'gauge',
  data: [],
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
};

export default function createChartOptions(
  title: string,
  min: number,
  level1: number,
  level2: number,
  level3: number,
  max: number,
  unit: string
): Highcharts.Options {
  return {
    ...baseChartOptions,
    title: {
      text: title,
    },
    yAxis: {
      min: min,
      max: max,
      tickPixelInterval: 72,
      tickPosition: 'inside',
      tickColor:
        (Highcharts.defaultOptions?.chart?.backgroundColor as string) ||
        '#FFFFFF',
      tickLength: 20,
      tickWidth: 2,
      minorTickInterval: undefined,
      labels: {
        distance: 15,
        style: {
          fontSize: '14px',
        },
      },
      lineWidth: 0,
      plotBands: [
        {
          from: min,
          to: level1,
          color: '#55BF3B',
          thickness: 20,
        },
        {
          from: level1,
          to: level2,
          color: '#DDDF0D',
          thickness: 20,
        },
        {
          from: level2,
          to: level3,
          color: '#ff3300',
          thickness: 20,
        },
        {
          from: level3,
          to: max,
          color: '#DF5353',
          thickness: 20,
        },
      ],
    },
    series: [
      {
        ...baseChartSeriesOptions,
        tooltip: {
          valueSuffix: ' ' + unit,
        },
        dataLabels: {
          format: '{y} ' + unit,
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
      } as Highcharts.SeriesOptionsType,
    ],
  } as Highcharts.Options;
}
