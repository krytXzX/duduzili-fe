import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroCalendarDays,
  heroChevronDown,
  heroEllipsisHorizontal,
  heroEye,
  heroLink,
  heroPause,
  heroShare,
  heroXMark,
} from '@ng-icons/heroicons/outline';

interface AdMetric {
  label: string;
  value: string;
  info?: boolean;
}

interface AdDetail {
  id: string;
  kind: 'listing' | 'store' | 'banner';
  title: string;
  status: 'Active' | 'Paused' | 'Expired';
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
  imports: [CommonModule, RouterLink, NgIcon],
  providers: [
    provideIcons({
      heroPause,
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
    <div class="flex h-full flex-col rounded-[32px] border border-gray-100/60 bg-white px-6 py-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] sm:px-8">
      <nav class="flex items-center gap-2 text-[11px] font-semibold text-[#B0B4BD]">
        <a routerLink="/ads" class="transition-colors hover:text-[#6B5CF0]">Ads</a>
        <span>/</span>
        <a routerLink="/ads/running" class="transition-colors hover:text-[#6B5CF0]">Running Ads</a>
        <span>/</span>
        <span class="text-[#5B5F67]">Ad details</span>
      </nav>

      <header class="mt-5 flex flex-col gap-5 border-b border-[#F0F1F4] pb-8 lg:flex-row lg:items-start lg:justify-between">
        <div>
          @if (ad().kind === 'banner') {
            <div class="w-full max-w-[214px]">
              <div class="relative h-[120px] w-[214px] overflow-hidden rounded-[22px] border border-[#ECEEF3] bg-[#F8F8FA] shadow-[0_16px_28px_-20px_rgba(17,24,39,0.35)]">
                <img [src]="ad().image" [alt]="ad().title" class="h-full w-full object-cover">
                <button
                  type="button"
                  (click)="openDestinationModal()"
                  class="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#59606B] shadow-sm transition hover:bg-[#FAFAFC]"
                  aria-label="Open destination link editor"
                >
                  <ng-icon name="heroLink" class="text-base"></ng-icon>
                </button>
              </div>

              <div class="mt-3 flex flex-wrap items-center gap-3">
                <h1 class="text-[20px] font-black tracking-tight text-[#1A1C21]">{{ ad().title }}</h1>
                <span
                  class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold"
                  [class.bg-[#EAF8EC]]="currentStatus() === 'Active'"
                  [class.text-[#2D9D48]]="currentStatus() === 'Active'"
                  [class.bg-[#F4F4F6]]="currentStatus() !== 'Active'"
                  [class.text-[#686D76]]="currentStatus() !== 'Active'"
                >
                  <span
                    class="h-2 w-2 rounded-full"
                    [class.bg-[#2DCA54]]="currentStatus() === 'Active'"
                    [class.bg-[#8F96A3]]="currentStatus() !== 'Active'"
                  ></span>
                  {{ currentStatus() }}
                </span>
              </div>
            </div>
          } @else {
            <div class="flex items-start gap-4">
              @if (ad().kind === 'listing') {
                <img [src]="ad().image" [alt]="ad().title" class="h-14 w-14 rounded-[16px] object-cover">
              } @else {
                <span
                  class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-[20px] font-black text-white"
                  [style.background]="ad().logoTone"
                >
                  {{ ad().initials }}
                </span>
              }

              <div>
                <div class="flex flex-wrap items-center gap-3">
                  <h1 class="text-[20px] font-black tracking-tight text-[#1A1C21]">{{ ad().title }}</h1>
                  <span
                    class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold"
                    [class.bg-[#EAF8EC]]="currentStatus() === 'Active'"
                    [class.text-[#2D9D48]]="currentStatus() === 'Active'"
                    [class.bg-[#F4F4F6]]="currentStatus() !== 'Active'"
                    [class.text-[#686D76]]="currentStatus() !== 'Active'"
                  >
                    <span
                      class="h-2 w-2 rounded-full"
                      [class.bg-[#2DCA54]]="currentStatus() === 'Active'"
                      [class.bg-[#8F96A3]]="currentStatus() !== 'Active'"
                    ></span>
                    {{ currentStatus() }}
                  </span>
                </div>

                @if (ad().kind === 'listing') {
                  <p class="mt-1 text-[18px] font-semibold text-[#8A8F98]">{{ ad().price }}</p>
                } @else if (ad().kind === 'store') {
                  <div class="mt-1 inline-flex items-center gap-2 text-[16px] font-medium text-[#7E848E]">
                    <span class="h-2 w-2 rounded-full bg-[#8D929B]"></span>
                    {{ ad().activeListings }}
                  </div>
                }
              </div>
            </div>
          }
        </div>

        <div class="flex items-center gap-3">
          @if (ad().kind === 'banner') {
            <button
              type="button"
              (click)="openDestinationModal()"
              class="inline-flex items-center gap-2 rounded-full border border-[#E7EAF0] bg-white px-5 py-3 text-[15px] font-semibold text-[#333842] transition hover:bg-[#FAFAFC]"
            >
              <ng-icon name="heroLink" class="text-base"></ng-icon>
              Edit destination link
            </button>
          }

          <button
            type="button"
            (click)="togglePaused()"
            class="inline-flex items-center gap-2 rounded-full border border-[#E7EAF0] bg-white px-5 py-3 text-[15px] font-semibold text-[#333842] transition hover:bg-[#FAFAFC]"
          >
            <ng-icon name="heroPause" class="text-base"></ng-icon>
            {{ currentStatus() === 'Paused' ? 'Resume Ad' : 'Pause Ad' }}
          </button>

          @if (ad().kind !== 'banner') {
            <div class="relative">
              <button
                type="button"
                (click)="isMenuOpen.update(value => !value)"
                class="flex h-11 w-11 items-center justify-center rounded-full border border-[#E7EAF0] bg-white text-[#69707B] transition hover:bg-[#FAFAFC]"
                aria-haspopup="menu"
                [attr.aria-expanded]="isMenuOpen()"
              >
                <ng-icon name="heroEllipsisHorizontal" class="text-lg"></ng-icon>
              </button>

              @if (isMenuOpen()) {
                <div
                  class="absolute right-0 top-[calc(100%+12px)] z-10 w-[180px] rounded-[22px] border border-[#ECEEF3] bg-white p-2 shadow-[0_24px_44px_-24px_rgba(17,24,39,0.4)]"
                  role="menu"
                >
                  <button
                    type="button"
                    role="menuitem"
                    class="flex w-full items-center gap-3 rounded-[16px] px-4 py-3 text-left text-[15px] font-medium text-[#2E333B] transition hover:bg-[#F8F8FA]"
                  >
                    <ng-icon name="heroEye" class="text-base text-[#6D727C]"></ng-icon>
                    {{ ad().kind === 'store' ? 'View store' : 'View listing' }}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    class="flex w-full items-center gap-3 rounded-[16px] px-4 py-3 text-left text-[15px] font-medium text-[#2E333B] transition hover:bg-[#F8F8FA]"
                  >
                    <ng-icon name="heroShare" class="text-base text-[#6D727C]"></ng-icon>
                    {{ ad().kind === 'store' ? 'Share store' : 'Share listing' }}
                  </button>
                </div>
              }
            </div>
          }
        </div>
      </header>

      <div class="mt-6 inline-flex max-w-[620px] items-start gap-3 rounded-[16px] bg-[#FFFBE5] px-5 py-4 text-[#59592E]">
        <span class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EEE82C] text-[#6C6B00]">!</span>
        <p class="text-[14px] font-semibold">
          {{ ad().noticePrefix }} until it expires on {{ ad().expiresOn }}.
        </p>
      </div>

      <div
        [class]="ad().metrics.length === 4
          ? 'mt-8 grid gap-4 border-y border-[#F0F1F4] py-5 md:grid-cols-4'
          : 'mt-8 grid gap-4 border-y border-[#F0F1F4] py-5 md:grid-cols-3'"
      >
        @for (metric of ad().metrics; track metric.label) {
          <div class="border-[#F0F1F4] md:border-r last:border-r-0 md:pr-5">
            <p class="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#9BA0AA]">
              {{ metric.label }}
              @if (metric.info) {
                <span class="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#D7DAE1] text-[9px] font-bold text-white">
                  i
                </span>
              }
            </p>
            <p class="mt-1 text-[18px] font-black text-[#24262D]">{{ metric.value }}</p>
          </div>
        }
      </div>

      <section class="mt-6 flex-1 rounded-[28px] border border-[#ECEEF3] bg-white p-4 shadow-[0_8px_30px_-28px_rgba(17,24,39,0.45)] sm:p-6">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <h2 class="text-[18px] font-black text-[#565B63] sm:text-[22px]">Performance Overview</h2>

          <div class="flex items-center gap-5">
            <div class="flex items-center gap-5 text-[14px] font-medium text-[#5B6068]">
              <span class="inline-flex items-center gap-2">
                <span class="h-1.5 w-4 rounded-full bg-[#6E5AE6]"></span>
                Views
              </span>
              <span class="inline-flex items-center gap-2">
                <span class="h-1.5 w-4 rounded-full bg-[#F3C433]"></span>
                Clicks
              </span>
            </div>

            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-full border border-[#E7EAF0] bg-white px-4 py-2.5 text-[14px] font-medium text-[#3F444C]"
            >
              <ng-icon name="heroCalendarDays" class="text-base"></ng-icon>
              Last 7 days
              <ng-icon name="heroChevronDown" class="text-sm text-[#9BA0AA]"></ng-icon>
            </button>
          </div>
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

            <line x1="345" y1="108" x2="345" y2="348" stroke="#D8DBE2" stroke-dasharray="4 4"></line>

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
              <text x="12" y="18" fill="#FFFFFF" font-size="12" font-weight="600">02 May, 2026</text>
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

    @if (isDestinationModalOpen()) {
      <div
        class="fixed inset-0 z-[220] flex items-center justify-center bg-black/20 p-4 backdrop-blur-[2px]"
        (click)="closeDestinationModal()"
      >
        <div
          class="w-full max-w-[600px] rounded-[28px] bg-white px-6 py-6 shadow-[0_30px_80px_-40px_rgba(19,27,45,0.45)] sm:px-10 sm:py-8"
          (click)="$event.stopPropagation()"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <h2 class="text-[22px] font-black tracking-tight text-[#1A1C21]">Edit destination link</h2>
              <p class="mt-3 text-[15px] font-medium text-[#626771]">
                Choose where buyers will be taken when they click your banner.
              </p>
            </div>

            <button
              type="button"
              (click)="closeDestinationModal()"
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F7F7F8] text-[#525762] transition hover:bg-[#EFEFF2]"
              aria-label="Close destination link modal"
            >
              <ng-icon name="heroXMark" class="text-lg"></ng-icon>
            </button>
          </div>

          <div class="mt-10">
            <label for="destination-link" class="mb-2 block text-[14px] font-semibold text-[#7B8089]">
              Destination link
            </label>

            <div class="flex items-center gap-3 rounded-[18px] border border-[#E7EAF0] bg-white px-4 py-3">
              <input
                id="destination-link"
                type="url"
                [value]="editedDestinationUrl()"
                (input)="updateEditedDestinationUrl($event)"
                class="min-w-0 flex-1 bg-transparent text-[14px] font-medium text-[#4B4F57] outline-none placeholder:text-[#B3B6BE]"
              >
              <button
                type="button"
                (click)="editedDestinationUrl.set('')"
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F7F7F8] text-[#6A6F78] transition hover:bg-[#EFEFF2]"
                aria-label="Clear destination link"
              >
                <ng-icon name="heroXMark" class="text-sm"></ng-icon>
              </button>
            </div>
          </div>

          <div class="mt-16 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              (click)="closeDestinationModal()"
              class="rounded-full border border-[#E7EAF0] bg-white px-6 py-3.5 text-[15px] font-semibold text-[#2E333B] transition hover:bg-[#FAFAFC]"
            >
              Cancel
            </button>
            <button
              type="button"
              (click)="saveDestinationUrl()"
              class="rounded-full bg-[#6653E4] px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)] transition hover:bg-[#5945DB]"
            >
              Update
            </button>
          </div>
        </div>
      </div>
    }
  `,
  host: { class: 'block h-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdDetailsPageComponent {
  private readonly route = inject(ActivatedRoute);

  readonly adId = signal(this.route.snapshot.paramMap.get('id') ?? 'other-1');
  readonly isMenuOpen = signal(false);
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
      status: 'Active',
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
      status: 'Expired',
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

  togglePaused(): void {
    this.currentStatus.update(status => (status === 'Paused' ? 'Active' : 'Paused'));
  }

  openDestinationModal(): void {
    if (this.ad().kind !== 'banner') {
      return;
    }

    this.editedDestinationUrl.set(this.currentDestinationUrl());
    this.isDestinationModalOpen.set(true);
  }

  closeDestinationModal(): void {
    this.isDestinationModalOpen.set(false);
  }

  updateEditedDestinationUrl(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.editedDestinationUrl.set(input.value);
  }

  saveDestinationUrl(): void {
    this.destinationUrlOverrides.update(overrides => ({
      ...overrides,
      [this.adId()]: this.editedDestinationUrl().trim(),
    }));
    this.isDestinationModalOpen.set(false);
  }
}
