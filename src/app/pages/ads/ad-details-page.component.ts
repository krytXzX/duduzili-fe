import { CommonModule, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { map } from 'rxjs';
import {
  heroCalendarDays,
  heroChevronLeft,
  heroChevronDown,
  heroEllipsisHorizontal,
  heroEye,
  heroLink,
  heroPause,
  heroShare,
  heroXMark,
} from '@ng-icons/heroicons/outline';
import { AppChartComponent, AppChartOptions } from '../../components/charts/app-chart.component';
import { createPerformanceLineChartOptions } from '../../components/charts/chart-mock-data';
import { CustomDropdownComponent, type CustomDropdownOption } from '../../components/ui/custom-dropdown.component';
import { MobileOverlayService } from '../../services/mobile-overlay.service';
import { AppToastService } from '../../services/app-toast.service';
import {
  SellerMonetizationService,
  type AdAnalyticsResponse,
  type SellerAdRecord,
} from '../../services/seller-monetization.service';

type AdPerformanceRange = '7d' | '30d' | '90d';

interface AdMetric {
  label: string;
  value: string;
  info?: boolean;
}

interface AdDetail {
  id: string;
  kind: 'listing' | 'store' | 'banner';
  title: string;
  status: 'Active' | 'Paused' | 'Expired' | 'Pending approval' | 'Declined';
  expiresOn: string;
  metrics: AdMetric[];
  noticePrefix: string;
  image?: string;
  price?: string;
  lastUpdated?: string;
  initials?: string;
  logoTone?: string;
  activeListings?: string;
  destinationUrl?: string;
}

interface RunningAdsQueryState {
  placement?: 'promoted listings' | 'store promotions' | 'banner ads';
  status?: 'active' | 'paused' | 'expired';
  page?: number;
}

@Component({
  selector: 'app-ad-details-page',
  imports: [CommonModule, RouterLink, NgIcon, NgOptimizedImage, AppChartComponent, CustomDropdownComponent],
  providers: [
    provideIcons({
      heroPause,
      heroChevronLeft,
      heroEllipsisHorizontal,
      heroEye,
      heroShare,
      heroCalendarDays,
      heroChevronDown,
      heroLink,
      heroXMark,
    }),
  ],
  template: `
    <div class="mx-auto w-full max-w-[420px] bg-[#F7F7FA] px-4 pb-32 pt-4 md:hidden">
      @if (ad().kind === 'banner') {
        <div class="rounded-[32px] bg-white px-4 pb-6 pt-4">
          <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <a
          routerLink="/seller/ads/running" [queryParams]="runningAdsQueryParams()"
                aria-label="Back to running ads"
                class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F6FA] text-[#30313A]"
              >
                <ng-icon name="heroChevronLeft" class="text-[16px]"></ng-icon>
              </a>
              <h1 class="text-[15px] font-semibold tracking-[-0.03em] text-[#202335]">
                Ad details
              </h1>
            </div>

            <button
              type="button"
              (click)="toggleMobileActionMenu()"
              class="inline-flex h-8 w-8 items-center justify-center text-[#4D5260]"
              aria-label="Open ad actions"
            >
              <ng-icon name="heroEllipsisHorizontal" class="text-[18px]"></ng-icon>
            </button>
          </div>

          <div class="mt-5">
            <div class="relative h-[161px] w-[287px] overflow-hidden rounded-[24px]">
              <img
                [ngSrc]="bannerImageSrc()"
                width="287"
                height="161"
                [alt]="ad().title"
                class="h-full w-full rounded-[24px] object-cover"
              />
              <button
                type="button"
                (click)="openDestinationModal()"
                class="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full border border-[#EAEAEA] bg-white shadow-[0_4px_8px_0_rgba(202,202,202,0.25)]"
                aria-label="Edit destination link"
              >
                <img [ngSrc]="bannerDetailsExportIcon" width="16" height="16" alt="" />
              </button>
            </div>

            <div class="mt-3 flex flex-wrap items-center gap-2">
              <h2 class="text-[24px] font-semibold leading-8 text-[#1A1B1D]">{{ ad().title }}</h2>
              <span class="inline-flex items-center gap-1 rounded-[8px] bg-[#F3FBF9] px-2 py-1">
                <img [ngSrc]="bannerDetailsStatusIcon" width="14" height="14" alt="" />
                <span class="text-[12px] font-semibold leading-4 text-[#25AD32]">{{ currentStatus() }}</span>
              </span>
            </div>

            <div
              class="mt-4 inline-flex max-w-full items-center gap-2 rounded-[16px] bg-[rgba(255,254,218,0.76)] px-[10px] py-[11px]"
            >
              <img [ngSrc]="bannerDetailsInfoIcon" width="24" height="24" alt="" class="shrink-0" />
              <p class="text-[14px] leading-5 text-[#1F1F1F]">
                Your banner will be promoted across Duduzili until it expires on
                {{ ad().expiresOn }}.
              </p>
            </div>

            <div class="mt-4 flex flex-col gap-3">
              <button
                type="button"
                (click)="openDestinationModal()"
                class="inline-flex h-10 items-center justify-center gap-2 rounded-[64px] border border-[#EAEAEA] bg-white px-5 text-[14px] font-medium text-black"
              >
                <img [ngSrc]="bannerDetailsEditIcon" width="14" height="14" alt="" />
                Edit destination link
              </button>
              <button
                type="button"
                (click)="togglePaused()"
                class="inline-flex h-10 items-center justify-center gap-2 rounded-[64px] border border-[#EAEAEA] bg-white px-5 text-[14px] font-medium text-black"
              >
                <img [ngSrc]="bannerDetailsPauseIcon" width="14" height="14" alt="" />
                {{ currentStatus() === 'Paused' ? 'Resume Ad' : 'Pause Ad' }}
              </button>
            </div>
          </div>

          <div class="mt-6 grid grid-cols-3 border-y border-[#F0F1F4] py-4">
            @for (metric of ad().metrics; track metric.label) {
              <div class="border-r border-[#F0F1F4] px-2 last:border-r-0">
                <p class="inline-flex items-center gap-1 text-[11px] text-[rgba(26,27,29,0.5)]">
                  {{ metric.label }}
                  @if (metric.info) {
                    <img [ngSrc]="bannerDetailsInfoCircleIcon" width="16" height="16" alt="" />
                  }
                </p>
                <p class="mt-1 text-[18px] font-semibold text-[#1A1B1D]">{{ metric.value }}</p>
              </div>
            }
          </div>

          <section class="mt-6 rounded-[24px] border border-[#EFEFEF] bg-white p-4">
            <div class="flex flex-col gap-4">
              <div class="flex items-center justify-between gap-3">
                <h3 class="text-[18px] font-semibold text-[rgba(13,13,13,0.6)]">
                  Performance Overview
                </h3>
                <app-custom-dropdown
                  [options]="performanceRangeOptions"
                  [value]="performanceRange()"
                  [ariaLabel]="'Filter ad performance range'"
                  [buttonClass]="'inline-flex items-center gap-2 rounded-[64px] border border-[#EAEAEA] bg-white px-4 py-2 text-[12px] font-medium text-black'"
                  [labelClass]="'truncate'"
                  [iconClass]="'text-[#777777]'"
                  [menuClass]="'min-w-[156px]'"
                  [optionClass]="'w-full rounded-[14px] px-4 py-3 text-left text-[14px] text-[#1A1B1D] transition hover:bg-[#F5F6FA]'"
                  [activeOptionClass]="'bg-[#F5F1FF] text-[#5932EA]'"
                  (valueChange)="performanceRange.set($event)"
                ></app-custom-dropdown>
              </div>

              <div class="flex items-center gap-5 text-[12px] text-[#181818]">
                <span class="inline-flex items-center gap-1.5">
                  <span class="h-1.5 w-4 rounded-[4px] bg-[#6453D9]"></span>
                  Views
                </span>
                <span class="inline-flex items-center gap-1.5">
                  <span class="h-1.5 w-4 rounded-[4px] bg-[#FACD38]"></span>
                  Clicks
                </span>
              </div>
            </div>

            <div class="mt-4">
              <app-chart [config]="desktopPerformanceChartOptions()" containerClass="min-h-[420px]"></app-chart>
            </div>
          </section>
        </div>
      } @else if (ad().kind === 'store') {
        <div class="bg-white px-5 pb-14 pt-2">
          <div class="flex items-center justify-between gap-3 py-3">
            <div class="flex items-center gap-3">
              <a
          routerLink="/seller/ads/running" [queryParams]="runningAdsQueryParams()"
                aria-label="Back to running ads"
                class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F3F3]"
              >
                <img [ngSrc]="listingBackIcon" width="20" height="20" alt="" />
              </a>
              <h1 class="text-[20px] font-semibold leading-[1.2] tracking-[-0.03em] text-black">
                Ad details
              </h1>
            </div>

            <button
              type="button"
              (click)="toggleMobileActionMenu()"
              class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#1A1B1D]"
              aria-label="Open ad actions"
            >
              <ng-icon name="heroEllipsisHorizontal" class="text-[20px]"></ng-icon>
            </button>
          </div>

          <section class="pt-3">
            <div class="flex items-center gap-3">
              <div
                class="relative h-[54px] w-[54px] shrink-0 overflow-hidden rounded-full border-[2.919px] border-white bg-[#3D785F]"
              >
                <img
                  [ngSrc]="ad().image || storeFallbackLogo"
                  width="54"
                  height="54"
                  [alt]="ad().title"
                  class="h-full w-full object-cover"
                />
              </div>

              <div class="min-w-0">
                <h2
                  class="truncate text-[18px] font-semibold leading-[1.3] tracking-[-0.03em] text-[#1A1B1D]"
                >
                  {{ ad().title }}
                </h2>
                <div class="mt-1 flex items-center gap-1 text-[14px] text-[#777777]">
                  <img [ngSrc]="storeListingsIcon" width="14" height="14" alt="" />
                  <span>{{ ad().activeListings }}</span>
                </div>
              </div>
            </div>

            <div class="mt-6" [class]="listingStatusPillClass()">
              <img [ngSrc]="listingStatusIcon()" width="14" height="14" alt="" />
              <span [class]="listingStatusLabelClass()">{{ currentStatus() }}</span>
            </div>

            <div
              class="mt-4 flex items-center gap-2 rounded-[18px] bg-[rgba(255,254,218,0.76)] px-[10px] py-[11px]"
            >
              <img [ngSrc]="bannerDetailsInfoIcon" width="24" height="24" alt="" class="shrink-0" />
              <p class="text-[14px] font-medium leading-6 text-[#1F1F1F]">
                {{ ad().noticePrefix }} until it expires on {{ ad().expiresOn }}.
              </p>
            </div>
          </section>

          <div class="mt-6 border-y border-[#EDEDED] py-2">
            <div class="grid grid-cols-3 gap-4">
              @for (metric of ad().metrics; track metric.label) {
                <div class="border-r border-[#EDEDED] pr-4 last:border-r-0 last:pr-0">
                  <p class="text-[14px] font-medium text-[rgba(26,27,29,0.5)]">{{ metric.label }}</p>
                  <p class="mt-1 text-[18px] font-semibold text-[#1A1B1D]">{{ metric.value }}</p>
                </div>
              }
            </div>
          </div>

          <section class="mt-6 rounded-[16px] border border-[#EBEBEB] bg-white p-2">
            <div class="flex items-start justify-between gap-3">
              <div class="flex flex-col gap-4">
                <app-custom-dropdown
                  [options]="performanceRangeOptions"
                  [value]="performanceRange()"
                  [ariaLabel]="'Filter ad performance range'"
                  [buttonClass]="'inline-flex h-10 items-center gap-2 rounded-[64px] border border-[#EAEAEA] bg-white px-4 text-[14px] font-medium text-black'"
                  [labelClass]="'truncate'"
                  [iconClass]="'text-[#777777]'"
                  [menuClass]="'min-w-[156px]'"
                  [optionClass]="'w-full rounded-[14px] px-4 py-3 text-left text-[14px] text-[#1A1B1D] transition hover:bg-[#F5F6FA]'"
                  [activeOptionClass]="'bg-[#F5F1FF] text-[#5932EA]'"
                  (valueChange)="performanceRange.set($event)"
                ></app-custom-dropdown>

                <h3 class="text-[18px] font-semibold leading-6 text-[rgba(13,13,13,0.4)]">
                  Performance Overview
                </h3>
              </div>

              <div class="flex items-center gap-3 pt-1 text-[14px] text-[#181818]">
                <span class="inline-flex items-center gap-1">
                  <span class="h-1 w-3 rounded-[4px] bg-[#6453D9]"></span>
                  Views
                </span>
                <span class="inline-flex items-center gap-1">
                  <span class="h-1 w-3 rounded-[4px] bg-[#F4C12B]"></span>
                  Clicks
                </span>
              </div>
            </div>

            <div class="mt-4">
              <app-chart [config]="mobilePerformanceChartOptions()" containerClass="min-h-[250px]"></app-chart>
            </div>
          </section>
        </div>
      } @else if (ad().kind === 'listing') {
        <div class="bg-white px-5 pb-14 pt-2">
          <div class="flex items-center justify-between gap-3 py-3">
            <div class="flex items-center gap-3">
              <a
          routerLink="/seller/ads/running" [queryParams]="runningAdsQueryParams()"
                aria-label="Back to running ads"
                class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F3F3]"
              >
                <img [ngSrc]="listingBackIcon" width="20" height="20" alt="" />
              </a>
              <h1 class="text-[20px] font-semibold leading-[1.2] tracking-[-0.03em] text-black">
                Ad details
              </h1>
            </div>

            <button
              type="button"
              (click)="toggleMobileActionMenu()"
              class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#1A1B1D]"
              aria-label="Open ad actions"
            >
              <ng-icon name="heroEllipsisHorizontal" class="text-[20px]"></ng-icon>
            </button>
          </div>

          <section class="pt-3">
            <div class="flex items-center gap-3">
              <div class="relative h-[54px] w-[54px] shrink-0 overflow-hidden rounded-[10.8px] bg-[#EFEFEF]">
                <img
                  [ngSrc]="ad().image || listingPrimaryImage"
                  width="54"
                  height="54"
                  [alt]="ad().title"
                  class="h-full w-full object-cover"
                />
              </div>

              <div class="min-w-0">
                <h2
                  class="truncate text-[18px] font-semibold leading-[1.3] tracking-[-0.03em] text-[#1A1B1D]"
                >
                  {{ ad().title }}
                </h2>
                <p class="mt-1 text-[13px] leading-[1.2] text-[#8A8A8A]">
                  Last updated on: {{ ad().lastUpdated }}
                </p>
              </div>
            </div>

            <div class="mt-6" [class]="listingStatusPillClass()">
              <img [ngSrc]="listingStatusIcon()" width="14" height="14" alt="" />
              <span [class]="listingStatusLabelClass()">{{ currentStatus() }}</span>
            </div>

            <div
              class="mt-4 flex items-center gap-2 rounded-[18px] bg-[rgba(255,254,218,0.76)] px-[10px] py-[11px]"
            >
              <img [ngSrc]="bannerDetailsInfoIcon" width="24" height="24" alt="" class="shrink-0" />
              <p class="text-[14px] font-medium leading-6 text-[#1F1F1F]">
                {{ ad().noticePrefix }} until it expires on {{ ad().expiresOn }}.
              </p>
            </div>
          </section>

          <div class="mt-6 -mx-5 overflow-x-auto border-y border-[#EDEDED] px-5 py-[9px]">
            <div class="flex min-w-[430px]">
              @for (metric of ad().metrics; track metric.label) {
                <div class="min-w-[110px] border-r border-[#EDEDED] pr-5 last:border-r-0 last:pr-0">
                  <p class="text-[14px] font-medium text-[rgba(26,27,29,0.5)]">{{ metric.label }}</p>
                  <p class="mt-1 text-[18px] font-semibold text-[#1A1B1D]">{{ metric.value }}</p>
                </div>
              }
            </div>
          </div>

          <section class="mt-6 rounded-[16px] border border-[#EBEBEB] bg-white p-2">
            <div class="flex items-start justify-between gap-3">
              <div class="flex flex-col gap-4">
                <button
                  type="button"
                  class="inline-flex h-10 items-center gap-2 rounded-[64px] border border-[#EAEAEA] bg-white px-4 text-[14px] font-medium text-black"
                >
                  <img [ngSrc]="bannerDetailsCalendarIcon" width="14" height="14" alt="" />
                  Last 7 days
                  <img [ngSrc]="bannerDetailsArrowDownIcon" width="14" height="14" alt="" />
                </button>

                <h3 class="text-[18px] font-semibold leading-6 text-[rgba(13,13,13,0.4)]">
                  Performance Overview
                </h3>
              </div>

              <div class="flex items-center gap-3 pt-1 text-[14px] text-[#181818]">
                <span class="inline-flex items-center gap-1">
                  <span class="h-1 w-3 rounded-[4px] bg-[#6453D9]"></span>
                  Views
                </span>
                <span class="inline-flex items-center gap-1">
                  <span class="h-1 w-3 rounded-[4px] bg-[#F4C12B]"></span>
                  Clicks
                </span>
              </div>
            </div>

            <div class="mt-4">
              <app-chart [config]="mobilePerformanceChartOptions()" containerClass="min-h-[250px]"></app-chart>
            </div>
          </section>
        </div>
      } @else {
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <a
          routerLink="/seller/ads/running" [queryParams]="runningAdsQueryParams()"
              aria-label="Back to running ads"
              class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F6FA] text-[#30313A]"
            >
              <ng-icon name="heroChevronLeft" class="text-[16px]"></ng-icon>
            </a>
            <h1 class="text-[15px] font-semibold tracking-[-0.03em] text-[#202335]">Ad details</h1>
          </div>
        </div>

        <div class="mt-5 rounded-[24px] bg-white p-4 text-[14px] text-[#626771]">
          This view is currently optimized for banner ads.
        </div>
      }
    </div>

    <div class="hidden h-full md:flex">
      @if (ad().kind === 'banner') {
        <div
          class="flex h-full w-full flex-col rounded-[32px] border border-[#F1F1F4] bg-white px-8 pb-8 pt-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]"
        >
          <nav class="flex items-center gap-2 text-[14px] font-medium leading-5 text-[#9E9E9E]">
        <a routerLink="/seller/ads" class="transition-colors hover:text-[#6B5CF0]">Ads</a>
            <span>/</span>
        <a routerLink="/seller/ads/running" [queryParams]="runningAdsQueryParams()" class="transition-colors hover:text-[#6B5CF0]"
              >Running Ads</a
            >
            <span>/</span>
            <span class="text-[#181818]">Ad details</span>
          </nav>

          <section class="mt-6 border-b border-[#F0F1F4] pb-6">
            <div class="flex items-start justify-between gap-6">
              <div class="flex flex-col gap-4">
                <div class="relative h-[161px] w-[287px] overflow-hidden rounded-[24px]">
                  <img
                    [ngSrc]="bannerImageSrc()"
                    width="287"
                    height="161"
                    [alt]="ad().title"
                    class="h-full w-full rounded-[24px] object-cover"
                  />
                  <button
                    type="button"
                    (click)="openDestinationModal()"
                    class="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full border border-[#EAEAEA] bg-white shadow-[0_4px_8px_0_rgba(202,202,202,0.25)]"
                    aria-label="Edit destination link"
                  >
                    <img [ngSrc]="bannerDetailsExportIcon" width="16" height="16" alt="" />
                  </button>
                </div>

                <div class="flex flex-wrap items-center gap-2">
                  <h1 class="text-[24px] font-semibold leading-8 text-[#1A1B1D]">
                    {{ ad().title }}
                  </h1>
              <span class="inline-flex items-center gap-1 rounded-[8px] bg-[#F3FBF9] px-2 py-1">
                <img [ngSrc]="bannerDetailsStatusIcon" width="14" height="14" alt="" />
                <span class="text-[12px] font-semibold leading-4 text-[#25AD32]">{{ currentStatus() }}</span>
              </span>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <button
                  type="button"
                  (click)="openDestinationModal()"
                  class="inline-flex h-10 items-center gap-2 rounded-[64px] border border-[#EAEAEA] bg-white px-5 text-[14px] font-medium text-[#0D0D0D]"
                >
                  <img [ngSrc]="bannerDetailsEditIcon" width="14" height="14" alt="" />
                  Edit destination link
                </button>
                <button
                  type="button"
                  (click)="togglePaused()"
                  class="inline-flex h-10 items-center gap-2 rounded-[64px] border border-[#EAEAEA] bg-white px-5 text-[14px] font-medium text-[#0D0D0D]"
                >
                  <img [ngSrc]="bannerDetailsPauseIcon" width="14" height="14" alt="" />
                  {{ currentStatus() === 'Paused' ? 'Resume Ad' : 'Pause Ad' }}
                </button>
              </div>
            </div>

            <div
              class="mt-4 inline-flex max-w-[695px] items-center gap-2 rounded-[16px] bg-[rgba(255,254,218,0.76)] px-[10px] py-[11px]"
            >
              <img [ngSrc]="bannerDetailsInfoIcon" width="24" height="24" alt="" class="shrink-0" />
              <p class="text-[14px] leading-5 text-[#1F1F1F]">
                Your banner will be promoted across Duduzili until it expires on
                {{ ad().expiresOn }}.
              </p>
            </div>
          </section>

          <div class="mt-6 grid grid-cols-3 border-b border-[#F0F1F4] pb-6">
            @for (metric of ad().metrics; track metric.label) {
              <div class="border-r border-[#F0F1F4] px-4 first:pl-0 last:border-r-0 last:pr-0">
                <p
                  class="inline-flex items-center gap-1 text-[14px] font-medium leading-5 text-[rgba(24,24,24,0.5)]"
                >
                  {{ metric.label }}
                  @if (metric.info) {
                    <img [ngSrc]="bannerDetailsInfoCircleIcon" width="16" height="16" alt="" />
                  }
                </p>
                <p class="mt-1 text-[24px] font-semibold leading-8 text-[#1A1B1D]">
                  {{ metric.value }}
                </p>
              </div>
            }
          </div>

          <section class="mt-6 flex-1 rounded-[32px] border border-[#EFEFEF] bg-white p-6">
            <div class="flex items-start justify-between gap-6">
              <div>
                <h2 class="text-[24px] font-medium leading-8 text-[rgba(13,13,13,0.6)]">
                  Performance Overview
                </h2>
                <div class="mt-4 flex items-center gap-6 text-[14px] leading-5 text-[#181818]">
                  <span class="inline-flex items-center gap-2">
                    <span class="h-1.5 w-4 rounded-[4px] bg-[#6453D9]"></span>
                    Views
                  </span>
                  <span class="inline-flex items-center gap-2">
                    <span class="h-1.5 w-4 rounded-[4px] bg-[#FACD38]"></span>
                    Clicks
                  </span>
                </div>
              </div>

              <app-custom-dropdown
                [options]="performanceRangeOptions"
                [value]="performanceRange()"
                [ariaLabel]="'Filter ad performance range'"
                [buttonClass]="'inline-flex items-center gap-2 rounded-[64px] border border-[#EAEAEA] bg-white px-4 py-2.5 text-[14px] font-medium text-black'"
                [labelClass]="'truncate'"
                [iconClass]="'text-[#777777]'"
                [menuClass]="'min-w-[156px]'"
                [optionClass]="'w-full rounded-[14px] px-4 py-3 text-left text-[14px] text-[#1A1B1D] transition hover:bg-[#F5F6FA]'"
                [activeOptionClass]="'bg-[#F5F1FF] text-[#5932EA]'"
                (valueChange)="performanceRange.set($event)"
              ></app-custom-dropdown>
            </div>

            <div class="mt-6">
              <app-chart [config]="desktopPerformanceChartOptions()" containerClass="min-h-[420px]"></app-chart>
            </div>
          </section>
        </div>
      } @else if (ad().kind === 'store') {
        <div
          class="flex h-full w-full flex-col rounded-[24px] border border-[#F4F4F4] bg-white px-5 pb-8 pt-[14px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] xl:px-6"
        >
          <nav class="flex items-center gap-2 text-[14px] font-medium leading-5 text-[#959595]">
        <a routerLink="/seller/ads" class="transition-colors hover:text-[#6B5CF0]">Ads</a>
            <span>/</span>
        <a routerLink="/seller/ads/running" [queryParams]="runningAdsQueryParams()" class="transition-colors hover:text-[#6B5CF0]"
              >Running Ads</a
            >
            <span>/</span>
            <span class="text-[#1F1F1F]">Ad details</span>
          </nav>

          <section class="border-b border-[#F0F1F4] pb-9 pt-7">
            <div class="flex items-start justify-between gap-6">
              <div class="flex min-w-0 flex-col gap-4">
                <div class="flex items-center gap-3">
                  <div
                    class="relative h-[60px] w-[60px] shrink-0 overflow-hidden rounded-full border-[3.243px] border-white bg-[#3D785F]"
                  >
                    <img
                      [ngSrc]="ad().image || storeFallbackLogo"
                      width="60"
                      height="60"
                      [alt]="ad().title"
                      class="h-full w-full object-cover"
                    />
                  </div>

                  <div class="min-w-0">
                    <div class="flex items-center gap-3">
                      <h1
                        class="truncate text-[24px] font-semibold leading-8 tracking-[-0.03em] text-[#1A1B1D]"
                      >
                        {{ ad().title }}
                      </h1>
                      <div class="shrink-0" [class]="listingStatusPillClass()">
                        <img [ngSrc]="listingStatusIcon()" width="14" height="14" alt="" />
                        <span [class]="listingStatusLabelClass()">{{ currentStatus() }}</span>
                      </div>
                    </div>

                    <div class="mt-1 flex items-center gap-1 text-[14px] text-[#777777]">
                      <img [ngSrc]="storeListingsIcon" width="14" height="14" alt="" />
                      <span>{{ ad().activeListings }}</span>
                    </div>
                  </div>
                </div>

                <div
                  class="inline-flex max-w-[540px] items-center gap-2 rounded-[16px] bg-[rgba(255,254,218,0.76)] px-[10px] py-[11px]"
                >
                  <img
                    [ngSrc]="bannerDetailsInfoIcon"
                    width="24"
                    height="24"
                    alt=""
                    class="shrink-0"
                  />
                  <p class="text-[14px] font-medium leading-5 text-[#1F1F1F]">
                    {{ ad().noticePrefix }} until it expires on {{ ad().expiresOn }}.
                  </p>
                </div>
              </div>

              <div class="flex shrink-0 items-center gap-3">
                <button
                  type="button"
                  (click)="togglePaused()"
                  class="inline-flex h-10 items-center gap-2 rounded-[64px] border border-[#EAEAEA] bg-white px-5 text-[14px] font-medium text-[#0D0D0D]"
                >
                  <img [ngSrc]="listingPauseIcon" width="14" height="14" alt="" />
                  {{ pauseActionLabel() }}
                </button>
                <button
                  type="button"
                  class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] bg-white shadow-[0_1px_2px_rgba(42,59,81,0.12),0_0_0_1px_rgba(18,55,105,0.08)]"
                  aria-label="More ad actions"
                >
                  <ng-icon name="heroEllipsisHorizontal" class="text-[18px] text-[#0D0D0D]"></ng-icon>
                </button>
              </div>
            </div>
          </section>

          <div class="grid grid-cols-3 border-b border-[#F0F1F4] py-5">
            @for (metric of ad().metrics; track metric.label) {
              <div class="border-r border-[#F0F1F4] pr-10 last:border-r-0 last:pr-0">
                <p class="text-[16px] font-medium text-[rgba(26,27,29,0.5)]">{{ metric.label }}</p>
                <p class="mt-2 text-[20px] font-semibold text-[#1A1B1D]">{{ metric.value }}</p>
              </div>
            }
          </div>

          <section
            class="mt-6 flex-1 rounded-[24px] border border-[#EFEFEF] bg-white px-3 pb-4 pt-4 xl:px-4"
          >
            <div class="flex items-start justify-between gap-6">
              <h2 class="text-[24px] font-semibold leading-6 text-[rgba(13,13,13,0.6)]">
                Performance Overview
              </h2>

              <div class="flex items-center gap-5">
                <div class="flex items-center gap-5 text-[16px] text-[#181818]">
                  <span class="inline-flex items-center gap-1">
                    <span class="h-1.5 w-4 rounded-[4px] bg-[#6453D9]"></span>
                    Views
                  </span>
                  <span class="inline-flex items-center gap-1">
                    <span class="h-1.5 w-4 rounded-[4px] bg-[#FACD38]"></span>
                    Clicks
                  </span>
                </div>

                <app-custom-dropdown
                  [options]="performanceRangeOptions"
                  [value]="performanceRange()"
                  [ariaLabel]="'Filter ad performance range'"
                  [buttonClass]="'inline-flex h-10 items-center gap-2 rounded-[64px] border border-[#EAEAEA] bg-white px-4 text-[14px] font-medium text-black'"
                  [labelClass]="'truncate'"
                  [iconClass]="'text-[#777777]'"
                  [menuClass]="'min-w-[156px]'"
                  [optionClass]="'w-full rounded-[14px] px-4 py-3 text-left text-[14px] text-[#1A1B1D] transition hover:bg-[#F5F6FA]'"
                  [activeOptionClass]="'bg-[#F5F1FF] text-[#5932EA]'"
                  (valueChange)="performanceRange.set($event)"
                ></app-custom-dropdown>
              </div>
            </div>

            <div class="mt-4">
              <app-chart [config]="desktopWidePerformanceChartOptions()" containerClass="min-h-[430px]"></app-chart>
            </div>
          </section>
        </div>
      } @else if (ad().kind === 'listing') {
        <div
          class="flex h-full w-full flex-col rounded-[24px] border border-[#F4F4F4] bg-white px-5 pb-8 pt-[14px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] xl:px-6"
        >
          <nav class="flex items-center gap-2 text-[14px] font-medium leading-5 text-[#959595]">
        <a routerLink="/seller/ads" class="transition-colors hover:text-[#6B5CF0]">Ads</a>
            <span>/</span>
        <a routerLink="/seller/ads/running" [queryParams]="runningAdsQueryParams()" class="transition-colors hover:text-[#6B5CF0]"
              >Running Ads</a
            >
            <span>/</span>
            <span class="text-[#1F1F1F]">Ad details</span>
          </nav>

          <section class="border-b border-[#F0F1F4] pb-9 pt-7">
            <div class="flex items-start justify-between gap-6">
              <div class="flex min-w-0 flex-col gap-4">
                <div class="flex items-center gap-3">
                  <div
                    class="relative h-[60px] w-[60px] shrink-0 overflow-hidden rounded-[12px] bg-[#EFEFEF]"
                  >
                    <img
                      [ngSrc]="ad().image || listingPrimaryImage"
                      width="60"
                      height="60"
                      [alt]="ad().title"
                      class="h-full w-full object-cover"
                    />
                  </div>

                  <div class="min-w-0">
                    <div class="flex items-center gap-3">
                      <h1
                        class="truncate text-[24px] font-semibold leading-8 tracking-[-0.03em] text-[#1A1B1D]"
                      >
                        {{ ad().title }}
                      </h1>
                      <div class="shrink-0" [class]="listingStatusPillClass()">
                        <img [ngSrc]="listingStatusIcon()" width="14" height="14" alt="" />
                        <span [class]="listingStatusLabelClass()">{{ currentStatus() }}</span>
                      </div>
                    </div>

                    <p class="mt-1 text-[14px] text-[#777777]">
                      <span class="line-through">₦</span>{{ ad().price?.replace('₦', '') }}
                    </p>
                  </div>
                </div>

                <div
                  class="inline-flex max-w-[540px] items-center gap-2 rounded-[16px] bg-[rgba(255,254,218,0.76)] px-[10px] py-[11px]"
                >
                  <img
                    [ngSrc]="bannerDetailsInfoIcon"
                    width="24"
                    height="24"
                    alt=""
                    class="shrink-0"
                  />
                  <p class="text-[14px] font-medium leading-5 text-[#1F1F1F]">
                    {{ ad().noticePrefix }} until it expires on {{ ad().expiresOn }}.
                  </p>
                </div>
              </div>

              <div class="flex shrink-0 items-center gap-3">
                <button
                  type="button"
                  (click)="togglePaused()"
                  class="inline-flex h-10 items-center gap-2 rounded-[64px] border border-[#EAEAEA] bg-white px-5 text-[14px] font-medium text-[#0D0D0D]"
                >
                  <img [ngSrc]="listingPauseIcon" width="14" height="14" alt="" />
                  {{ pauseActionLabel() }}
                </button>
                <div class="relative">
                  <button
                    type="button"
                    (click)="toggleDesktopActionMenu()"
                    class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] bg-white shadow-[0_1px_2px_rgba(42,59,81,0.12),0_0_0_1px_rgba(18,55,105,0.08)]"
                    aria-label="More ad actions"
                    [attr.aria-expanded]="isDesktopActionMenuOpen()"
                    aria-haspopup="menu"
                  >
                    <ng-icon
                      name="heroEllipsisHorizontal"
                      class="text-[18px] text-[#0D0D0D]"
                    ></ng-icon>
                  </button>

                  @if (isDesktopActionMenuOpen()) {
                    <div
                      class="absolute right-0 top-[calc(100%+10px)] z-[260] w-[140px] rounded-[16px] border border-[#F0F0F0] bg-white p-[10px] shadow-[0_6.65px_5.32px_rgba(0,0,0,0.03),0_2.767px_2.214px_rgba(0,0,0,0.02)]"
                      role="menu"
                      aria-label="Listing actions"
                    >
                      <button
                        type="button"
                        (click)="closeDesktopActionMenu()"
                        class="flex h-8 w-full items-center gap-[6px] rounded-[8px] bg-white px-2 text-left text-[14px] font-medium text-[rgba(13,13,13,0.87)]"
                        role="menuitem"
                      >
                        <img [ngSrc]="listingViewIcon" width="14" height="14" alt="" />
                        <span>View listing</span>
                      </button>

                      <button
                        type="button"
                        (click)="closeDesktopActionMenu()"
                        class="mt-1 flex h-8 w-full items-center gap-[6px] rounded-[8px] bg-white px-2 text-left text-[14px] font-medium text-[rgba(13,13,13,0.87)]"
                        role="menuitem"
                      >
                        <img [ngSrc]="listingShareIcon" width="14" height="14" alt="" />
                        <span>Share listing</span>
                      </button>
                    </div>
                  }
                </div>
              </div>
            </div>
          </section>

          <div class="grid grid-cols-4 border-b border-[#F0F1F4] py-5">
            @for (metric of ad().metrics; track metric.label) {
              <div class="border-r border-[#F0F1F4] pr-10 last:border-r-0 last:pr-0">
                <p class="text-[16px] font-medium text-[rgba(26,27,29,0.5)]">{{ metric.label }}</p>
                <p class="mt-2 text-[20px] font-semibold text-[#1A1B1D]">{{ metric.value }}</p>
              </div>
            }
          </div>

          <section
            class="mt-6 flex-1 rounded-[24px] border border-[#EFEFEF] bg-white px-3 pb-4 pt-4 xl:px-4"
          >
            <div class="flex items-start justify-between gap-6">
              <h2 class="text-[24px] font-semibold leading-6 text-[rgba(13,13,13,0.6)]">
                Performance Overview
              </h2>

              <div class="flex items-center gap-5">
                <div class="flex items-center gap-5 text-[16px] text-[#181818]">
                  <span class="inline-flex items-center gap-1">
                    <span class="h-1.5 w-4 rounded-[4px] bg-[#6453D9]"></span>
                    Views
                  </span>
                  <span class="inline-flex items-center gap-1">
                    <span class="h-1.5 w-4 rounded-[4px] bg-[#FACD38]"></span>
                    Clicks
                  </span>
                </div>

                <app-custom-dropdown
                  [options]="performanceRangeOptions"
                  [value]="performanceRange()"
                  [ariaLabel]="'Filter ad performance range'"
                  [buttonClass]="'inline-flex h-10 items-center gap-2 rounded-[64px] border border-[#EAEAEA] bg-white px-4 text-[14px] font-medium text-black'"
                  [labelClass]="'truncate'"
                  [iconClass]="'text-[#777777]'"
                  [menuClass]="'min-w-[156px]'"
                  [optionClass]="'w-full rounded-[14px] px-4 py-3 text-left text-[14px] text-[#1A1B1D] transition hover:bg-[#F5F6FA]'"
                  [activeOptionClass]="'bg-[#F5F1FF] text-[#5932EA]'"
                  (valueChange)="performanceRange.set($event)"
                ></app-custom-dropdown>
              </div>
            </div>

            <div class="mt-4">
              <app-chart [config]="desktopWidePerformanceChartOptions()" containerClass="min-h-[430px]"></app-chart>
            </div>
          </section>
        </div>
      } @else {
        <div
          class="flex h-full w-full flex-col rounded-[32px] border border-[#F1F1F4] bg-white px-8 py-6 text-[15px] text-[#626771] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]"
        >
          <nav class="flex items-center gap-2 text-[14px] font-medium leading-5 text-[#9E9E9E]">
        <a routerLink="/seller/ads" class="transition-colors hover:text-[#6B5CF0]">Ads</a>
            <span>/</span>
        <a routerLink="/seller/ads/running" [queryParams]="runningAdsQueryParams()" class="transition-colors hover:text-[#6B5CF0]"
              >Running Ads</a
            >
            <span>/</span>
            <span class="text-[#181818]">Ad details</span>
          </nav>

          <div class="mt-6 rounded-[24px] bg-[#F7F7FA] p-5">
            This view is currently optimized for banner ads.
          </div>
        </div>
      }
    </div>

    @if (isDestinationModalOpen()) {
      <div
        class="fixed inset-0 z-[220] bg-black/20 p-4 backdrop-blur-[2px] md:flex md:items-center md:justify-center"
        (click)="closeDestinationModal()"
      >
        <div
          class="fixed inset-x-0 bottom-0 rounded-t-[28px] bg-white px-5 py-5 shadow-[0_-20px_50px_-30px_rgba(19,27,45,0.45)] md:static md:w-full md:max-w-[600px] md:rounded-[28px] md:px-10 md:py-8 md:shadow-[0_30px_80px_-40px_rgba(19,27,45,0.45)]"
          (click)="$event.stopPropagation()"
        >
          <div class="mx-auto mb-3 h-1.5 w-14 rounded-full bg-[#E6E7EC] md:hidden"></div>

          <div class="flex items-start justify-between gap-4">
            <div>
              <h2
                class="text-[18px] font-semibold tracking-[-0.03em] text-[#1A1C21] md:text-[22px] md:font-black md:tracking-tight"
              >
                Edit destination link
              </h2>
              <p class="mt-2 text-[12px] text-[#626771] md:mt-3 md:text-[15px] md:font-medium">
                Choose where buyers will be taken when they click your banner.
              </p>
            </div>

            <button
              type="button"
              (click)="closeDestinationModal()"
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#ECEEF4] bg-white text-[#525762] transition hover:bg-[#F7F7F8] md:h-10 md:w-10 md:border-0 md:bg-[#F7F7F8] md:hover:bg-[#EFEFF2]"
              aria-label="Close destination link modal"
            >
              <ng-icon name="heroXMark" class="text-lg"></ng-icon>
            </button>
          </div>

          <div class="mt-6 md:mt-10">
            <label
              for="destination-link"
              class="mb-2 block text-[11px] font-medium text-[#7B8089] md:text-[14px] md:font-semibold"
            >
              Destination link
            </label>

            <div
              class="flex items-center gap-3 rounded-[14px] border border-[#E7EAF0] bg-white px-3 py-3 md:rounded-[18px] md:px-4"
            >
              <input
                id="destination-link"
                type="url"
                [value]="editedDestinationUrl()"
                (input)="updateEditedDestinationUrl($event)"
                class="min-w-0 flex-1 bg-transparent text-[12px] font-medium text-[#4B4F57] outline-none placeholder:text-[#B3B6BE] md:text-[14px]"
              />
              <button
                type="button"
                (click)="editedDestinationUrl.set('')"
                class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F7F7F8] text-[#6A6F78] transition hover:bg-[#EFEFF2] md:h-8 md:w-8"
                aria-label="Clear destination link"
              >
                <ng-icon name="heroXMark" class="text-sm"></ng-icon>
              </button>
            </div>
          </div>

          <div class="mt-8 grid gap-3 sm:grid-cols-2 md:mt-16">
            <button
              type="button"
              (click)="closeDestinationModal()"
              class="hidden rounded-full border border-[#E7EAF0] bg-white px-6 py-3.5 text-[15px] font-semibold text-[#2E333B] transition hover:bg-[#FAFAFC] sm:block"
            >
              Cancel
            </button>
            <button
              type="button"
              (click)="saveDestinationUrl()"
              class="rounded-full bg-[#6653E4] px-6 py-3 text-[12px] font-medium text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)] transition hover:bg-[#5945DB] md:py-3.5 md:text-[15px] md:font-semibold"
            >
              Update
            </button>
          </div>
        </div>
      </div>
    }

    @if (isMobileActionMenuOpen()) {
      <div
        class="fixed inset-0 z-[220] bg-black/20 md:hidden"
        (click)="closeMobileActionMenu()"
        aria-hidden="true"
      ></div>

      @if (ad().kind === 'listing') {
        <section
          class="fixed inset-x-0 bottom-0 z-[230] rounded-t-[36px] bg-white px-4 pb-7 pt-3 shadow-[0_-24px_44px_-24px_rgba(17,24,39,0.24)] md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Ad actions"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1 pt-1">
              <div class="mx-auto h-1 w-[50px] rounded-full bg-[#EBEBEB]"></div>
            </div>

            <button
              type="button"
              (click)="closeMobileActionMenu()"
              class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#EAEAEA] bg-white text-[#434455] shadow-[0_4px_8px_rgba(202,202,202,0.25)]"
              aria-label="Close ad actions"
            >
              <img [ngSrc]="listingCloseIcon" width="24" height="24" alt="" />
            </button>
          </div>

          <div class="mt-3 space-y-1 pb-1">
            <button
              type="button"
              (click)="togglePausedFromMenu()"
              class="flex h-8 w-full items-center gap-[10px] rounded-[8px] px-2 text-left text-[16px] font-medium text-[#0D0D0D]"
            >
              @if (currentStatus() === 'Paused') {
                <svg
                  viewBox="0 0 20 20"
                  class="h-5 w-5 shrink-0 stroke-[#434455]"
                  fill="none"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M7 5.6L14.2 10 7 14.4V5.6Z"></path>
                </svg>
              } @else {
                <img [ngSrc]="listingPauseIcon" width="20" height="20" alt="" class="shrink-0" />
              }
              <span>{{ pauseActionLabel() }}</span>
            </button>

            <button
              type="button"
              (click)="closeMobileActionMenu()"
              class="flex h-8 w-full items-center gap-[10px] rounded-[8px] px-2 text-left text-[16px] font-medium text-[rgba(13,13,13,0.87)]"
            >
              <img [ngSrc]="listingShareIcon" width="20" height="20" alt="" class="shrink-0" />
              <span>Share listing</span>
            </button>

            <button
              type="button"
              (click)="closeMobileActionMenu()"
              class="flex h-8 w-full items-center gap-[10px] rounded-[8px] px-2 text-left text-[16px] font-medium text-[rgba(13,13,13,0.87)]"
            >
              <img [ngSrc]="listingViewIcon" width="20" height="20" alt="" class="shrink-0" />
              <span>View listing</span>
            </button>
          </div>
        </section>
      } @else {
        <section
          class="fixed bottom-24 left-1/2 z-[230] w-[270px] -translate-x-1/2 rounded-[22px] border border-[#ECEEF3] bg-white p-2 shadow-[0_24px_44px_-24px_rgba(17,24,39,0.4)] md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Ad actions"
        >
          @if (ad().kind === 'banner') {
            <button
              type="button"
              (click)="openDestinationModal()"
              class="flex w-full items-center gap-3 rounded-[16px] px-4 py-3 text-left text-[13px] font-medium text-[#2E333B] transition hover:bg-[#F8F8FA]"
            >
              <ng-icon name="heroLink" class="text-[14px] text-[#6D727C]"></ng-icon>
              Edit destination link
            </button>
          }
          @if (currentStatus() === 'Paused' || currentStatus() === 'Active') {
            <button
              type="button"
              (click)="togglePausedFromMenu()"
              class="flex w-full items-center gap-3 rounded-[16px] px-4 py-3 text-left text-[13px] font-medium text-[#2E333B] transition hover:bg-[#F8F8FA]"
            >
              <img [ngSrc]="listingPauseIcon" width="14" height="14" alt="" />
              {{ pauseActionLabel() }}
            </button>
          }
        </section>
      }
    }

    @if (isDesktopActionMenuOpen()) {
      <button
        type="button"
        class="fixed inset-0 z-[250] hidden cursor-default bg-transparent md:block"
        (click)="closeDesktopActionMenu()"
        aria-label="Close listing actions"
      ></button>
    }
  `,
  host: { class: 'block h-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdDetailsPageComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly mobileOverlayService = inject(MobileOverlayService);
  private readonly sellerMonetizationService = inject(SellerMonetizationService);
  private readonly appToastService = inject(AppToastService);
  readonly listingPrimaryImage = 'assets/images/listing-iphone-17-pro-max-figma.png';
  readonly listingSecondaryImage = 'assets/images/listing-logitech-mouse-figma.png';
  readonly storeFallbackLogo = 'assets/images/store-vine-logo-mobile.png';
  readonly storeListingsIcon = 'assets/icons/running-ads-tab-store.svg';
  readonly listingBackIcon = 'assets/icons/listing-details-back.svg';
  readonly listingCloseIcon = 'assets/icons/listing-details-close.svg';
  readonly listingPauseIcon = 'assets/icons/listing-details-action-pause.svg';
  readonly listingShareIcon = 'assets/icons/listing-details-action-share.svg';
  readonly listingViewIcon = 'assets/icons/listing-details-eye.svg';
  readonly bannerHeroImage = 'assets/images/banner-details-hero.png';
  readonly bannerDetailsEditIcon = 'assets/icons/banner-details-edit.svg';
  readonly bannerDetailsPauseIcon = 'assets/icons/banner-details-pause.svg';
  readonly bannerDetailsExportIcon = 'assets/icons/banner-details-export.svg';
  readonly bannerDetailsInfoIcon = 'assets/icons/banner-details-info.svg';
  readonly bannerDetailsStatusIcon = 'assets/icons/banner-details-status.svg';
  readonly bannerDetailsInfoCircleIcon = 'assets/icons/banner-details-info-circle.svg';
  readonly bannerDetailsCalendarIcon = 'assets/icons/banner-details-calendar.svg';
  readonly bannerDetailsArrowDownIcon = 'assets/icons/banner-details-arrow-down.svg';
  readonly performanceRange = signal<AdPerformanceRange>('7d');
  readonly performanceRangeOptions: readonly CustomDropdownOption<AdPerformanceRange>[] = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
  ];
  readonly performanceRangeLabel = computed(() => {
    switch (this.performanceRange()) {
      case '30d':
        return 'Last 30 days';
      case '90d':
        return 'Last 90 days';
      default:
        return 'Last 7 days';
    }
  });

  readonly adId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? 'other-1')),
    { initialValue: this.route.snapshot.paramMap.get('id') ?? 'other-1' },
  );
  readonly runningAdsQueryState = toSignal(
    this.route.queryParamMap.pipe(
      map((params): RunningAdsQueryState => {
        const placement = params.get('placement');
        const status = params.get('status');
        const pageValue = Number(params.get('page') ?? '1');

        return {
          placement:
            placement === 'promoted listings' || placement === 'store promotions' || placement === 'banner ads'
              ? placement
              : undefined,
          status: status === 'active' || status === 'paused' || status === 'expired' ? status : undefined,
          page: Number.isFinite(pageValue) && pageValue > 0 ? Math.floor(pageValue) : undefined,
        };
      }),
    ),
    { initialValue: {} },
  );
  readonly backendAd = signal<SellerAdRecord | null>(null);
  readonly adAnalytics = signal<AdAnalyticsResponse | null>(null);
  readonly isMenuOpen = signal(false);
  readonly isMobileActionMenuOpen = signal(false);
  readonly isDesktopActionMenuOpen = signal(false);
  readonly isDestinationModalOpen = signal(false);
  readonly editedDestinationUrl = signal('');
  readonly destinationUrlOverrides = signal<Record<string, string>>({});
  readonly listingStatusIcon = computed(() =>
    this.currentStatus() === 'Paused'
      ? 'assets/icons/listing-details-status-pause.svg'
      : this.bannerDetailsStatusIcon,
  );
  readonly listingStatusPillClass = computed(() =>
    this.currentStatus() === 'Paused'
      ? 'inline-flex items-center gap-1 rounded-[8px] bg-[#F3F0FF] px-2 py-1'
      : 'inline-flex items-center gap-1 rounded-[8px] bg-[#F3FBF9] px-2 py-1',
  );
  readonly listingStatusLabelClass = computed(() =>
    this.currentStatus() === 'Paused'
      ? 'text-[12px] font-semibold leading-4 text-[#5E44EE]'
      : 'text-[12px] font-semibold leading-4 text-[#25AD32]',
  );
  readonly pauseActionLabel = computed(() =>
    this.currentStatus() === 'Paused' ? 'Resume Ad' : 'Pause Ad',
  );

  private readonly adMap: Record<string, AdDetail> = {
    'other-1': {
      id: 'other-1',
      kind: 'listing',
      title: 'Iphone 17 pro max',
      price: '₦1,500,000',
      lastUpdated: '24 January, 2026',
      status: 'Active',
      image: 'assets/images/listing-iphone-17-pro-max-figma.png',
      expiresOn: '24 March, 2026',
      noticePrefix: 'Your listing will be promoted across Duduzili',
      metrics: [
        { label: 'Total views', value: '750,000' },
        { label: 'Total clicks', value: '108' },
        { label: 'Total calls', value: '56' },
        { label: 'Total messages', value: '24' },
      ],
    },
    'other-2': {
      id: 'other-2',
      kind: 'listing',
      title: 'Logitech ergonomic mouse',
      price: '₦35,000',
      lastUpdated: '24 January, 2026',
      status: 'Active',
      image: 'assets/images/listing-logitech-mouse-figma.png',
      expiresOn: '24 March, 2026',
      noticePrefix: 'Your listing will be promoted across Duduzili',
      metrics: [
        { label: 'Total views', value: '215,000' },
        { label: 'Total clicks', value: '74' },
        { label: 'Total calls', value: '12' },
        { label: 'Total messages', value: '18' },
      ],
    },
    'store-1': {
      id: 'store-1',
      kind: 'store',
      title: 'The Vine Collections',
      activeListings: '43 active listings',
      status: 'Active',
      image: 'assets/images/store-vine-logo-mobile.png',
      initials: 'V',
      logoTone: 'linear-gradient(135deg, #4A8F67 0%, #F0C76C 100%)',
      expiresOn: '24 March, 2026',
      noticePrefix: 'Your store will be promoted across Duduzili',
      metrics: [
        { label: 'Total views', value: '750,000' },
        { label: 'Total clicks', value: '108' },
        { label: 'Listings viewed', value: '56' },
      ],
    },
    'store-2': {
      id: 'store-2',
      kind: 'store',
      title: 'New Age Properties',
      activeListings: '43 active listings',
      status: 'Active',
      image: 'assets/images/store-newage-logo-desktop.png',
      initials: 'N',
      logoTone: 'linear-gradient(135deg, #101713 0%, #83D95E 100%)',
      expiresOn: '24 March, 2026',
      noticePrefix: 'Your store will be promoted across Duduzili',
      metrics: [
        { label: 'Total views', value: '620,000' },
        { label: 'Total clicks', value: '94' },
        { label: 'Listings viewed', value: '42' },
      ],
    },
    'store-3': {
      id: 'store-3',
      kind: 'store',
      title: 'Snap Thrifts',
      activeListings: '43 active listings',
      status: 'Paused',
      image: 'assets/images/store-snap-logo-mobile.png',
      initials: 'S',
      logoTone: 'linear-gradient(135deg, #3DBF6C 0%, #62D68A 100%)',
      expiresOn: '24 March, 2026',
      noticePrefix: 'Your store will be promoted across Duduzili',
      metrics: [
        { label: 'Total views', value: '315,000' },
        { label: 'Total clicks', value: '57' },
        { label: 'Listings viewed', value: '29' },
      ],
    },
    'store-4': {
      id: 'store-4',
      kind: 'store',
      title: 'goMelon',
      activeListings: '43 active listings',
      status: 'Expired',
      image: 'assets/images/store-gomelon-logo-mobile.png',
      initials: 'g',
      logoTone: 'linear-gradient(135deg, #FF7B2F 0%, #FFB266 100%)',
      expiresOn: '03 March, 2026',
      noticePrefix: 'Your store will be promoted across Duduzili',
      metrics: [
        { label: 'Total views', value: '198,000' },
        { label: 'Total clicks', value: '31' },
        { label: 'Listings viewed', value: '14' },
      ],
    },
    'banner-1': {
      id: 'banner-1',
      kind: 'banner',
      title: 'Christmas Sale Banner',
      status: 'Active',
      image: 'assets/images/image-1-1.jpg',
      destinationUrl: 'https://duduzili.com/christmas-sale',
      expiresOn: '24 March, 2026',
      noticePrefix: 'Your banner will be promoted across Duduzili',
      metrics: [
        { label: 'Total views', value: '750,000' },
        { label: 'Total clicks', value: '108' },
        { label: 'CTR', value: '2.5%', info: true },
      ],
    },
    'banner-2': {
      id: 'banner-2',
      kind: 'banner',
      title: 'Prime Deals Banner',
      status: 'Active',
      image: 'assets/images/image-2-1.jpg',
      destinationUrl: 'https://duduzili.com/prime-deals',
      expiresOn: '24 March, 2026',
      noticePrefix: 'Your banner will be promoted across Duduzili',
      metrics: [
        { label: 'Total views', value: '622,000' },
        { label: 'Total clicks', value: '95' },
        { label: 'CTR', value: '2.1%', info: true },
      ],
    },
    'banner-3': {
      id: 'banner-3',
      kind: 'banner',
      title: 'Weekend Gadget Banner',
      status: 'Paused',
      image: 'assets/images/image-3-1.jpg',
      destinationUrl: 'https://duduzili.com/weekend-gadgets',
      expiresOn: '18 May, 2026',
      noticePrefix: 'Your banner will be promoted across Duduzili',
      metrics: [
        { label: 'Total views', value: '205,000' },
        { label: 'Total clicks', value: '41' },
        { label: 'CTR', value: '1.8%', info: true },
      ],
    },
    'banner-4': {
      id: 'banner-4',
      kind: 'banner',
      title: 'Home Office Banner',
      status: 'Pending approval',
      image: 'assets/images/image-4-1.jpg',
      destinationUrl: 'https://duduzili.com/home-office',
      expiresOn: '03 June, 2026',
      noticePrefix: 'Your banner will be promoted across Duduzili',
      metrics: [
        { label: 'Total views', value: '91,000' },
        { label: 'Total clicks', value: '23' },
        { label: 'CTR', value: '1.5%', info: true },
      ],
    },
    'banner-5': {
      id: 'banner-5',
      kind: 'banner',
      title: 'Beauty Launch Banner',
      status: 'Declined',
      image: 'assets/images/image-1-1.jpg',
      destinationUrl: 'https://duduzili.com/beauty-launch',
      expiresOn: '11 May, 2026',
      noticePrefix: 'Your banner will be promoted across Duduzili',
      metrics: [
        { label: 'Total views', value: '84,000' },
        { label: 'Total clicks', value: '12' },
        { label: 'CTR', value: '0.9%', info: true },
      ],
    },
    'banner-6': {
      id: 'banner-6',
      kind: 'banner',
      title: 'Lifestyle Refresh Banner',
      status: 'Expired',
      image: 'assets/images/image-2-1.jpg',
      destinationUrl: 'https://duduzili.com/lifestyle-refresh',
      expiresOn: '03 May, 2026',
      noticePrefix: 'Your banner will be promoted across Duduzili',
      metrics: [
        { label: 'Total views', value: '143,000' },
        { label: 'Total clicks', value: '34' },
        { label: 'CTR', value: '1.1%', info: true },
      ],
    },
  };

  readonly ad = computed<AdDetail>(() => {
    const backendAd = this.backendAd();
    if (backendAd) {
      return this.mapBackendAd(backendAd);
    }

    return this.resolveFallbackAd(this.adId());
  });
  readonly currentStatus = signal<AdDetail['status']>('Active');
  readonly currentDestinationUrl = computed(
    () => this.destinationUrlOverrides()[this.adId()] ?? this.ad().destinationUrl ?? '',
  );
  readonly runningAdsQueryParams = computed(() => {
    const state = this.runningAdsQueryState();
    return {
      placement: state.placement,
      status: state.status,
      page: state.page,
    };
  });
  readonly bannerImageSrc = computed(() => this.ad().image || this.bannerHeroImage);
  readonly mobilePerformanceChartOptions = computed(() =>
    this.buildPerformanceChartOptions(250, true, '#6453D9', '#F4C12B'),
  );
  readonly desktopPerformanceChartOptions = computed(() =>
    this.buildPerformanceChartOptions(420, false, '#7A6AF1', '#F5C23A'),
  );
  readonly desktopWidePerformanceChartOptions = computed(() =>
    this.buildPerformanceChartOptions(430, false, '#6453D9', '#FACD38'),
  );

  constructor() {
    effect(() => {
      const adId = this.adId();
      this.backendAd.set(null);
      this.adAnalytics.set(null);
      this.currentStatus.set(this.resolveFallbackAd(adId).status);
      this.loadAdData(adId);
    });
  }

  ngOnDestroy(): void {
    if (this.isMobileActionMenuOpen() || this.isDestinationModalOpen()) {
      this.mobileOverlayService.closeMobileModal();
    }
  }

  togglePaused(): void {
    const backendAd = this.backendAd();
    if (!backendAd) {
      this.currentStatus.update((status) => (status === 'Paused' ? 'Active' : 'Paused'));
      return;
    }

    const nextStatus = this.currentStatus() === 'Paused' ? 'active' : 'paused';
    this.sellerMonetizationService.updateMyAd(backendAd.id, { status: nextStatus }).subscribe({
      next: (updatedAd) => {
        this.backendAd.set(updatedAd);
        this.currentStatus.set(this.mapStatusLabel(updatedAd.status));
      },
      error: () => {
        this.appToastService.show({ message: 'We could not update this ad status right now.' });
      },
    });
  }

  toggleMobileActionMenu(): void {
    if (this.isMobileActionMenuOpen()) {
      this.closeMobileActionMenu();
      return;
    }

    this.mobileOverlayService.openMobileModal();
    this.isMobileActionMenuOpen.set(true);
  }

  toggleDesktopActionMenu(): void {
    this.isDesktopActionMenuOpen.update((open) => !open);
  }

  closeDesktopActionMenu(): void {
    this.isDesktopActionMenuOpen.set(false);
  }

  closeMobileActionMenu(): void {
    if (this.isMobileActionMenuOpen()) {
      this.mobileOverlayService.closeMobileModal();
    }
    this.isMobileActionMenuOpen.set(false);
  }

  togglePausedFromMenu(): void {
    this.togglePaused();
    this.closeMobileActionMenu();
  }

  openDestinationModal(): void {
    if (this.ad().kind !== 'banner') {
      return;
    }

    if (this.isMobileActionMenuOpen()) {
      this.closeMobileActionMenu();
    }

    if (!this.isDestinationModalOpen()) {
      this.mobileOverlayService.openMobileModal();
    }
    this.editedDestinationUrl.set(this.currentDestinationUrl());
    this.isDestinationModalOpen.set(true);
  }

  closeDestinationModal(): void {
    if (this.isDestinationModalOpen()) {
      this.mobileOverlayService.closeMobileModal();
    }
    this.isDestinationModalOpen.set(false);
  }

  updateEditedDestinationUrl(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.editedDestinationUrl.set(input.value);
  }

  saveDestinationUrl(): void {
    const nextLink = this.editedDestinationUrl().trim();
    const backendAd = this.backendAd();

    if (!backendAd) {
      this.destinationUrlOverrides.update((overrides) => ({
        ...overrides,
        [this.adId()]: nextLink,
      }));
      this.isDestinationModalOpen.set(false);
      this.mobileOverlayService.closeMobileModal();
      return;
    }

    this.sellerMonetizationService.updateMyAd(backendAd.id, { link: nextLink }).subscribe({
      next: (updatedAd) => {
        this.backendAd.set(updatedAd);
        this.destinationUrlOverrides.update((overrides) => ({
          ...overrides,
          [this.adId()]: nextLink,
        }));
        this.isDestinationModalOpen.set(false);
        this.mobileOverlayService.closeMobileModal();
        this.appToastService.show({ message: 'Destination link updated.' });
      },
      error: () => {
        this.appToastService.show({ message: 'We could not update that destination link right now.' });
      },
    });
  }

  private loadAdData(adId: string): void {
    const numericId = Number(adId);
    if (!Number.isFinite(numericId)) {
      return;
    }

    this.sellerMonetizationService.getMyAd(numericId).subscribe({
      next: (ad) => {
        this.backendAd.set(ad);
        this.currentStatus.set(this.mapStatusLabel(ad.status));
      },
      error: () => {
        this.backendAd.set(null);
      },
    });

    this.sellerMonetizationService.getAdAnalytics(numericId).subscribe({
      next: (analytics) => this.adAnalytics.set(analytics),
      error: () => this.adAnalytics.set(null),
    });
  }

  private mapStatusLabel(status: SellerAdRecord['status']): AdDetail['status'] {
    switch (status) {
      case 'paused':
        return 'Paused';
      case 'expired':
        return 'Expired';
      case 'pending':
        return 'Pending approval';
      case 'rejected':
        return 'Declined';
      default:
        return 'Active';
    }
  }

  private resolveFallbackAd(adId: string): AdDetail {
    if (/^\d+$/.test(adId)) {
      return {
        id: adId,
        kind: 'banner',
        title: 'Loading ad details',
        status: 'Active',
        expiresOn: '',
        noticePrefix: 'Your ad details are loading',
        image: this.bannerHeroImage,
        destinationUrl: '',
        metrics: [
          { label: 'Total views', value: '0' },
          { label: 'Total clicks', value: '0' },
          { label: 'CTR', value: '0%', info: true },
        ],
      };
    }

    return this.adMap[adId] ?? this.adMap['other-1'];
  }

  private mapBackendAd(ad: SellerAdRecord): AdDetail {
    const mappedStatus = this.mapStatusLabel(ad.status);
    const analytics = this.adAnalytics();
    if (ad.ad_type === 'banner') {
      return {
        id: String(ad.id),
        kind: 'banner',
        title: ad.title,
        status: mappedStatus,
        image: ad.image ?? undefined,
        destinationUrl: ad.link || '',
        expiresOn: this.formatDate(ad.end_date),
        noticePrefix: 'Your banner will be promoted across Duduzili',
        metrics: [
          { label: 'Total views', value: this.formatMetricNumber(analytics?.summary.total_views ?? ad.total_views) },
          { label: 'Total clicks', value: this.formatMetricNumber(analytics?.summary.total_clicks ?? ad.total_clicks) },
          { label: 'CTR', value: analytics?.summary.ctr ?? this.computeCtr(ad.total_views, ad.total_clicks), info: true },
        ],
      };
    }

    if (ad.ad_type === 'store') {
      return {
        id: String(ad.id),
        kind: 'store',
        title: ad.promoted_store_name || ad.title,
        status: mappedStatus,
        image: ad.image ?? ad.promoted_store_image ?? undefined,
        expiresOn: this.formatDate(ad.end_date),
        noticePrefix: 'Your store promotion will be promoted across Duduzili',
        activeListings: 'Promoted store',
        metrics: [
          { label: 'Total views', value: this.formatMetricNumber(analytics?.summary.total_views ?? ad.total_views) },
          { label: 'Total clicks', value: this.formatMetricNumber(analytics?.summary.total_clicks ?? ad.total_clicks) },
          { label: 'Listings viewed', value: this.formatMetricNumber(analytics?.summary.total_clicks ?? ad.total_clicks) },
        ],
      };
    }

    return {
      id: String(ad.id),
      kind: 'listing',
      title: ad.title,
      status: mappedStatus,
      image: ad.image ?? undefined,
      price: this.formatCurrency(ad.amount_paid),
      lastUpdated: this.formatDate(ad.created_at),
      expiresOn: this.formatDate(ad.end_date),
      noticePrefix: 'Your listing will be promoted across Duduzili',
      metrics: [
        { label: 'Total views', value: this.formatMetricNumber(analytics?.summary.total_views ?? ad.total_views) },
        { label: 'Total clicks', value: this.formatMetricNumber(analytics?.summary.total_clicks ?? ad.total_clicks) },
        { label: 'Total calls', value: '0' },
        { label: 'Total messages', value: '0' },
      ],
    };
  }

  private formatDate(date: string): string {
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }
    return new Intl.DateTimeFormat('en-NG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(parsedDate);
  }

  private formatCurrency(amount: string): string {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount)) {
      return `₦${amount}`;
    }
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(numericAmount);
  }

  private formatMetricNumber(value: number): string {
    return new Intl.NumberFormat('en', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  }

  private computeCtr(views: number, clicks: number): string {
    if (views <= 0) {
      return '0%';
    }
    return `${((clicks / views) * 100).toFixed(1)}%`;
  }

  private buildPerformanceChartOptions(
    height: number,
    compact: boolean,
    primary: string,
    secondary: string,
  ): AppChartOptions {
    const fallback = createPerformanceLineChartOptions(height, compact, primary, secondary);
    const dailyStats = this.adAnalytics()?.daily_stats ?? {};
    const entries = Object.entries(dailyStats)
      .map(([date, values]) => ({
        date,
        views: values.views ?? 0,
        clicks: values.clicks ?? 0,
      }))
      .sort((left, right) => left.date.localeCompare(right.date));

    if (entries.length === 0) {
      return fallback;
    }

    const pointLimit =
      this.performanceRange() === '90d' ? 90 : this.performanceRange() === '30d' ? 30 : 7;
    const filteredEntries = entries.slice(-pointLimit);
    const categories = filteredEntries.map((entry) =>
      new Intl.DateTimeFormat('en-NG', {
        day: 'numeric',
        month: filteredEntries.length > 31 ? 'short' : 'numeric',
      }).format(new Date(entry.date)),
    );
    const viewSeries = filteredEntries.map((entry) => entry.views);
    const clickSeries = filteredEntries.map((entry) => entry.clicks);
    const maxValue = Math.max(...viewSeries, ...clickSeries, 1);

    return {
      ...fallback,
      series: [
        { name: 'Views', data: viewSeries },
        { name: 'Clicks', data: clickSeries },
      ],
      xaxis: {
        ...(fallback.xaxis ?? {}),
        categories,
      },
      yaxis: {
        ...(Array.isArray(fallback.yaxis) ? fallback.yaxis[0] : fallback.yaxis ?? {}),
        min: 0,
        max: Math.max(5, Math.ceil(maxValue * 1.15)),
        tickAmount: 4,
      },
    };
  }
}
