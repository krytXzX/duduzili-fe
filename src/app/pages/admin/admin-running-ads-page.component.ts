import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { CustomDropdownComponent, type CustomDropdownOption } from '../../components/ui/custom-dropdown.component';
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
type RunningAdsStoreFilter = 'all' | string;
type RunningAdsActiveUntilFilter = 'all' | string;

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
  imports: [NgIcon, NgOptimizedImage, CustomDropdownComponent],
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

      <div class="px-4 pb-6 pt-5 md:hidden">
        <div class="border-b border-[#efefef]">
          <div class="flex items-center gap-4 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            @for (tab of categoryTabs; track tab.id) {
              <button
                type="button"
                (click)="setActiveCategory(tab.id)"
                [attr.aria-pressed]="activeCategory() === tab.id"
                class="flex shrink-0 items-center gap-2 border-b-2 px-1 pb-3 pt-2 text-[15px] font-medium transition-colors"
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

        <div class="mt-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          @for (chip of visibleFilterChips(); track chip.id) {
            <button
              type="button"
              (click)="activeFilterChip.set(chip.id); currentPage.set(1)"
              class="shrink-0 rounded-full px-4 py-2 text-[14px] font-medium transition-colors"
              [class.bg-[#1f1f1f]]="activeFilterChip() === chip.id"
              [class.text-white]="activeFilterChip() === chip.id"
              [class.bg-[#f3f3f3]]="activeFilterChip() !== chip.id"
              [class.text-[#222222]]="activeFilterChip() !== chip.id"
            >
              {{ chip.label }} ({{ countByFilterChip(chip.id) }})
            </button>
          }
        </div>

        @if (activeCategory() === 'promoted listings') {
          <div class="mt-4 flex items-center gap-2">
            <label class="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-full bg-[#fafafa] px-4 text-[#9c9c9c]">
              <ng-icon name="heroMagnifyingGlass" class="text-[16px]"></ng-icon>
              <input
                type="search"
                [value]="searchQuery()"
                (input)="updateSearchQuery($event)"
                placeholder="Search"
                class="min-w-0 flex-1 bg-transparent text-[14px] text-[#202020] outline-none placeholder:text-[#9c9c9c]"
              >
            </label>

            <button
              type="button"
              class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#ececec] bg-white"
              aria-label="Filter listings"
            >
              <img [ngSrc]="mobileFilterIcon" alt="" width="18" height="18" class="h-[18px] w-[18px]">
            </button>
          </div>

          <div class="mt-5 space-y-3">
            @for (record of paginatedAds(); track record.id) {
              <article class="rounded-[14px] border border-[#e9e9e9] bg-white p-3">
                <div class="flex items-start gap-3">
                  <div class="h-11 w-11 shrink-0 overflow-hidden rounded-[10px] bg-[#f3f3f3]">
                    <img
                      [ngSrc]="record.thumbnail"
                      [alt]="record.title"
                      width="44"
                      height="44"
                      class="h-11 w-11 object-cover"
                    >
                  </div>

                  <div class="min-w-0 flex-1">
                    <div class="flex items-start justify-between gap-2">
                      <p class="truncate text-[14px] font-medium text-[#1f1f1f]">{{ record.title }}</p>
                      <span
                        class="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-medium"
                        [class.bg-[#e8f9ec]]="record.status === 'active'"
                        [class.text-[#21a63a]]="record.status === 'active'"
                        [class.bg-[#e9f1ff]]="record.status === 'paused'"
                        [class.text-[#3875e8]]="record.status === 'paused'"
                      >
                        <ng-icon
                          [name]="record.status === 'active' ? 'heroCheckCircle' : 'heroPauseCircle'"
                          class="text-[14px]"
                        ></ng-icon>
                        {{ record.status === 'active' ? 'Active' : 'Paused' }}
                      </span>
                    </div>

                    <div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[#8f8f8f]">
                      <span class="inline-flex items-center gap-1">
                        <img [ngSrc]="metricViewIcon" alt="" width="12" height="12" class="h-3 w-3">
                        {{ record.views }}
                      </span>
                      <span class="inline-flex items-center gap-1">
                        <img [ngSrc]="metricClickIcon" alt="" width="12" height="12" class="h-3 w-3">
                        {{ record.clicks }}
                      </span>
                      <span class="inline-flex items-center gap-1">
                        <img [ngSrc]="metricMessageIcon" alt="" width="12" height="12" class="h-3 w-3">
                        {{ record.messages }}
                      </span>
                      <span class="inline-flex items-center gap-1">
                        <img [ngSrc]="metricCallIcon" alt="" width="12" height="12" class="h-3 w-3">
                        {{ record.calls }}
                      </span>
                    </div>

                    <p class="mt-2 text-[12px] text-[#8f8f8f]">
                      Store/User:
                      <span class="font-medium text-[#383838]">{{ record.storeOrUser }}</span>
                    </p>
                    <p class="mt-1 text-[12px] text-[#8f8f8f]">
                      Active until:
                      <span class="font-medium text-[#383838]">{{ record.activeUntil }}</span>
                    </p>
                  </div>
                </div>
              </article>
            }
          </div>
        } @else if (activeCategory() === 'store promotions') {
          <div class="mt-4 flex items-center gap-2">
            <label class="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-full bg-[#fafafa] px-4 text-[#9c9c9c]">
              <ng-icon name="heroMagnifyingGlass" class="text-[16px]"></ng-icon>
              <input
                type="search"
                [value]="searchQuery()"
                (input)="updateSearchQuery($event)"
                placeholder="Search"
                class="min-w-0 flex-1 bg-transparent text-[14px] text-[#202020] outline-none placeholder:text-[#9c9c9c]"
              >
            </label>

            <button
              type="button"
              class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#ececec] bg-white"
              aria-label="Filter stores"
            >
              <img [ngSrc]="mobileFilterIcon" alt="" width="18" height="18" class="h-[18px] w-[18px]">
            </button>
          </div>

          <div class="mt-4">
            @for (record of paginatedAds(); track record.id) {
              <article class="border-b border-[#ebebeb] py-3">
                <div class="flex items-start justify-between gap-3">
                  <div class="flex min-w-0 items-center gap-3">
                    <div class="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-[#3d785f]">
                      <img
                        [ngSrc]="record.thumbnail"
                        [alt]="record.storeOrUser"
                        width="44"
                        height="44"
                        class="h-11 w-11 object-cover"
                      >
                    </div>

                    <div class="min-w-0">
                      <p class="truncate text-[16px] font-medium leading-6 text-[rgba(13,13,13,0.8)]">
                        {{ record.storeOrUser }}
                      </p>
                      <div class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-[#1a1b1d]">
                        <span class="inline-flex items-center gap-1">
                          <img [ngSrc]="metricBoxIcon" alt="" width="12" height="12" class="h-3 w-3">
                          {{ record.products || '12' }}
                        </span>
                        <span class="inline-flex items-center gap-1">
                          <img [ngSrc]="metricViewIcon" alt="" width="12" height="12" class="h-3 w-3">
                          {{ record.views }}
                        </span>
                        <span class="inline-flex items-center gap-1">
                          <img [ngSrc]="metricClickIcon" alt="" width="12" height="12" class="h-3 w-3">
                          {{ record.clicks }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span
                    class="inline-flex shrink-0 items-center gap-1 rounded-[8px] px-2 py-1 text-[12px] font-semibold"
                    [class.bg-[#f3fbf9]]="record.status === 'active'"
                    [class.text-[#25ad32]]="record.status === 'active'"
                    [class.bg-[#edf4ff]]="record.status === 'paused'"
                    [class.text-[#4787fe]]="record.status === 'paused'"
                  >
                    <img
                      [ngSrc]="record.status === 'active' ? statusActiveIcon : statusPausedIcon"
                      alt=""
                      width="14"
                      height="14"
                      class="h-[14px] w-[14px]"
                    >
                    {{ record.status === 'active' ? 'Active' : 'Paused' }}
                  </span>
                </div>

                <div class="mt-3 space-y-2">
                  <div class="flex items-center justify-between gap-2">
                    <p class="text-[14px] text-[rgba(26,27,29,0.5)]">Owner</p>
                    <div class="flex min-w-0 items-center gap-2">
                      <div class="h-6 w-6 shrink-0 overflow-hidden rounded-full bg-[#ececec]">
                        <img
                          [ngSrc]="record.ownerAvatarImage || ownerAvatarFallback"
                          [alt]="record.ownerName || 'Owner avatar'"
                          width="24"
                          height="24"
                          class="h-6 w-6 object-cover"
                        >
                      </div>
                      <p class="truncate text-[14px] font-medium text-[#0d0d0d]">
                        {{ record.ownerName || 'Mark Anthony' }}
                      </p>
                    </div>
                  </div>

                  <div class="flex items-center justify-between gap-2">
                    <p class="text-[14px] text-[rgba(26,27,29,0.5)]">Active until</p>
                    <p class="text-[14px] font-medium text-[#1a1b1d]">{{ record.activeUntil }}</p>
                  </div>
                </div>
              </article>
            }
          </div>
        } @else if (activeCategory() === 'banner ads') {
          <div class="mt-4 space-y-4">
            @for (record of paginatedAds(); track record.id; let index = $index) {
              <article class="overflow-hidden rounded-[21px] border border-[#eaeaea] bg-white p-[3px]">
                <div class="relative h-[193px] overflow-hidden rounded-[20px]">
                  <img
                    [ngSrc]="mobileBannerPreviewImage"
                    [alt]="record.title"
                    width="343"
                    height="193"
                    class="h-full w-full object-cover"
                  >

                  <div class="absolute left-2 top-2 rounded-[8px] bg-[#f1ffac] px-[6px] py-[2px] text-[12px] font-medium leading-4 text-[#4e3e07]">
                    Active until: {{ record.activeUntil }}
                  </div>

                  @if ((record.bannerBadgeLabel || 'Sponsored') && index > 0) {
                    <div class="absolute bottom-2 left-4 rounded-full bg-black/55 px-2 py-1 text-[12px] font-medium leading-4 text-white">
                      {{ record.bannerBadgeLabel || 'Sponsored' }}
                    </div>
                  }
                </div>

                <div class="flex items-center gap-3 px-4 py-2 text-[14px] text-[#959595]">
                  <span class="inline-flex items-center gap-1">
                    <img [ngSrc]="metricViewIcon" alt="" width="14" height="14" class="h-[14px] w-[14px]">
                    {{ record.views }}
                  </span>
                  <span class="inline-flex items-center gap-1">
                    <img [ngSrc]="metricClickIcon" alt="" width="14" height="14" class="h-[14px] w-[14px]">
                    {{ record.clicks }}
                  </span>
                </div>
              </article>
            }
          </div>
        }
      </div>

      <div class="hidden px-4 py-6 sm:px-6 lg:px-8 md:block">
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
              <app-custom-dropdown
                [options]="storeFilterOptions()"
                [value]="storeFilter()"
                ariaLabel="Select store filter"
                buttonClass="inline-flex h-10 items-center gap-2 rounded-full border border-[#e8e8e8] bg-white px-4 text-[14px] text-[#8a8a8a]"
                iconClass="text-[#8a8a8a]"
                menuClass="min-w-[210px]"
                (valueChange)="storeFilter.set($event); currentPage.set(1)"
              ></app-custom-dropdown>

              <app-custom-dropdown
                [options]="statusDropdownOptions"
                [value]="statusDropdownFilter()"
                ariaLabel="Select status filter"
                buttonClass="inline-flex h-10 items-center gap-2 rounded-full border border-[#e8e8e8] bg-white px-4 text-[14px] text-[#8a8a8a]"
                iconClass="text-[#8a8a8a]"
                menuClass="min-w-[160px]"
                (valueChange)="statusDropdownFilter.set($event); currentPage.set(1)"
              ></app-custom-dropdown>

              <app-custom-dropdown
                [options]="activeUntilFilterOptions()"
                [value]="activeUntilFilter()"
                ariaLabel="Select active until filter"
                buttonClass="inline-flex h-10 items-center gap-2 rounded-full border border-[#e8e8e8] bg-white px-4 text-[14px] text-[#8a8a8a]"
                iconClass="text-[#8a8a8a]"
                menuClass="min-w-[170px]"
                (valueChange)="activeUntilFilter.set($event); currentPage.set(1)"
              ></app-custom-dropdown>
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
  readonly mobileFilterIcon = '/assets/icons/admin-users/filter-tuning.svg';
  readonly statusActiveIcon = '/assets/icons/admin-users/tick-circle.svg';
  readonly statusPausedIcon = '/assets/icons/banner-status-paused.svg';
  readonly metricViewIcon = '/assets/icons/running-ads-eye.svg';
  readonly metricClickIcon = '/assets/icons/running-ads-click.svg';
  readonly metricMessageIcon = '/assets/icons/running-ads-messages.svg';
  readonly metricCallIcon = '/assets/icons/running-ads-call.svg';
  readonly metricBoxIcon = '/assets/icons/admin-user-details/box.svg';
  readonly ownerAvatarFallback = '/assets/images/admin-listing-details/reports/desktop/mark-anthony.png';
  readonly mobileBannerPreviewImage = '/assets/images/admin-user-details/ads/mobile-banner-ads/super-shopping-day.png';

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
  readonly storeFilter = signal<RunningAdsStoreFilter>('all');
  readonly statusDropdownFilter = signal<'all' | AdStatus>('all');
  readonly activeUntilFilter = signal<RunningAdsActiveUntilFilter>('all');
  readonly searchQuery = signal('');
  readonly currentPage = signal(1);
  readonly pageSize = 5;
  readonly statusDropdownOptions: readonly CustomDropdownOption<'all' | AdStatus>[] = [
    { value: 'all', label: 'Status' },
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
  ];

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

  readonly storeFilterOptions = computed<readonly CustomDropdownOption<RunningAdsStoreFilter>[]>(() => {
    const uniqueStores = [...new Set(
      this.runningAds()
        .filter((record) => record.category === this.activeCategory())
        .map((record) => record.storeOrUser),
    )];

    return [
      { value: 'all', label: 'Store' },
      ...uniqueStores.map((store) => ({ value: store, label: store })),
    ];
  });

  readonly activeUntilFilterOptions = computed<readonly CustomDropdownOption<RunningAdsActiveUntilFilter>[]>(() => {
    const uniqueDates = [...new Set(
      this.runningAds()
        .filter((record) => record.category === this.activeCategory())
        .map((record) => record.activeUntil),
    )];

    return [
      { value: 'all', label: 'Active until' },
      ...uniqueDates.map((date) => ({ value: date, label: date })),
    ];
  });

  readonly filteredAds = computed(() => {
    const category = this.activeCategory();
    const chip = this.activeFilterChip();
    const query = this.searchQuery().trim().toLowerCase();
    const store = this.storeFilter();
    const dropdownStatus = this.statusDropdownFilter();
    const activeUntil = this.activeUntilFilter();

    return this.runningAds().filter((record) => {
      const categoryMatch = record.category === category;
      const statusMatch = chip === 'all' || record.status === chip;
      const dropdownStatusMatch = dropdownStatus === 'all' || record.status === dropdownStatus;
      const storeMatch = store === 'all' || record.storeOrUser === store;
      const activeUntilMatch = activeUntil === 'all' || record.activeUntil === activeUntil;
      const queryMatch =
        query === ''
        || record.title.toLowerCase().includes(query)
        || record.storeOrUser.toLowerCase().includes(query);

      return categoryMatch && statusMatch && dropdownStatusMatch && storeMatch && activeUntilMatch && queryMatch;
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
    this.storeFilter.set('all');
    this.statusDropdownFilter.set('all');
    this.activeUntilFilter.set('all');
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
