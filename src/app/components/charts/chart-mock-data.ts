import { AppChartOptions } from './app-chart.component';

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function createPerformanceLineChartOptions(
  height: number,
  compact = false,
  primary = '#6453D9',
  secondary = '#FACD38',
): AppChartOptions {
  return {
    series: [
      {
        name: 'Views',
        data: [96, 132, 118, 174, 148, 186, 170, 214, 198, 242, 228, 268],
      },
      {
        name: 'Clicks',
        data: [48, 66, 58, 92, 80, 96, 88, 128, 122, 146, 140, 168],
      },
    ],
    chart: {
      type: 'line',
      height,
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: { enabled: false },
      fontFamily: 'inherit',
      sparkline: { enabled: false },
    },
    colors: [primary, secondary],
    stroke: {
      curve: 'smooth',
      width: compact ? 2 : 3,
      lineCap: 'round',
    },
    dataLabels: { enabled: false },
    grid: {
      borderColor: '#ECECEC',
      strokeDashArray: 0,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: false } },
      padding: {
        left: compact ? 4 : 8,
        right: compact ? 4 : 10,
      },
    },
    markers: {
      size: compact ? 3 : 4,
      hover: { sizeOffset: 0 },
      strokeWidth: 0,
    },
    legend: {
      show: false,
    },
    xaxis: {
      categories: monthLabels,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: monthLabels.map(() => compact ? 'rgba(13,13,13,0.5)' : '#A5AAB3'),
          fontSize: compact ? '10px' : '12px',
          fontWeight: '500',
        },
      },
      tooltip: { enabled: false },
      crosshairs: { show: false },
    },
    yaxis: {
      min: 0,
      max: 300,
      tickAmount: 3,
      labels: {
        formatter(value: number) {
          return value === 0 ? '0' : String(Math.round((value / 300) * 500));
        },
        style: {
          colors: compact ? ['rgba(0,0,0,0.7)'] : ['#A5AAB3'],
          fontSize: compact ? '11px' : '12px',
          fontWeight: '500',
        },
      },
    },
    tooltip: {
      enabled: true,
      shared: true,
      intersect: false,
      theme: 'dark',
    },
  };
}

export function createColumnChartOptions(
  height: number,
  categories: readonly string[],
  values: readonly number[],
  colors: readonly string[],
  compact = false,
): AppChartOptions {
  return {
    series: [
      {
        name: 'Series 1',
        data: [...values],
      },
    ],
    chart: {
      type: 'bar',
      height,
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: { enabled: false },
      fontFamily: 'inherit',
    },
    plotOptions: {
      bar: {
        distributed: true,
        columnWidth: compact ? '48%' : '56%',
        borderRadius: compact ? 4 : 8,
      },
    },
    colors: [...colors],
    dataLabels: { enabled: false },
    legend: { show: false },
    grid: {
      borderColor: 'transparent',
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: false } },
      padding: {
        left: compact ? 0 : 6,
        right: compact ? 0 : 6,
      },
    },
    xaxis: {
      categories: [...categories],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: categories.map(() => compact ? 'rgba(13,13,13,0.5)' : '#7D7D7D'),
          fontSize: compact ? '12px' : '15px',
          fontWeight: '500',
        },
      },
    },
    yaxis: {
      min: 0,
      max: Math.max(...values, 1) * 1.15,
      tickAmount: 3,
      labels: {
        style: {
          colors: compact ? ['rgba(0,0,0,0.7)'] : ['#8F8F8F'],
          fontSize: compact ? '11px' : '13px',
          fontWeight: '500',
        },
      },
    },
    tooltip: {
      enabled: true,
      theme: 'dark',
    },
  };
}

export function createSparkBarChartOptions(
  height: number,
  categories: readonly string[],
  values: readonly number[],
  colors: readonly string[],
  compact = false,
): AppChartOptions {
  return {
    series: [
      {
        name: 'Values',
        data: [...values],
      },
    ],
    chart: {
      type: 'bar',
      height,
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: { enabled: false },
      fontFamily: 'inherit',
    },
    plotOptions: {
      bar: {
        distributed: true,
        columnWidth: compact ? '58%' : '72%',
        borderRadius: compact ? 4 : 6,
      },
    },
    colors: [...colors],
    dataLabels: { enabled: false },
    legend: { show: false },
    grid: {
      borderColor: '#ECECEC',
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: false } },
      padding: {
        left: compact ? 0 : 4,
        right: compact ? 0 : 4,
      },
    },
    xaxis: {
      categories: [...categories],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: categories.map(() => compact ? 'rgba(13,13,13,0.4)' : 'rgba(0,0,0,0.5)'),
          fontSize: '10px',
          fontWeight: '500',
        },
      },
    },
    yaxis: {
      min: 0,
      max: Math.max(...values, 1) * 1.15,
      tickAmount: 3,
      labels: {
        style: {
          colors: compact ? ['#1A1B1D'] : ['rgba(0,0,0,0.7)'],
          fontSize: '11px',
          fontWeight: '500',
        },
      },
    },
    tooltip: {
      enabled: true,
      theme: 'dark',
    },
  };
}
