import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AppChartComponent, AppChartOptions } from '../../components/charts/app-chart.component';
import { createSparkBarChartOptions } from '../../components/charts/chart-mock-data';
import { CustomDropdownComponent, type CustomDropdownOption } from '../../components/ui/custom-dropdown.component';
import { environment } from '../../../environments/environment';
import {
  VendorsService,
  type MyStoresResponse,
  type VendorAnalyticsRecord,
  type VendorRecord,
} from '../../services/vendors.service';
import { formatListingPricing } from '../../utils/listing-pricing';

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
  id: string;
  src: string;
  alt: string;
}

interface SoldItemsChartPoint {
  date: string;
  count: number;
}

interface AggregateAnalyticsTotals {
  totalListings: number;
  totalViews: number;
  totalSaves: number;
  active: number;
  sold: number;
  responseTimeSecondsTotal: number;
  responseTimeSamples: number;
}

type AnalyticsRange = '7d' | '30d' | '90d';
type AnalyticsStoreFilter = string;

@Component({
  selector: 'app-analytics-page',
  imports: [NgOptimizedImage, RouterLink, AppChartComponent, CustomDropdownComponent],
  template: `
    <div class="md:hidden">
      <div class="px-4 pb-28">
        <div class="flex h-[54px] items-center">
          <a
          routerLink="/seller/more"
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
            @if (isLoading()) {
              @for (item of skeletonItems; track item) {
                <div class="flex min-w-[72px] flex-col gap-2">
                  <span class="skeleton-shimmer h-4 w-20 rounded-full"></span>
                  <span class="skeleton-shimmer h-6 w-12 rounded-full"></span>
                </div>
              }
            } @else {
              @for (metric of summaryMetrics(); track metric.label) {
                <div class="flex min-w-[72px] flex-col gap-1">
                  <p class="text-[14px] font-medium leading-[normal] text-[rgba(26,27,29,0.5)]">
                    {{ metric.label }}
                  </p>
                  <p class="text-[18px] font-semibold leading-[normal] text-[#1A1B1D]">
                    {{ metric.value }}
                  </p>
                </div>
              }
            }
          </div>
        </div>

        @if (loadMessage()) {
          <p class="mt-4 rounded-[18px] bg-[#F7F7F8] px-4 py-3 text-[13px] font-medium text-[#6A6F7A]">
            {{ loadMessage() }}
          </p>
        }

        <section class="mt-4 rounded-[20px] border border-[#EBEBEB] bg-white px-[11px] pb-4 pt-[11px]">
          <app-custom-dropdown
            [options]="rangeOptions"
            [value]="range()"
            [ariaLabel]="'Filter analytics range'"
            [buttonClass]="'inline-flex h-10 items-center gap-2 rounded-[64px] border border-[#EAEAEA] bg-white pl-3 pr-4 text-[14px] font-medium leading-5 text-black'"
            [labelClass]="'truncate'"
            [iconClass]="'text-[#777777]'"
            [menuClass]="'min-w-[156px]'"
            [optionClass]="'w-full rounded-[14px] px-4 py-3 text-left text-[14px] text-[#1A1B1D] transition hover:bg-[#F5F6FA]'"
            [activeOptionClass]="'bg-[#F5F1FF] text-[#5932EA]'"
            (valueChange)="range.set($event)"
          ></app-custom-dropdown>

          <div class="mt-7">
            <p class="text-[14px] font-semibold leading-6 text-[rgba(13,13,13,0.4)]">
              Total sold items
            </p>
            @if (isLoading()) {
              <div class="mt-2 space-y-3">
                <span class="skeleton-shimmer block h-9 w-24 rounded-full"></span>
                <span class="skeleton-shimmer block h-6 w-36 rounded-full"></span>
              </div>
            } @else {
              <p class="mt-1 text-[32px] font-semibold leading-[1.2] text-[#1A1B1D]">
                {{ formatInteger(soldItemsMetrics().total) }}
              </p>
              <span
                class="mt-[9px] inline-flex h-6 items-center gap-1 rounded-[100px] px-2 py-[6px] text-[12px] font-normal leading-4"
                [class]="soldItemsChangeToneClass()"
              >
                <img [ngSrc]="soldItemsChangeIcon()" width="12" height="12" alt="" class="h-3 w-3">
                {{ soldItemsChangeText() }}
              </span>
            }
          </div>

          <div class="mt-6">
            @if (isLoading()) {
              <div class="skeleton-shimmer min-h-[220px] rounded-[20px]"></div>
            } @else {
              <app-chart [config]="mobileSoldItemsChartOptions()" containerClass="min-h-[220px]"></app-chart>
            }
          </div>
        </section>

        <section class="mt-4 rounded-[24px] border border-[#EFEFEF] bg-white px-[15px] pb-4 pt-[15px]">
          <p class="text-[14px] font-medium leading-[normal] text-[rgba(13,13,13,0.5)]">
            Most viewed listing
          </p>

          <div class="mt-4 flex flex-col items-center">
            @if (isLoading()) {
              <div class="skeleton-shimmer h-[132px] w-[96px] rounded-[12px]"></div>
            } @else {
              <div
                class="rounded-[10.46px] border border-[#EAEAEA] bg-white px-[1.7px] pb-[6.5px] pt-[1.7px] shadow-[0_4.721px_9.443px_rgba(192,192,192,0.25)]"
              >
                <div class="overflow-hidden rounded-[8.716px] border border-[#EAEAEA] bg-[#EFEFEF]">
                  @if (mostViewedImage()) {
                    <img
                      [ngSrc]="mostViewedImage()"
                      width="82"
                      height="98"
                      alt="Most viewed listing"
                      class="h-[97px] w-[82px] object-cover"
                    >
                  } @else {
                    <div class="flex h-[97px] w-[82px] items-center justify-center text-[10px] font-medium text-[#8A8F9A]">
                      No image
                    </div>
                  }
                </div>
                <div class="px-[1.7px] pt-[5.2px]">
                  <div class="flex items-center justify-between gap-2">
                    <span class="text-[6.1px] leading-[8.7px] text-[#1F1F1F]">{{ mostViewedTitle() }}</span>
                    @if (mostViewedBadge()) {
                      <span class="rounded-[435px] bg-[#F0F0F0] px-[3.5px] py-[0.9px] text-[5.23px] leading-[6.97px] text-[#1F1F1F]">
                        {{ mostViewedBadge() }}
                      </span>
                    }
                  </div>
                  @if (mostViewedPrice()) {
                    <div class="mt-[1.7px] flex items-center gap-[1px]">
                      <span class="text-[6.973px] leading-[10.46px] text-[#1F1F1F]">{{ mostViewedPrice() }}</span>
                    </div>
                  }
                </div>
              </div>
            }

            <p class="mt-6 max-w-[246px] text-center text-[17px] font-medium leading-[1.3] text-[rgba(13,13,13,0.5)]">
              {{ mostViewedViewsText() }}
            </p>
          </div>
        </section>

        <section class="mt-4 rounded-[24px] border border-[#EFEFEF] bg-white px-[15px] pb-4 pt-[15px] text-center">
          <p class="text-left text-[14px] font-medium leading-[normal] text-[rgba(13,13,13,0.5)]">
            Average response time
          </p>

          <div class="mt-10 flex flex-col items-center gap-[5px]">
            @if (isLoading()) {
              <span class="skeleton-shimmer h-20 w-40 rounded-full"></span>
            } @else {
              <p class="text-[64px] font-medium leading-[normal] text-[#0D0D0D]">{{ averageResponseTimeLabel() }}</p>
            }
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
            @if (isLoading()) {
              <span class="skeleton-shimmer h-1 w-full rounded-[14px]"></span>
            } @else {
              @for (item of distributionItems(); track item.label) {
                <span
                  class="h-1 rounded-[14px]"
                  [style.width]="item.width"
                  [style.background]="item.color"
                ></span>
              }
            }
          </div>

          <div class="mt-6 space-y-6">
            @if (isLoading()) {
              @for (item of distributionSkeletonItems; track item) {
                <div class="flex items-center justify-between gap-4">
                  <span class="skeleton-shimmer h-4 w-28 rounded-full"></span>
                  <span class="skeleton-shimmer h-4 w-10 rounded-full"></span>
                </div>
              }
            } @else {
              @for (item of distributionItems(); track item.label) {
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

          <app-custom-dropdown
            [options]="storeOptions()"
            [value]="selectedStoreFilter()"
            [ariaLabel]="'Filter analytics by store'"
            [buttonClass]="'inline-flex h-11 items-center justify-between rounded-[32px] border border-[#EAEAEA] bg-white p-2 pr-3 w-[347px]'"
            [labelClass]="'truncate text-[14px] font-medium leading-5 text-[rgba(13,13,13,0.8)]'"
            [iconClass]="'text-[#777777]'"
            [menuClass]="'min-w-[220px]'"
            [optionClass]="'w-full rounded-[14px] px-4 py-3 text-left text-[14px] text-[#1A1B1D] transition hover:bg-[#F5F6FA]'"
            [activeOptionClass]="'bg-[#F5F1FF] text-[#5932EA]'"
            (valueChange)="onStoreFilterChange($event)"
          ></app-custom-dropdown>
        </div>

        <div class="flex-1 overflow-y-auto px-[19px] pb-5 pt-[17px]">
          <div class="grid grid-cols-4 border-y border-[#EDEDED] py-4">
            @if (isLoading()) {
              @for (item of skeletonItems; track item) {
                <div class="flex min-h-[57px] flex-col justify-between pr-4">
                  <span class="skeleton-shimmer h-5 w-28 rounded-full"></span>
                  <span class="skeleton-shimmer h-7 w-16 rounded-full"></span>
                </div>
              }
            } @else {
              @for (metric of summaryMetrics(); track metric.label) {
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
            }
          </div>

          @if (loadMessage()) {
            <p class="mt-4 rounded-[18px] bg-[#F7F7F8] px-4 py-3 text-[13px] font-medium text-[#6A6F7A]">
              {{ loadMessage() }}
            </p>
          }

          <section class="mt-[25px] rounded-[24px] border border-[#EFEFEF] bg-white p-[15px]">
            <div class="flex items-start justify-between gap-4">
              <div class="w-[293px]">
                <p class="text-[14px] font-semibold leading-6 text-[rgba(13,13,13,0.4)]">
                  Total sold items
                </p>
                @if (isLoading()) {
                  <div class="mt-2 space-y-3">
                    <span class="skeleton-shimmer block h-9 w-24 rounded-full"></span>
                    <span class="skeleton-shimmer block h-6 w-36 rounded-full"></span>
                  </div>
                } @else {
                  <p class="mt-1 text-[32px] font-semibold leading-[1.2] text-[#1A1B1D]">
                    {{ formatInteger(soldItemsMetrics().total) }}
                  </p>
                  <span
                    class="mt-[9px] inline-flex h-6 items-center gap-1 rounded-[100px] px-2 py-[6px] text-[12px]"
                    [class]="soldItemsChangeToneClass()"
                  >
                    <img [ngSrc]="soldItemsChangeIcon()" width="12" height="12" alt="" class="h-3 w-3">
                    {{ soldItemsChangeText() }}
                  </span>
                }
              </div>

              <app-custom-dropdown
                [options]="rangeOptions"
                [value]="range()"
                [ariaLabel]="'Filter analytics range'"
                [buttonClass]="'inline-flex h-10 items-center justify-center gap-3 rounded-[64px] border border-[#EAEAEA] bg-white pl-3 pr-4 text-[14px] font-medium text-black'"
                [labelClass]="'truncate'"
                [iconClass]="'text-[#777777]'"
                [menuClass]="'min-w-[156px]'"
                [optionClass]="'w-full rounded-[14px] px-4 py-3 text-left text-[14px] text-[#1A1B1D] transition hover:bg-[#F5F6FA]'"
                [activeOptionClass]="'bg-[#F5F1FF] text-[#5932EA]'"
                (valueChange)="range.set($event)"
              ></app-custom-dropdown>
            </div>

            <div class="mt-8">
              @if (isLoading()) {
                <div class="skeleton-shimmer min-h-[288px] rounded-[20px]"></div>
              } @else {
                <app-chart [config]="desktopSoldItemsChartOptions()" containerClass="min-h-[288px]"></app-chart>
              }
            </div>
          </section>

          <div class="mt-5 grid grid-cols-3 gap-5">
            <section class="rounded-[24px] border border-[#EFEFEF] bg-white px-[15px] pb-4 pt-[15px]">
              <p class="text-[14px] font-medium leading-[normal] text-[rgba(13,13,13,0.5)]">
                Most viewed listing
              </p>

              <div class="mt-[18px] flex flex-col items-center">
                @if (isLoading()) {
                  <div class="skeleton-shimmer h-[132px] w-[96px] rounded-[12px]"></div>
                } @else {
                  <div
                    class="rounded-[10.46px] border border-[#EAEAEA] bg-white px-[1.7px] pb-[6.5px] pt-[1.7px] shadow-[0_4.721px_9.443px_rgba(192,192,192,0.25)]"
                  >
                    <div class="overflow-hidden rounded-[8.716px] border border-[#EAEAEA] bg-[#EFEFEF]">
                      @if (mostViewedImage()) {
                        <img
                          [ngSrc]="mostViewedImage()"
                          width="82"
                          height="98"
                          alt="Most viewed listing"
                          class="h-[97px] w-[82px] object-cover"
                        >
                      } @else {
                        <div class="flex h-[97px] w-[82px] items-center justify-center text-[10px] font-medium text-[#8A8F9A]">
                          No image
                        </div>
                      }
                    </div>
                    <div class="px-[1.7px] pt-[5.2px]">
                      <div class="flex items-center justify-between gap-2">
                        <span class="text-[6.1px] leading-[8.7px] text-[#1F1F1F]">{{ mostViewedTitle() }}</span>
                        @if (mostViewedBadge()) {
                          <span class="rounded-[435px] bg-[#F0F0F0] px-[3.5px] py-[0.9px] text-[5.23px] leading-[6.97px] text-[#1F1F1F]">
                            {{ mostViewedBadge() }}
                          </span>
                        }
                      </div>
                      @if (mostViewedPrice()) {
                        <div class="mt-[1.7px] flex items-center gap-[1px]">
                          <span class="text-[6.973px] leading-[10.46px] text-[#1F1F1F]">{{ mostViewedPrice() }}</span>
                        </div>
                      }
                    </div>
                  </div>
                }

                <p class="mt-[21px] max-w-[246px] text-center text-[17px] font-medium leading-[1.3] text-[rgba(13,13,13,0.5)]">
                  {{ mostViewedViewsText() }}
                </p>
              </div>
            </section>

            <section class="rounded-[24px] border border-[#EFEFEF] bg-white px-[15px] pb-4 pt-[15px] text-center">
              <p class="text-left text-[14px] font-medium leading-[normal] text-[rgba(13,13,13,0.5)]">
                Average response time
              </p>

              <div class="mt-[43px] flex flex-col items-center gap-[5px]">
                @if (isLoading()) {
                  <span class="skeleton-shimmer h-20 w-40 rounded-full"></span>
                } @else {
                  <p class="text-[64px] font-medium leading-[normal] text-[#0D0D0D]">{{ averageResponseTimeLabel() }}</p>
                }
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
                @if (isLoading()) {
                  <span class="skeleton-shimmer h-1 w-full rounded-[14px]"></span>
                } @else {
                  @for (item of distributionItems(); track item.label) {
                    <span
                      class="h-1 rounded-[14px]"
                      [style.width]="item.width"
                      [style.background]="item.color"
                    ></span>
                  }
                }
              </div>

              <div class="mt-6 space-y-6">
                @if (isLoading()) {
                  @for (item of distributionSkeletonItems; track item) {
                    <div class="flex items-center justify-between gap-4">
                      <span class="skeleton-shimmer h-4 w-28 rounded-full"></span>
                      <span class="skeleton-shimmer h-4 w-10 rounded-full"></span>
                    </div>
                  }
                } @else {
                  @for (item of distributionItems(); track item.label) {
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
  styles: [
    `
      .skeleton-shimmer {
        position: relative;
        overflow: hidden;
        background: #f1f3f6;
      }

      .skeleton-shimmer::after {
        position: absolute;
        inset: 0;
        content: '';
        transform: translateX(-100%);
        background: linear-gradient(
          90deg,
          rgba(255, 255, 255, 0) 0%,
          rgba(255, 255, 255, 0.75) 50%,
          rgba(255, 255, 255, 0) 100%
        );
        animation: analytics-shimmer 1.4s ease-in-out infinite;
      }

      @keyframes analytics-shimmer {
        100% {
          transform: translateX(100%);
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsPageComponent {
  private readonly vendorsService = inject(VendorsService);
  private readonly apiOrigin = this.resolveApiOrigin();
  readonly assets = {
    arrowUpIcon: '/assets/icons/analytics-arrow-up.svg',
    arrowDownIcon: '/assets/icons/analytics-arrow-down.svg',
    calendarIcon: '/assets/icons/analytics-calendar.svg',
    storeBadgeIcon: '/assets/icons/analytics-store-badge.svg',
  } as const;
  readonly skeletonItems = [1, 2, 3, 4] as const;
  readonly distributionSkeletonItems = [1, 2, 3] as const;

  readonly summaryMetrics = computed<readonly SummaryMetric[]>(() => [
    { label: 'Total listings', value: this.formatInteger(this.analyticsTotals().totalListings) },
    { label: 'Total views', value: this.formatInteger(this.analyticsTotals().totalViews) },
    { label: 'Total saves', value: this.formatInteger(this.analyticsTotals().totalSaves) },
    { label: 'Total messages', value: this.formatInteger(0) },
  ]);

  readonly distributionItems = computed<readonly DistributionItem[]>(() => {
    const active = this.analyticsDistribution().active;
    const sold = this.analyticsDistribution().sold;
    const total = Math.max(active + sold, 1);

    return [
      {
        label: 'Sold',
        value: this.formatInteger(sold),
        color: '#25AD32',
        width: `${Math.max((sold / total) * 100, sold > 0 ? 8 : 0)}%`,
      },
      {
        label: 'Available',
        value: this.formatInteger(active),
        color: '#4787FE',
        width: `${Math.max((active / total) * 100, active > 0 ? 8 : 0)}%`,
      },
      {
        label: 'Paused',
        value: this.formatInteger(0),
        color: '#EE9C2E',
        width: '0%',
      },
    ];
  });

  readonly stores = signal<readonly StoreAvatar[]>([
    { id: 'all', src: '', alt: 'All stores' },
  ]);
  readonly backendStoreIds = signal<readonly string[]>([]);
  readonly analyticsTotals = signal({
    totalListings: 0,
    totalViews: 0,
    totalSaves: 0,
  });
  readonly analyticsDistribution = signal({
    active: 0,
    sold: 0,
  });
  readonly averageResponseTimeSeconds = signal<number | null>(null);
  readonly soldItemsSeries = signal<readonly SoldItemsChartPoint[]>([]);
  readonly mostViewedTitle = signal<string>('No listings yet');
  readonly mostViewedImage = signal<string>('');
  readonly mostViewedPrice = signal<string>('');
  readonly mostViewedBadge = signal<string>('');
  readonly mostViewedViewsText = signal<string>('Your stores have no recorded views yet');
  readonly isLoading = signal(true);
  readonly loadMessage = signal('');
  readonly averageResponseTimeLabel = computed(() =>
    this.formatResponseTime(this.averageResponseTimeSeconds()),
  );

  readonly range = signal<AnalyticsRange>('7d');
  readonly selectedStoreFilter = signal<AnalyticsStoreFilter>('all');
  readonly visibleSoldItemsSeries = computed(() => this.sliceSoldItemsSeries(this.soldItemsSeries(), this.range()));
  readonly soldItemsMetrics = computed(() => {
    const range = this.range();
    const rangeDays = this.getRangeDays(range);
    const series = this.soldItemsSeries();
    const currentPeriod = series.slice(-rangeDays);
    const previousPeriod = series.slice(-(rangeDays * 2), -rangeDays);
    const currentTotal = this.sumSoldItems(currentPeriod);
    const previousTotal = this.sumSoldItems(previousPeriod);
    const changePercent =
      previousTotal > 0
        ? Math.round(((currentTotal - previousTotal) / previousTotal) * 100)
        : 0;

    return {
      total: currentTotal,
      changePercent,
      comparisonLabel: this.getPreviousRangeLabel(range),
    };
  });
  readonly soldItemsChangeIcon = computed(() =>
    this.soldItemsMetrics().changePercent < 0 ? this.assets.arrowDownIcon : this.assets.arrowUpIcon,
  );
  readonly soldItemsChangeToneClass = computed(() => {
    const changePercent = this.soldItemsMetrics().changePercent;
    if (changePercent < 0) {
      return 'bg-[rgba(238,156,46,0.08)] text-[#EE9C2E]';
    }

    if (changePercent === 0) {
      return 'bg-[rgba(13,13,13,0.06)] text-[rgba(13,13,13,0.7)]';
    }

    return 'bg-[rgba(39,165,81,0.06)] text-[#27A551]';
  });
  readonly soldItemsChangeText = computed(() => {
    const { changePercent, comparisonLabel } = this.soldItemsMetrics();
    const formattedPercent = `${Math.abs(changePercent)}%`;

    if (changePercent === 0) {
      return `${formattedPercent} vs ${comparisonLabel}`;
    }

    return `${formattedPercent} vs ${comparisonLabel}`;
  });
  readonly mobileSoldItemsChartOptions = computed<AppChartOptions>(() =>
    this.withHoverDarken(this.createSoldItemsChartOptions(220, true)),
  );
  readonly desktopSoldItemsChartOptions = computed<AppChartOptions>(() =>
    this.withHoverDarken(this.createSoldItemsChartOptions(288, false)),
  );

  readonly visibleStores = computed(() =>
    this.selectedStoreFilter() === 'all'
      ? this.stores()
      : this.stores().filter((store) => store.id === this.selectedStoreFilter()).slice(0, 1),
  );

  readonly selectedStoreLabel = computed(() =>
    this.selectedStoreFilter() === 'all'
      ? `All stores (${Math.max(this.stores().length - 1, 0)})`
      : this.visibleStores()[0]?.alt ?? 'Selected store',
  );
  readonly rangeOptions: readonly CustomDropdownOption<AnalyticsRange>[] = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
  ];
  readonly storeOptions = computed<readonly CustomDropdownOption<AnalyticsStoreFilter>[]>(() => [
    {
      value: 'all',
      label: `All stores (${Math.max(this.stores().length - 1, 0)})`,
    },
    ...this.stores()
      .filter((store) => store.id !== 'all')
      .map((store) => ({
        value: store.id,
        label: store.alt,
      })),
  ]);

  constructor() {
    void this.loadAnalyticsStores();
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

  private async loadAnalyticsStores(): Promise<void> {
    this.isLoading.set(true);
    this.loadMessage.set('');

    try {
      const response = await firstValueFrom(this.vendorsService.getMyStores());
      const stores = this.extractStores(response);
      const mappedStores = stores.map((store, index) => this.toStoreAvatar(store, index));
      this.backendStoreIds.set(mappedStores.map((store) => store.id));
      this.stores.set([
        { id: 'all', src: '', alt: 'All stores' },
        ...mappedStores,
      ]);

      this.selectedStoreFilter.set('all');
      if (mappedStores.length > 0) {
        await this.loadAllStoresAnalytics();
        return;
      }

      this.resetAnalyticsState('Create a store to start seeing analytics.');
    } catch {
      this.resetAnalyticsState('We could not load analytics right now. Please try again later.');
    } finally {
      this.isLoading.set(false);
    }
  }

  private async loadVendorAnalytics(storeId: string): Promise<void> {
    if (!storeId || storeId === 'all') {
      return;
    }

    this.isLoading.set(true);

    try {
      const response = await firstValueFrom(this.vendorsService.getVendorAnalytics(storeId));
      this.applyAnalytics(response);
    } catch {
      this.resetAnalyticsState('We could not load analytics for this store right now.');
    } finally {
      this.isLoading.set(false);
    }
  }

  protected async onStoreFilterChange(storeId: AnalyticsStoreFilter): Promise<void> {
    this.selectedStoreFilter.set(storeId);

    if (storeId === 'all') {
      await this.loadAllStoresAnalytics();
      return;
    }

    await this.loadVendorAnalytics(storeId);
  }

  private async loadAllStoresAnalytics(): Promise<void> {
    const storeIds = this.backendStoreIds();
    if (!storeIds.length) {
      return;
    }

    this.isLoading.set(true);

    try {
      const responses = await Promise.all(
        storeIds.map((storeId) => firstValueFrom(this.vendorsService.getVendorAnalytics(storeId))),
      );
      this.applyAggregateAnalytics(responses);
    } catch {
      this.resetAnalyticsState('We could not load analytics right now. Please try again later.');
    } finally {
      this.isLoading.set(false);
    }
  }

  private applyAnalytics(record: VendorAnalyticsRecord): void {
    const totalListings = this.readNumber(record['total_listings']) ?? 0;
    const totalViews = this.readNumber(record['total_views']) ?? 0;
    const totalSaves = this.readNumber(record['total_saves']) ?? 0;
    const distribution = this.readRecord(record['distribution']);
    const mostViewed = this.readRecord(record['most_viewed']);

    this.analyticsTotals.set({
      totalListings,
      totalViews,
      totalSaves,
    });
    this.analyticsDistribution.set({
      active: this.readNumber(distribution?.['active']) ?? 0,
      sold: this.readNumber(distribution?.['sold']) ?? 0,
    });
    this.averageResponseTimeSeconds.set(this.readNumber(record['average_response_time_seconds']));
    this.soldItemsSeries.set(this.readSoldItemsSeries(record['sold_items_chart']));
    this.mostViewedTitle.set(this.readString(mostViewed?.['title']) ?? 'No listings yet');
    this.mostViewedImage.set(this.resolveMostViewedImage(mostViewed));
    this.applyMostViewedPricing(mostViewed);
    this.mostViewedViewsText.set(
      totalViews > 0
        ? `This store has been viewed ${this.formatInteger(totalViews)} times`
        : 'This store has no recorded views yet',
    );
    this.loadMessage.set('');
  }

  private applyAggregateAnalytics(records: readonly VendorAnalyticsRecord[]): void {
    const totals = records.reduce<AggregateAnalyticsTotals>(
      (summary, record) => {
        const totalListings = this.readNumber(record['total_listings']) ?? 0;
        const totalViews = this.readNumber(record['total_views']) ?? 0;
        const totalSaves = this.readNumber(record['total_saves']) ?? 0;
        const distribution = this.readRecord(record['distribution']);
        const active = this.readNumber(distribution?.['active']) ?? 0;
        const sold = this.readNumber(distribution?.['sold']) ?? 0;

        return {
          totalListings: summary.totalListings + totalListings,
          totalViews: summary.totalViews + totalViews,
          totalSaves: summary.totalSaves + totalSaves,
          active: summary.active + active,
          sold: summary.sold + sold,
          responseTimeSecondsTotal:
            summary.responseTimeSecondsTotal
            + (this.readNumber(record['average_response_time_seconds']) ?? 0),
          responseTimeSamples:
            summary.responseTimeSamples
            + (this.readNumber(record['average_response_time_seconds']) !== null ? 1 : 0),
        };
      },
      {
        totalListings: 0,
        totalViews: 0,
        totalSaves: 0,
        active: 0,
        sold: 0,
        responseTimeSecondsTotal: 0,
        responseTimeSamples: 0,
      },
    );

    const richestRecord = records.reduce<VendorAnalyticsRecord | null>((selected, record) => {
      const selectedViews = selected ? (this.readNumber(selected['total_views']) ?? -1) : -1;
      const currentViews = this.readNumber(record['total_views']) ?? -1;
      return currentViews > selectedViews ? record : selected;
    }, null);
    const mostViewed = this.readRecord(richestRecord?.['most_viewed']);

    this.analyticsTotals.set({
      totalListings: totals.totalListings,
      totalViews: totals.totalViews,
      totalSaves: totals.totalSaves,
    });
    this.analyticsDistribution.set({
      active: totals.active,
      sold: totals.sold,
    });
    this.averageResponseTimeSeconds.set(
      totals.responseTimeSamples > 0
        ? Math.round(totals.responseTimeSecondsTotal / totals.responseTimeSamples)
        : null,
    );
    this.soldItemsSeries.set(this.aggregateSoldItemsSeries(records));
    this.mostViewedTitle.set(this.readString(mostViewed?.['title']) ?? 'No listings yet');
    this.mostViewedImage.set(this.resolveMostViewedImage(mostViewed));
    this.applyMostViewedPricing(mostViewed);
    this.mostViewedViewsText.set(
      totals.totalViews > 0
        ? `Your stores have been viewed ${this.formatInteger(totals.totalViews)} times`
        : 'Your stores have no recorded views yet',
    );
    this.loadMessage.set('');
  }

  private resetAnalyticsState(message = ''): void {
    this.analyticsTotals.set({
      totalListings: 0,
      totalViews: 0,
      totalSaves: 0,
    });
    this.analyticsDistribution.set({
      active: 0,
      sold: 0,
    });
    this.averageResponseTimeSeconds.set(null);
    this.soldItemsSeries.set([]);
    this.mostViewedTitle.set('No listings yet');
    this.mostViewedImage.set('');
    this.mostViewedPrice.set('');
    this.mostViewedBadge.set('');
    this.mostViewedViewsText.set('Your stores have no recorded views yet');
    this.loadMessage.set(message);
  }

  private resolveMostViewedImage(record: Record<string, unknown> | null): string {
    if (!record) {
      return '';
    }

    return (
      this.resolveMediaUrl(
        this.readString(record['url']) ??
          this.readString(record['image']) ??
          this.readString(record['thumbnail']) ??
          this.readString(record['cover_image']) ??
          this.readString(record['primary_image']),
      ) ?? ''
    );
  }

  private applyMostViewedPricing(record: Record<string, unknown> | null): void {
    if (!record) {
      this.mostViewedPrice.set('');
      this.mostViewedBadge.set('');
      return;
    }

    const pricing = formatListingPricing(record);
    this.mostViewedPrice.set(pricing.price);
    this.mostViewedBadge.set(
      pricing.discountBadge ??
        this.readString(record['status']) ??
        this.readString(record['condition']) ??
        '',
    );
  }

  private extractStores(response: MyStoresResponse): readonly VendorRecord[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (!response || typeof response !== 'object') {
      return [];
    }

    if (Array.isArray(response.results)) {
      return response.results;
    }

    if (Array.isArray(response.data)) {
      return response.data;
    }

    if (Array.isArray(response.stores)) {
      return response.stores;
    }

    if (Array.isArray(response.vendors)) {
      return response.vendors;
    }

    return [];
  }

  private toStoreAvatar(record: VendorRecord, index: number): StoreAvatar {
    return {
      id: this.readString(record['id']) ?? `store-${index + 1}`,
      alt:
        this.readString(record['store_name']) ??
        this.readString(record['name']) ??
        this.readString(record['vendor_name']) ??
        `Store ${index + 1}`,
      src:
        this.resolveMediaUrl(
          this.readString(record['profile_photo']) ??
            this.readString(record['logo']) ??
            this.readNestedString(record['user'], 'avatar'),
        ) ?? '/assets/images/analytics-store-avatar-1.png',
    };
  }

  private resolveApiOrigin(): string {
    try {
      return new URL(environment.apiUrl).origin;
    } catch {
      return '';
    }
  }

  private resolveMediaUrl(value: string | null): string | null {
    if (!value) {
      return null;
    }

    if (/^https?:\/\//i.test(value)) {
      return value;
    }

    if (!this.apiOrigin) {
      return value;
    }

    if (value.startsWith('/')) {
      return `${this.apiOrigin}${value}`;
    }

    return `${this.apiOrigin}/${value}`;
  }

  protected formatInteger(value: number): string {
    return new Intl.NumberFormat('en-NG').format(value);
  }


  private formatResponseTime(value: number | null): string {
    if (value === null || !Number.isFinite(value) || value <= 0) {
      return 'N/A';
    }

    const totalMinutes = Math.max(1, Math.round(value / 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0 && minutes > 0) {
      return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;
    }

    if (hours > 0) {
      return `${String(hours).padStart(2, '0')} hrs`;
    }

    return `${String(minutes).padStart(2, '0')} mins`;
  }

  private createSoldItemsChartOptions(height: number, compact: boolean): AppChartOptions {
    const series = this.visibleSoldItemsSeries();
    const categories = this.buildSoldItemsCategories(series, compact);
    const values = series.map((point) => point.count);
    const colors = values.map((_, index) => this.resolveSoldItemsBarColor(index, values.length, compact));

    return createSparkBarChartOptions(height, categories, values, colors, compact);
  }

  private buildSoldItemsCategories(
    series: readonly SoldItemsChartPoint[],
    compact: boolean,
  ): readonly string[] {
    const length = series.length;
    const step = length <= 7 ? 1 : length <= 30 ? 5 : 15;

    return series.map((point, index) => {
      const isLast = index === length - 1;
      if (!isLast && index % step !== 0) {
        return '';
      }

      return this.formatChartLabel(point.date, compact, length);
    });
  }

  private formatChartLabel(dateValue: string, compact: boolean, length: number): string {
    const parsedDate = new Date(dateValue);
    if (Number.isNaN(parsedDate.getTime())) {
      return '';
    }

    if (length <= 7) {
      return new Intl.DateTimeFormat('en-NG', {
        weekday: compact ? 'narrow' : 'short',
      }).format(parsedDate);
    }

    return new Intl.DateTimeFormat('en-NG', {
      month: 'short',
      day: 'numeric',
    }).format(parsedDate);
  }

  private resolveSoldItemsBarColor(index: number, length: number, compact: boolean): string {
    if (index === length - 1) {
      return compact ? '#6453D9' : '#6B5CF0';
    }

    return compact ? '#CFC8FD' : '#DAD7F7';
  }

  private getRangeDays(range: AnalyticsRange): number {
    switch (range) {
      case '7d':
        return 7;
      case '30d':
        return 30;
      case '90d':
        return 90;
    }
  }

  private getPreviousRangeLabel(range: AnalyticsRange): string {
    switch (range) {
      case '7d':
        return 'previous 7 days';
      case '30d':
        return 'previous 30 days';
      case '90d':
        return 'previous 90 days';
    }
  }

  private sliceSoldItemsSeries(
    series: readonly SoldItemsChartPoint[],
    range: AnalyticsRange,
  ): readonly SoldItemsChartPoint[] {
    const rangeDays = this.getRangeDays(range);
    return series.slice(-rangeDays);
  }

  private sumSoldItems(series: readonly SoldItemsChartPoint[]): number {
    return series.reduce((total, point) => total + point.count, 0);
  }

  private readSoldItemsSeries(value: unknown): readonly SoldItemsChartPoint[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .map((item) => this.toSoldItemsChartPoint(item))
      .filter((point): point is SoldItemsChartPoint => point !== null);
  }

  private toSoldItemsChartPoint(value: unknown): SoldItemsChartPoint | null {
    if (!value || typeof value !== 'object') {
      return null;
    }

    const record = value as Record<string, unknown>;
    const date = this.readString(record['date']);
    const count = this.readNumber(record['count']);

    if (!date || count === null) {
      return null;
    }

    return {
      date,
      count,
    };
  }

  private aggregateSoldItemsSeries(records: readonly VendorAnalyticsRecord[]): readonly SoldItemsChartPoint[] {
    const totalsByDate = new Map<string, number>();

    for (const record of records) {
      for (const point of this.readSoldItemsSeries(record['sold_items_chart'])) {
        totalsByDate.set(point.date, (totalsByDate.get(point.date) ?? 0) + point.count);
      }
    }

    return [...totalsByDate.entries()]
      .sort(([leftDate], [rightDate]) => leftDate.localeCompare(rightDate))
      .map(([date, count]) => ({ date, count }));
  }

  private readString(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
  }

  private readNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const parsed = Number(value.replace(/,/g, '').trim());
      return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
  }

  private readRecord(value: unknown): Record<string, unknown> | null {
    return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
  }

  private readNestedString(value: unknown, key: string): string | null {
    if (!value || typeof value !== 'object') {
      return null;
    }

    return this.readString((value as Record<string, unknown>)[key]);
  }
}
