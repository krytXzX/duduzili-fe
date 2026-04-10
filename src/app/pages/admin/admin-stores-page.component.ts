import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { Router } from '@angular/router';
import {
  heroChevronDown,
  heroChevronLeft,
  heroChevronRight,
  heroMagnifyingGlass,
} from '@ng-icons/heroicons/outline';

type AdminStoreRatingFilter = 'all' | 'highest' | 'lowest';

interface AdminStoreRecord {
  id: string;
  name: string;
  logo: string;
  location: string;
  linkedUser: string;
  linkedUserInitials: string;
  linkedUserBackground: string;
  listingCount: number;
  rating: number;
  boosted: boolean;
}

@Component({
  selector: 'app-admin-stores-page',
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
        <h1 class="text-[22px] font-semibold tracking-[-0.04em] text-[#1A1C21]">Stores</h1>
      </div>

      <div class="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
        <div class="overflow-hidden rounded-[28px] border border-[#ECEEF3] bg-white shadow-[0_8px_30px_-28px_rgba(17,24,39,0.45)]">
          <div class="flex flex-col gap-4 border-b border-[#F1F2F4] px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
            <button
              type="button"
              (click)="cycleRatingFilter()"
              class="inline-flex w-fit items-center gap-2 rounded-full border border-[#E8EAF0] bg-white px-5 py-2.5 text-[13px] font-medium text-[#80858F]"
            >
              {{ ratingFilterLabel() }}
              <ng-icon name="heroChevronDown" class="text-sm"></ng-icon>
            </button>

            <label class="relative block w-full lg:max-w-[230px]">
              <ng-icon
                name="heroMagnifyingGlass"
                class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#A2A7B0]"
              ></ng-icon>
              <input
                type="text"
                [value]="searchQuery()"
                (input)="updateSearchQuery(($any($event.target).value ?? '').toString())"
                placeholder="Search"
                class="w-full rounded-full bg-[#FAFAFB] py-3 pl-11 pr-4 text-[14px] font-medium text-[#2A2D34] outline-none placeholder:text-[#B5BAC4] focus:ring-2 focus:ring-[#6B5CF0]/10"
              >
            </label>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full min-w-[980px]">
              <thead class="border-b border-[#F1F2F4] bg-[#FAFAFB] text-left">
                <tr class="text-[12px] font-semibold text-[#9AA0AA]">
                  <th class="px-8 py-4">Name</th>
                  <th class="px-4 py-4">Location</th>
                  <th class="px-4 py-4">Linked user</th>
                  <th class="px-4 py-4">No of listings</th>
                  <th class="px-4 py-4">Rating</th>
                  <th class="px-4 py-4"></th>
                </tr>
              </thead>
              <tbody>
                @for (store of visibleStores(); track store.id) {
                  <tr
                    class="cursor-pointer border-b border-[#F4F5F7] transition hover:bg-[#FBFBFD] last:border-b-0"
                    (click)="openStore(store.id)"
                  >
                    <td class="px-8 py-5">
                      <div class="flex items-center gap-3">
                        <span class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_6px_14px_-12px_rgba(17,24,39,0.35)]">
                          <img [src]="store.logo" [alt]="store.name" class="h-full w-full object-cover">
                        </span>
                        <span class="text-[14px] font-semibold text-[#2A2D34]">{{ store.name }}</span>
                      </div>
                    </td>
                    <td class="px-4 py-5 text-[14px] font-medium text-[#555A64]">{{ store.location }}</td>
                    <td class="px-4 py-5">
                      <div class="flex items-center gap-3">
                        <span
                          class="flex h-9 w-9 items-center justify-center rounded-full text-[12px] font-semibold text-white"
                          [style.background]="store.linkedUserBackground"
                        >
                          {{ store.linkedUserInitials }}
                        </span>
                        <span class="text-[14px] font-medium text-[#3F444C]">{{ store.linkedUser }}</span>
                      </div>
                    </td>
                    <td class="px-4 py-5 text-[14px] font-medium text-[#2A2D34]">{{ store.listingCount }}</td>
                    <td class="px-4 py-5 text-[14px] font-medium text-[#2A2D34]">{{ store.rating.toFixed(1) }}</td>
                    <td class="px-4 py-5 text-right">
                      @if (store.boosted) {
                        <button
                          type="button"
                          (click)="stopRowNavigation($event)"
                          class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#ECEEF3] bg-white text-[15px] shadow-[0_8px_16px_-14px_rgba(17,24,39,0.35)]"
                          aria-label="Boosted store"
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
        </div>

        <div class="mt-6 flex flex-col gap-4 px-1 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-[14px] font-semibold text-[#646A73]">{{ visibleStores().length }} results</p>

          <div class="flex items-center gap-2 self-end text-[14px] font-medium text-[#B2B7C0]">
            <button
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-[10px] border border-[#ECEEF3] bg-white transition hover:bg-[#FAFAFC]"
              aria-label="Previous page"
            >
              <ng-icon name="heroChevronLeft" class="text-sm"></ng-icon>
            </button>
            <span class="flex h-8 min-w-8 items-center justify-center rounded-[10px] border border-[#ECEEF3] bg-white px-3 text-[#7A808A]">
              1
            </span>
            <button
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-[10px] border border-[#ECEEF3] bg-white transition hover:bg-[#FAFAFC]"
              aria-label="Next page"
            >
              <ng-icon name="heroChevronRight" class="text-sm"></ng-icon>
            </button>
            <span class="ml-2">of 1</span>
          </div>
        </div>
      </div>
    </div>
  `,
  host: { class: 'block h-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminStoresPageComponent {
  private readonly router = inject(Router);

  readonly ratingFilter = signal<AdminStoreRatingFilter>('all');
  readonly searchQuery = signal('');

  readonly stores: AdminStoreRecord[] = [
    {
      id: 'vine-collections',
      name: 'The Vine Collections',
      logo: '/assets/images/store-1-banner.png',
      location: '54 Ajao Estate, Lagos',
      linkedUser: 'Ifeanyi Austin',
      linkedUserInitials: 'IA',
      linkedUserBackground: 'linear-gradient(135deg, #F6B14B 0%, #F28D28 100%)',
      listingCount: 58,
      rating: 4.8,
      boosted: true,
    },
    {
      id: 'eden-organics',
      name: 'Eden Organics',
      logo: '/assets/images/store-2-banner.png',
      location: '54 Ajao Estate, Lagos',
      linkedUser: 'Abogu Ruth',
      linkedUserInitials: 'AR',
      linkedUserBackground: 'linear-gradient(135deg, #4FC3C8 0%, #2FB8A8 100%)',
      listingCount: 300,
      rating: 3.5,
      boosted: false,
    },
    {
      id: 'amazing-fragrances',
      name: 'Amazing Fragrances',
      logo: '/assets/images/store-3-banner.png',
      location: '54 Ajao Estate, Lagos',
      linkedUser: 'Ifeanyi Austin',
      linkedUserInitials: 'IA',
      linkedUserBackground: 'linear-gradient(135deg, #F6B14B 0%, #F28D28 100%)',
      listingCount: 123,
      rating: 5,
      boosted: false,
    },
    {
      id: 'vine-collections-2',
      name: 'The Vine Collections',
      logo: '/assets/images/store-1-banner.png',
      location: '54 Ajao Estate, Lagos',
      linkedUser: 'Abogu Ruth',
      linkedUserInitials: 'AR',
      linkedUserBackground: 'linear-gradient(135deg, #4FC3C8 0%, #2FB8A8 100%)',
      listingCount: 7,
      rating: 4.4,
      boosted: true,
    },
    {
      id: 'amazing-fragrances-2',
      name: 'Amazing Fragrances',
      logo: '/assets/images/store-3-banner.png',
      location: '54 Ajao Estate, Lagos',
      linkedUser: 'Ifeanyi Austin',
      linkedUserInitials: 'IA',
      linkedUserBackground: 'linear-gradient(135deg, #F6B14B 0%, #F28D28 100%)',
      listingCount: 0,
      rating: 4.7,
      boosted: true,
    },
    {
      id: 'eden-organics-2',
      name: 'Eden Organics',
      logo: '/assets/images/store-2-banner.png',
      location: '54 Ajao Estate, Lagos',
      linkedUser: 'Abogu Ruth',
      linkedUserInitials: 'AR',
      linkedUserBackground: 'linear-gradient(135deg, #4FC3C8 0%, #2FB8A8 100%)',
      listingCount: 28,
      rating: 2.5,
      boosted: false,
    },
    {
      id: 'vine-collections-3',
      name: 'The Vine Collections',
      logo: '/assets/images/store-1-banner.png',
      location: '54 Ajao Estate, Lagos',
      linkedUser: 'Ifeanyi Austin',
      linkedUserInitials: 'IA',
      linkedUserBackground: 'linear-gradient(135deg, #F6B14B 0%, #F28D28 100%)',
      listingCount: 44,
      rating: 1.3,
      boosted: false,
    },
  ];

  readonly visibleStores = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();

    let filtered = this.stores;

    if (this.ratingFilter() === 'highest') {
      filtered = [...filtered].sort((left, right) => right.rating - left.rating);
    } else if (this.ratingFilter() === 'lowest') {
      filtered = [...filtered].sort((left, right) => left.rating - right.rating);
    }

    if (!query) {
      return filtered;
    }

    return filtered.filter((store) =>
      [store.name, store.location, store.linkedUser, store.rating.toString(), store.listingCount.toString()]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  });

  ratingFilterLabel(): string {
    switch (this.ratingFilter()) {
      case 'highest':
        return 'Highest rating';
      case 'lowest':
        return 'Lowest rating';
      default:
        return 'Rating';
    }
  }

  cycleRatingFilter(): void {
    this.ratingFilter.update((current) => {
      switch (current) {
        case 'all':
          return 'highest';
        case 'highest':
          return 'lowest';
        default:
          return 'all';
      }
    });
  }

  updateSearchQuery(value: string): void {
    this.searchQuery.set(value);
  }

  openStore(storeId: string): void {
    void this.router.navigate(['/admin/stores', storeId]);
  }

  stopRowNavigation(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
  }
}
