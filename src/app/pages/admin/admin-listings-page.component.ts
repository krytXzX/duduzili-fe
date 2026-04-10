import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroChevronDown,
  heroChevronLeft,
  heroChevronRight,
  heroMagnifyingGlass,
} from '@ng-icons/heroicons/outline';

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

interface AdminListingRecord {
  id: string;
  name: string;
  thumbnail: string;
  categoryKey: Exclude<AdminListingsCategory, 'all'>;
  categoryLabel: string;
  price: string;
  storeKey: Exclude<AdminListingsStore, 'all'>;
  storeName: string;
  storeLogoType: 'image' | 'initials';
  storeLogo?: string;
  storeInitials?: string;
  storeBackground?: string;
  status: AdminListingsStatus;
  boosted: boolean;
}

@Component({
  selector: 'app-admin-listings-page',
  imports: [NgIcon],
  providers: [
    provideIcons({
      heroChevronDown,
      heroChevronLeft,
      heroChevronRight,
      heroMagnifyingGlass,
    }),
  ],
  template: `
    <div class="flex h-full flex-col rounded-[24px] border border-gray-100/60 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] sm:rounded-[32px]">
      <div class="border-b border-[#EEF0F4] px-6 py-5 sm:px-8">
        <h1 class="text-[22px] font-semibold tracking-[-0.04em] text-[#1A1C21]">Listings</h1>
      </div>

      <div class="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
        <div class="grid gap-3 lg:grid-cols-4">
          @for (card of summaryCards(); track card.label) {
            <button
              type="button"
              (click)="setSummaryFilter(card.value)"
              class="rounded-[18px] border px-4 py-3 text-left transition"
              [class.border-[#6B5CF0]]="summaryStatusFilter() === card.value"
              [class.bg-[#F7F5FF]]="summaryStatusFilter() === card.value"
              [class.border-[#F1F2F4]]="summaryStatusFilter() !== card.value"
              [class.bg-[#FCFCFD]]="summaryStatusFilter() !== card.value"
            >
              <p class="text-[13px] font-medium text-[#8E9199]">{{ card.label }}</p>
              <p class="mt-2 text-[18px] font-semibold tracking-[-0.03em] text-[#6F747D]">{{ card.amount }}</p>
            </button>
          }
        </div>

        <div class="mt-6 overflow-hidden rounded-[28px] border border-[#ECEEF3] bg-white shadow-[0_8px_30px_-28px_rgba(17,24,39,0.45)]">
          <div class="flex flex-col gap-4 border-b border-[#F1F2F4] px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div class="flex flex-wrap gap-3">
              <button
                type="button"
                (click)="cycleCategoryFilter()"
                class="inline-flex items-center gap-2 rounded-full border border-[#E8EAF0] bg-white px-4 py-2.5 text-[13px] font-medium text-[#80858F]"
              >
                {{ categoryLabel() }}
                <ng-icon name="heroChevronDown" class="text-sm"></ng-icon>
              </button>

              <button
                type="button"
                (click)="cycleStoreFilter()"
                class="inline-flex items-center gap-2 rounded-full border border-[#E8EAF0] bg-white px-4 py-2.5 text-[13px] font-medium text-[#80858F]"
              >
                {{ storeLabel() }}
                <ng-icon name="heroChevronDown" class="text-sm"></ng-icon>
              </button>

              <button
                type="button"
                (click)="cycleStatusFilter()"
                class="inline-flex items-center gap-2 rounded-full border border-[#E8EAF0] bg-white px-4 py-2.5 text-[13px] font-medium text-[#80858F]"
              >
                {{ statusLabel() }}
                <ng-icon name="heroChevronDown" class="text-sm"></ng-icon>
              </button>
            </div>

            <label class="relative block w-full lg:max-w-[250px]">
              <ng-icon
                name="heroMagnifyingGlass"
                class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#A2A7B0]"
              ></ng-icon>
              <input
                type="text"
                [value]="searchQuery()"
                (input)="updateSearchQuery($any($event.target).value)"
                placeholder="Search"
                class="w-full rounded-full bg-[#FAFAFB] py-3 pl-11 pr-4 text-[14px] font-medium text-[#2A2D34] outline-none placeholder:text-[#B5BAC4] focus:ring-2 focus:ring-[#6B5CF0]/10"
              >
            </label>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full min-w-[1000px]">
              <thead class="border-b border-[#F1F2F4] bg-[#FAFAFB] text-left">
                <tr class="text-[12px] font-semibold text-[#9AA0AA]">
                  <th class="px-8 py-4">Name</th>
                  <th class="px-4 py-4">Category</th>
                  <th class="px-4 py-4">Price</th>
                  <th class="px-4 py-4">Store/User</th>
                  <th class="px-4 py-4">Status</th>
                  <th class="px-4 py-4"></th>
                </tr>
              </thead>
              <tbody>
                @for (listing of visibleListings(); track listing.id) {
                  <tr
                    class="cursor-pointer border-b border-[#F4F5F7] transition hover:bg-[#FAFAFC] last:border-b-0"
                    (click)="openListing(listing.id)"
                  >
                    <td class="px-8 py-5">
                      <div class="flex items-center gap-3">
                        <img
                          [src]="listing.thumbnail"
                          [alt]="listing.name"
                          class="h-10 w-10 rounded-[10px] border border-[#ECEEF3] object-cover"
                        >
                        <p class="text-[14px] font-semibold text-[#2A2D34]">{{ listing.name }}</p>
                      </div>
                    </td>
                    <td class="px-4 py-5 text-[14px] font-medium text-[#555A64]">{{ listing.categoryLabel }}</td>
                    <td class="px-4 py-5 text-[14px] font-semibold text-[#2A2D34]">₦{{ listing.price }}</td>
                    <td class="px-4 py-5">
                      <div class="flex items-center gap-3">
                        @if (listing.storeLogoType === 'image') {
                          <span class="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_6px_14px_-12px_rgba(17,24,39,0.35)]">
                            <img [src]="listing.storeLogo!" [alt]="listing.storeName" class="h-full w-full object-cover" />
                          </span>
                        } @else {
                          <span
                            class="flex h-9 w-9 items-center justify-center rounded-full text-[12px] font-semibold text-white"
                            [style.background]="listing.storeBackground"
                          >
                            {{ listing.storeInitials }}
                          </span>
                        }
                        <span class="text-[14px] font-medium text-[#3F444C]">{{ listing.storeName }}</span>
                      </div>
                    </td>
                    <td class="px-4 py-5">
                      <span
                        class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold"
                        [class.bg-[#FFF5E8]]="listing.status === 'available'"
                        [class.text-[#FF9800]]="listing.status === 'available'"
                        [class.bg-[#EDF9EF]]="listing.status === 'sold'"
                        [class.text-[#2FB04A]]="listing.status === 'sold'"
                        [class.bg-[#EEF4FF]]="listing.status === 'paused'"
                        [class.text-[#4C86F5]]="listing.status === 'paused'"
                        [class.bg-[#FFF0F0]]="listing.status === 'suspended'"
                        [class.text-[#FF4B4B]]="listing.status === 'suspended'"
                      >
                        <span
                          class="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] font-bold text-white"
                          [class.bg-[#FF9800]]="listing.status === 'available'"
                          [class.bg-[#2FB04A]]="listing.status === 'sold'"
                          [class.bg-[#4C86F5]]="listing.status === 'paused'"
                          [class.bg-[#FF4B4B]]="listing.status === 'suspended'"
                        >
                          {{ statusMark(listing.status) }}
                        </span>
                        {{ statusText(listing.status) }}
                      </span>
                    </td>
                    <td class="px-4 py-5 text-right">
                      @if (listing.boosted) {
                        <button
                          type="button"
                          (click)="$event.stopPropagation()"
                          class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#ECEEF3] bg-white text-[15px] shadow-[0_8px_16px_-14px_rgba(17,24,39,0.35)] transition hover:bg-[#FAFAFC]"
                          aria-label="Boosted listing"
                        >
                          🚀
                        </button>
                      } @else {
                        <span class="inline-flex h-9 w-9"></span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="mt-auto flex flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <p class="text-[14px] font-semibold text-[#646A73]">{{ visibleListings().length }} results</p>

            <div class="flex items-center gap-2 self-end text-[14px] font-medium text-[#B2B7C0]">
              <button
                type="button"
                class="flex h-8 w-8 items-center justify-center rounded-[10px] border border-[#ECEEF3] bg-white transition hover:bg-[#FAFAFC]"
              >
                <ng-icon name="heroChevronLeft" class="text-sm"></ng-icon>
              </button>
              <span class="flex h-8 min-w-8 items-center justify-center rounded-[10px] border border-[#ECEEF3] bg-white px-3 text-[#7A808A]">
                1
              </span>
              <button
                type="button"
                class="flex h-8 w-8 items-center justify-center rounded-[10px] border border-[#ECEEF3] bg-white transition hover:bg-[#FAFAFC]"
              >
                <ng-icon name="heroChevronRight" class="text-sm"></ng-icon>
              </button>
              <span class="ml-2">of 1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  host: { class: 'block h-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminListingsPageComponent {
  private readonly router = inject(Router);

  readonly summaryStatusFilter = signal<'all' | 'available' | 'sold' | 'paused'>('all');
  readonly categoryFilter = signal<AdminListingsCategory>('all');
  readonly storeFilter = signal<AdminListingsStore>('all');
  readonly statusFilter = signal<'all' | AdminListingsStatus>('all');
  readonly searchQuery = signal('');

  readonly listings: AdminListingRecord[] = [
    {
      id: 'iphone-17-pro-max',
      name: 'Iphone 17 pro max',
      thumbnail: '/assets/images/image-1-1.jpg',
      categoryKey: 'phones-laptops',
      categoryLabel: 'Phones & Laptops',
      price: '2,500,000.00',
      storeKey: 'vine',
      storeName: 'The Vine Collections',
      storeLogoType: 'image',
      storeLogo: '/assets/images/image-1-1.jpg',
      status: 'available',
      boosted: true,
    },
    {
      id: 'logitech-mouse',
      name: 'Logitech ergonomic mouse',
      thumbnail: '/assets/images/hero_img_3.png',
      categoryKey: 'electronics',
      categoryLabel: 'Electronics',
      price: '2,500,000.00',
      storeKey: 'eden',
      storeName: 'Eden Organics',
      storeLogoType: 'initials',
      storeInitials: 'EO',
      storeBackground: 'linear-gradient(135deg, #132816 0%, #23B14D 100%)',
      status: 'sold',
      boosted: false,
    },
    {
      id: 'nike-sneaker',
      name: 'Nike sneaker',
      thumbnail: '/assets/images/product_sneakers.png',
      categoryKey: 'mens-fashion',
      categoryLabel: 'Men’s fashion',
      price: '2,500,000.00',
      storeKey: 'amazing',
      storeName: 'Amazing Fragrances',
      storeLogoType: 'initials',
      storeInitials: 'AF',
      storeBackground: 'linear-gradient(135deg, #FFC738 0%, #F2A700 100%)',
      status: 'suspended',
      boosted: false,
    },
    {
      id: 'bone-straight-wig',
      name: 'Bone straight wig',
      thumbnail: '/assets/images/image-2-1.jpg',
      categoryKey: 'womens-fashion',
      categoryLabel: 'Women’s fashion',
      price: '2,500,000.00',
      storeKey: 'ifeanyi',
      storeName: 'Ifeanyi Austin',
      storeLogoType: 'initials',
      storeInitials: 'IA',
      storeBackground: 'linear-gradient(135deg, #F7C3B6 0%, #F28D28 100%)',
      status: 'paused',
      boosted: true,
    },
    {
      id: 'maserati',
      name: 'Maserati',
      thumbnail: '/assets/images/fashion_menswear.png',
      categoryKey: 'automobiles',
      categoryLabel: 'Automobiles',
      price: '2,500,000.00',
      storeKey: 'eden',
      storeName: 'Eden Organics',
      storeLogoType: 'initials',
      storeInitials: 'EO',
      storeBackground: 'linear-gradient(135deg, #132816 0%, #23B14D 100%)',
      status: 'sold',
      boosted: true,
    },
    {
      id: 'rgb-keyboard',
      name: 'RGB keyboard',
      thumbnail: '/assets/images/product_keyboard_rgb.png',
      categoryKey: 'electronics',
      categoryLabel: 'Electronics',
      price: '2,500,000.00',
      storeKey: 'abogu',
      storeName: 'Abogu Ruth',
      storeLogoType: 'initials',
      storeInitials: 'AR',
      storeBackground: 'linear-gradient(135deg, #F4B38A 0%, #E75E43 100%)',
      status: 'paused',
      boosted: false,
    },
    {
      id: 'sweatshirt',
      name: 'Sweatshirt',
      thumbnail: '/assets/images/fashion_menswear_hero.png',
      categoryKey: 'mens-fashion',
      categoryLabel: 'Men’s fashion',
      price: '2,500,000.00',
      storeKey: 'vine',
      storeName: 'The Vine Collections',
      storeLogoType: 'image',
      storeLogo: '/assets/images/image-1-1.jpg',
      status: 'sold',
      boosted: false,
    },
  ];

  readonly visibleListings = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();

    return this.listings.filter((listing) => {
      const summaryMatches =
        this.summaryStatusFilter() === 'all' || listing.status === this.summaryStatusFilter();
      const categoryMatches =
        this.categoryFilter() === 'all' || listing.categoryKey === this.categoryFilter();
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

  readonly summaryCards = computed(() => [
    { label: 'All', value: 'all' as const, amount: '6,500,000' },
    { label: 'Available', value: 'available' as const, amount: '4,000,000' },
    { label: 'Sold', value: 'sold' as const, amount: '2,000,000' },
    { label: 'Paused', value: 'paused' as const, amount: '500,000' },
  ]);

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

  setSummaryFilter(value: 'all' | 'available' | 'sold' | 'paused'): void {
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

  statusMark(status: AdminListingsStatus): string {
    switch (status) {
      case 'available':
        return '•';
      case 'sold':
        return '✓';
      case 'paused':
        return '∥';
      case 'suspended':
        return '⛔';
    }
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
}
