import { CommonModule, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
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
import { MobileOverlayService } from '../../services/mobile-overlay.service';

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
  initials?: string;
  logoTone?: string;
  activeListings?: string;
  destinationUrl?: string;
}

@Component({
  selector: 'app-ad-details-page',
  imports: [CommonModule, RouterLink, NgIcon, NgOptimizedImage],
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
                routerLink="/ads/running"
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
                [ngSrc]="bannerHeroImage"
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
                <span class="text-[12px] font-semibold leading-4 text-[#25AD32]">Active</span>
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
                <button
                  type="button"
                  class="inline-flex items-center gap-2 rounded-[64px] border border-[#EAEAEA] bg-white px-4 py-2 text-[12px] font-medium text-black"
                >
                  <img [ngSrc]="bannerDetailsCalendarIcon" width="14" height="14" alt="" />
                  Last 7 days
                  <img [ngSrc]="bannerDetailsArrowDownIcon" width="14" height="14" alt="" />
                </button>
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
              <svg viewBox="0 0 900 420" class="h-auto w-full overflow-visible">
                <g stroke="#EEF0F4" stroke-width="1">
                  <line x1="40" y1="40" x2="40" y2="360"></line>
                  <line x1="40" y1="360" x2="870" y2="360"></line>
                </g>

                <g fill="#A5AAB3" font-size="22" font-weight="500">
                  <text x="10" y="360">0</text>
                  <text x="2" y="280">250</text>
                  <text x="2" y="200">250</text>
                  <text x="2" y="120">250</text>
                  <text x="2" y="40">500</text>
                </g>

                <g fill="#A5AAB3" font-size="18" font-weight="500">
                  <text x="52" y="388">Jan</text>
                  <text x="120" y="388">Feb</text>
                  <text x="190" y="388">Mar</text>
                  <text x="262" y="388">Apr</text>
                  <text x="334" y="388">May</text>
                  <text x="405" y="388">Jun</text>
                  <text x="478" y="388">Jul</text>
                  <text x="550" y="388">Aug</text>
                  <text x="622" y="388">Sep</text>
                  <text x="694" y="388">Oct</text>
                  <text x="766" y="388">Nov</text>
                  <text x="838" y="388">Dec</text>
                </g>

                <line
                  x1="345"
                  y1="108"
                  x2="345"
                  y2="348"
                  stroke="#D8DBE2"
                  stroke-dasharray="4 4"
                ></line>

                <path
                  d="M 60 355 C 80 310, 105 275, 135 270 C 165 265, 190 300, 220 250 C 250 200, 280 185, 320 205 C 350 220, 375 275, 410 245 C 445 215, 470 180, 510 210 C 550 240, 575 315, 620 292 C 665 269, 690 185, 730 118 C 770 78, 805 58, 850 38"
                  fill="none"
                  stroke="#7A6AF1"
                  stroke-linecap="round"
                  stroke-width="6"
                ></path>

                <path
                  d="M 60 330 C 88 345, 118 338, 145 280 C 172 222, 205 246, 240 235 C 275 224, 315 248, 345 320 C 375 350, 412 320, 448 268 C 484 216, 520 198, 555 238 C 590 278, 625 336, 660 306 C 695 276, 730 230, 760 222 C 790 214, 820 228, 842 232"
                  fill="none"
                  stroke="#F5C23A"
                  stroke-linecap="round"
                  stroke-width="6"
                ></path>

                <circle cx="345" cy="205" r="7" fill="#7A6AF1"></circle>

                <g transform="translate(350,110)">
                  <rect width="250" height="92" rx="14" fill="#050505"></rect>
                  <text x="16" y="24" fill="#FFFFFF" font-size="14" font-weight="600">
                    02 May, 2026
                  </text>
                  <rect x="16" y="38" width="10" height="4" rx="2" fill="#7A6AF1"></rect>
                  <text x="34" y="44" fill="#FFFFFF" font-size="13">Views</text>
                  <text x="178" y="44" fill="#FFFFFF" font-size="13">100,000</text>
                  <rect x="16" y="62" width="10" height="4" rx="2" fill="#F5C23A"></rect>
                  <text x="34" y="68" fill="#FFFFFF" font-size="13">Clicks</text>
                  <text x="188" y="68" fill="#FFFFFF" font-size="13">50,000</text>
                </g>
              </svg>
            </div>
          </section>
        </div>
      } @else {
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <a
              routerLink="/ads/running"
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
            <a routerLink="/ads" class="transition-colors hover:text-[#6B5CF0]">Ads</a>
            <span>/</span>
            <a routerLink="/ads/running" class="transition-colors hover:text-[#6B5CF0]"
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
                    [ngSrc]="bannerHeroImage"
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
                    <span class="text-[12px] font-semibold leading-4 text-[#25AD32]">Active</span>
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

              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-[64px] border border-[#EAEAEA] bg-white px-4 py-2.5 text-[14px] font-medium text-black"
              >
                <img [ngSrc]="bannerDetailsCalendarIcon" width="14" height="14" alt="" />
                Last 7 days
                <img [ngSrc]="bannerDetailsArrowDownIcon" width="14" height="14" alt="" />
              </button>
            </div>

            <div class="mt-6">
              <svg viewBox="0 0 900 420" class="h-auto w-full overflow-visible">
                <g stroke="#EEF0F4" stroke-width="1">
                  <line x1="40" y1="40" x2="40" y2="360"></line>
                  <line x1="40" y1="360" x2="870" y2="360"></line>
                </g>

                <g fill="#A5AAB3" font-size="12" font-weight="500">
                  <text x="10" y="360">0</text>
                  <text x="2" y="280">250</text>
                  <text x="2" y="200">250</text>
                  <text x="2" y="120">250</text>
                  <text x="2" y="40">500</text>
                </g>

                <g fill="#A5AAB3" font-size="12" font-weight="500">
                  <text x="52" y="388">Jan</text>
                  <text x="120" y="388">Feb</text>
                  <text x="190" y="388">Mar</text>
                  <text x="262" y="388">Apr</text>
                  <text x="334" y="388">May</text>
                  <text x="405" y="388">Jun</text>
                  <text x="478" y="388">Jul</text>
                  <text x="550" y="388">Aug</text>
                  <text x="622" y="388">Sep</text>
                  <text x="694" y="388">Oct</text>
                  <text x="766" y="388">Nov</text>
                  <text x="838" y="388">Dec</text>
                </g>

                <line
                  x1="345"
                  y1="108"
                  x2="345"
                  y2="348"
                  stroke="#D8DBE2"
                  stroke-dasharray="4 4"
                ></line>

                <path
                  d="M 60 355 C 80 310, 105 275, 135 270 C 165 265, 190 300, 220 250 C 250 200, 280 185, 320 205 C 350 220, 375 275, 410 245 C 445 215, 470 180, 510 210 C 550 240, 575 315, 620 292 C 665 269, 690 185, 730 118 C 770 78, 805 58, 850 38"
                  fill="none"
                  stroke="#7A6AF1"
                  stroke-linecap="round"
                  stroke-width="3"
                ></path>

                <path
                  d="M 60 330 C 88 345, 118 338, 145 280 C 172 222, 205 246, 240 235 C 275 224, 315 248, 345 320 C 375 350, 412 320, 448 268 C 484 216, 520 198, 555 238 C 590 278, 625 336, 660 306 C 695 276, 730 230, 760 222 C 790 214, 820 228, 842 232"
                  fill="none"
                  stroke="#F5C23A"
                  stroke-linecap="round"
                  stroke-width="3"
                ></path>

                <circle cx="345" cy="205" r="4" fill="#7A6AF1"></circle>
                <circle cx="842" cy="232" r="4" fill="#F5C23A"></circle>
                <circle cx="850" cy="38" r="4" fill="#7A6AF1"></circle>

                <g transform="translate(350,110)">
                  <rect width="190" height="70" rx="12" fill="#050505"></rect>
                  <text x="12" y="18" fill="#FFFFFF" font-size="12" font-weight="600">
                    02 May, 2026
                  </text>
                  <rect x="12" y="28" width="8" height="3" rx="1.5" fill="#7A6AF1"></rect>
                  <text x="26" y="33" fill="#FFFFFF" font-size="11">Views</text>
                  <text x="132" y="33" fill="#FFFFFF" font-size="11">100,000</text>
                  <rect x="12" y="48" width="8" height="3" rx="1.5" fill="#F5C23A"></rect>
                  <text x="26" y="53" fill="#FFFFFF" font-size="11">Clicks</text>
                  <text x="140" y="53" fill="#FFFFFF" font-size="11">50,000</text>
                </g>
              </svg>
            </div>
          </section>
        </div>
      } @else {
        <div
          class="flex h-full w-full flex-col rounded-[32px] border border-[#F1F1F4] bg-white px-8 py-6 text-[15px] text-[#626771] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]"
        >
          <nav class="flex items-center gap-2 text-[14px] font-medium leading-5 text-[#9E9E9E]">
            <a routerLink="/ads" class="transition-colors hover:text-[#6B5CF0]">Ads</a>
            <span>/</span>
            <a routerLink="/ads/running" class="transition-colors hover:text-[#6B5CF0]"
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

      <section
        class="fixed bottom-24 left-1/2 z-[230] w-[270px] -translate-x-1/2 rounded-[22px] border border-[#ECEEF3] bg-white p-2 shadow-[0_24px_44px_-24px_rgba(17,24,39,0.4)] md:hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Ad actions"
      >
        <button
          type="button"
          (click)="openDestinationModal()"
          class="flex w-full items-center gap-3 rounded-[16px] px-4 py-3 text-left text-[13px] font-medium text-[#2E333B] transition hover:bg-[#F8F8FA]"
        >
          <ng-icon name="heroLink" class="text-[14px] text-[#6D727C]"></ng-icon>
          Edit destination link
        </button>
        @if (currentStatus() === 'Paused' || currentStatus() === 'Active') {
          <button
            type="button"
            (click)="togglePausedFromMenu()"
            class="flex w-full items-center gap-3 rounded-[16px] px-4 py-3 text-left text-[13px] font-medium text-[#2E333B] transition hover:bg-[#F8F8FA]"
          >
            <ng-icon name="heroPause" class="text-[14px] text-[#6D727C]"></ng-icon>
            {{ currentStatus() === 'Paused' ? 'Resume Ad' : 'Pause Ad' }}
          </button>
        }
      </section>
    }
  `,
  host: { class: 'block h-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdDetailsPageComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly mobileOverlayService = inject(MobileOverlayService);
  readonly bannerHeroImage = 'assets/images/banner-details-hero.png';
  readonly bannerDetailsEditIcon = 'assets/icons/banner-details-edit.svg';
  readonly bannerDetailsPauseIcon = 'assets/icons/banner-details-pause.svg';
  readonly bannerDetailsExportIcon = 'assets/icons/banner-details-export.svg';
  readonly bannerDetailsInfoIcon = 'assets/icons/banner-details-info.svg';
  readonly bannerDetailsStatusIcon = 'assets/icons/banner-details-status.svg';
  readonly bannerDetailsInfoCircleIcon = 'assets/icons/banner-details-info-circle.svg';
  readonly bannerDetailsCalendarIcon = 'assets/icons/banner-details-calendar.svg';
  readonly bannerDetailsArrowDownIcon = 'assets/icons/banner-details-arrow-down.svg';

  readonly adId = signal(this.route.snapshot.paramMap.get('id') ?? 'other-1');
  readonly isMenuOpen = signal(false);
  readonly isMobileActionMenuOpen = signal(false);
  readonly isDestinationModalOpen = signal(false);
  readonly editedDestinationUrl = signal('');
  readonly destinationUrlOverrides = signal<Record<string, string>>({});

  private readonly adMap: Record<string, AdDetail> = {
    'other-1': {
      id: 'other-1',
      kind: 'listing',
      title: 'Iphone 17 pro max',
      price: '₦1,500,000',
      status: 'Active',
      image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=200&h=200&fit=crop',
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
      status: 'Active',
      image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=200&h=200&fit=crop',
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

  readonly ad = computed<AdDetail>(() => this.adMap[this.adId()] ?? this.adMap['other-1']);
  readonly currentStatus = signal<AdDetail['status']>('Active');
  readonly currentDestinationUrl = computed(
    () => this.destinationUrlOverrides()[this.adId()] ?? this.ad().destinationUrl ?? '',
  );

  constructor() {
    this.currentStatus.set(this.ad().status);
  }

  ngOnDestroy(): void {
    if (this.isMobileActionMenuOpen() || this.isDestinationModalOpen()) {
      this.mobileOverlayService.closeMobileModal();
    }
  }

  togglePaused(): void {
    this.currentStatus.update((status) => (status === 'Paused' ? 'Active' : 'Paused'));
  }

  toggleMobileActionMenu(): void {
    if (this.isMobileActionMenuOpen()) {
      this.closeMobileActionMenu();
      return;
    }

    this.mobileOverlayService.openMobileModal();
    this.isMobileActionMenuOpen.set(true);
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
    this.destinationUrlOverrides.update((overrides) => ({
      ...overrides,
      [this.adId()]: this.editedDestinationUrl().trim(),
    }));
    this.isDestinationModalOpen.set(false);
    this.mobileOverlayService.closeMobileModal();
  }
}
