import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

type AdminListingsStatus = 'available' | 'sold' | 'paused' | 'suspended';
type AdminListingsCategory =
  | 'all'
  | 'phones-laptops'
  | 'electronics'
  | 'mens-fashion'
  | 'womens-fashion'
  | 'automobiles';
type AdminListingsStore =
  | 'all'
  | 'vine'
  | 'eden'
  | 'amazing'
  | 'personal'
  | 'ifeanyi'
  | 'abogu';

type AdminListingsSummaryFilter = 'all' | 'available' | 'sold' | 'paused' | 'suspended';

interface AdminListingRecord {
  id: string;
  name: string;
  thumbnail: string;
  categoryKey: Exclude<AdminListingsCategory, 'all'>;
  categoryLabel: string;
  priceWhole: string;
  priceDecimal: string;
  storeKey: Exclude<AdminListingsStore, 'all'>;
  storeName: string;
  storeAvatar?: string;
  status: AdminListingsStatus;
  boosted: boolean;
}

@Component({
  selector: 'app-admin-listings-page',
  imports: [NgOptimizedImage],
  host: { class: 'block h-full' },
  template: `
    <section class="flex h-full flex-col bg-white lg:hidden">
      <div class="px-5 pb-[120px] pt-6">
        <h1 class="text-[24px] font-semibold leading-8 text-[#1A1B1D]">Listings</h1>

        <div class="mt-6 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          @for (card of mobileSummaryCards; track card.label) {
            <button
              type="button"
              (click)="setSummaryFilter(card.value)"
              class="h-[75px] min-w-[152px] rounded-[10px] border px-[10px] text-left transition"
              [class.border-[1.5px]]="summaryStatusFilter() === card.value"
              [class.border-[#6453D9]]="summaryStatusFilter() === card.value"
              [class.bg-[#6453D9]/[0.05]]="summaryStatusFilter() === card.value"
              [class.border-transparent]="summaryStatusFilter() !== card.value"
              [class.bg-[#FAFAFA]]="summaryStatusFilter() !== card.value"
            >
              <p class="text-[12px] leading-none text-[#1A1B1D]/50">{{ card.label }}</p>
              <p class="mt-4 text-[20px] font-semibold leading-none text-[#1A1B1D]" [class.text-[#1A1B1D]/50]="summaryStatusFilter() !== card.value">
                {{ card.amount }}
              </p>
            </button>
          }
        </div>

        <div class="mt-6 flex items-center gap-3">
          <label class="relative block min-w-0 flex-1">
            <img
              ngSrc="/assets/icons/admin-listings/search.svg"
              width="16"
              height="16"
              alt=""
              class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              type="text"
              [value]="searchQuery()"
              (input)="updateSearchQuery($any($event.target).value)"
              placeholder="Search"
              class="h-10 w-full rounded-full bg-[#FAFAFA] py-2 pl-10 pr-4 text-[14px] text-[#1A1B1D] outline-none placeholder:text-[#777777] focus:ring-2 focus:ring-[#6453D9]/10"
            >
          </label>

          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-full bg-white"
            aria-label="Filter listings"
          >
            <img ngSrc="/assets/icons/admin-listings/filter.svg" width="24" height="24" alt="" class="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <div class="mt-4 flex flex-col gap-0">
          @for (listing of visibleMobileListings(); track listing.id) {
            <article class="border-b border-[#EBEBEB] py-3" (click)="openListing(listing.id)">
              <div class="flex items-start justify-between gap-3">
                <div class="flex min-w-0 items-center gap-3">
                  <div class="h-11 w-11 shrink-0 overflow-hidden rounded-[6.6px] border border-[#F0F0F0] bg-[#EFEFEF]">
                    <img [ngSrc]="listing.thumbnail" [alt]="listing.name" width="44" height="44" class="h-11 w-11 object-cover" />
                  </div>

                  <div class="min-w-0">
                    <h2 class="truncate text-[16px] font-medium leading-6 text-[#0D0D0D]/80">{{ listing.name }}</h2>
                    @if (listing.boosted) {
                      <div class="mt-1 inline-flex items-center gap-1 text-[12px] leading-4 text-[#7F8081]">
                        <span class="text-[#1A1B1D]">🚀</span>
                        <span>Promoted</span>
                      </div>
                    }
                  </div>
                </div>

                <span
                  class="inline-flex h-6 shrink-0 items-center gap-1 rounded-lg px-2 text-[12px] font-semibold leading-4"
                  [class.bg-[#F9F9F9]]="listing.status === 'available'"
                  [class.text-[#EE9C2E]]="listing.status === 'available'"
                  [class.bg-[#F3FBF9]]="listing.status === 'sold'"
                  [class.text-[#25AD32]]="listing.status === 'sold'"
                  [class.bg-[#EEF4FF]]="listing.status === 'paused'"
                  [class.text-[#4787FE]]="listing.status === 'paused'"
                  [class.bg-[#FDF6FA]]="listing.status === 'suspended'"
                  [class.text-[#FF2524]]="listing.status === 'suspended'"
                >
                  <img [ngSrc]="statusIcon(listing.status)" width="14" height="14" alt="" class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {{ statusText(listing.status) }}
                </span>
              </div>

              <dl class="mt-4 flex flex-col gap-3">
                <div class="flex items-center justify-between gap-4">
                  <dt class="text-[14px] leading-5 text-[#1A1B1D]/50">Store</dt>
                  <dd class="text-right text-[14px] font-medium leading-5 text-[#1A1B1D]">{{ listing.storeName }}</dd>
                </div>

                <div class="flex items-center justify-between gap-4">
                  <dt class="text-[14px] leading-5 text-[#1A1B1D]/50">Amount</dt>
                  <dd class="text-right text-[14px] font-medium leading-5 text-[#1F1F1F]">
                    ₦{{ listing.priceWhole }}<span class="text-[#1F1F1F]/50">.{{ listing.priceDecimal }}</span>
                  </dd>
                </div>
              </dl>
            </article>
          }
        </div>
      </div>
    </section>

    <section class="hidden h-full flex-col bg-white lg:flex">
      <div class="flex h-full flex-col px-4 pb-6 pt-6 xl:px-6">
        <h1 class="text-[24px] font-medium leading-none text-[#0D0D0D]">Listings</h1>

        <div class="mt-6 flex items-center gap-3">
          @for (card of desktopSummaryCards; track card.label) {
            <button
              type="button"
              (click)="setSummaryFilter(card.value)"
              class="h-[75px] flex-1 rounded-[10px] px-[10px] text-left transition"
              [class.border-[1.5px]]="summaryStatusFilter() === card.value"
              [class.border-[#6453D9]]="summaryStatusFilter() === card.value"
              [class.bg-[#6453D9]/[0.05]]="summaryStatusFilter() === card.value"
              [class.bg-[#FAFAFA]]="summaryStatusFilter() !== card.value"
            >
              <p class="text-[12px] leading-none text-[#1A1B1D]/50">{{ card.label }}</p>
              <p class="mt-4 text-[24px] font-semibold leading-none text-[#1A1B1D]" [class.text-[#1A1B1D]/50]="summaryStatusFilter() !== card.value">
                {{ card.amount }}
              </p>
            </button>
          }
        </div>

        <div class="mt-6 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[16px] border border-[#F0F0F0] bg-white">
          <div class="flex items-center justify-between px-4 py-4">
            <div class="flex flex-wrap items-center gap-2">
              <button
                type="button"
                (click)="cycleCategoryFilter()"
                class="inline-flex h-8 items-center gap-2 rounded-full border border-[#EBEBEB] bg-white px-3 text-[14px] font-medium leading-5 text-[#1A1B1D]/50 shadow-[0_0_0_1px_rgba(18,55,105,0.08)]"
              >
                {{ categoryLabel() }}
                <img ngSrc="/assets/icons/admin-user-details/arrow-down.svg" width="16" height="16" alt="" class="h-4 w-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                (click)="cycleStoreFilter()"
                class="inline-flex h-8 items-center gap-2 rounded-full border border-[#EBEBEB] bg-white px-3 text-[14px] font-medium leading-5 text-[#1A1B1D]/50 shadow-[0_0_0_1px_rgba(18,55,105,0.08)]"
              >
                {{ storeLabel() }}
                <img ngSrc="/assets/icons/admin-user-details/arrow-down.svg" width="16" height="16" alt="" class="h-4 w-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                (click)="cycleStatusFilter()"
                class="inline-flex h-8 items-center gap-2 rounded-full border border-[#EBEBEB] bg-white px-3 text-[14px] font-medium leading-5 text-[#1A1B1D]/50 shadow-[0_0_0_1px_rgba(18,55,105,0.08)]"
              >
                {{ statusLabel() }}
                <img ngSrc="/assets/icons/admin-user-details/arrow-down.svg" width="16" height="16" alt="" class="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <label class="relative block w-full max-w-[224px]">
              <img
                ngSrc="/assets/icons/admin-listings/search.svg"
                width="16"
                height="16"
                alt=""
                class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                aria-hidden="true"
              />
              <input
                type="text"
                [value]="searchQuery()"
                (input)="updateSearchQuery($any($event.target).value)"
                placeholder="Search"
                class="h-10 w-full rounded-full bg-[#FAFAFA] py-2 pl-10 pr-4 text-[14px] text-[#1A1B1D] outline-none placeholder:text-[#777777] focus:ring-2 focus:ring-[#6453D9]/10"
              >
            </label>
          </div>

          <div class="min-h-0 flex-1 overflow-x-auto">
            <table class="w-full min-w-[1020px]">
              <thead class="border-y border-[#F4F4F4] bg-[#FAFAFA] text-left">
                <tr class="text-[12px] font-medium text-[#1A1B1D]/60">
                  <th class="px-4 py-[11px]">Name</th>
                  <th class="px-4 py-[11px]">Category</th>
                  <th class="px-4 py-[11px]">Price</th>
                  <th class="px-4 py-[11px]">Store/User</th>
                  <th class="px-4 py-[11px]">Status</th>
                  <th class="px-4 py-[11px]"></th>
                </tr>
              </thead>
              <tbody>
                @for (listing of visibleDesktopListings(); track listing.id) {
                  <tr class="cursor-pointer border-b border-[#F0F0F0] hover:bg-[#FCFCFD]" (click)="openListing(listing.id)">
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-2">
                        <div class="h-10 w-10 overflow-hidden rounded-[6px] border border-[#F0F0F0] bg-[#EFEFEF]">
                          <img [ngSrc]="listing.thumbnail" [alt]="listing.name" width="40" height="40" class="h-10 w-10 object-cover" />
                        </div>
                        <p class="text-[14px] font-medium leading-5 text-[#1A1B1D]">{{ listing.name }}</p>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-[14px] leading-5 text-[#1A1B1D]">{{ listing.categoryLabel }}</td>
                    <td class="px-4 py-3 text-[14px] font-medium leading-5 text-[#1F1F1F]">
                      ₦{{ listing.priceWhole }}<span class="text-[#1F1F1F]/50">.{{ listing.priceDecimal }}</span>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-2">
                        <div class="h-8 w-8 overflow-hidden rounded-full border-[1.73px] border-white bg-white">
                          <img [ngSrc]="listing.storeAvatar!" [alt]="listing.storeName" width="32" height="32" class="h-8 w-8 object-cover" />
                        </div>
                        <span class="text-[14px] leading-5 text-[#1A1B1D]">{{ listing.storeName }}</span>
                      </div>
                    </td>
                    <td class="px-4 py-3">
                      <span
                        class="inline-flex h-6 items-center gap-1 rounded-lg px-2 text-[12px] font-semibold leading-4"
                        [class.bg-[#F9F9F9]]="listing.status === 'available'"
                        [class.text-[#EE9C2E]]="listing.status === 'available'"
                        [class.bg-[#F3FBF9]]="listing.status === 'sold'"
                        [class.text-[#25AD32]]="listing.status === 'sold'"
                        [class.bg-[#EEF4FF]]="listing.status === 'paused'"
                        [class.text-[#4787FE]]="listing.status === 'paused'"
                        [class.bg-[#FDF6FA]]="listing.status === 'suspended'"
                        [class.text-[#FF2524]]="listing.status === 'suspended'"
                      >
                        <img [ngSrc]="statusIcon(listing.status)" width="14" height="14" alt="" class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        {{ statusText(listing.status) }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-right">
                      @if (listing.boosted) {
                        <span class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#EAEAEA] bg-white text-[14px] shadow-[0_4px_8px_rgba(202,202,202,0.25)]">
                          🚀
                        </span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="flex items-center justify-between px-4 py-6">
            <p class="text-[16px] font-medium text-[#1A1B1D]">
              {{ visibleDesktopListings().length }}
              <span class="text-[#1A1B1D]/50"> results</span>
            </p>

            <div class="flex items-center gap-2 text-[16px] text-[#1C1F1D]/50">
              <button type="button" class="flex h-8 w-8 items-center justify-center rounded-[8px] bg-white shadow-[0_1px_2px_rgba(42,59,81,0.12),0_0_0_1px_rgba(18,55,105,0.08)]">
                <img ngSrc="/assets/icons/admin-user-details/chevron-left.svg" width="16" height="16" alt="" class="h-4 w-4" aria-hidden="true" />
              </button>
              <span class="flex h-8 min-w-8 items-center justify-center rounded-[8px] bg-white px-3 text-[14px] font-medium text-[#1A1B1D] shadow-[0_1px_2px_rgba(42,59,81,0.12),0_0_0_1px_rgba(18,55,105,0.08)]">
                1
              </span>
              <button type="button" class="flex h-8 w-8 items-center justify-center rounded-[8px] bg-white shadow-[0_1px_2px_rgba(42,59,81,0.12),0_0_0_1px_rgba(18,55,105,0.08)]">
                <img ngSrc="/assets/icons/admin-user-details/chevron-right.svg" width="16" height="16" alt="" class="h-4 w-4" aria-hidden="true" />
              </button>
              <span class="ml-2">of 1</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminListingsPageComponent {
  private readonly router = inject(Router);

  readonly summaryStatusFilter = signal<AdminListingsSummaryFilter>('all');
  readonly categoryFilter = signal<AdminListingsCategory>('all');
  readonly storeFilter = signal<AdminListingsStore>('all');
  readonly statusFilter = signal<'all' | AdminListingsStatus>('all');
  readonly searchQuery = signal('');

  readonly desktopSummaryCards = [
    { label: 'All', value: 'all' as const, amount: '6,500,000' },
    { label: 'Available', value: 'available' as const, amount: '4,000,000' },
    { label: 'Sold', value: 'sold' as const, amount: '2,000,000' },
    { label: 'Paused', value: 'paused' as const, amount: '500,000' },
  ];

  readonly mobileSummaryCards = [
    { label: 'All', value: 'all' as const, amount: '6,500,000' },
    { label: 'Available', value: 'available' as const, amount: '4,000,000' },
    { label: 'Sold', value: 'sold' as const, amount: '4,000,000' },
    { label: 'Paused', value: 'paused' as const, amount: '06' },
    { label: 'Suspended', value: 'suspended' as const, amount: '59' },
  ];

  readonly desktopListings: AdminListingRecord[] = [
    {
      id: 'iphone-17-pro-max',
      name: 'Iphone 17 pro max',
      thumbnail: '/assets/images/admin-listings/desktop/iphone-17-pro-max.png',
      categoryKey: 'phones-laptops',
      categoryLabel: 'Phones & Laptops',
      priceWhole: '2,500,000',
      priceDecimal: '00',
      storeKey: 'vine',
      storeName: 'The Vine Collections',
      storeAvatar: '/assets/images/admin-listings/desktop/the-vine-collections.png',
      status: 'available',
      boosted: true,
    },
    {
      id: 'logitech-ergonomic-mouse',
      name: 'Logitech ergonomic mouse',
      thumbnail: '/assets/images/admin-listings/desktop/logitech-ergonomic-mouse.png',
      categoryKey: 'electronics',
      categoryLabel: 'Electronics',
      priceWhole: '2,500,000',
      priceDecimal: '00',
      storeKey: 'eden',
      storeName: 'Eden Organics',
      storeAvatar: '/assets/images/admin-listings/desktop/eden-organics.png',
      status: 'sold',
      boosted: false,
    },
    {
      id: 'nike-sneaker',
      name: 'Nike sneaker',
      thumbnail: '/assets/images/admin-listings/desktop/nike-sneaker.png',
      categoryKey: 'mens-fashion',
      categoryLabel: 'Men’s fashion',
      priceWhole: '2,500,000',
      priceDecimal: '00',
      storeKey: 'amazing',
      storeName: 'Amazing Fragrances',
      storeAvatar: '/assets/images/admin-listings/desktop/amazing-fragrances.png',
      status: 'suspended',
      boosted: false,
    },
    {
      id: 'bone-straight-wig',
      name: 'Bone straight wig',
      thumbnail: '/assets/images/admin-listings/desktop/bone-straight-wig.png',
      categoryKey: 'womens-fashion',
      categoryLabel: 'Women’s fashion',
      priceWhole: '2,500,000',
      priceDecimal: '00',
      storeKey: 'ifeanyi',
      storeName: 'Ifeanyi Austin',
      storeAvatar: '/assets/images/admin-listings/desktop/ifeanyi-austin.png',
      status: 'paused',
      boosted: true,
    },
    {
      id: 'maserati',
      name: 'Maserati',
      thumbnail: '/assets/images/admin-listings/desktop/maserati.png',
      categoryKey: 'automobiles',
      categoryLabel: 'Automobiles',
      priceWhole: '2,500,000',
      priceDecimal: '00',
      storeKey: 'eden',
      storeName: 'Eden Organics',
      storeAvatar: '/assets/images/admin-listings/desktop/eden-organics.png',
      status: 'sold',
      boosted: true,
    },
    {
      id: 'rgb-keyboard',
      name: 'RGB keyboard',
      thumbnail: '/assets/images/admin-listings/desktop/rgb-keyboard.png',
      categoryKey: 'electronics',
      categoryLabel: 'Electronics',
      priceWhole: '2,500,000',
      priceDecimal: '00',
      storeKey: 'abogu',
      storeName: 'Abogu Ruth',
      storeAvatar: '/assets/images/admin-listings/desktop/abogu-ruth.png',
      status: 'paused',
      boosted: false,
    },
    {
      id: 'sweatshirt',
      name: 'Sweatshirt',
      thumbnail: '/assets/images/admin-listings/desktop/sweatshirt.png',
      categoryKey: 'mens-fashion',
      categoryLabel: 'Men’s fashion',
      priceWhole: '2,500,000',
      priceDecimal: '00',
      storeKey: 'vine',
      storeName: 'The Vine Collections',
      storeAvatar: '/assets/images/admin-listings/desktop/the-vine-collections.png',
      status: 'sold',
      boosted: false,
    },
  ];

  readonly mobileListings: AdminListingRecord[] = [
    {
      id: 'iphone-17-pro-max-mobile',
      name: 'Iphone 17 pro max',
      thumbnail: '/assets/images/admin-listings/mobile/iphone-17-pro-max.png',
      categoryKey: 'phones-laptops',
      categoryLabel: 'Phones & Laptops',
      priceWhole: '2,500,000',
      priceDecimal: '00',
      storeKey: 'vine',
      storeName: 'The Vine Collections',
      status: 'available',
      boosted: true,
    },
    {
      id: 'logitech-ergonomic-mouse-mobile',
      name: 'Logitech ergonomic m...',
      thumbnail: '/assets/images/admin-listings/mobile/logitech-ergonomic-mouse.png',
      categoryKey: 'electronics',
      categoryLabel: 'Electronics',
      priceWhole: '150,000',
      priceDecimal: '00',
      storeKey: 'eden',
      storeName: 'Eden Organics',
      status: 'sold',
      boosted: true,
    },
    {
      id: 'nike-sneaker-mobile',
      name: 'Nike sneaker',
      thumbnail: '/assets/images/admin-listings/mobile/nike-sneaker.png',
      categoryKey: 'mens-fashion',
      categoryLabel: 'Men’s fashion',
      priceWhole: '150,000',
      priceDecimal: '00',
      storeKey: 'amazing',
      storeName: 'Amazing Fragrances',
      status: 'suspended',
      boosted: false,
    },
    {
      id: 'bone-straight-wig-mobile',
      name: 'Bone straight wig',
      thumbnail: '/assets/images/admin-listings/mobile/bone-straight-wig.png',
      categoryKey: 'womens-fashion',
      categoryLabel: 'Women’s fashion',
      priceWhole: '150,000',
      priceDecimal: '00',
      storeKey: 'personal',
      storeName: 'Personal account',
      status: 'paused',
      boosted: true,
    },
    {
      id: 'maserati-mobile',
      name: 'Maserati',
      thumbnail: '/assets/images/admin-listings/mobile/maserati.png',
      categoryKey: 'automobiles',
      categoryLabel: 'Automobiles',
      priceWhole: '150,000',
      priceDecimal: '00',
      storeKey: 'vine',
      storeName: 'The Vine Collections',
      status: 'suspended',
      boosted: false,
    },
  ];

  readonly visibleDesktopListings = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();

    return this.desktopListings.filter((listing) => {
      const summaryMatches = this.summaryStatusFilter() === 'all' || listing.status === this.summaryStatusFilter();
      const categoryMatches = this.categoryFilter() === 'all' || listing.categoryKey === this.categoryFilter();
      const storeMatches = this.storeFilter() === 'all' || listing.storeKey === this.storeFilter();
      const statusMatches = this.statusFilter() === 'all' || listing.status === this.statusFilter();
      const searchMatches =
        query === ''
        || listing.name.toLowerCase().includes(query)
        || listing.categoryLabel.toLowerCase().includes(query)
        || listing.storeName.toLowerCase().includes(query);

      return summaryMatches && categoryMatches && storeMatches && statusMatches && searchMatches;
    });
  });

  readonly visibleMobileListings = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();

    return this.mobileListings.filter((listing) => {
      const summaryMatches = this.summaryStatusFilter() === 'all' || listing.status === this.summaryStatusFilter();
      const searchMatches =
        query === ''
        || listing.name.toLowerCase().includes(query)
        || listing.storeName.toLowerCase().includes(query);

      return summaryMatches && searchMatches;
    });
  });

  readonly categoryLabel = computed(() => {
    switch (this.categoryFilter()) {
      case 'phones-laptops':
        return 'Phones & Laptops';
      case 'electronics':
        return 'Electronics';
      case 'mens-fashion':
        return 'Men’s fashion';
      case 'womens-fashion':
        return 'Women’s fashion';
      case 'automobiles':
        return 'Automobiles';
      default:
        return 'Category';
    }
  });

  readonly storeLabel = computed(() => {
    switch (this.storeFilter()) {
      case 'vine':
        return 'The Vine Collections';
      case 'eden':
        return 'Eden Organics';
      case 'amazing':
        return 'Amazing Fragrances';
      case 'personal':
        return 'Personal account';
      case 'ifeanyi':
        return 'Ifeanyi Austin';
      case 'abogu':
        return 'Abogu Ruth';
      default:
        return 'Store';
    }
  });

  readonly statusLabel = computed(() => {
    switch (this.statusFilter()) {
      case 'available':
        return 'Available';
      case 'sold':
        return 'Sold';
      case 'paused':
        return 'Paused';
      case 'suspended':
        return 'Suspended';
      default:
        return 'Status';
    }
  });

  setSummaryFilter(value: AdminListingsSummaryFilter): void {
    this.summaryStatusFilter.set(value);
  }

  cycleCategoryFilter(): void {
    this.categoryFilter.update((value) => {
      switch (value) {
        case 'all':
          return 'phones-laptops';
        case 'phones-laptops':
          return 'electronics';
        case 'electronics':
          return 'mens-fashion';
        case 'mens-fashion':
          return 'womens-fashion';
        case 'womens-fashion':
          return 'automobiles';
        default:
          return 'all';
      }
    });
  }

  cycleStoreFilter(): void {
    this.storeFilter.update((value) => {
      switch (value) {
        case 'all':
          return 'vine';
        case 'vine':
          return 'eden';
        case 'eden':
          return 'amazing';
        case 'amazing':
          return 'ifeanyi';
        case 'ifeanyi':
          return 'abogu';
        case 'abogu':
          return 'personal';
        default:
          return 'all';
      }
    });
  }

  cycleStatusFilter(): void {
    this.statusFilter.update((value) => {
      switch (value) {
        case 'all':
          return 'available';
        case 'available':
          return 'sold';
        case 'sold':
          return 'paused';
        case 'paused':
          return 'suspended';
        default:
          return 'all';
      }
    });
  }

  updateSearchQuery(value: string): void {
    this.searchQuery.set(value);
  }

  openListing(id: string): void {
    void this.router.navigate(['/admin/listings', id]);
  }

  statusText(status: AdminListingsStatus): string {
    switch (status) {
      case 'available':
        return 'Available';
      case 'sold':
        return 'Sold';
      case 'paused':
        return 'Paused';
      case 'suspended':
        return 'Suspended';
    }
  }

  statusIcon(status: AdminListingsStatus): string {
    switch (status) {
      case 'available':
        return '/assets/icons/admin-listings/status-available.svg';
      case 'sold':
        return '/assets/icons/admin-listings/status-sold.svg';
      case 'paused':
        return '/assets/icons/admin-listings/status-paused.svg';
      case 'suspended':
        return '/assets/icons/admin-listings/status-suspended.svg';
    }
  }
}
