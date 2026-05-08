import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  ApexAnnotations,
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexGrid,
  ApexLegend,
  ApexMarkers,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexResponsive,
  ApexStroke,
  ApexTheme,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  NgApexchartsModule,
} from 'ng-apexcharts';

export interface AppChartOptions {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart: ApexChart;
  annotations?: ApexAnnotations;
  colors?: string[];
  dataLabels?: ApexDataLabels;
  fill?: ApexFill;
  grid?: ApexGrid;
  labels?: string[];
  legend?: ApexLegend;
  markers?: ApexMarkers;
  plotOptions?: ApexPlotOptions;
  responsive?: ApexResponsive[];
  stroke?: ApexStroke;
  theme?: ApexTheme;
  tooltip?: ApexTooltip;
  xaxis?: ApexXAxis;
  yaxis?: ApexYAxis | ApexYAxis[];
}

type ResolvedAppChartOptions = Required<AppChartOptions>;

@Component({
  selector: 'app-chart',
  imports: [NgApexchartsModule],
  template: `
    <div class="w-full overflow-hidden" [class]="containerClass()">
      <apx-chart
        class="block w-full"
        [series]="resolvedConfig().series"
        [chart]="resolvedConfig().chart"
        [annotations]="resolvedConfig().annotations"
        [colors]="resolvedConfig().colors"
        [dataLabels]="resolvedConfig().dataLabels"
        [fill]="resolvedConfig().fill"
        [grid]="resolvedConfig().grid"
        [labels]="resolvedConfig().labels"
        [legend]="resolvedConfig().legend"
        [markers]="resolvedConfig().markers"
        [plotOptions]="resolvedConfig().plotOptions"
        [responsive]="resolvedConfig().responsive"
        [stroke]="resolvedConfig().stroke"
        [theme]="resolvedConfig().theme"
        [tooltip]="resolvedConfig().tooltip"
        [xaxis]="resolvedConfig().xaxis"
        [yaxis]="resolvedConfig().yaxis"
      ></apx-chart>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppChartComponent {
  readonly config = input.required<AppChartOptions>();
  readonly containerClass = input('h-full');

  readonly resolvedConfig = computed<ResolvedAppChartOptions>(() => {
    const config = this.config();

    return {
      ...config,
      annotations: config.annotations ?? {},
      colors: config.colors ?? [],
      dataLabels: config.dataLabels ?? {},
      fill: config.fill ?? {},
      grid: config.grid ?? {},
      labels: config.labels ?? [],
      legend: config.legend ?? {},
      markers: config.markers ?? {},
      plotOptions: config.plotOptions ?? {},
      responsive: config.responsive ?? [],
      stroke: config.stroke ?? {},
      theme: config.theme ?? {},
      tooltip: config.tooltip ?? {},
      xaxis: config.xaxis ?? {},
      yaxis: config.yaxis ?? {},
    };
  });
}
