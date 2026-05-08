import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppChartComponent, AppChartOptions } from '../../components/charts/app-chart.component';
import { createSparkBarChartOptions } from '../../components/charts/chart-mock-data';

interface SummaryMetric {
  label: string;
  value: string;
}

interface DistributionItem {
  label: string;
  value: string;
  color: string;
  width: string;
}

interface StoreAvatar {
  src: string;
  alt: string;
}

@Component({
  selector: 'app-analytics-page',
  imports: [NgOptimizedImage, RouterLink, AppChartComponent],
  template: `
    <div class="md:hidden">
      <div class="px-4 pb-28">
        <div class="flex h-[54px] items-center">
          <a
            routerLink="/more"
            aria-label="Back to more"
            class="inline-flex items-center gap-2 text-black"
          >
            <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#F3F3F3]">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="none">
                <path
                  d="M11.5 5L6.5 10L11.5 15"
                  stroke="#141414"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
            <span class="text-[20px] font-semibold leading-6 tracking-[-0.03em] text-black">
              Analytics
            </span>
          </a>
        </div>

        <div class="mt-[25px] overflow-x-auto border-y border-[#EDEDED] py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div class="flex min-w-max items-center gap-8 pr-8">
            @for (metric of summaryMetrics; track metric.label) {
              <div class="flex min-w-[72px] flex-col gap-1">
                <p class="text-[14px] font-medium leading-[normal] text-[rgba(26,27,29,0.5)]">
                  {{ metric.label }}
                </p>
                <p class="text-[18px] font-semibold leading-[normal] text-[#1A1B1D]">
                  {{ metric.value }}
                </p>
              </div>
            }
          </div>
        </div>

        <section class="mt-4 rounded-[20px] border border-[#EBEBEB] bg-white px-[11px] pb-4 pt-[11px]">
          <button
            type="button"
            class="inline-flex h-10 items-center gap-2 rounded-[64px] border border-[#EAEAEA] bg-white pl-3 pr-4 text-[14px] font-medium leading-5 text-black"
          >
            <img [ngSrc]="assets.calendarIcon" width="14" height="14" alt="" class="h-[14px] w-[14px]">
            Last 7 days
            <img [ngSrc]="assets.arrowDownIcon" width="14" height="14" alt="" class="h-[14px] w-[14px]">
          </button>

          <div class="mt-7">
            <p class="text-[14px] font-semibold leading-6 text-[rgba(13,13,13,0.4)]">
              Total sold items
            </p>
            <p class="mt-1 text-[32px] font-semibold leading-[1.2] text-[#1A1B1D]">100,500</p>
            <span
              class="mt-[9px] inline-flex h-6 items-center gap-1 rounded-[100px] bg-[rgba(39,165,81,0.06)] px-2 py-[6px] text-[12px] font-normal leading-4 text-[#27A551]"
            >
              <img [ngSrc]="assets.arrowUpIcon" width="12" height="12" alt="" class="h-3 w-3">
              28% vs last month
            </span>
          </div>

          <div class="mt-6">
            <app-chart [config]="mobileSoldItemsChartOptions" containerClass="min-h-[220px]"></app-chart>
          </div>
        </section>

        <section class="mt-4 rounded-[24px] border border-[#EFEFEF] bg-white px-[15px] pb-4 pt-[15px]">
          <p class="text-[14px] font-medium leading-[normal] text-[rgba(13,13,13,0.5)]">
            Most viewed listing
          </p>

          <div class="mt-4 flex flex-col items-center">
            <div
              class="rounded-[10.46px] border border-[#EAEAEA] bg-white px-[1.7px] pb-[6.5px] pt-[1.7px] shadow-[0_4.721px_9.443px_rgba(192,192,192,0.25)]"
            >
              <div class="overflow-hidden rounded-[8.716px] border border-[#EAEAEA] bg-[#EFEFEF]">
                <img
                  [ngSrc]="assets.mostViewedImage"
                  width="82"
                  height="98"
                  alt="Most viewed listing"
                  class="h-[97px] w-[82px] object-cover"
                >
              </div>
              <div class="px-[1.7px] pt-[5.2px]">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-[6.1px] leading-[8.7px] text-[#1F1F1F]">Iphone 17 pro max</span>
                  <span class="rounded-[435px] bg-[#F0F0F0] px-[3.5px] py-[0.9px] text-[5.23px] leading-[6.97px] text-[#1F1F1F]">
                    New
                  </span>
                </div>
                <div class="mt-[1.7px] flex items-center gap-[1px]">
                  <span class="text-[6.973px] leading-[10.46px] text-[#1F1F1F]">₦</span>
                  <span class="text-[6.973px] leading-[10.46px] text-[#1F1F1F]">2,500,000</span>
                </div>
              </div>
            </div>

            <p class="mt-6 max-w-[246px] text-center text-[17px] font-medium leading-[1.3] text-[rgba(13,13,13,0.5)]">
              This item has been viewed <span class="text-[#0D0D0D]">34,002</span> times
            </p>
          </div>
        </section>

        <section class="mt-4 rounded-[24px] border border-[#EFEFEF] bg-white px-[15px] pb-4 pt-[15px] text-center">
          <p class="text-left text-[14px] font-medium leading-[normal] text-[rgba(13,13,13,0.5)]">
            Average response time
          </p>

          <div class="mt-10 flex flex-col items-center gap-[5px]">
            <p class="text-[64px] font-medium leading-[normal] text-[#0D0D0D]">06 hrs</p>
            <p class="max-w-[287px] text-[12px] leading-[normal] text-[rgba(13,13,13,0.5)]">
              How quickly you respond to buyer inquiries. Faster responses increase your chances of selling.
            </p>
          </div>
        </section>

        <section class="mt-4 rounded-[24px] border border-[#EFEFEF] bg-white px-[15px] pb-[17px] pt-[15px]">
          <p class="text-[14px] font-medium leading-[normal] text-[rgba(13,13,13,0.5)]">
            Listings distribution
          </p>

          <div class="mt-6 flex items-center gap-0.5">
            @for (item of distributionItems; track item.label) {
              <span
                class="h-1 rounded-[14px]"
                [style.width]="item.width"
                [style.background]="item.color"
              ></span>
            }
          </div>

          <div class="mt-6 space-y-6">
            @for (item of distributionItems; track item.label) {
              <div class="flex items-center justify-between gap-4">
                <div class="flex items-center gap-[10px]">
                  <span class="h-3 w-3 rounded-[22px]" [style.background]="item.color"></span>
                  <span class="text-[14px] leading-[normal] text-[rgba(13,13,13,0.5)]">
                    {{ item.label }}
                  </span>
                </div>
                <span class="text-[14px] font-medium leading-[normal] text-[#0D0D0D]">
                  {{ item.value }}
                </span>
              </div>
            }
          </div>

          <a
            href="#"
            class="mt-5 inline-flex text-[14px] font-medium leading-5 text-[#6453D9] underline"
          >
            View more
          </a>
        </section>
      </div>
    </div>

    <div class="hidden h-full md:block">
      <div class="flex h-full flex-col rounded-[24px] bg-white">
        <div class="flex items-center justify-between border-b border-[#EEEEEE] px-4 py-3">
          <h1 class="text-[24px] font-medium leading-[normal] text-[#0D0D0D]">Analytics</h1>

          <button
            type="button"
            (click)="cycleStoreSelection()"
            class="inline-flex h-11 items-center justify-between rounded-[32px] border border-[#EAEAEA] bg-white p-2 pr-3 w-[347px]"
            aria-label="Change store selection"
          >
            <span class="flex items-center gap-2">
              <span class="relative h-8 w-[68px]">
                @for (store of visibleStores(); track store.alt; let i = $index) {
                  <span
                    class="absolute top-0 inline-flex h-8 w-8 overflow-hidden rounded-full border-[1.3px] border-white bg-white"
                    [style.left.px]="i * 12"
                  >
                    @if (store.src) {
                      <img
                        [ngSrc]="store.src"
                        width="32"
                        height="32"
                        [alt]="store.alt"
                        class="h-8 w-8 object-cover"
                      >
                    } @else {
                      <span class="flex h-full w-full items-center justify-center bg-[#3D785F]">
                        <img
                          [ngSrc]="assets.storeBadgeIcon"
                          width="20"
                          height="20"
                          alt=""
                          class="h-5 w-5"
                        >
                      </span>
                    }
                  </span>
                }
              </span>
              <span class="text-[14px] font-medium leading-5 text-[rgba(13,13,13,0.8)]">
                {{ selectedStoreLabel() }}
              </span>
            </span>

            <span class="flex items-center gap-[10px]">
              <span class="h-[17px] w-px rotate-180 bg-[#E8E8E8]"></span>
              <span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#EDEDED]">
                <img [ngSrc]="assets.arrowDownIcon" width="16" height="16" alt="" class="h-4 w-4">
              </span>
            </span>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto px-[19px] pb-5 pt-[17px]">
          <div class="grid grid-cols-4 border-y border-[#EDEDED] py-4">
            @for (metric of summaryMetrics; track metric.label) {
              <div class="flex min-h-[57px] flex-col justify-between pr-4">
                <p class="text-[16px] font-medium leading-[normal] text-[rgba(26,27,29,0.5)]">
                  {{ metric.label }}
                </p>
                <p
                  class="text-[#1A1B1D] leading-[normal]"
                  [class.text-[24px]]="$first"
                  [class.text-[20px]]="!$first"
                  [class.font-semibold]="true"
                >
                  {{ metric.value }}
                </p>
              </div>
            }
          </div>

          <section class="mt-[25px] rounded-[24px] border border-[#EFEFEF] bg-white p-[15px]">
            <div class="flex items-start justify-between gap-4">
              <div class="w-[293px]">
                <p class="text-[14px] font-semibold leading-6 text-[rgba(13,13,13,0.4)]">
                  Total sold items
                </p>
                <p class="mt-1 text-[32px] font-semibold leading-[1.2] text-[#1A1B1D]">100,500</p>
                <span
                  class="mt-[9px] inline-flex h-6 items-center gap-1 rounded-[100px] bg-[rgba(39,165,81,0.06)] px-2 py-[6px] text-[12px] text-[#27A551]"
                >
                  <img [ngSrc]="assets.arrowUpIcon" width="12" height="12" alt="" class="h-3 w-3">
                  28% vs last month
                </span>
              </div>

              <button
                type="button"
                class="inline-flex h-10 items-center justify-center gap-3 rounded-[64px] border border-[#EAEAEA] bg-white pl-3 pr-4 text-[14px] font-medium text-black"
              >
                <span class="flex items-center gap-1">
                  <img [ngSrc]="assets.calendarIcon" width="14" height="14" alt="" class="h-[14px] w-[14px]">
                  Last 7 days
                </span>
                <img [ngSrc]="assets.arrowDownIcon" width="14" height="14" alt="" class="h-[14px] w-[14px]">
              </button>
            </div>

            <div class="mt-8">
              <app-chart [config]="desktopSoldItemsChartOptions" containerClass="min-h-[288px]"></app-chart>
            </div>
          </section>

          <div class="mt-5 grid grid-cols-3 gap-5">
            <section class="rounded-[24px] border border-[#EFEFEF] bg-white px-[15px] pb-4 pt-[15px]">
              <p class="text-[14px] font-medium leading-[normal] text-[rgba(13,13,13,0.5)]">
                Most viewed listing
              </p>

              <div class="mt-[18px] flex flex-col items-center">
                <div
                  class="rounded-[10.46px] border border-[#EAEAEA] bg-white px-[1.7px] pb-[6.5px] pt-[1.7px] shadow-[0_4.721px_9.443px_rgba(192,192,192,0.25)]"
                >
                  <div class="overflow-hidden rounded-[8.716px] border border-[#EAEAEA] bg-[#EFEFEF]">
                    <img
                      [ngSrc]="assets.mostViewedImage"
                      width="82"
                      height="98"
                      alt="Most viewed listing"
                      class="h-[97px] w-[82px] object-cover"
                    >
                  </div>
                  <div class="px-[1.7px] pt-[5.2px]">
                    <div class="flex items-center justify-between gap-2">
                      <span class="text-[6.1px] leading-[8.7px] text-[#1F1F1F]">Iphone 17 pro max</span>
                      <span class="rounded-[435px] bg-[#F0F0F0] px-[3.5px] py-[0.9px] text-[5.23px] leading-[6.97px] text-[#1F1F1F]">
                        New
                      </span>
                    </div>
                    <div class="mt-[1.7px] flex items-center gap-[1px]">
                      <span class="text-[6.973px] leading-[10.46px] text-[#1F1F1F]">₦</span>
                      <span class="text-[6.973px] leading-[10.46px] text-[#1F1F1F]">2,500,000</span>
                    </div>
                  </div>
                </div>

                <p class="mt-[21px] max-w-[246px] text-center text-[17px] font-medium leading-[1.3] text-[rgba(13,13,13,0.5)]">
                  This item has been viewed <span class="text-[#0D0D0D]">34,002</span> times
                </p>
              </div>
            </section>

            <section class="rounded-[24px] border border-[#EFEFEF] bg-white px-[15px] pb-4 pt-[15px] text-center">
              <p class="text-left text-[14px] font-medium leading-[normal] text-[rgba(13,13,13,0.5)]">
                Average response time
              </p>

              <div class="mt-[43px] flex flex-col items-center gap-[5px]">
                <p class="text-[64px] font-medium leading-[normal] text-[#0D0D0D]">06 hrs</p>
                <p class="max-w-[287px] text-[12px] leading-[normal] text-[rgba(13,13,13,0.5)]">
                  How quickly you respond to buyer inquiries. Faster responses increase your chances of selling.
                </p>
              </div>
            </section>

            <section class="rounded-[24px] border border-[#EFEFEF] bg-white px-[15px] pb-[17px] pt-[15px]">
              <p class="text-[14px] font-medium leading-[normal] text-[rgba(13,13,13,0.5)]">
                Listings distribution
              </p>

              <div class="mt-[18px] flex items-center gap-0.5">
                @for (item of distributionItems; track item.label) {
                  <span
                    class="h-1 rounded-[14px]"
                    [style.width]="item.width"
                    [style.background]="item.color"
                  ></span>
                }
              </div>

              <div class="mt-6 space-y-6">
                @for (item of distributionItems; track item.label) {
                  <div class="flex items-center justify-between gap-4">
                    <div class="flex items-center gap-[10px]">
                      <span class="h-3 w-3 rounded-[22px]" [style.background]="item.color"></span>
                      <span class="text-[14px] leading-[normal] text-[rgba(13,13,13,0.5)]">
                        {{ item.label }}
                      </span>
                    </div>
                    <span class="text-[14px] font-medium leading-[normal] text-[#0D0D0D]">
                      {{ item.value }}
                    </span>
                  </div>
                }
              </div>

              <a
                href="#"
                class="mt-[18px] inline-flex text-[14px] font-medium leading-5 text-[#6453D9] underline"
              >
                View more
              </a>
            </section>
          </div>
        </div>
      </div>
    </div>
  `,
  host: { class: 'block h-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsPageComponent {
  readonly mobileSoldItemsChartOptions: AppChartOptions = this.withHoverDarken(
    createSparkBarChartOptions(
      220,
      ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
      [26, 109, 45, 76, 96, 45, 168, 67, 45, 141, 52, 30],
      ['#6453D9', '#6453D9', '#6453D9', '#6453D9', '#6453D9', '#CFC8FD', '#CFC8FD', '#CFC8FD', '#CFC8FD', '#6453D9', '#6453D9', '#6453D9'],
      true,
    ),
  );
  readonly desktopSoldItemsChartOptions: AppChartOptions = this.withHoverDarken(
    createSparkBarChartOptions(
      288,
      ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      [104, 77, 48, 72, 144, 76, 104, 104, 76, 81, 67, 104],
      ['#DAD7F7', '#DAD7F7', '#DAD7F7', '#DAD7F7', '#6B5CF0', '#DAD7F7', '#DAD7F7', '#DAD7F7', '#DAD7F7', '#DAD7F7', '#DAD7F7', '#DAD7F7'],
      false,
    ),
  );
  readonly assets = {
    arrowUpIcon: '/assets/icons/analytics-arrow-up.svg',
    calendarIcon: '/assets/icons/analytics-calendar.svg',
    arrowDownIcon: '/assets/icons/analytics-arrow-down.svg',
    storeBadgeIcon: '/assets/icons/analytics-store-badge.svg',
    mostViewedImage: '/assets/images/analytics-most-viewed-phone.png',
  } as const;

  readonly summaryMetrics: readonly SummaryMetric[] = [
    { label: 'Total listings', value: '108' },
    { label: 'Total views', value: '750,000' },
    { label: 'Total saves', value: '562' },
    { label: 'Total messages', value: '24' },
  ];

  readonly distributionItems: readonly DistributionItem[] = [
    { label: 'Sold', value: '2,000,000', color: '#25AD32', width: '48%' },
    { label: 'Available', value: '1,200,000', color: '#4787FE', width: '24%' },
    { label: 'Paused', value: '800,000', color: '#EE9C2E', width: '28%' },
  ];

  readonly stores = signal<readonly StoreAvatar[]>([
    { src: '/assets/images/analytics-store-avatar-1.png', alt: 'Store avatar one' },
    { src: '/assets/images/analytics-store-avatar-2.png', alt: 'Store avatar two' },
    { src: '/assets/images/analytics-store-avatar-3.png', alt: 'Store avatar three' },
    { src: '', alt: 'Store badge' },
  ]);

  readonly selectedStoreMode = signal<'all' | 'single'>('all');

  readonly visibleStores = computed(() =>
    this.selectedStoreMode() === 'all' ? this.stores() : this.stores().slice(0, 1),
  );

  readonly selectedStoreLabel = computed(() =>
    this.selectedStoreMode() === 'all' ? 'All stores (4)' : 'The Vine Collections',
  );

  cycleStoreSelection(): void {
    this.selectedStoreMode.update(mode => (mode === 'all' ? 'single' : 'all'));
  }

  private withHoverDarken(config: AppChartOptions): AppChartOptions {
    return {
      ...config,
      states: {
        hover: {
          filter: {
            type: 'darken',
          },
        },
        active: {
          filter: {
            type: 'none',
          },
        },
      },
    };
  }
}
