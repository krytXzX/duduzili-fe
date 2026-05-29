import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgOptimizedImage } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { switchMap } from 'rxjs';
import { CustomDropdownComponent, type CustomDropdownOption } from '../../components/ui/custom-dropdown.component';
import {
  AdminRunningAdsCounts,
  AdminRunningAdsRecord,
  AdminRunningAdsService,
  AdminRunningAdsType,
} from '../../services/admin-running-ads.service';
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

const EMPTY_COUNTS: AdminRunningAdsCounts = {
  listing: { all: 0, active: 0, paused: 0 },
  store: { all: 0, active: 0, paused: 0 },
  banner: { all: 0, active: 0, paused: 0 },
};

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
                      [src]="record.thumbnail"
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
                          [src]="record.thumbnail"
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
                          [src]="record.ownerAvatarImage || ownerAvatarFallback"
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
                    [src]="record.thumbnail || mobileBannerPreviewImage"
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
                        [src]="record.thumbnail"
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
                              [src]="record.ownerAvatarImage || record.thumbnail"
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
                            [src]="record.thumbnail"
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
  private readonly adminRunningAdsService = inject(AdminRunningAdsService);
  private readonly destroyRef = inject(DestroyRef);

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
  readonly isLoading = signal(true);
  readonly loadFailed = signal(false);
  readonly totalResults = signal(0);
  readonly hasNextPage = signal(false);
  readonly hasPreviousPage = signal(false);
  readonly pageSize = 5;
  readonly counts = signal<AdminRunningAdsCounts>(EMPTY_COUNTS);
  readonly runningAds = signal<RunningAdsRecord[]>([]);
  readonly statusDropdownOptions: readonly CustomDropdownOption<'all' | AdStatus>[] = [
    { value: 'all', label: 'All statuses' },
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
  ];

  readonly storeFilterOptions = computed<readonly CustomDropdownOption<RunningAdsStoreFilter>[]>(() => {
    const uniqueStores = [...new Set(
      this.runningAds()
        .map((record) => record.storeOrUser),
    )];

    return [
      { value: 'all', label: 'All stores' },
      ...uniqueStores.map((store) => ({ value: store, label: store })),
    ];
  });

  readonly activeUntilFilterOptions = computed<readonly CustomDropdownOption<RunningAdsActiveUntilFilter>[]>(() => {
    const uniqueDates = [...new Set(
      this.runningAds().map((record) => record.activeUntil),
    )];

    return [
      { value: 'all', label: 'All dates' },
      ...uniqueDates
        .map((date) => {
          const dateKey = this.toIsoDateKey(date);
          return dateKey ? { value: dateKey, label: date } : null;
        })
        .filter((option): option is CustomDropdownOption<RunningAdsActiveUntilFilter> => option !== null),
    ];
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalResults() / this.pageSize)));
  readonly paginatedAds = computed(() => this.runningAds());
  private readonly query = computed(() => ({
    page: this.currentPage(),
    ad_type: this.categoryToApiType(this.activeCategory()),
    status: this.effectiveStatusFilter(),
    search: this.searchQuery().trim(),
    vendor_name: this.storeFilter() === 'all' ? undefined : this.storeFilter(),
    end_date: this.activeUntilFilter() === 'all' ? undefined : this.activeUntilFilter(),
  }));

  countByFilterChip(chip: FilterChip): number {
    const categoryCounts = this.counts()[this.categoryToApiType(this.activeCategory())];
    if (chip === 'all') {
      return categoryCounts.all;
    }
    return categoryCounts[chip];
  }

  readonly visibleFilterChips = computed(() =>
    this.activeCategory() === 'banner ads'
      ? this.filterChips.filter((chip) => chip.id !== 'all')
      : this.filterChips
  );

  constructor() {
    toObservable(this.query)
      .pipe(
        switchMap((query) => {
          this.isLoading.set(true);
          this.loadFailed.set(false);
          return this.adminRunningAdsService.getRunningAds(query);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.runningAds.set(response.results.map((record) => this.mapRecord(record)));
          this.counts.set(response.counts);
          this.totalResults.set(response.count);
          this.hasNextPage.set(Boolean(response.next));
          this.hasPreviousPage.set(Boolean(response.previous));
          this.isLoading.set(false);
        },
        error: () => {
          this.runningAds.set([]);
          this.totalResults.set(0);
          this.hasNextPage.set(false);
          this.hasPreviousPage.set(false);
          this.isLoading.set(false);
          this.loadFailed.set(true);
        },
      });
  }

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

  private effectiveStatusFilter(): AdStatus | undefined {
    const chip = this.activeFilterChip();
    const dropdownStatus = this.statusDropdownFilter();
    if (this.activeCategory() === 'banner ads') {
      return chip === 'active' || chip === 'paused' ? chip : undefined;
    }
    if (dropdownStatus === 'active' || dropdownStatus === 'paused') {
      return dropdownStatus;
    }
    return chip === 'active' || chip === 'paused' ? chip : undefined;
  }

  private categoryToApiType(category: AdsCategory): AdminRunningAdsType {
    switch (category) {
      case 'promoted listings':
        return 'listing';
      case 'store promotions':
        return 'store';
      case 'banner ads':
        return 'banner';
    }
  }

  private mapRecord(record: AdminRunningAdsRecord): RunningAdsRecord {
    const category = this.apiTypeToCategory(record.ad_type);
    const storeOrUser = this.resolvePrimaryLabel(record, category);
    const ownerName = category === 'store promotions'
      ? record.promoted_store_owner_name || record.vendor_name
      : undefined;

    return {
      id: String(record.id),
      title: record.promoted_listing_title || record.title,
      thumbnail: record.image || this.mobileBannerPreviewImage,
      bannerBadgeLabel: category === 'banner ads' ? 'Sponsored' : undefined,
      storeOrUser,
      storeAvatarText: this.initialsForLabel(storeOrUser),
      storeAvatarTone: this.avatarToneForLabel(storeOrUser),
      subtitle: category === 'store promotions' ? (record.promoted_store_location || record.vendor_location || '') : undefined,
      ownerName,
      ownerAvatarImage: category === 'store promotions'
        ? (record.promoted_store_owner_avatar || record.vendor_avatar || undefined)
        : undefined,
      products: category === 'store promotions'
        ? String(record.promoted_store_product_count || record.vendor_product_count || 0)
        : undefined,
      views: this.formatMetric(record.total_views),
      clicks: this.formatMetric(record.total_clicks),
      messages: '0',
      calls: '0',
      activeUntil: this.formatDateLabel(record.end_date),
      status: record.status,
      category,
    };
  }

  private apiTypeToCategory(type: AdminRunningAdsType): AdsCategory {
    switch (type) {
      case 'listing':
        return 'promoted listings';
      case 'store':
        return 'store promotions';
      case 'banner':
        return 'banner ads';
    }
  }

  private resolvePrimaryLabel(record: AdminRunningAdsRecord, category: AdsCategory): string {
    if (category === 'store promotions') {
      return record.promoted_store_name || record.vendor_name;
    }
    return record.vendor_name;
  }

  private formatMetric(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
  }

  private formatDateLabel(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  }

  private toIsoDateKey(value: string): string | null {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return date.toISOString().slice(0, 10);
  }

  private initialsForLabel(label: string): string {
    const parts = label.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      return 'AD';
    }
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }

  private avatarToneForLabel(label: string): string {
    const tones = [
      'linear-gradient(135deg, #48836a 0%, #5f9c83 100%)',
      'linear-gradient(135deg, #072a17 0%, #0d4024 100%)',
      'linear-gradient(135deg, #f8b400 0%, #ffcf3f 100%)',
      'linear-gradient(135deg, #d5614a 0%, #8b4336 100%)',
      'linear-gradient(135deg, #3558d8 0%, #5d7bff 100%)',
      'linear-gradient(135deg, #7d6bff 0%, #9f8bff 100%)',
    ];
    const hash = [...label].reduce((total, char) => total + char.charCodeAt(0), 0);
    return tones[hash % tones.length] ?? tones[0];
  }
}
