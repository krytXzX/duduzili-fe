import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroBuildingStorefront,
  heroCalendarDays,
  heroChevronDown,
  heroChevronLeft,
  heroChevronRight,
  heroMagnifyingGlass,
  heroPhoto,
  heroQueueList,
  heroCheckCircle,
  heroPauseCircle,
} from '@ng-icons/heroicons/outline';

type AdsCategory = 'promoted listings' | 'store promotions' | 'banner ads';
type AdStatus = 'active' | 'paused';
type FilterChip = 'all' | AdStatus;

interface RunningAdsCategoryTab {
  id: AdsCategory;
  label: string;
  icon:
    | 'heroQueueList'
    | 'heroBuildingStorefront'
    | 'heroPhoto';
}

interface RunningAdsRecord {
  id: string;
  title: string;
  thumbnail: string;
  bannerBadgeLabel?: string;
  storeOrUser: string;
  storeAvatarText: string;
  storeAvatarTone: string;
  subtitle?: string;
  ownerName?: string;
  ownerAvatarImage?: string;
  products?: string;
  views: string;
  clicks: string;
  messages: string;
  calls: string;
  activeUntil: string;
  status: AdStatus;
  category: AdsCategory;
}

@Component({
  selector: 'app-admin-running-ads-page',
  imports: [NgIcon, NgOptimizedImage],
  providers: [
    provideIcons({
      heroBuildingStorefront,
      heroCalendarDays,
      heroChevronDown,
      heroChevronLeft,
      heroChevronRight,
      heroMagnifyingGlass,
      heroPhoto,
      heroQueueList,
      heroCheckCircle,
      heroPauseCircle,
    }),
  ],
  template: `
    <section class="min-h-full rounded-[32px] bg-white">
      <header class="border-b border-[#efefef] px-8 py-6">
        <h1 class="text-[18px] font-medium tracking-[-0.04em] text-[#b3b3b3]">
          Ads management &gt; <span class="font-semibold text-[#202020]">Running Ads</span>
        </h1>
      </header>

      <div class="px-4 py-6 sm:px-6 lg:px-8">
        <div class="border-b border-[#efefef]">
          <div class="flex flex-wrap items-center gap-8">
            @for (tab of categoryTabs; track tab.id) {
              <button
                type="button"
                (click)="setActiveCategory(tab.id)"
                [attr.aria-pressed]="activeCategory() === tab.id"
                class="flex items-center gap-2 border-b-2 px-3 py-3 text-[15px] font-medium transition-colors"
                [class.border-[#6254f3]]="activeCategory() === tab.id"
                [class.text-[#6254f3]]="activeCategory() === tab.id"
                [class.border-transparent]="activeCategory() !== tab.id"
                [class.text-[#939393]]="activeCategory() !== tab.id"
              >
                <ng-icon [name]="tab.icon" class="text-[16px]"></ng-icon>
                {{ tab.label }}
              </button>
            }
          </div>
        </div>

        <div class="mt-6 flex flex-wrap items-center gap-3">
          @for (chip of visibleFilterChips(); track chip.id) {
            <button
              type="button"
              (click)="activeFilterChip.set(chip.id); currentPage.set(1)"
              class="rounded-full px-4 py-2.5 text-[14px] font-medium transition-colors"
              [class.bg-[#1f1f1f]]="activeFilterChip() === chip.id"
              [class.text-white]="activeFilterChip() === chip.id"
              [class.bg-[#f3f3f3]]="activeFilterChip() !== chip.id"
              [class.text-[#222222]]="activeFilterChip() !== chip.id"
            >
              {{ chip.label }} ({{ countByFilterChip(chip.id) }})
            </button>
          }
        </div>

        @if (activeCategory() === 'banner ads') {
          <section class="mt-8">
            <div class="grid gap-5 xl:grid-cols-2">
              @for (record of paginatedAds(); track record.id) {
                <article class="overflow-hidden rounded-[20px] border border-[#e9e9e9] bg-white">
                  <div class="p-1.5">
                    <div class="relative h-[228px] overflow-hidden rounded-[22px]">
                      <img
                        [ngSrc]="record.thumbnail"
                        [alt]="record.title"
                        width="840"
                        height="456"
                        class="h-full w-full object-cover"
                      >

                      <div class="absolute left-3 top-3 rounded-full bg-[#f0f59b] px-3 py-1 text-[14px] font-medium text-[#3e3e3e]">
                        Active until: {{ record.activeUntil }}
                      </div>

                      <div class="absolute bottom-4 left-4 rounded-full bg-black/55 px-3 py-1.5 text-[14px] font-medium text-white">
                        {{ record.bannerBadgeLabel || 'Sponsored' }}
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center gap-4 px-4 pb-4 text-[14px] text-[#8d8d8d]">
                    <span class="inline-flex items-center gap-1">
                      <span class="text-[15px]">◉</span>
                      {{ record.views }}
                    </span>
                    <span class="inline-flex items-center gap-1">
                      <span class="text-[15px]">✦</span>
                      {{ record.clicks }}
                    </span>
                  </div>
                </article>
              }
            </div>
          </section>
        } @else {
        <section class="mt-8 overflow-hidden rounded-[20px] border border-[#e9e9e9] bg-white">
          <div class="flex flex-col gap-4 border-b border-[#efefef] px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div class="flex flex-wrap items-center gap-3">
              <button
                type="button"
                class="inline-flex h-10 items-center gap-2 rounded-full border border-[#e8e8e8] bg-white px-4 text-[14px] text-[#8a8a8a]"
              >
                <span>Store</span>
                <ng-icon name="heroChevronDown" class="text-[16px]"></ng-icon>
              </button>

              <button
                type="button"
                class="inline-flex h-10 items-center gap-2 rounded-full border border-[#e8e8e8] bg-white px-4 text-[14px] text-[#8a8a8a]"
              >
                <span>Status</span>
                <ng-icon name="heroChevronDown" class="text-[16px]"></ng-icon>
              </button>

              <button
                type="button"
                class="inline-flex h-10 items-center gap-2 rounded-full border border-[#e8e8e8] bg-white px-4 text-[14px] text-[#8a8a8a]"
              >
                <span>Active until</span>
                <ng-icon name="heroChevronDown" class="text-[16px]"></ng-icon>
              </button>
            </div>

            <label class="flex h-10 w-full items-center gap-2 rounded-full bg-[#fafafa] px-4 text-[#9c9c9c] lg:max-w-[226px]">
              <ng-icon name="heroMagnifyingGlass" class="text-[16px]"></ng-icon>
              <input
                type="search"
                [value]="searchQuery()"
                (input)="updateSearchQuery($event)"
                placeholder="Search"
                class="min-w-0 flex-1 bg-transparent text-[14px] text-[#202020] outline-none placeholder:text-[#9c9c9c]"
              >
            </label>
          </div>

          <div class="overflow-x-auto">
            @if (activeCategory() === 'store promotions') {
              <table class="min-w-[1080px] w-full table-fixed">
                <thead>
                  <tr class="border-b border-[#efefef] bg-[#fafafa] text-left text-[13px] font-medium text-[#7d7d7d]">
                    <th class="w-[260px] px-4 py-3 font-medium">Store</th>
                    <th class="w-[220px] px-4 py-3 font-medium">Owner</th>
                    <th class="w-[90px] px-4 py-3 font-medium">Products</th>
                    <th class="w-[110px] px-4 py-3 font-medium">Views</th>
                    <th class="w-[90px] px-4 py-3 font-medium">Clicks</th>
                    <th class="w-[140px] px-4 py-3 font-medium">Active until</th>
                    <th class="w-[110px] px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>

                <tbody>
                  @for (record of paginatedAds(); track record.id) {
                    <tr class="border-b border-[#efefef] last:border-b-0">
                      <td class="px-4 py-4">
                        <div class="flex items-center gap-3">
                          <div
                            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold text-white"
                            [style.background]="record.storeAvatarTone"
                          >
                            {{ record.storeAvatarText }}
                          </div>
                          <div class="min-w-0">
                            <p class="truncate text-[15px] font-medium text-[#222222]">{{ record.storeOrUser }}</p>
                            <p class="truncate text-[13px] text-[#9a9a9a]">{{ record.subtitle }}</p>
                          </div>
                        </div>
                      </td>

                      <td class="px-4 py-4">
                        <div class="flex items-center gap-3">
                          <div class="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[#f3f3f3]">
                            <img
                              [ngSrc]="record.ownerAvatarImage || record.thumbnail"
                              [alt]="record.ownerName || record.storeOrUser"
                              width="32"
                              height="32"
                              class="h-8 w-8 object-cover"
                            >
                          </div>
                          <span class="truncate text-[15px] text-[#3a3a3a]">{{ record.ownerName }}</span>
                        </div>
                      </td>

                      <td class="whitespace-nowrap px-4 py-4 text-[15px] text-[#303030]">{{ record.products }}</td>
                      <td class="whitespace-nowrap px-4 py-4 text-[15px] text-[#303030]">{{ record.views }}</td>
                      <td class="whitespace-nowrap px-4 py-4 text-[15px] text-[#303030]">{{ record.clicks }}</td>
                      <td class="whitespace-nowrap px-4 py-4 text-[15px] text-[#303030]">{{ record.activeUntil }}</td>
                      <td class="px-4 py-4">
                        <span
                          class="inline-flex whitespace-nowrap items-center gap-1 rounded-full px-2 py-1 text-[14px] font-medium"
                          [class.text-[#2ab83f]]="record.status === 'active'"
                          [class.text-[#4a8cff]]="record.status === 'paused'"
                        >
                          <ng-icon
                            [name]="record.status === 'active' ? 'heroCheckCircle' : 'heroPauseCircle'"
                            class="text-[15px]"
                          ></ng-icon>
                          {{ record.status === 'active' ? 'Active' : 'Paused' }}
                        </span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            } @else {
              <table class="min-w-[1120px] w-full table-fixed">
              <thead>
                <tr class="border-b border-[#efefef] bg-[#fafafa] text-left text-[13px] font-medium text-[#7d7d7d]">
                  <th class="w-[260px] px-4 py-3 font-medium">Listing</th>
                  <th class="w-[220px] px-4 py-3 font-medium">Store/User</th>
                  <th class="w-[90px] px-4 py-3 font-medium">Views</th>
                  <th class="w-[90px] px-4 py-3 font-medium">Clicks</th>
                  <th class="w-[100px] px-4 py-3 font-medium">Messages</th>
                  <th class="w-[80px] px-4 py-3 font-medium">Calls</th>
                  <th class="w-[140px] px-4 py-3 font-medium">Active until</th>
                  <th class="w-[110px] px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>

              <tbody>
                @for (record of paginatedAds(); track record.id) {
                  <tr class="border-b border-[#efefef] last:border-b-0">
                    <td class="px-4 py-4">
                      <div class="flex items-center gap-3">
                        <div class="h-10 w-10 shrink-0 overflow-hidden rounded-[10px] bg-[#f3f3f3]">
                          <img
                            [ngSrc]="record.thumbnail"
                            [alt]="record.title"
                            width="40"
                            height="40"
                            class="h-10 w-10 object-cover"
                          >
                        </div>
                        <span class="truncate text-[15px] font-medium text-[#222222]">{{ record.title }}</span>
                      </div>
                    </td>

                    <td class="px-4 py-4">
                      <div class="flex items-center gap-3">
                        <div
                          class="flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-semibold text-white"
                          [style.background]="record.storeAvatarTone"
                        >
                          {{ record.storeAvatarText }}
                        </div>
                        <span class="truncate text-[15px] text-[#3a3a3a]">{{ record.storeOrUser }}</span>
                      </div>
                    </td>

                    <td class="whitespace-nowrap px-4 py-4 text-[15px] text-[#303030]">{{ record.views }}</td>
                    <td class="whitespace-nowrap px-4 py-4 text-[15px] text-[#303030]">{{ record.clicks }}</td>
                    <td class="whitespace-nowrap px-4 py-4 text-[15px] text-[#303030]">{{ record.messages }}</td>
                    <td class="whitespace-nowrap px-4 py-4 text-[15px] text-[#303030]">{{ record.calls }}</td>
                    <td class="whitespace-nowrap px-4 py-4 text-[15px] text-[#303030]">{{ record.activeUntil }}</td>
                    <td class="px-4 py-4">
                      <span
                        class="inline-flex whitespace-nowrap items-center gap-1 rounded-full px-2 py-1 text-[14px] font-medium"
                        [class.text-[#2ab83f]]="record.status === 'active'"
                        [class.text-[#4a8cff]]="record.status === 'paused'"
                      >
                        <ng-icon
                          [name]="record.status === 'active' ? 'heroCheckCircle' : 'heroPauseCircle'"
                          class="text-[15px]"
                        ></ng-icon>
                        {{ record.status === 'active' ? 'Active' : 'Paused' }}
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
              </table>
            }
          </div>
        </section>
        }

        <div class="mt-6 flex flex-col gap-4 text-[15px] text-[#4d4d4d] sm:flex-row sm:items-center sm:justify-between">
          <p>{{ paginatedAds().length }} results</p>

          <div class="flex items-center gap-2 self-end">
            <button
              type="button"
              (click)="goToPreviousPage()"
              [disabled]="currentPage() === 1"
              class="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#ececec] text-[#b3b3b3] transition hover:bg-[#fafafa] disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Previous page"
            >
              <ng-icon name="heroChevronLeft" class="text-[16px]"></ng-icon>
            </button>

            <div class="flex h-9 min-w-10 items-center justify-center rounded-[10px] border border-[#ececec] px-3 text-[15px] text-[#707070]">
              {{ currentPage() }}
            </div>

            <button
              type="button"
              (click)="goToNextPage()"
              [disabled]="currentPage() === totalPages()"
              class="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#ececec] text-[#9a9a9a] transition hover:bg-[#fafafa] disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Next page"
            >
              <ng-icon name="heroChevronRight" class="text-[16px]"></ng-icon>
            </button>

            <span class="ml-1 text-[15px] text-[#7d7d7d]">of {{ totalPages() }}</span>
          </div>
        </div>
      </div>
    </section>
  `,
  host: {
    class: 'block h-full',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminRunningAdsPageComponent {
  readonly categoryTabs: ReadonlyArray<RunningAdsCategoryTab> = [
    { id: 'promoted listings', label: 'Promoted Listings', icon: 'heroQueueList' },
    { id: 'store promotions', label: 'Store Promotions', icon: 'heroBuildingStorefront' },
    { id: 'banner ads', label: 'Banner Ads', icon: 'heroPhoto' },
  ];

  readonly filterChips = [
    { id: 'all' as const, label: 'All' },
    { id: 'active' as const, label: 'Active' },
    { id: 'paused' as const, label: 'Paused' },
  ];

  readonly activeCategory = signal<AdsCategory>('promoted listings');
  readonly activeFilterChip = signal<FilterChip>('all');
  readonly searchQuery = signal('');
  readonly currentPage = signal(1);
  readonly pageSize = 5;

  readonly runningAds = signal<RunningAdsRecord[]>([
    {
      id: 'ad-1',
      title: 'Iphone 17 pro max',
      thumbnail: '/assets/images/product_watch_luxury.png',
      storeOrUser: 'The Vine Collections',
      storeAvatarText: 'VC',
      storeAvatarTone: 'linear-gradient(135deg, #48836a 0%, #5f9c83 100%)',
      views: '1,458',
      clicks: '700',
      messages: '45',
      calls: '45',
      activeUntil: '12 May, 2026',
      status: 'active',
      category: 'promoted listings',
    },
    {
      id: 'ad-2',
      title: 'Logitech ergonomic mouse',
      thumbnail: '/assets/images/product_keyboard_rgb.png',
      storeOrUser: 'Eden Organics',
      storeAvatarText: 'EO',
      storeAvatarTone: 'linear-gradient(135deg, #072a17 0%, #0d4024 100%)',
      views: '1,458',
      clicks: '700',
      messages: '45',
      calls: '45',
      activeUntil: '12 May, 2026',
      status: 'active',
      category: 'promoted listings',
    },
    {
      id: 'ad-3',
      title: 'Nike sneaker',
      thumbnail: '/assets/images/product_sneakers_lifestyle.png',
      storeOrUser: 'Amazing Fragrances',
      storeAvatarText: 'AF',
      storeAvatarTone: 'linear-gradient(135deg, #f8b400 0%, #ffcf3f 100%)',
      views: '1,458',
      clicks: '700',
      messages: '45',
      calls: '45',
      activeUntil: '12 May, 2026',
      status: 'active',
      category: 'promoted listings',
    },
    {
      id: 'ad-4',
      title: 'Bone straight wig',
      thumbnail: '/assets/images/fashion_menswear_hero.png',
      storeOrUser: 'Bryan Ojede',
      storeAvatarText: 'BO',
      storeAvatarTone: 'linear-gradient(135deg, #d5614a 0%, #8b4336 100%)',
      views: '1,458',
      clicks: '700',
      messages: '45',
      calls: '45',
      activeUntil: '12 May, 2026',
      status: 'paused',
      category: 'promoted listings',
    },
    {
      id: 'ad-5',
      title: 'Maserati',
      thumbnail: '/assets/images/product_sneakers.png',
      storeOrUser: 'Eden Organics',
      storeAvatarText: 'EO',
      storeAvatarTone: 'linear-gradient(135deg, #072a17 0%, #0d4024 100%)',
      views: '1,458',
      clicks: '500',
      messages: '45',
      calls: '45',
      activeUntil: '12 May, 2026',
      status: 'active',
      category: 'promoted listings',
    },
    {
      id: 'ad-6',
      title: 'RGB keyboard',
      thumbnail: '/assets/images/product_keyboard_rgb.png',
      storeOrUser: 'Bryan Ojede',
      storeAvatarText: 'BO',
      storeAvatarTone: 'linear-gradient(135deg, #d5614a 0%, #8b4336 100%)',
      views: '1,458',
      clicks: '500',
      messages: '45',
      calls: '45',
      activeUntil: '12 May, 2026',
      status: 'paused',
      category: 'promoted listings',
    },
    {
      id: 'ad-7',
      title: 'Sweatshirt',
      thumbnail: '/assets/images/fashion_menswear_hero.png',
      storeOrUser: 'The Vine Collections',
      storeAvatarText: 'VC',
      storeAvatarTone: 'linear-gradient(135deg, #48836a 0%, #5f9c83 100%)',
      views: '1,458',
      clicks: '500',
      messages: '45',
      calls: '45',
      activeUntil: '12 May, 2026',
      status: 'active',
      category: 'promoted listings',
    },
    {
      id: 'ad-8',
      title: 'Vine flagship store',
      thumbnail: '/assets/images/product_sneakers_lifestyle.png',
      storeOrUser: 'The Vine Collections',
      storeAvatarText: 'VC',
      storeAvatarTone: 'linear-gradient(135deg, #48836a 0%, #5f9c83 100%)',
      subtitle: 'Ikeja, Lagos',
      ownerName: 'Amdechi Justina',
      ownerAvatarImage: '/assets/images/fashion_menswear_hero.png',
      products: '41',
      views: '1,210',
      clicks: '310',
      messages: '18',
      calls: '9',
      activeUntil: '19 May, 2026',
      status: 'active',
      category: 'store promotions',
    },
    {
      id: 'ad-9',
      title: 'Eden Organics store push',
      thumbnail: '/assets/images/product_keyboard_rgb.png',
      storeOrUser: 'Eden Organics',
      storeAvatarText: 'EO',
      storeAvatarTone: 'linear-gradient(135deg, #072a17 0%, #0d4024 100%)',
      subtitle: 'Warri, Delta',
      ownerName: 'David Akins',
      ownerAvatarImage: '/assets/images/fashion_menswear_hero.png',
      products: '41',
      views: '1,458',
      clicks: '500',
      messages: '14',
      calls: '8',
      activeUntil: '20 May, 2026',
      status: 'active',
      category: 'store promotions',
    },
    {
      id: 'ad-10',
      title: 'Amazing Fragrances store feature',
      thumbnail: '/assets/images/product_sneakers_lifestyle.png',
      storeOrUser: 'Amazing Fragrances',
      storeAvatarText: 'AF',
      storeAvatarTone: 'linear-gradient(135deg, #f8b400 0%, #ffcf3f 100%)',
      subtitle: 'Wue 2, Abuja',
      ownerName: 'Amdechi Justina',
      ownerAvatarImage: '/assets/images/fashion_menswear_hero.png',
      products: '41',
      views: '1,458',
      clicks: '500',
      messages: '16',
      calls: '10',
      activeUntil: '12 May, 2026',
      status: 'active',
      category: 'store promotions',
    },
    {
      id: 'ad-11',
      title: 'Vine spotlight store',
      thumbnail: '/assets/images/product_sneakers_lifestyle.png',
      storeOrUser: 'The Vine Collections',
      storeAvatarText: 'VC',
      storeAvatarTone: 'linear-gradient(135deg, #48836a 0%, #5f9c83 100%)',
      subtitle: 'Ikeja, Lagos',
      ownerName: 'David Akins',
      ownerAvatarImage: '/assets/images/fashion_menswear_hero.png',
      products: '41',
      views: '1,458',
      clicks: '500',
      messages: '20',
      calls: '11',
      activeUntil: '12 May, 2026',
      status: 'paused',
      category: 'store promotions',
    },
    {
      id: 'ad-12',
      title: 'Eden homepage store boost',
      thumbnail: '/assets/images/product_keyboard_rgb.png',
      storeOrUser: 'Eden Organics',
      storeAvatarText: 'EO',
      storeAvatarTone: 'linear-gradient(135deg, #072a17 0%, #0d4024 100%)',
      subtitle: 'Warri, Delta',
      ownerName: 'Amdechi Justina',
      ownerAvatarImage: '/assets/images/fashion_menswear_hero.png',
      products: '41',
      views: '1,458',
      clicks: '500',
      messages: '12',
      calls: '8',
      activeUntil: '12 May, 2026',
      status: 'active',
      category: 'store promotions',
    },
    {
      id: 'ad-13',
      title: 'Mega gadget banner',
      thumbnail: '/assets/images/product_watch_luxury.png',
      bannerBadgeLabel: 'Sponsored',
      storeOrUser: 'Tech Avenue',
      storeAvatarText: 'TA',
      storeAvatarTone: 'linear-gradient(135deg, #3558d8 0%, #5d7bff 100%)',
      views: '1K',
      clicks: '500',
      messages: '65',
      calls: '20',
      activeUntil: '24 May, 2025',
      status: 'active',
      category: 'banner ads',
    },
    {
      id: 'ad-14',
      title: 'Weekend sneaker banner',
      thumbnail: '/assets/images/product_sneakers_lifestyle.png',
      bannerBadgeLabel: 'Sponsored',
      storeOrUser: 'Sneaker Plug',
      storeAvatarText: 'SP',
      storeAvatarTone: 'linear-gradient(135deg, #ff7a00 0%, #ffb347 100%)',
      views: '1K',
      clicks: '500',
      messages: '40',
      calls: '15',
      activeUntil: '24 May, 2025',
      status: 'paused',
      category: 'banner ads',
    },
    {
      id: 'ad-15',
      title: 'Bryan beauty banner',
      thumbnail: '/assets/images/fashion_menswear_hero.png',
      bannerBadgeLabel: 'Sponsored',
      storeOrUser: 'Bryan Ojede',
      storeAvatarText: 'BO',
      storeAvatarTone: 'linear-gradient(135deg, #d5614a 0%, #8b4336 100%)',
      views: '1K',
      clicks: '500',
      messages: '32',
      calls: '12',
      activeUntil: '24 May, 2025',
      status: 'active',
      category: 'banner ads',
    },
    {
      id: 'ad-16',
      title: 'Summer tech deals banner',
      thumbnail: '/assets/images/product_watch_luxury.png',
      bannerBadgeLabel: 'Sponsored',
      storeOrUser: 'Device Hub',
      storeAvatarText: 'DH',
      storeAvatarTone: 'linear-gradient(135deg, #2c79ff 0%, #54a0ff 100%)',
      views: '1K',
      clicks: '500',
      messages: '28',
      calls: '11',
      activeUntil: '24 May, 2025',
      status: 'active',
      category: 'banner ads',
    },
    {
      id: 'ad-17',
      title: 'Beauty essentials banner',
      thumbnail: '/assets/images/fashion_menswear_hero.png',
      bannerBadgeLabel: 'Sponsored',
      storeOrUser: 'Glow Market',
      storeAvatarText: 'GM',
      storeAvatarTone: 'linear-gradient(135deg, #ff7b72 0%, #ffb199 100%)',
      views: '1K',
      clicks: '500',
      messages: '26',
      calls: '9',
      activeUntil: '24 May, 2025',
      status: 'active',
      category: 'banner ads',
    },
    {
      id: 'ad-18',
      title: 'Home lifestyle banner',
      thumbnail: '/assets/images/product_sneakers_lifestyle.png',
      bannerBadgeLabel: 'Sponsored',
      storeOrUser: 'Casa Living',
      storeAvatarText: 'CL',
      storeAvatarTone: 'linear-gradient(135deg, #7d6bff 0%, #9f8bff 100%)',
      views: '1K',
      clicks: '500',
      messages: '31',
      calls: '14',
      activeUntil: '24 May, 2025',
      status: 'active',
      category: 'banner ads',
    },
  ]);

  readonly filteredAds = computed(() => {
    const category = this.activeCategory();
    const chip = this.activeFilterChip();
    const query = this.searchQuery().trim().toLowerCase();

    return this.runningAds().filter((record) => {
      const categoryMatch = record.category === category;
      const statusMatch = chip === 'all' || record.status === chip;
      const queryMatch =
        query === ''
        || record.title.toLowerCase().includes(query)
        || record.storeOrUser.toLowerCase().includes(query);

      return categoryMatch && statusMatch && queryMatch;
    });
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filteredAds().length / this.pageSize)));

  readonly paginatedAds = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredAds().slice(start, start + this.pageSize);
  });

  countByFilterChip(chip: FilterChip): number {
    return this.runningAds().filter((record) => {
      const categoryMatch = record.category === this.activeCategory();
      const statusMatch = chip === 'all' || record.status === chip;
      return categoryMatch && statusMatch;
    }).length;
  }

  readonly visibleFilterChips = computed(() =>
    this.activeCategory() === 'banner ads'
      ? this.filterChips.filter((chip) => chip.id !== 'all')
      : this.filterChips
  );

  setActiveCategory(category: AdsCategory): void {
    this.activeCategory.set(category);
    this.activeFilterChip.set(category === 'banner ads' ? 'active' : 'all');
    this.currentPage.set(1);
  }

  updateSearchQuery(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.currentPage.set(1);
  }

  goToPreviousPage(): void {
    this.currentPage.update((page) => Math.max(1, page - 1));
  }

  goToNextPage(): void {
    this.currentPage.update((page) => Math.min(this.totalPages(), page + 1));
  }
}
