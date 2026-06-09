import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroCalendarDays,
  heroChevronDown,
  heroQueueList,
  heroSquares2x2,
  heroUserCircle,
} from '@ng-icons/heroicons/outline';
import { ApexAxisChartSeries } from 'ng-apexcharts';
import { map, switchMap } from 'rxjs';
import { AppChartComponent, AppChartOptions } from '../../components/charts/app-chart.component';
import { CustomDropdownComponent, type CustomDropdownOption } from '../../components/ui/custom-dropdown.component';
import {
  createColumnChartOptions,
  createPerformanceLineChartOptions,
} from '../../components/charts/chart-mock-data';
import {
  AdminAnalyticsRange,
  AdminAnalyticsService,
} from '../../services/admin-analytics.service';

type AnalyticsTab = 'overview' | 'users' | 'listings';
interface UserMetric {
  label: string;
  value: string;
  dot?: boolean;
}

interface RegionSignupItem {
  label: string;
  value: string;
  color: string;
  width: string;
}

interface ListingMetric {
  label: string;
  value: string;
  delta: string;
}

interface MostViewedListing {
  title: string;
  image: string | null;
  views: string;
  initials: string;
}

interface TopSeller {
  name: string;
  email: string;
  avatar: string | null;
  sold: string;
  initials: string;
}

interface ConversionMetric {
  label: string;
  value: string;
  width: string;
}

@Component({
  selector: 'app-admin-analytics-page',
  imports: [NgOptimizedImage, NgIcon, AppChartComponent, CustomDropdownComponent],
  providers: [
    provideIcons({
      heroCalendarDays,
      heroChevronDown,
      heroQueueList,
      heroSquares2x2,
      heroUserCircle,
    }),
  ],
  template: `
    <section class="bg-white px-5 pb-8 pt-[10px] lg:hidden">
      <div class="mx-auto max-w-[358px]">
        <div class="flex items-center justify-between">
          <h1 class="text-[36px] font-semibold tracking-[-0.04em] text-[#1A1B1D]">Analytics</h1>

          <app-custom-dropdown
            [options]="rangeOptions"
            [value]="range()"
            ariaLabel="Select analytics range"
            buttonClass="inline-flex h-10 items-center gap-2 rounded-full border border-[#EAEAEA] bg-white pl-3 pr-4 text-[14px] font-medium text-black"
            iconClass="text-[#6F6F6F]"
            menuClass="min-w-[160px]"
            (valueChange)="range.set($event)"
          ></app-custom-dropdown>
        </div>

        <div class="mt-6 border-b border-[#EAEAEA]">
          <div class="flex items-center">
            <button
              type="button"
              (click)="activeTab.set('overview')"
              class="flex min-w-0 items-center gap-1 border-b-2 px-3 py-1 text-[16px] font-medium leading-6"
              [class.border-[#6453D9]]="activeTab() === 'overview'"
              [class.text-[#6453D9]]="activeTab() === 'overview'"
              [class.border-transparent]="activeTab() !== 'overview'"
              [class.text-[#959595]]="activeTab() !== 'overview'"
            >
              <span class="flex h-4 w-4 items-center justify-center rounded-full border border-current text-[10px] leading-none">i</span>
              Overview
            </button>

            <button
              type="button"
              (click)="activeTab.set('users')"
              class="flex min-w-0 items-center gap-1 border-b-2 px-3 py-1 text-[16px] font-medium leading-6"
              [class.border-[#6453D9]]="activeTab() === 'users'"
              [class.text-[#6453D9]]="activeTab() === 'users'"
              [class.border-transparent]="activeTab() !== 'users'"
              [class.text-[#959595]]="activeTab() !== 'users'"
            >
              <ng-icon name="heroUserCircle" class="text-[16px]"></ng-icon>
              Users
            </button>

            <button
              type="button"
              (click)="activeTab.set('listings')"
              class="flex min-w-0 items-center gap-1 border-b-2 px-3 py-1 text-[16px] font-medium leading-6"
              [class.border-[#6453D9]]="activeTab() === 'listings'"
              [class.text-[#6453D9]]="activeTab() === 'listings'"
              [class.border-transparent]="activeTab() !== 'listings'"
              [class.text-[#959595]]="activeTab() !== 'listings'"
            >
              <ng-icon name="heroSquares2x2" class="text-[16px]"></ng-icon>
              Listings
            </button>
          </div>
        </div>

        @if (activeTab() === 'overview') {
          <section class="pt-6">
            <div>
              <p class="text-[16px] font-semibold text-[#0D0D0D]/40">Subscription earnings</p>
              <h2 class="mt-2 text-[32px] font-semibold leading-[40px] tracking-[-0.04em] text-[#1A1B1D]">
                {{ subscriptionEarningsParts().whole }}<span class="text-[24px] text-[#0D0D0D]/40">.{{ subscriptionEarningsParts().decimal }}</span>
              </h2>
              <span class="mt-2 inline-flex rounded-full bg-[#27A551]/[0.06] px-2 py-1 text-[12px] leading-4 text-[#27A551]">
                {{ subscriptionEarningsChangeText() }} from previous period
              </span>
            </div>

            <div class="mt-6">
              <app-chart [config]="mobileOverviewChartOptions()" [suppressGeneratedTitle]="true" containerClass="min-h-[226px]"></app-chart>
            </div>

            <div class="mt-4 space-y-4">
              <section class="rounded-[24px] border border-[#EFEFEF] bg-white px-[15px] py-[15px]">
                <h3 class="text-[16px] font-medium text-[#0D0D0D]/50">Platform health</h3>
                <div class="mt-5 text-center">
                  <p class="text-[64px] font-semibold leading-none tracking-[-0.06em] text-[#0D0D0D]">{{ platformHealthScore() }}%</p>
                  <p class="mt-1 text-[16px] font-medium text-[#0D0D0D]/30">/ 100</p>
                </div>
                <div class="relative mx-auto mt-5 w-[289px]">
                  <div class="flex h-[14px] items-center gap-[2px]">
                    @for (segment of healthSegments; track segment.color) {
                      <span class="block h-[14px] flex-1 rounded-[2px]" [style.background]="segment.color"></span>
                    }
                  </div>
                  <div class="absolute left-[176px] top-[-24px] h-[30px] w-[42px]">
                    <div class="absolute left-0 top-0 flex h-[30px] w-[42px] rotate-180 items-center justify-center text-[11px] font-semibold text-[#229EFE]">
                      <svg viewBox="0 0 42 30" class="absolute inset-0 h-full w-full">
                        <path d="M5 0h32a5 5 0 0 1 5 5v14l-21 11L0 19V5a5 5 0 0 1 5-5Z" fill="#DFF0FF"></path>
                      </svg>
                      <span class="relative z-10 -rotate-180">{{ platformHealthScore() }}</span>
                    </div>
                  </div>
                  <div class="mt-[7px] grid grid-cols-4 text-center text-[12px] font-medium">
                    <span class="text-[#CDCDCD]">Bad</span>
                    <span class="text-[#CDCDCD]">Fair</span>
                    <span class="text-[#CDCDCD]">Good</span>
                    <span class="text-[#313131]">Great</span>
                  </div>
                </div>
                <div class="mt-6 rounded-[16px] bg-[#FBFBFB] p-3">
                  <p class="text-[16px] font-medium leading-[1.1] text-[#242424]">Why?</p>
                  <p class="mt-1 text-[14px] leading-[1.4] text-[#777777]">
                    {{ platformHealthSummary() }}
                  </p>
                </div>
              </section>

              <section class="rounded-[24px] border border-[#EFEFEF] bg-white px-[15px] py-[15px]">
                <h3 class="text-[16px] font-medium text-[#0D0D0D]/50">Top subscribed plans</h3>
                <div class="mt-6">
                  <app-chart [config]="mobilePlansChartOptions()" containerClass="min-h-[275px]"></app-chart>
                </div>
              </section>
            </div>
          </section>
        } @else if (activeTab() === 'users') {
          <section class="pt-6">
            <div class="-mx-5 overflow-x-auto border-y border-[#EDEDED] px-5 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div class="flex min-w-[724px] items-center gap-8">
                @for (metric of userMetrics(); track metric.label) {
                  <div class="flex flex-col gap-1 py-1">
                    <div class="flex items-center gap-1 text-[14px] font-medium text-[#1A1B1D]/50">
                      <span>{{ metric.label }}</span>
                      @if (metric.dot) {
                        <span class="h-[5px] w-[5px] rounded-full bg-[#01A204]"></span>
                      }
                    </div>
                    <p class="text-[18px] font-semibold text-[#1A1B1D]">{{ metric.value }}</p>
                  </div>
                }
              </div>
            </div>

            <div class="mt-6">
              <p class="text-[16px] font-semibold text-[#0D0D0D]/40">New sign ups</p>
              <h2 class="mt-2 text-[32px] font-semibold leading-[40px] tracking-[-0.04em] text-[#1A1B1D]">{{ formatInteger(usersResponse()?.new_signups ?? 0) }}</h2>
              <span class="mt-2 inline-flex rounded-full bg-[#27A551]/[0.06] px-2 py-1 text-[12px] leading-4 text-[#27A551]">
                {{ changeText(usersResponse()?.signups_change_percent ?? 0) }} from previous period
              </span>
            </div>

            <div class="mt-6">
              <app-chart [config]="mobileUsersChartOptions()" [suppressGeneratedTitle]="true" containerClass="min-h-[226px]"></app-chart>
            </div>

            <div class="mt-4 space-y-4">
              <section class="rounded-[24px] border border-[#EFEFEF] bg-white px-[15px] py-[15px]">
                <h3 class="text-[16px] font-medium text-[#0D0D0D]/50">Verified vs Unverified</h3>
                <div class="mt-6">
                  <app-chart [config]="mobileVerifiedChartOptions()" containerClass="min-h-[250px]"></app-chart>
                </div>
              </section>

              <section class="rounded-[24px] border border-[#EFEFEF] bg-white px-[15px] py-[15px]">
                <h3 class="text-[14px] font-medium text-[#0D0D0D]/50">Top regions/cities for signups</h3>
                <div class="mt-6 flex h-1 items-center gap-0.5">
                  @for (region of topSignupRegions(); track region.label) {
                    <span class="block h-1 rounded-[14px]" [style.width]="region.width" [style.background]="region.color"></span>
                  }
                </div>
                <div class="mt-6 space-y-6">
                  @for (region of topSignupRegions(); track region.label) {
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-[10px]">
                        <span class="h-3 w-3 rounded-full" [style.background]="region.color"></span>
                        <span class="text-[14px] text-[#0D0D0D]/50">{{ region.label }}</span>
                      </div>
                      <span class="text-[14px] font-medium text-[#0D0D0D]">{{ region.value }}</span>
                    </div>
                  }
                </div>
              </section>
            </div>
          </section>
        } @else {
          <section class="pt-6">
            <div class="-mx-5 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div class="flex min-w-[724px] overflow-hidden rounded-t-[12px]">
                @for (metric of listingMetrics(); track metric.label; let index = $index) {
                  <div
                    class="flex h-[100px] min-w-[241px] flex-col gap-3 p-3"
                    [class.bg-white]="index === 0"
                    [class.border-b-[1.5px]]="index === 0"
                    [class.border-[#A2A500]]="index === 0"
                    [class.bg-[#FAFAFA]]="index > 0"
                    [class.border-r]="index < listingMetrics().length - 1"
                    [class.border-[#EFEFEF]]="index < listingMetrics().length - 1"
                  >
                    <p class="text-[12px] font-medium text-[#1A1B1D]/50">{{ metric.label }}</p>
                    <p class="text-[16px] font-semibold text-[#0D0D0D]/80">{{ metric.value }}</p>
                    <p class="text-[12px] text-[#0D0D0D]/60">
                      <span class="text-[#50BD5A]">{{ metric.delta }}</span> from last period
                    </p>
                  </div>
                }
              </div>
            </div>

            <div class="mt-8">
              <app-chart [config]="mobileListingsChartOptions()" [suppressGeneratedTitle]="true" containerClass="min-h-[226px]"></app-chart>
            </div>

            <div class="mt-4 space-y-4">
              <section class="rounded-[24px] border border-[#EFEFEF] bg-white px-[15px] py-[15px]">
                <h3 class="text-[16px] font-medium text-[#0D0D0D]/50">Most viewed listings</h3>
                <div class="mt-6 space-y-6">
                  @for (listing of mostViewedListings(); track listing.title) {
                    <div class="flex items-center justify-between gap-4">
                      <div class="flex min-w-0 items-center gap-2">
                        <div class="h-9 w-9 shrink-0 overflow-hidden rounded-[5.4px] border border-[#F0F0F0] bg-[#EFEFEF]">
                          @if (listing.image) {
                            <img [ngSrc]="listing.image" [alt]="listing.title" width="36" height="36" loading="lazy" sizes="36px" class="h-9 w-9 object-cover">
                          } @else {
                            <div class="flex h-9 w-9 items-center justify-center text-[11px] font-semibold text-[#6F6F6F]">{{ listing.initials }}</div>
                          }
                        </div>
                        <p class="truncate text-[14px] font-medium text-[#1A1B1D]">{{ listing.title }}</p>
                      </div>
                      <span class="shrink-0 text-[14px] font-medium text-[#0D0D0D]">{{ listing.views }}</span>
                    </div>
                  }
                </div>
              </section>

              <section class="rounded-[24px] border border-[#EFEFEF] bg-white px-[15px] py-[15px]">
                <h3 class="text-[16px] font-medium text-[#0D0D0D]/50">Top sellers</h3>
                <div class="mt-6 space-y-6">
                  @for (seller of topSellers(); track seller.name + seller.email + seller.sold) {
                    <div class="flex items-center justify-between gap-4">
                      <div class="flex min-w-0 items-center gap-2">
                        <div class="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#F3F3F3]">
                          @if (seller.avatar) {
                            <img [ngSrc]="seller.avatar" [alt]="seller.name" width="36" height="36" loading="lazy" sizes="36px" class="h-9 w-9 rounded-full object-cover">
                          } @else {
                            <div class="flex h-9 w-9 items-center justify-center rounded-full bg-[#EDEBFF] text-[11px] font-semibold text-[#6453D9]">{{ seller.initials }}</div>
                          }
                        </div>
                        <div class="min-w-0">
                          <p class="truncate text-[14px] font-medium leading-5 text-[#0D0D0D]">{{ seller.name }}</p>
                          <p class="truncate text-[12px] leading-4 text-[#8C8C8C]">{{ seller.email }}</p>
                        </div>
                      </div>
                      <p class="shrink-0 text-[14px] text-[#0D0D0D]"><span class="font-medium">{{ seller.sold }}</span> <span class="text-[#0D0D0D]/50">sold</span></p>
                    </div>
                  }
                </div>
              </section>

              <section class="rounded-[24px] border border-[#EFEFEF] bg-white px-[15px] py-[15px]">
                <h3 class="text-[16px] font-medium text-[#0D0D0D]/50">Listing conversion rate</h3>
                <div class="mt-6 flex items-center gap-1">
                  <p class="text-[32px] font-semibold leading-[40px] tracking-[-0.04em] text-[#1A1B1D]">{{ conversionRateDisplay() }}</p>
                  <span class="text-[12px] leading-4 text-[#27A551]">{{ conversionRateChangeText() }} from last period</span>
                </div>
                <div class="mt-6 space-y-6">
                  @for (metric of conversionMetrics(); track metric.label) {
                    <div>
                      <div class="mb-2 flex items-center justify-between gap-4 text-[12px] leading-4">
                        <span class="text-[#919293]">{{ metric.label }}</span>
                        <span class="font-medium text-[#4F4F51]">{{ metric.value }}</span>
                      </div>
                      <div class="h-2 overflow-hidden rounded-[5px] bg-[#F4F4F4]">
                        <span class="block h-full rounded-[5px] bg-[#6453D9]" [style.width]="metric.width"></span>
                      </div>
                    </div>
                  }
                </div>
              </section>
            </div>
          </section>
        }
      </div>
    </section>

    <section class="hidden min-h-full rounded-[32px] bg-white lg:block">
      <header class="flex flex-col gap-4 border-b border-[#efefef] px-8 py-6 lg:flex-row lg:items-center lg:justify-between">
        <h1 class="text-[2rem] font-semibold tracking-[-0.04em] text-[#202020]">Analytics</h1>

        <app-custom-dropdown
          [options]="rangeOptions"
          [value]="range()"
          ariaLabel="Select analytics range"
          buttonClass="inline-flex h-11 items-center gap-2 self-start rounded-full border border-[#e8e8e8] bg-white px-5 text-[15px] text-[#1f1f1f]"
          iconClass="text-[#6f6f6f]"
          menuClass="min-w-[170px]"
          (valueChange)="range.set($event)"
        ></app-custom-dropdown>
      </header>

      <div class="px-4 py-6 sm:px-6 lg:px-8">
        <div class="border-b border-[#efefef]">
          <div class="flex items-center gap-8">
            <button
              type="button"
              (click)="activeTab.set('overview')"
              class="flex items-center gap-2 border-b-2 px-1 py-4 text-[15px] font-medium transition-colors"
              [class.border-[#6254f3]]="activeTab() === 'overview'"
              [class.text-[#6254f3]]="activeTab() === 'overview'"
              [class.border-transparent]="activeTab() !== 'overview'"
              [class.text-[#8b8b8b]]="activeTab() !== 'overview'"
            >
              <span class="flex h-4 w-4 items-center justify-center rounded-full bg-current/10 text-[12px]">i</span>
              Overview
            </button>

            <button
              type="button"
              (click)="activeTab.set('users')"
              class="flex items-center gap-2 border-b-2 px-1 py-4 text-[15px] font-medium transition-colors"
              [class.border-[#6254f3]]="activeTab() === 'users'"
              [class.text-[#6254f3]]="activeTab() === 'users'"
              [class.border-transparent]="activeTab() !== 'users'"
              [class.text-[#8b8b8b]]="activeTab() !== 'users'"
            >
              <ng-icon name="heroUserCircle" class="text-[16px]"></ng-icon>
              Users
            </button>

            <button
              type="button"
              (click)="activeTab.set('listings')"
              class="flex items-center gap-2 border-b-2 px-1 py-4 text-[15px] font-medium transition-colors"
              [class.border-[#6254f3]]="activeTab() === 'listings'"
              [class.text-[#6254f3]]="activeTab() === 'listings'"
              [class.border-transparent]="activeTab() !== 'listings'"
              [class.text-[#8b8b8b]]="activeTab() !== 'listings'"
            >
              <ng-icon name="heroSquares2x2" class="text-[16px]"></ng-icon>
              Listings
            </button>
          </div>
        </div>

        @if (activeTab() === 'overview') {
          <section class="pt-8">
            <div>
              <p class="text-[18px] font-medium text-[#9f9f9f]">Subscription earnings</p>
              <h2 class="mt-3 text-[32px] font-semibold tracking-[-0.04em] text-[#202020] sm:text-[38px]">
                {{ subscriptionEarningsParts().whole }}<span class="text-[20px] text-[#8d8d8d]">.{{ subscriptionEarningsParts().decimal }}</span>
              </h2>
              <span class="mt-3 inline-flex rounded-full bg-[#ecfbf1] px-3 py-1 text-[14px] font-medium text-[#29b34a]">
                {{ subscriptionEarningsChangeText() }} from previous period
              </span>
            </div>

            <div class="mt-10">
              <app-chart [config]="desktopOverviewChartOptions()" [suppressGeneratedTitle]="true" containerClass="min-h-[320px]"></app-chart>
            </div>

            <div class="mt-12 grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.2fr)]">
              <section class="rounded-[24px] border border-[#e9e9e9] bg-white px-5 py-5">
                <h3 class="text-[16px] font-medium text-[#7b7b7b]">Platform health</h3>

                <div class="mt-8 text-center">
                  <p class="text-[68px] font-semibold leading-none tracking-[-0.06em] text-[#101010]">{{ platformHealthScore() }}%</p>
                  <p class="mt-1 text-[14px] text-[#a1a1a1]">/ 100</p>
                </div>

                <div class="mt-8 px-4">
                  <div class="relative">
                    <div class="flex h-4 items-center gap-0.5">
                      @for (segment of healthSegments; track segment.color) {
                        <span
                          class="block h-4 flex-1 rounded-[4px]"
                          [style.background]="segment.color"
                        ></span>
                      }
                    </div>

                    <div class="absolute left-[67%] top-[-26px] -translate-x-1/2">
                      <div class="rounded-full bg-[#e8f3ff] px-2 py-1 text-[12px] font-semibold text-[#3c9cff] shadow-[0_10px_24px_-18px_rgba(60,156,255,0.8)]">
                        {{ platformHealthScore() }}
                      </div>
                    </div>
                  </div>

                  <div class="mt-2 grid grid-cols-4 text-center text-[14px] text-[#c6c6c6]">
                    <span>Bad</span>
                    <span>Fair</span>
                    <span class="font-medium text-[#505050]">Good</span>
                    <span>Great</span>
                  </div>
                </div>

                <div class="mt-8 rounded-[18px] bg-[#fafafa] px-5 py-4">
                  <p class="text-[18px] font-medium text-[#202020]">Why?</p>
                  <p class="mt-2 text-[15px] leading-8 text-[#707070]">
                    {{ platformHealthSummary() }}
                  </p>
                </div>
              </section>

              <section class="rounded-[24px] border border-[#e9e9e9] bg-white px-5 py-5">
                <h3 class="text-[16px] font-medium text-[#7b7b7b]">Top subscribed plans</h3>

                <div class="mt-8">
                  <app-chart [config]="desktopPlansChartOptions()" containerClass="min-h-[320px]"></app-chart>
                </div>
              </section>
            </div>
          </section>
        } @else if (activeTab() === 'users') {
          <section class="pt-8">
            <div class="grid gap-6 border-y border-[#efefef] py-5 sm:grid-cols-2 xl:grid-cols-4">
              @for (metric of userMetrics(); track metric.label) {
                <div>
                  <div class="flex items-center gap-1 text-[18px] font-medium text-[#9f9f9f]">
                    <span>{{ metric.label }}</span>
                    @if (metric.dot) {
                      <span class="h-1.5 w-1.5 rounded-full bg-[#12b133]"></span>
                    }
                  </div>
                  <p class="mt-2 text-[22px] font-semibold text-[#202020]">{{ metric.value }}</p>
                </div>
              }
            </div>

            <div class="pt-8">
              <p class="text-[18px] font-medium text-[#9f9f9f]">New sign ups</p>
              <h2 class="mt-3 text-[32px] font-semibold tracking-[-0.04em] text-[#202020] sm:text-[38px]">
                {{ formatInteger(usersResponse()?.new_signups ?? 0) }}
              </h2>
              <span class="mt-3 inline-flex rounded-full bg-[#ecfbf1] px-3 py-1 text-[14px] font-medium text-[#29b34a]">
                {{ changeText(usersResponse()?.signups_change_percent ?? 0) }} from previous period
              </span>
            </div>

            <div class="mt-10">
              <app-chart [config]="desktopUsersChartOptions()" [suppressGeneratedTitle]="true" containerClass="min-h-[320px]"></app-chart>
            </div>

            <div class="mt-12 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <section class="rounded-[24px] border border-[#e9e9e9] bg-white px-5 py-5">
                <h3 class="text-[16px] font-medium text-[#7b7b7b]">Verified vs Unverified</h3>

                <div class="mt-8">
                  <app-chart [config]="desktopVerifiedChartOptions()" containerClass="min-h-[260px]"></app-chart>
                </div>
              </section>

              <section class="rounded-[24px] border border-[#e9e9e9] bg-white px-5 py-5">
                <h3 class="text-[16px] font-medium text-[#7b7b7b]">Top regions/cities for signups</h3>

                <div class="mt-8 flex h-1.5 items-center gap-1 overflow-hidden rounded-full bg-[#f2f2f2]">
                  @for (region of topSignupRegions(); track region.label) {
                    <span class="block h-full rounded-full" [style.width]="region.width" [style.background]="region.color"></span>
                  }
                </div>

                <div class="mt-8 space-y-6">
                  @for (region of topSignupRegions(); track region.label) {
                    <div class="flex items-center justify-between gap-4">
                      <div class="flex items-center gap-3">
                        <span class="h-3 w-3 rounded-full" [style.background]="region.color"></span>
                        <span class="text-[15px] text-[#8d8d8d]">{{ region.label }}</span>
                      </div>
                      <span class="text-[15px] font-medium text-[#202020]">{{ region.value }}</span>
                    </div>
                  }
                </div>
              </section>
            </div>
          </section>
        } @else {
          <section class="pt-8">
            <div class="grid gap-0 border-y border-[#efefef] md:grid-cols-3">
              @for (metric of listingMetrics(); track metric.label; let index = $index) {
                <div
                  class="px-3 py-4 sm:px-5"
                  [class.border-r]="index < listingMetrics().length - 1"
                  [class.border-[#efefef]]="index < listingMetrics().length - 1"
                >
                  <p class="text-[16px] font-medium text-[#8f8f8f]">{{ metric.label }}</p>
                  <p class="mt-3 text-[22px] font-semibold text-[#202020]">{{ metric.value }}</p>
                  <p class="mt-2 text-[14px] text-[#8f8f8f]">
                    <span class="text-[#29b34a]">{{ metric.delta }}</span> from last period
                  </p>
                </div>
              }
            </div>

            <div class="mt-10">
              <app-chart [config]="desktopListingsChartOptions()" [suppressGeneratedTitle]="true" containerClass="min-h-[320px]"></app-chart>
            </div>

            <div class="mt-12 grid gap-6 xl:grid-cols-3">
              <section class="rounded-[24px] border border-[#e9e9e9] bg-white px-5 py-5">
                <h3 class="text-[16px] font-medium text-[#7b7b7b]">Most viewed listings</h3>

                <div class="mt-8 space-y-6">
                  @for (listing of mostViewedListings(); track listing.title) {
                    <div class="flex items-center justify-between gap-4">
                      <div class="flex min-w-0 items-center gap-3">
                        <div class="h-10 w-10 shrink-0 overflow-hidden rounded-[10px] bg-[#f3f3f3]">
                          @if (listing.image) {
                            <img [ngSrc]="listing.image" [alt]="listing.title" width="40" height="40" loading="lazy" sizes="40px" class="h-10 w-10 object-cover">
                          } @else {
                            <div class="flex h-10 w-10 items-center justify-center text-[12px] font-semibold text-[#6F6F6F]">{{ listing.initials }}</div>
                          }
                        </div>
                        <p class="truncate text-[15px] font-medium text-[#202020]">{{ listing.title }}</p>
                      </div>
                      <span class="shrink-0 text-[15px] font-medium text-[#202020]">{{ listing.views }}</span>
                    </div>
                  }
                </div>
              </section>

              <section class="rounded-[24px] border border-[#e9e9e9] bg-white px-5 py-5">
                <h3 class="text-[16px] font-medium text-[#7b7b7b]">Top sellers</h3>

                <div class="mt-8 space-y-6">
                  @for (seller of topSellers(); track seller.name + seller.email + seller.sold) {
                    <div class="flex items-center justify-between gap-4">
                      <div class="flex min-w-0 items-center gap-3">
                        <div class="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#f3f3f3]">
                          @if (seller.avatar) {
                            <img [ngSrc]="seller.avatar" [alt]="seller.name" width="40" height="40" loading="lazy" sizes="40px" class="h-10 w-10 rounded-full object-cover">
                          } @else {
                            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-[#EDEBFF] text-[12px] font-semibold text-[#6453D9]">{{ seller.initials }}</div>
                          }
                        </div>
                        <div class="min-w-0">
                          <p class="truncate text-[15px] font-medium text-[#202020]">{{ seller.name }}</p>
                          <p class="truncate text-[14px] text-[#9a9a9a]">{{ seller.email }}</p>
                        </div>
                      </div>
                      <span class="shrink-0 text-[15px] text-[#202020]"><span class="font-medium">{{ seller.sold }}</span> sold</span>
                    </div>
                  }
                </div>
              </section>

              <section class="rounded-[24px] border border-[#e9e9e9] bg-white px-5 py-5">
                <h3 class="text-[16px] font-medium text-[#7b7b7b]">Listing conversion rate</h3>

                <div class="mt-8 flex items-start gap-2">
                  <p class="text-[34px] font-semibold tracking-[-0.05em] text-[#202020]">{{ conversionRateDisplay() }}</p>
                  <span class="mt-2 text-[14px] font-medium text-[#29b34a]">{{ conversionRateChangeText() }} from last period</span>
                </div>

                <div class="mt-10 space-y-6">
                  @for (metric of conversionMetrics(); track metric.label) {
                    <div>
                      <div class="mb-2 flex items-center justify-between gap-4 text-[14px] text-[#8f8f8f]">
                        <span>{{ metric.label }}</span>
                        <span class="font-medium text-[#5e5e5e]">{{ metric.value }}</span>
                      </div>
                      <div class="h-2 overflow-hidden rounded-full bg-[#ededed]">
                        <span class="block h-full rounded-full bg-[#6653e4]" [style.width]="metric.width"></span>
                      </div>
                    </div>
                  }
                </div>
              </section>
            </div>
          </section>
        }
      </div>
    </section>
  `,
  host: {
    class: 'block h-full',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAnalyticsPageComponent {
  private readonly analyticsService = inject(AdminAnalyticsService);

  readonly activeTab = signal<AnalyticsTab>('overview');
  readonly range = signal<AdminAnalyticsRange>('7d');
  readonly rangeOptions: readonly CustomDropdownOption<AdminAnalyticsRange>[] = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
  ];
  readonly overviewResponse = toSignal(this.analyticsService.getOverviewAnalytics(), { initialValue: null });
  readonly usersResponse = toSignal(this.analyticsService.getUsersAnalytics(), { initialValue: null });
  readonly listingsResponse = toSignal(this.analyticsService.getListingsAnalytics(), { initialValue: null });
  readonly earningsResponse = toSignal(
    toObservable(this.range).pipe(switchMap((range) => this.analyticsService.getSubscriptionEarnings(range))),
    { initialValue: null },
  );

  readonly subscriptionEarningsParts = computed(() => this.currencyParts(this.earningsResponse()?.total_earnings ?? 0));
  readonly subscriptionEarningsChangeText = computed(() => this.changeText(this.earningsResponse()?.earnings_change_percent ?? 0));
  readonly overviewTotalSoldItems = computed(() => this.formatInteger(this.overviewResponse()?.total_sold_items ?? 0));

  readonly mobileOverviewChartOptions = computed(() => this.buildOverviewChartOptions(226, true));
  readonly desktopOverviewChartOptions = computed(() => this.buildOverviewChartOptions(320, false));
  readonly mobileUsersChartOptions = computed(() => this.buildUsersChartOptions(226, true));
  readonly desktopUsersChartOptions = computed(() => this.buildUsersChartOptions(320, false));
  readonly mobileListingsChartOptions = computed(() => this.buildListingsChartOptions(226, true));
  readonly desktopListingsChartOptions = computed(() => this.buildListingsChartOptions(320, false));
  readonly mobilePlansChartOptions = computed(() => this.buildPlansChartOptions(275, true));
  readonly desktopPlansChartOptions = computed(() => this.buildPlansChartOptions(320, false));
  readonly mobileVerifiedChartOptions = computed(() => this.buildVerifiedChartOptions(250, true));
  readonly desktopVerifiedChartOptions = computed(() => this.buildVerifiedChartOptions(260, false));

  readonly userMetrics = computed<ReadonlyArray<UserMetric>>(() => {
    const response = this.usersResponse();

    return [
      { label: 'Online users', value: this.formatInteger(response?.online_users ?? 0), dot: true },
      { label: 'Total users', value: this.formatInteger(response?.total_users ?? 0) },
      { label: 'Renewal rate', value: this.percentString(response?.renewal_rate ?? 0) },
      { label: 'Churn rate', value: this.percentString(response?.churn_rate ?? 0) },
    ];
  });

  readonly healthSegments = [
    { color: '#ff4d4d' },
    { color: '#ff5c4c' },
    { color: '#ff6c41' },
    { color: '#ffb400' },
    { color: '#ffc532' },
    { color: '#3da1ff' },
    { color: '#50adff' },
    { color: '#37ba5a' },
    { color: '#21b84e' },
  ];

  readonly platformHealthScore = computed(() => this.overviewResponse()?.platform_health?.score ?? 0);
  readonly platformHealthSummary = computed(
    () => this.overviewResponse()?.platform_health?.summary ?? 'Platform health metrics are not available right now.',
  );

  readonly listingMetrics = computed<ReadonlyArray<ListingMetric>>(() => {
    const response = this.listingsResponse();

    return [
      {
        label: 'Total listings',
        value: this.formatInteger(response?.total_listings ?? 0),
        delta: this.changeText((response?.total_listings ?? 0) > 0 ? response?.price_change_percent ?? 0 : 0),
      },
      {
        label: 'Average listing price',
        value: this.currencyLabel(response?.average_listing_price ?? 0),
        delta: this.changeText(response?.price_change_percent ?? 0),
      },
      {
        label: 'Active listings',
        value: this.formatInteger(response?.active_listings ?? 0),
        delta: this.changeText(this.overviewResponse()?.sold_items_change_percent ?? 0),
      },
    ];
  });

  readonly topSignupRegions = computed<ReadonlyArray<RegionSignupItem>>(() => {
    const regions = this.usersResponse()?.top_regions ?? [];
    const maxCount = Math.max(...regions.map((region) => region.count), 1);
    const colors = ['#5f54ff', '#7bc8ff', '#ffcb42', '#ff9253', '#d9d9d9'];

    return regions.map((region, index) => ({
      label: region.region,
      value: this.formatInteger(region.count),
      color: colors[index] ?? '#d9d9d9',
      width: `${Math.max((region.count / maxCount) * 100, 4)}%`,
    }));
  });

  readonly mostViewedListings = computed<ReadonlyArray<MostViewedListing>>(() =>
    (this.listingsResponse()?.most_viewed_listings ?? []).map((listing) => ({
      title: listing.title,
      image: listing.image,
      views: this.formatInteger(listing.views),
      initials: this.initials(listing.title),
    })),
  );

  readonly topSellers = computed<ReadonlyArray<TopSeller>>(() =>
    (this.listingsResponse()?.top_sellers ?? []).map((seller) => ({
      name: seller.name,
      email: seller.email,
      avatar: seller.avatar,
      sold: this.formatInteger(seller.sold_count),
      initials: this.initials(seller.name),
    })),
  );

  readonly conversionRateDisplay = computed(() =>
    this.percentString(this.listingsResponse()?.listing_conversion_rate ?? 0, 1),
  );
  readonly conversionRateChangeText = computed(() =>
    this.changeText(this.listingsResponse()?.conversion_rate_change ?? 0),
  );
  readonly conversionMetrics = computed<ReadonlyArray<ConversionMetric>>(() => {
    const listings = this.listingsResponse();
    const overview = this.overviewResponse();
    const totalListings = Math.max(listings?.total_listings ?? 0, 1);
    const totalViews = overview?.total_views ?? 0;
    const totalSaves = overview?.total_saves ?? 0;
    const soldItems = overview?.total_sold_items ?? 0;
    const maxMetric = Math.max(totalListings, totalViews, totalSaves, soldItems, 1);

    return [
      {
        label: 'Listings posted',
        value: this.formatInteger(totalListings),
        width: `${(totalListings / maxMetric) * 100}%`,
      },
      {
        label: 'Listing views',
        value: this.formatInteger(totalViews),
        width: `${(totalViews / maxMetric) * 100}%`,
      },
      {
        label: 'Saved listings',
        value: this.formatInteger(totalSaves),
        width: `${(totalSaves / maxMetric) * 100}%`,
      },
      {
        label: 'Listings marked sold',
        value: this.formatInteger(soldItems),
        width: `${(soldItems / maxMetric) * 100}%`,
      },
    ];
  });

  private createSingleSeriesOptions(base: AppChartOptions, seriesName: string, color: string): AppChartOptions {
    const axisSeries = this.getAxisSeries(base.series);
    const firstSeries = axisSeries[0];

    return {
      ...base,
      colors: [color],
      series: firstSeries ? [{ ...firstSeries, name: seriesName }] : [],
    };
  }

  private getAxisSeries(series: AppChartOptions['series']): ApexAxisChartSeries {
    if (
      Array.isArray(series) &&
      series.every(
        (entry) =>
          typeof entry === 'object' &&
          entry !== null &&
          'data' in entry &&
          Array.isArray(entry.data),
      )
    ) {
      return series as ApexAxisChartSeries;
    }

    return [];
  }

  private buildOverviewChartOptions(height: number, compact: boolean): AppChartOptions {
    const response = this.earningsResponse();
    const points = response?.comparison_chart ?? [];
    const categories = points.map((point) => point.label);
    const currentSeries = points.map((point) => point.current_period);
    const previousSeries = points.map((point) => point.previous_period);
    const maxValue = Math.max(...currentSeries, ...previousSeries, 1);
    const tickAmount = compact ? 3 : 4;
    const base = createPerformanceLineChartOptions(height, compact, '#5F54FF', '#F2B400');

    return {
      ...base,
      series: [
        { name: 'Current period', data: currentSeries },
        { name: 'Previous period', data: previousSeries },
      ],
      xaxis: {
        ...base.xaxis,
        categories,
        labels: {
          ...base.xaxis?.labels,
          style: {
            ...base.xaxis?.labels?.style,
            colors: categories.map(() => (compact ? 'rgba(13,13,13,0.5)' : '#A5AAB3')),
          },
        },
      },
      yaxis: {
        min: 0,
        max: maxValue * 1.15,
        tickAmount,
        labels: {
          formatter: (value: number) => this.compactCurrencyLabel(value),
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
        y: {
          formatter: (value: number | undefined, context?: { seriesIndex?: number }) =>
            value == null ? '' : `${context?.seriesIndex === 0 ? 'Current' : 'Previous'}: ${this.currencyLabel(value)}`,
        },
      },
    };
  }

  private buildUsersChartOptions(height: number, compact: boolean): AppChartOptions {
    const response = this.usersResponse();
    const points = (response?.signups_chart ?? []).slice(-(this.range() === '7d' ? 7 : 30));
    const categories = points.map((point) => this.range() === '7d' ? this.weekdayLabel(point.date) : this.shortDateLabel(point.date));
    const values = points.map((point) => point.count);

    return this.createSingleSeriesOptions(
      {
        ...createPerformanceLineChartOptions(height, compact),
        xaxis: {
          ...createPerformanceLineChartOptions(height, compact).xaxis,
          categories,
          labels: {
            ...createPerformanceLineChartOptions(height, compact).xaxis?.labels,
            style: {
              ...createPerformanceLineChartOptions(height, compact).xaxis?.labels?.style,
              colors: categories.map(() => (compact ? 'rgba(13,13,13,0.5)' : '#A5AAB3')),
            },
          },
        },
        series: [{ name: 'New signups', data: values }],
        yaxis: {
          min: 0,
          max: Math.max(...values, 1) * 1.15,
          tickAmount: compact ? 3 : 4,
          labels: {
            formatter: (value: number) => this.formatCompactInteger(value),
            style: {
              colors: compact ? ['rgba(0,0,0,0.7)'] : ['#A5AAB3'],
              fontSize: compact ? '11px' : '12px',
              fontWeight: '500',
            },
          },
        },
        tooltip: {
          enabled: true,
          theme: 'dark',
          y: {
            formatter: (value: number | undefined) => value == null ? '' : `Signups: ${this.formatInteger(value)}`,
          },
        },
      },
      'New signups',
      '#5F54FF',
    );
  }

  private buildListingsChartOptions(height: number, compact: boolean): AppChartOptions {
    const response = this.listingsResponse();
    const points = (response?.listings_posted_chart ?? []).slice(-(this.range() === '7d' ? 7 : 30));
    const categories = points.map((point) => this.range() === '7d' ? this.weekdayLabel(point.date) : this.shortDateLabel(point.date));
    const values = points.map((point) => point.count);

    return this.createSingleSeriesOptions(
      {
        ...createPerformanceLineChartOptions(height, compact),
        xaxis: {
          ...createPerformanceLineChartOptions(height, compact).xaxis,
          categories,
          labels: {
            ...createPerformanceLineChartOptions(height, compact).xaxis?.labels,
            style: {
              ...createPerformanceLineChartOptions(height, compact).xaxis?.labels?.style,
              colors: categories.map(() => (compact ? 'rgba(13,13,13,0.5)' : '#A5AAB3')),
            },
          },
        },
        series: [{ name: 'Listings posted', data: values }],
        yaxis: {
          min: 0,
          max: Math.max(...values, 1) * 1.15,
          tickAmount: compact ? 3 : 4,
          labels: {
            formatter: (value: number) => this.formatCompactInteger(value),
            style: {
              colors: compact ? ['rgba(0,0,0,0.7)'] : ['#A5AAB3'],
              fontSize: compact ? '11px' : '12px',
              fontWeight: '500',
            },
          },
        },
        tooltip: {
          enabled: true,
          theme: 'dark',
          y: {
            formatter: (value: number | undefined) => value == null ? '' : `Posted: ${this.formatInteger(value)}`,
          },
        },
      },
      'Listings posted',
      '#5F54FF',
    );
  }

  private buildPlansChartOptions(height: number, compact: boolean): AppChartOptions {
    const plans = this.overviewResponse()?.top_subscribed_plans ?? [];
    const categories = plans.map((plan) => plan.plan_name);
    const values = plans.map((plan) => plan.subscriptions_count);
    const colors = ['#F59E0B', '#0FA02C', '#3B82F6', '#8B5CF6', '#EC4899'];

    return createColumnChartOptions(height, categories, values, colors.slice(0, Math.max(values.length, 1)), compact);
  }

  private buildVerifiedChartOptions(height: number, compact: boolean): AppChartOptions {
    const verified = this.usersResponse()?.verified_vs_unverified ?? { verified: 0, unverified: 0 };

    return createColumnChartOptions(
      height,
      ['Verified users', 'Unverified users'],
      [verified.verified, verified.unverified],
      ['#0FA02C', '#AE6709'],
      compact,
    );
  }

  private currencyParts(amount: number): { whole: string; decimal: string } {
    const fixed = amount.toFixed(2);
    const [whole, decimal] = fixed.split('.');
    return {
      whole: `₦ ${this.formatInteger(Number(whole))}`,
      decimal,
    };
  }

  protected changeText(value: number): string {
    const prefix = value > 0 ? '+' : '';
    return `${prefix}${this.percentString(value)}`;
  }

  private percentString(value: number, fractionDigits = 0): string {
    return `${Number(value).toFixed(fractionDigits)}%`;
  }

  private currencyLabel(amount: number): string {
    return `₦${this.formatInteger(Math.round(amount))}`;
  }

  private compactCurrencyLabel(amount: number): string {
    if (amount >= 1_000_000) {
      return `₦${(amount / 1_000_000).toFixed(1)}m`;
    }
    if (amount >= 1_000) {
      return `₦${(amount / 1_000).toFixed(0)}k`;
    }
    return `₦${Math.round(amount)}`;
  }

  private formatCompactInteger(value: number): string {
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}m`;
    }
    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(0)}k`;
    }
    return this.formatInteger(value);
  }

  protected formatInteger(value: number): string {
    return new Intl.NumberFormat('en-NG', { maximumFractionDigits: 0 }).format(Math.round(value));
  }

  private weekdayLabel(value: string): string {
    return new Intl.DateTimeFormat('en-NG', { weekday: 'short' }).format(new Date(value));
  }

  private shortDateLabel(value: string): string {
    return new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short' }).format(new Date(value));
  }

  private initials(value: string): string {
    const parts = value.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      return 'NA';
    }
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
}
