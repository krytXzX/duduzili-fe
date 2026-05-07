import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroCalendarDays,
  heroChevronDown,
  heroQueueList,
  heroSquares2x2,
  heroUserCircle,
} from '@ng-icons/heroicons/outline';

type AnalyticsTab = 'overview' | 'users' | 'listings';
type AnalyticsRange = '7d' | '30d';

interface EarningsPoint {
  blueX: number;
  blueY: number;
  yellowX: number;
  yellowY: number;
}

interface PlanBar {
  label: string;
  height: number;
  from: string;
  to: string;
}

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
  image: string;
  views: string;
}

interface TopSeller {
  name: string;
  email: string;
  avatar: string;
  sold: string;
}

interface ConversionMetric {
  label: string;
  value: string;
  width: string;
}

@Component({
  selector: 'app-admin-analytics-page',
  imports: [NgIcon, NgOptimizedImage],
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

          <button
            type="button"
            (click)="range.set(range() === '7d' ? '30d' : '7d')"
            class="inline-flex h-10 items-center gap-2 rounded-full border border-[#EAEAEA] bg-white pl-3 pr-4 text-[14px] font-medium text-black"
          >
            <ng-icon name="heroCalendarDays" class="text-[14px] text-[#6F6F6F]"></ng-icon>
            <span>{{ rangeLabel() }}</span>
            <ng-icon name="heroChevronDown" class="text-[14px] text-[#6F6F6F]"></ng-icon>
          </button>
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
                ₦ 1,760,000<span class="text-[24px] text-[#0D0D0D]/40">.00</span>
              </h2>
              <span class="mt-2 inline-flex rounded-full bg-[#27A551]/[0.06] px-2 py-1 text-[12px] leading-4 text-[#27A551]">
                +28% from last month
              </span>
            </div>

            <div class="mt-6">
              <svg viewBox="0 0 350 226" class="h-auto w-full overflow-visible">
                <g fill="rgba(0,0,0,0.7)" font-size="11" font-weight="400">
                  <text x="0" y="26">500</text>
                  <text x="0" y="110">250</text>
                  <text x="8" y="196">0</text>
                </g>
                <g fill="rgba(0,0,0,0.5)" font-size="10" font-weight="400">
                  <text x="2" y="220">21-12-2024</text>
                  <text x="319" y="220">Today</text>
                </g>
                <line x1="28" y1="190" x2="345" y2="190" stroke="#ECECEC" stroke-width="1"></line>
                <path
                  d="M 30 180 C 48 120, 72 150, 92 105 S 134 122, 154 98 S 196 126, 214 112 S 246 160, 272 118 S 320 72, 345 52"
                  fill="none"
                  stroke="#5F54FF"
                  stroke-width="1.7"
                  stroke-linecap="round"
                ></path>
                <path
                  d="M 30 176 C 56 186, 74 108, 96 126 S 140 86, 166 150 S 216 122, 242 152 S 296 122, 340 140"
                  fill="none"
                  stroke="#F2B400"
                  stroke-width="1.7"
                  stroke-linecap="round"
                ></path>
                <line x1="114" y1="84" x2="114" y2="190" stroke="#D6D6D6" stroke-width="1" stroke-dasharray="2 2"></line>
                <circle cx="114" cy="112" r="3" fill="#5F54FF"></circle>
                <circle cx="114" cy="126" r="3" fill="#F2B400"></circle>
                <circle cx="340" cy="140" r="3" fill="#F2B400"></circle>
                <circle cx="345" cy="52" r="3" fill="#5F54FF"></circle>
                <g transform="translate(120,66)">
                  <rect width="172" height="85" rx="9" fill="#000000"></rect>
                  <text x="8" y="16" fill="#FFFFFF" font-size="14" font-weight="500">Comparison</text>
                  <line x1="8" y1="26" x2="164" y2="26" stroke="#2E2E2E" stroke-width="1"></line>
                  <rect x="8" y="40" width="8" height="4" rx="2" fill="#357FF6"></rect>
                  <text x="20" y="45" fill="#A4A4A4" font-size="13">Aug 2025</text>
                  <text x="116" y="45" fill="#FFFFFF" font-size="13">₦100,000</text>
                  <rect x="8" y="61" width="8" height="4" rx="2" fill="#FACD38"></rect>
                  <text x="20" y="66" fill="#A4A4A4" font-size="13">Aug 2026</text>
                  <text x="122" y="66" fill="#FFFFFF" font-size="13">₦50,000</text>
                </g>
              </svg>
            </div>

            <div class="mt-4 space-y-4">
              <section class="rounded-[24px] border border-[#EFEFEF] bg-white px-[15px] py-[15px]">
                <h3 class="text-[16px] font-medium text-[#0D0D0D]/50">Platform health</h3>
                <div class="mt-5 text-center">
                  <p class="text-[64px] font-semibold leading-none tracking-[-0.06em] text-[#0D0D0D]">76%</p>
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
                      <span class="relative z-10 -rotate-180">76</span>
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
                    The platform is performing well with steady listing growth <span class="text-[#151515]">(+40,000)</span> and a <span class="text-[#101010]">56.5%</span> listing success rate. Buyer engagement remains strong.
                  </p>
                </div>
              </section>

              <section class="rounded-[24px] border border-[#EFEFEF] bg-white px-[15px] py-[15px]">
                <h3 class="text-[16px] font-medium text-[#0D0D0D]/50">Top subscribed plans</h3>
                <div class="mt-6">
                  <svg viewBox="0 0 318 275" class="h-auto w-full">
                    <g fill="rgba(0,0,0,0.7)" font-size="11" font-weight="400">
                      <text x="0" y="25">1000</text>
                      <text x="4" y="95">500</text>
                      <text x="4" y="165">250</text>
                      <text x="10" y="255">0</text>
                    </g>
                    <rect x="52" y="192" width="54" height="48" rx="4" fill="url(#proMobileBar)"></rect>
                    <rect x="120" y="134" width="54" height="106" rx="4" fill="url(#premiumMobileBar)"></rect>
                    <rect x="188" y="46" width="54" height="194" rx="4" fill="url(#enterpriseMobileBar)"></rect>
                    <defs>
                      <linearGradient id="proMobileBar" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stop-color="#F59E0B"></stop>
                        <stop offset="100%" stop-color="#FFEBAA"></stop>
                      </linearGradient>
                      <linearGradient id="premiumMobileBar" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stop-color="#0FA02C"></stop>
                        <stop offset="100%" stop-color="#A9FDBA"></stop>
                      </linearGradient>
                      <linearGradient id="enterpriseMobileBar" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stop-color="#3B82F6"></stop>
                        <stop offset="100%" stop-color="#C2DFFF"></stop>
                      </linearGradient>
                    </defs>
                    <text x="70" y="258" fill="rgba(13,13,13,0.5)" font-size="12" font-weight="500">Pro</text>
                    <text x="128" y="258" fill="rgba(13,13,13,0.5)" font-size="12" font-weight="500">Premium</text>
                    <text x="190" y="258" fill="rgba(13,13,13,0.5)" font-size="12" font-weight="500">Enterprise</text>
                  </svg>
                </div>
              </section>
            </div>
          </section>
        } @else if (activeTab() === 'users') {
          <section class="pt-6">
            <div class="-mx-5 overflow-x-auto border-y border-[#EDEDED] px-5 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div class="flex min-w-[724px] items-center gap-8">
                @for (metric of userMetrics; track metric.label) {
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
              <h2 class="mt-2 text-[32px] font-semibold leading-[40px] tracking-[-0.04em] text-[#1A1B1D]">100,500</h2>
              <span class="mt-2 inline-flex rounded-full bg-[#27A551]/[0.06] px-2 py-1 text-[12px] leading-4 text-[#27A551]">
                +28% from last month
              </span>
            </div>

            <div class="mt-6">
              <svg viewBox="0 0 350 226" class="h-auto w-full overflow-visible">
                <g fill="rgba(0,0,0,0.7)" font-size="11" font-weight="400">
                  <text x="0" y="26">500</text>
                  <text x="0" y="110">250</text>
                  <text x="8" y="196">0</text>
                </g>
                <g fill="rgba(0,0,0,0.5)" font-size="10" font-weight="400">
                  <text x="2" y="220">21-12-2024</text>
                  <text x="319" y="220">Today</text>
                </g>
                <line x1="28" y1="190" x2="345" y2="190" stroke="#ECECEC" stroke-width="1"></line>
                <path
                  d="M 30 180 C 50 132, 64 146, 86 144 S 108 100, 128 112 S 158 148, 182 130 S 228 170, 254 132 S 296 74, 342 45"
                  fill="none"
                  stroke="#5F54FF"
                  stroke-width="1.7"
                  stroke-linecap="round"
                ></path>
                <line x1="114" y1="84" x2="114" y2="190" stroke="#D6D6D6" stroke-width="1" stroke-dasharray="2 2"></line>
                <circle cx="114" cy="112" r="3" fill="#5F54FF"></circle>
                <circle cx="342" cy="45" r="3" fill="#5F54FF"></circle>
                <g transform="translate(118,90)">
                  <rect width="165" height="32" rx="9" fill="#000000"></rect>
                  <rect x="8" y="14" width="8" height="4" rx="2" fill="#357FF6"></rect>
                  <text x="20" y="19" fill="#A4A4A4" font-size="13">Aug 2025</text>
                  <text x="118" y="19" fill="#FFFFFF" font-size="13">10,000</text>
                </g>
              </svg>
            </div>

            <div class="mt-4 space-y-4">
              <section class="rounded-[24px] border border-[#EFEFEF] bg-white px-[15px] py-[15px]">
                <h3 class="text-[16px] font-medium text-[#0D0D0D]/50">Verified vs Unverified</h3>
                <div class="mt-6">
                  <svg viewBox="0 0 318 250" class="h-auto w-full">
                    <g fill="rgba(0,0,0,0.7)" font-size="11" font-weight="400">
                      <text x="0" y="28">1000</text>
                      <text x="4" y="102">500</text>
                      <text x="4" y="174">250</text>
                      <text x="10" y="235">0</text>
                    </g>
                    <rect x="46" y="55" width="115" height="145" rx="4" fill="url(#verifiedUsersMobile)"></rect>
                    <rect x="184" y="118" width="115" height="82" rx="4" fill="url(#unverifiedUsersMobile)"></rect>
                    <defs>
                      <linearGradient id="verifiedUsersMobile" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stop-color="#0FA02C"></stop>
                        <stop offset="100%" stop-color="#A9FDBA"></stop>
                      </linearGradient>
                      <linearGradient id="unverifiedUsersMobile" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stop-color="#AE6709"></stop>
                        <stop offset="100%" stop-color="#FBA535"></stop>
                      </linearGradient>
                    </defs>
                    <text x="63" y="224" fill="rgba(13,13,13,0.5)" font-size="12" font-weight="500">Verified users</text>
                    <text x="194" y="224" fill="rgba(13,13,13,0.5)" font-size="12" font-weight="500">Unverified users</text>
                  </svg>
                </div>
              </section>

              <section class="rounded-[24px] border border-[#EFEFEF] bg-white px-[15px] py-[15px]">
                <h3 class="text-[14px] font-medium text-[#0D0D0D]/50">Top regions/cities for signups</h3>
                <div class="mt-6 flex h-1 items-center gap-0.5">
                  @for (region of topSignupRegions; track region.label) {
                    <span class="block h-1 rounded-[14px]" [style.width]="region.width" [style.background]="region.color"></span>
                  }
                </div>
                <div class="mt-6 space-y-6">
                  @for (region of topSignupRegions; track region.label) {
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
                @for (metric of listingMetrics; track metric.label; let index = $index) {
                  <div
                    class="flex h-[100px] min-w-[241px] flex-col gap-3 p-3"
                    [class.bg-white]="index === 0"
                    [class.border-b-[1.5px]]="index === 0"
                    [class.border-[#A2A500]]="index === 0"
                    [class.bg-[#FAFAFA]]="index > 0"
                    [class.border-r]="index < listingMetrics.length - 1"
                    [class.border-[#EFEFEF]]="index < listingMetrics.length - 1"
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
              <svg viewBox="0 0 350 226" class="h-auto w-full overflow-visible">
                <g fill="rgba(0,0,0,0.7)" font-size="11" font-weight="400">
                  <text x="0" y="26">500</text>
                  <text x="0" y="110">250</text>
                  <text x="8" y="196">0</text>
                </g>
                <g fill="rgba(0,0,0,0.5)" font-size="10" font-weight="400">
                  <text x="2" y="220">21-12-2024</text>
                  <text x="319" y="220">Today</text>
                </g>
                <line x1="28" y1="190" x2="345" y2="190" stroke="#ECECEC" stroke-width="1"></line>
                <path
                  d="M 30 180 C 48 120, 72 150, 92 105 S 134 122, 154 98 S 196 126, 214 112 S 246 160, 272 118 S 320 72, 345 52"
                  fill="none"
                  stroke="#5F54FF"
                  stroke-width="1.7"
                  stroke-linecap="round"
                ></path>
                <path
                  d="M 30 176 C 56 186, 74 108, 96 126 S 140 86, 166 150 S 216 122, 242 152 S 296 122, 340 140"
                  fill="none"
                  stroke="#F2B400"
                  stroke-width="1.7"
                  stroke-linecap="round"
                ></path>
                <line x1="114" y1="84" x2="114" y2="190" stroke="#D6D6D6" stroke-width="1" stroke-dasharray="2 2"></line>
                <circle cx="114" cy="112" r="3" fill="#5F54FF"></circle>
                <circle cx="114" cy="126" r="3" fill="#F2B400"></circle>
                <circle cx="340" cy="140" r="3" fill="#F2B400"></circle>
                <circle cx="345" cy="52" r="3" fill="#5F54FF"></circle>
                <g transform="translate(120,66)">
                  <rect width="168" height="68" rx="9" fill="#000000"></rect>
                  <text x="8" y="16" fill="#FFFFFF" font-size="14" font-weight="500">Listings posted</text>
                  <line x1="8" y1="26" x2="160" y2="26" stroke="#2E2E2E" stroke-width="1"></line>
                  <rect x="8" y="40" width="8" height="4" rx="2" fill="#357FF6"></rect>
                  <text x="20" y="45" fill="#A4A4A4" font-size="13">Aug 2025</text>
                  <text x="116" y="45" fill="#FFFFFF" font-size="13">₦100,000</text>
                  <rect x="8" y="58" width="8" height="4" rx="2" fill="#FACD38"></rect>
                  <text x="20" y="63" fill="#A4A4A4" font-size="13">Aug 2026</text>
                  <text x="122" y="63" fill="#FFFFFF" font-size="13">₦50,000</text>
                </g>
              </svg>
            </div>

            <div class="mt-4 space-y-4">
              <section class="rounded-[24px] border border-[#EFEFEF] bg-white px-[15px] py-[15px]">
                <h3 class="text-[16px] font-medium text-[#0D0D0D]/50">Most viewed listings</h3>
                <div class="mt-6 space-y-6">
                  @for (listing of mostViewedListings; track listing.title) {
                    <div class="flex items-center justify-between gap-4">
                      <div class="flex min-w-0 items-center gap-2">
                        <div class="h-9 w-9 shrink-0 overflow-hidden rounded-[5.4px] border border-[#F0F0F0] bg-[#EFEFEF]">
                          <img [ngSrc]="listing.image" [alt]="listing.title" width="36" height="36" class="h-9 w-9 object-cover">
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
                  @for (seller of topSellers; track seller.name + seller.email + seller.sold) {
                    <div class="flex items-center justify-between gap-4">
                      <div class="flex min-w-0 items-center gap-2">
                        <div class="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#F3F3F3]">
                          <img [ngSrc]="seller.avatar" [alt]="seller.name" width="36" height="36" class="h-9 w-9 rounded-full object-cover">
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
                  <p class="text-[32px] font-semibold leading-[40px] tracking-[-0.04em] text-[#1A1B1D]">56.5%</p>
                  <span class="text-[12px] leading-4 text-[#27A551]">+28% from last period</span>
                </div>
                <div class="mt-6 space-y-6">
                  @for (metric of conversionMetrics; track metric.label) {
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

        <button
          type="button"
          (click)="range.set(range() === '7d' ? '30d' : '7d')"
          class="inline-flex h-11 items-center gap-2 self-start rounded-full border border-[#e8e8e8] bg-white px-5 text-[15px] text-[#1f1f1f]"
        >
          <ng-icon name="heroCalendarDays" class="text-[16px] text-[#6f6f6f]"></ng-icon>
          <span>{{ rangeLabel() }}</span>
          <ng-icon name="heroChevronDown" class="text-[16px] text-[#6f6f6f]"></ng-icon>
        </button>
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
                ₦ 1,760,000<span class="text-[20px] text-[#8d8d8d]">.00</span>
              </h2>
              <span class="mt-3 inline-flex rounded-full bg-[#ecfbf1] px-3 py-1 text-[14px] font-medium text-[#29b34a]">
                +28% from last month
              </span>
            </div>

            <div class="mt-10">
              <svg viewBox="0 0 1100 320" class="h-auto w-full overflow-visible">
                <g fill="#8f8f8f" font-size="13" font-weight="500">
                  <text x="0" y="260">0</text>
                  <text x="0" y="173">250</text>
                  <text x="0" y="86">500</text>
                  <text x="22" y="286">21-12-2024</text>
                  <text x="1054" y="286">Today</text>
                </g>

                <line x1="34" y1="270" x2="1090" y2="270" stroke="#ececec" stroke-width="1"></line>

                <path
                  d="M 55 265 C 90 220, 120 185, 165 180 S 255 200, 315 170 S 455 160, 540 185 S 650 165, 755 215 S 900 220, 980 145 S 1045 118, 1090 105"
                  fill="none"
                  stroke="#5f54ff"
                  stroke-width="2"
                  stroke-linecap="round"
                ></path>

                <path
                  d="M 42 250 C 98 266, 135 285, 170 220 S 250 175, 330 192 S 430 255, 500 230 S 640 160, 710 214 S 840 252, 925 215 S 1010 182, 1080 190"
                  fill="none"
                  stroke="#f2b400"
                  stroke-width="2"
                  stroke-linecap="round"
                ></path>

                <line x1="380" y1="115" x2="380" y2="270" stroke="#d6d6d6" stroke-width="1.5" stroke-dasharray="3 3"></line>
                <circle cx="380" cy="175" r="4" fill="#5f54ff"></circle>
                <circle cx="380" cy="230" r="4" fill="#f2b400"></circle>
                <circle cx="1080" cy="190" r="4" fill="#f2b400"></circle>
                <circle cx="1090" cy="105" r="4" fill="#5f54ff"></circle>

                <g transform="translate(384,82)">
                  <rect width="230" height="84" rx="12" fill="#0a0a0a"></rect>
                  <text x="14" y="22" fill="#ffffff" font-size="14" font-weight="500">Comparison</text>

                  <circle cx="16" cy="46" r="4" fill="#5f54ff"></circle>
                  <text x="28" y="51" fill="#ffffff" font-size="13">Aug 2025</text>
                  <text x="160" y="51" fill="#ffffff" font-size="13">₦100,000</text>

                  <circle cx="16" cy="72" r="4" fill="#f2b400"></circle>
                  <text x="28" y="77" fill="#ffffff" font-size="13">Aug 2026</text>
                  <text x="160" y="77" fill="#ffffff" font-size="13">₦50,000</text>
                </g>
              </svg>
            </div>

            <div class="mt-12 grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.2fr)]">
              <section class="rounded-[24px] border border-[#e9e9e9] bg-white px-5 py-5">
                <h3 class="text-[16px] font-medium text-[#7b7b7b]">Platform health</h3>

                <div class="mt-8 text-center">
                  <p class="text-[68px] font-semibold leading-none tracking-[-0.06em] text-[#101010]">76%</p>
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
                        76
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
                    The platform is performing well with steady listing growth (+40,000) and a 56.5% listing success rate. Buyer engagement remains strong.
                  </p>
                </div>
              </section>

              <section class="rounded-[24px] border border-[#e9e9e9] bg-white px-5 py-5">
                <h3 class="text-[16px] font-medium text-[#7b7b7b]">Top subscribed plans</h3>

                <div class="mt-8">
                  <svg viewBox="0 0 620 320" class="h-auto w-full">
                    <g fill="#8f8f8f" font-size="13" font-weight="500">
                      <text x="8" y="270">0</text>
                      <text x="8" y="200">250</text>
                      <text x="8" y="130">500</text>
                      <text x="8" y="60">1000</text>
                    </g>

                    @for (bar of planBars; track bar.label) {
                      <g>
                        <defs>
                          <linearGradient [attr.id]="'bar-' + bar.label" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" [attr.stop-color]="bar.from"></stop>
                            <stop offset="100%" [attr.stop-color]="bar.to"></stop>
                          </linearGradient>
                        </defs>

                        <rect
                          [attr.x]="planBarX(bar.label)"
                          [attr.y]="260 - bar.height"
                          width="120"
                          [attr.height]="bar.height"
                          rx="8"
                          [attr.fill]="'url(#bar-' + bar.label + ')'"
                        ></rect>
                        <text
                          [attr.x]="planBarX(bar.label) + 44"
                          y="292"
                          fill="#7d7d7d"
                          font-size="15"
                          font-weight="500"
                        >
                          {{ bar.label }}
                        </text>
                      </g>
                    }
                  </svg>
                </div>
              </section>
            </div>
          </section>
        } @else if (activeTab() === 'users') {
          <section class="pt-8">
            <div class="grid gap-6 border-y border-[#efefef] py-5 sm:grid-cols-2 xl:grid-cols-4">
              @for (metric of userMetrics; track metric.label) {
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
                100,500
              </h2>
              <span class="mt-3 inline-flex rounded-full bg-[#ecfbf1] px-3 py-1 text-[14px] font-medium text-[#29b34a]">
                +28% from last month
              </span>
            </div>

            <div class="mt-10">
              <svg viewBox="0 0 1100 320" class="h-auto w-full overflow-visible">
                <g fill="#8f8f8f" font-size="13" font-weight="500">
                  <text x="0" y="260">0</text>
                  <text x="0" y="173">250</text>
                  <text x="0" y="86">500</text>
                  <text x="22" y="286">21-12-2024</text>
                  <text x="1054" y="286">Today</text>
                </g>

                <line x1="34" y1="270" x2="1090" y2="270" stroke="#ececec" stroke-width="1"></line>
                <path
                  d="M 55 255 C 95 220, 120 205, 170 210 S 255 198, 320 170 S 450 178, 520 190 S 635 165, 740 214 S 885 236, 970 162 S 1030 128, 1100 112"
                  fill="none"
                  stroke="#5f54ff"
                  stroke-width="2"
                  stroke-linecap="round"
                ></path>

                <line x1="382" y1="115" x2="382" y2="270" stroke="#d6d6d6" stroke-width="1.5" stroke-dasharray="3 3"></line>
                <circle cx="382" cy="175" r="4" fill="#5f54ff"></circle>
                <circle cx="1100" cy="112" r="4" fill="#5f54ff"></circle>

                <g transform="translate(386,82)">
                  <rect width="230" height="32" rx="10" fill="#0a0a0a"></rect>
                  <circle cx="16" cy="16" r="4" fill="#5f54ff"></circle>
                  <text x="28" y="21" fill="#ffffff" font-size="13">Aug 2025</text>
                  <text x="176" y="21" fill="#ffffff" font-size="13">10,000</text>
                </g>
              </svg>
            </div>

            <div class="mt-12 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <section class="rounded-[24px] border border-[#e9e9e9] bg-white px-5 py-5">
                <h3 class="text-[16px] font-medium text-[#7b7b7b]">Verified vs Unverified</h3>

                <div class="mt-8">
                  <svg viewBox="0 0 520 260" class="h-auto w-full">
                    <g fill="#8f8f8f" font-size="13" font-weight="500">
                      <text x="8" y="230">0</text>
                      <text x="8" y="150">250</text>
                      <text x="8" y="70">500</text>
                    </g>

                    <defs>
                      <linearGradient id="verified-users-bar" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stop-color="#13ad2e"></stop>
                        <stop offset="100%" stop-color="#a6f5b5"></stop>
                      </linearGradient>
                      <linearGradient id="unverified-users-bar" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stop-color="#d17b00"></stop>
                        <stop offset="100%" stop-color="#ffb13a"></stop>
                      </linearGradient>
                    </defs>

                    <rect x="110" y="40" width="170" height="180" rx="8" fill="url(#verified-users-bar)"></rect>
                    <rect x="315" y="130" width="170" height="90" rx="8" fill="url(#unverified-users-bar)"></rect>

                    <text x="148" y="244" fill="#7d7d7d" font-size="15" font-weight="500">Verified users</text>
                    <text x="344" y="244" fill="#7d7d7d" font-size="15" font-weight="500">Unverified users</text>
                  </svg>
                </div>
              </section>

              <section class="rounded-[24px] border border-[#e9e9e9] bg-white px-5 py-5">
                <h3 class="text-[16px] font-medium text-[#7b7b7b]">Top regions/cities for signups</h3>

                <div class="mt-8 flex h-1.5 items-center gap-1 overflow-hidden rounded-full bg-[#f2f2f2]">
                  @for (region of topSignupRegions; track region.label) {
                    <span class="block h-full rounded-full" [style.width]="region.width" [style.background]="region.color"></span>
                  }
                </div>

                <div class="mt-8 space-y-6">
                  @for (region of topSignupRegions; track region.label) {
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
              @for (metric of listingMetrics; track metric.label; let index = $index) {
                <div
                  class="px-3 py-4 sm:px-5"
                  [class.border-r]="index < listingMetrics.length - 1"
                  [class.border-[#efefef]]="index < listingMetrics.length - 1"
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
              <svg viewBox="0 0 1100 320" class="h-auto w-full overflow-visible">
                <g fill="#8f8f8f" font-size="13" font-weight="500">
                  <text x="0" y="260">0</text>
                  <text x="0" y="173">250</text>
                  <text x="0" y="86">500</text>
                  <text x="22" y="286">21-12-2023</text>
                  <text x="1054" y="286">Today</text>
                </g>

                <line x1="34" y1="270" x2="1090" y2="270" stroke="#ececec" stroke-width="1"></line>

                <path
                  d="M 55 265 C 90 220, 120 185, 165 180 S 255 200, 315 170 S 455 160, 540 185 S 650 165, 755 215 S 900 220, 980 145 S 1045 118, 1090 105"
                  fill="none"
                  stroke="#5f54ff"
                  stroke-width="2"
                  stroke-linecap="round"
                ></path>

                <path
                  d="M 42 250 C 98 266, 135 285, 170 220 S 250 175, 330 192 S 430 255, 500 230 S 640 160, 710 214 S 840 252, 925 215 S 1010 182, 1080 190"
                  fill="none"
                  stroke="#f2b400"
                  stroke-width="2"
                  stroke-linecap="round"
                ></path>

                <line x1="382" y1="115" x2="382" y2="270" stroke="#d6d6d6" stroke-width="1.5" stroke-dasharray="3 3"></line>
                <circle cx="382" cy="175" r="4" fill="#5f54ff"></circle>
                <circle cx="382" cy="230" r="4" fill="#f2b400"></circle>
                <circle cx="1080" cy="190" r="4" fill="#f2b400"></circle>
                <circle cx="1090" cy="105" r="4" fill="#5f54ff"></circle>

                <g transform="translate(384,82)">
                  <rect width="230" height="84" rx="12" fill="#0a0a0a"></rect>
                  <text x="14" y="22" fill="#ffffff" font-size="14" font-weight="500">Listings posted</text>

                  <circle cx="16" cy="46" r="4" fill="#5f54ff"></circle>
                  <text x="28" y="51" fill="#ffffff" font-size="13">Aug 2025</text>
                  <text x="160" y="51" fill="#ffffff" font-size="13">100,000</text>

                  <circle cx="16" cy="72" r="4" fill="#f2b400"></circle>
                  <text x="28" y="77" fill="#ffffff" font-size="13">Aug 2026</text>
                  <text x="160" y="77" fill="#ffffff" font-size="13">50,000</text>
                </g>
              </svg>
            </div>

            <div class="mt-12 grid gap-6 xl:grid-cols-3">
              <section class="rounded-[24px] border border-[#e9e9e9] bg-white px-5 py-5">
                <h3 class="text-[16px] font-medium text-[#7b7b7b]">Most viewed listings</h3>

                <div class="mt-8 space-y-6">
                  @for (listing of mostViewedListings; track listing.title) {
                    <div class="flex items-center justify-between gap-4">
                      <div class="flex min-w-0 items-center gap-3">
                        <div class="h-10 w-10 shrink-0 overflow-hidden rounded-[10px] bg-[#f3f3f3]">
                          <img
                            [ngSrc]="listing.image"
                            [alt]="listing.title"
                            width="40"
                            height="40"
                            class="h-10 w-10 object-cover"
                          >
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
                  @for (seller of topSellers; track seller.name + seller.email + seller.sold) {
                    <div class="flex items-center justify-between gap-4">
                      <div class="flex min-w-0 items-center gap-3">
                        <div class="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#f3f3f3]">
                          <img
                            [ngSrc]="seller.avatar"
                            [alt]="seller.name"
                            width="40"
                            height="40"
                            class="h-10 w-10 object-cover"
                          >
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
                  <p class="text-[34px] font-semibold tracking-[-0.05em] text-[#202020]">56.5%</p>
                  <span class="mt-2 text-[14px] font-medium text-[#29b34a]">+28% from last period</span>
                </div>

                <div class="mt-10 space-y-6">
                  @for (metric of conversionMetrics; track metric.label) {
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
  readonly activeTab = signal<AnalyticsTab>('overview');
  readonly range = signal<AnalyticsRange>('7d');

  readonly userMetrics: ReadonlyArray<UserMetric> = [
    { label: 'Online users', value: '2,500,000', dot: true },
    { label: 'Total users', value: '4,000,000' },
    { label: 'Renewal rate', value: '56.1%' },
    { label: 'Churn rate', value: '43.9%' },
  ];

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

  readonly planBars: ReadonlyArray<PlanBar> = [
    { label: 'Pro', height: 60, from: '#ffaf1f', to: '#ffe39b' },
    { label: 'Premium', height: 120, from: '#0da329', to: '#9af1a8' },
    { label: 'Enterprise', height: 205, from: '#4d86e9', to: '#b8d7f8' },
  ];

  readonly listingMetrics: ReadonlyArray<ListingMetric> = [
    { label: 'Total listings', value: '600,000', delta: '+40,000' },
    { label: 'Average listing price', value: '₦10,500', delta: '+₦2,665' },
    { label: 'Active listings', value: '420,000', delta: '+242' },
  ];

  readonly topSignupRegions: ReadonlyArray<RegionSignupItem> = [
    { label: 'Lagos', value: '2,000,000', color: '#5f54ff', width: '28%' },
    { label: 'Abuja', value: '1,200,000', color: '#7bc8ff', width: '22%' },
    { label: 'Delta', value: '800,000', color: '#ffcb42', width: '31%' },
    { label: 'Rivers', value: '240,000', color: '#ff9253', width: '10%' },
    { label: 'Nasaruwa', value: '120,222', color: '#d9d9d9', width: '4%' },
  ];

  readonly mostViewedListings: ReadonlyArray<MostViewedListing> = [
    { title: 'Iphone 17 pro max', image: '/assets/images/product_watch_luxury.png', views: '10,234' },
    { title: 'Logitech ergonomic mouse', image: '/assets/images/product_sneakers.png', views: '7,234' },
    { title: 'Nike sneaker', image: '/assets/images/product_sneakers_lifestyle.png', views: '5,234' },
    { title: 'Bone straight wig', image: '/assets/images/fashion_menswear_hero.png', views: '2,234' },
    { title: 'Maserati', image: '/assets/images/product_keyboard_rgb.png', views: '455' },
  ];

  readonly topSellers: ReadonlyArray<TopSeller> = [
    { name: 'Mary Jane', email: 'mary@email.com', avatar: '/assets/images/product_sneakers_lifestyle.png', sold: '129' },
    { name: 'Bryan Walter', email: 'bryan@email.com', avatar: '/assets/images/fashion_menswear_hero.png', sold: '98' },
    { name: 'John Doe', email: 'john@email.com', avatar: '/assets/images/product_watch_luxury.png', sold: '54' },
    { name: 'Mary Jane', email: 'mary@email.com', avatar: '/assets/images/product_sneakers_lifestyle.png', sold: '24' },
    { name: 'Bryan Walter', email: 'bryan@email.com', avatar: '/assets/images/fashion_menswear_hero.png', sold: '6' },
  ];

  readonly conversionMetrics: ReadonlyArray<ConversionMetric> = [
    { label: 'Listings posted', value: '600,000', width: '100%' },
    { label: 'Listings viewed', value: '550,000', width: '88%' },
    { label: 'Listings contacted', value: '500,000', width: '82%' },
    { label: 'Listings marked sold', value: '300', width: '8%' },
  ];

  readonly rangeLabel = computed(() => (this.range() === '7d' ? 'Last 7 days' : 'Last 30 days'));

  planBarX(label: string): number {
    switch (label) {
      case 'Pro':
        return 160;
      case 'Premium':
        return 315;
      default:
        return 470;
    }
  }
}
