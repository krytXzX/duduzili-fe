import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CustomDropdownComponent, type CustomDropdownOption } from '../../components/ui/custom-dropdown.component';

type AdminStoreRatingFilter = 'all' | 'highest' | 'lowest';

interface AdminStoreRecord {
  id: string;
  name: string;
  logo: string;
  location: string;
  linkedUser: string;
  linkedUserAvatar: string;
  listingCount: number;
  rating: number;
  promoted: boolean;
}

@Component({
  selector: 'app-admin-stores-page',
  imports: [NgOptimizedImage, RouterLink, CustomDropdownComponent],
  host: { class: 'block h-full' },
  template: `
    <section class="bg-white lg:hidden">
      <div class="flex items-center gap-2 px-5 pb-4 pt-[10px]">
        <a
          routerLink="/admin"
          class="inline-flex h-8 w-11 items-center justify-center rounded-full bg-[#F3F3F3]"
          aria-label="Back"
        >
          <img ngSrc="/assets/icons/listing-details-back.svg" width="20" height="20" alt="" class="h-5 w-5" aria-hidden="true" />
        </a>
        <h1 class="text-[20px] font-semibold leading-[1.2] text-black">Stores</h1>
      </div>

      <div class="px-4 pb-8">
        <div class="flex items-center gap-3">
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
              (input)="updateSearchQuery(($any($event.target).value ?? '').toString())"
              placeholder="Search"
              class="h-10 w-full rounded-full bg-[#FAFAFA] py-2 pl-10 pr-4 text-[14px] text-[#1A1B1D] outline-none placeholder:text-[#777777]"
            >
          </label>
          <button type="button" class="inline-flex h-6 w-6 items-center justify-center" aria-label="Filter">
            <img ngSrc="/assets/icons/admin-listings/filter.svg" width="24" height="24" alt="" class="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <div class="mt-4">
          @for (store of visibleMobileStores(); track store.id) {
            <article class="border-b border-[#EBEBEB] py-3" (click)="openStore(store.id)">
              <div class="flex items-start justify-between gap-3">
                <div class="flex min-w-0 items-center gap-3">
                  <div class="h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-white bg-white">
                    <img [ngSrc]="store.logo" [alt]="store.name" width="44" height="44" class="h-11 w-11 object-cover" />
                  </div>
                  <div class="min-w-0">
                    <h2 class="truncate text-[16px] font-medium leading-6 text-[#0D0D0D]/80">{{ store.name }}</h2>
                    @if (store.promoted) {
                      <p class="mt-1 text-[12px] leading-4 text-[#7F8081]"><span class="text-[#1A1B1D]">🚀</span> Promoted</p>
                    }
                  </div>
                </div>
              </div>

              <div class="mt-4 space-y-3 text-[14px] leading-5">
                <div class="flex items-center justify-between gap-4">
                  <span class="text-[#1A1B1D]/50">Linked user</span>
                  <span class="flex items-center gap-2 text-right font-medium text-[#1A1B1D]">
                    <img [ngSrc]="store.linkedUserAvatar" [alt]="store.linkedUser" width="24" height="24" class="h-6 w-6 rounded-full object-cover" />
                    {{ store.linkedUser }}
                  </span>
                </div>
                <div class="flex items-center justify-between gap-4">
                  <span class="text-[#1A1B1D]/50">Location</span>
                  <span class="text-right font-medium text-[#1A1B1D]">{{ store.location }}</span>
                </div>
              </div>
            </article>
          }
        </div>
      </div>
    </section>

    <section class="hidden h-full flex-col rounded-[24px] border border-[#F4F4F4] bg-white lg:flex">
      <div class="border-b border-[#EEEEEE] px-4 py-5 xl:px-6">
        <h1 class="text-[24px] font-medium leading-none text-[#0D0D0D]">Stores</h1>
      </div>

      <div class="flex-1 overflow-y-auto px-4 py-6 xl:px-6">
        <div class="overflow-hidden rounded-[16px] border border-[#F0F0F0] bg-white">
          <div class="flex items-center justify-between gap-4 px-[15px] py-[15px]">
            <app-custom-dropdown
              [options]="ratingOptions"
              [value]="ratingFilter()"
              ariaLabel="Select rating filter"
              buttonClass="inline-flex h-8 items-center gap-2 rounded-full border border-[#EBEBEB] px-3 text-[14px] font-medium text-[#1A1B1D]/50 shadow-[0_0_0_1px_rgba(18,55,105,0.08)]"
              iconClass="text-[#1A1B1D]/50"
              menuClass="min-w-[170px]"
              (valueChange)="ratingFilter.set($event)"
            ></app-custom-dropdown>

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
                (input)="updateSearchQuery(($any($event.target).value ?? '').toString())"
                placeholder="Search"
                class="h-10 w-full rounded-full bg-[#FAFAFA] py-2 pl-10 pr-4 text-[14px] text-[#1A1B1D] outline-none placeholder:text-[#777777]"
              >
            </label>
          </div>

          <table class="w-full">
            <thead class="border-y border-[#F4F4F4] bg-[#FAFAFA] text-left text-[12px] font-medium text-[#1A1B1D]/60">
              <tr>
                <th class="px-4 py-[11px]">Name</th>
                <th class="px-4 py-[11px]">Location</th>
                <th class="px-4 py-[11px]">Linked user</th>
                <th class="px-4 py-[11px]">No of listings</th>
                <th class="px-4 py-[11px]">Rating</th>
                <th class="px-4 py-[11px]"></th>
              </tr>
            </thead>
            <tbody>
              @for (store of visibleDesktopStores(); track store.id) {
                <tr class="cursor-pointer border-b border-[#F0F0F0] text-[14px] text-[#1A1B1D]" (click)="openStore(store.id)">
                  <td class="px-4 py-[15px]">
                    <div class="flex items-center gap-2">
                      <div class="h-8 w-8 overflow-hidden rounded-full border-[1.73px] border-white">
                        <img [ngSrc]="store.logo" [alt]="store.name" width="32" height="32" class="h-8 w-8 object-cover" />
                      </div>
                      <span>{{ store.name }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-[15px]">{{ store.location }}</td>
                  <td class="px-4 py-[15px]">
                    <div class="flex items-center gap-2">
                      <img [ngSrc]="store.linkedUserAvatar" [alt]="store.linkedUser" width="32" height="32" class="h-8 w-8 rounded-full object-cover" />
                      <span>{{ store.linkedUser }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-[15px]">{{ store.listingCount }}</td>
                  <td class="px-4 py-[15px]">{{ store.rating.toFixed(1) }}</td>
                  <td class="px-4 py-[15px] text-right">
                    @if (store.promoted) {
                      <button
                        type="button"
                        (click)="stopRowNavigation($event)"
                        class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#EAEAEA] bg-white text-[14px] shadow-[0_4px_8px_rgba(202,202,202,0.25)]"
                        aria-label="Promoted store"
                      >
                        🚀
                      </button>
                    } @else {
                      <span class="inline-flex h-8 w-8"></span>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div class="mt-6 flex items-center justify-between">
          <p class="text-[16px] font-medium text-[#1A1B1D]">{{ visibleDesktopStores().length }} <span class="text-[#1A1B1D]/50">results</span></p>
          <div class="flex items-center gap-2 opacity-50">
            <div class="inline-flex h-8 w-11 items-center justify-center rounded-[8px] shadow-[0_1px_2px_rgba(42,59,81,0.12),0_0_0_1px_rgba(18,55,105,0.08)]">‹</div>
            <div class="inline-flex h-8 w-11 items-center justify-center rounded-[8px] shadow-[0_1px_2px_rgba(42,59,81,0.12),0_0_0_1px_rgba(18,55,105,0.08)] text-[14px] font-medium text-[#1A1B1D]">1</div>
            <div class="inline-flex h-8 w-11 items-center justify-center rounded-[8px] shadow-[0_1px_2px_rgba(42,59,81,0.12),0_0_0_1px_rgba(18,55,105,0.08)]">›</div>
            <span class="text-[16px] text-[#1C1F1D]">of 1</span>
          </div>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminStoresPageComponent {
  readonly ratingOptions: readonly CustomDropdownOption<AdminStoreRatingFilter>[] = [
    { value: 'all', label: 'All ratings' },
    { value: 'highest', label: 'Highest rating' },
    { value: 'lowest', label: 'Lowest rating' },
  ];
  private readonly router = inject(Router);

  readonly ratingFilter = signal<AdminStoreRatingFilter>('all');
  readonly searchQuery = signal('');

  readonly stores: AdminStoreRecord[] = [
    {
      id: 'vine-collections',
      name: 'The Vine Collections',
      logo: '/assets/images/admin-stores/store-vine.png',
      location: '54 Ajao Estate, Lagos',
      linkedUser: 'Ifeanyi Austin',
      linkedUserAvatar: '/assets/images/admin-stores/user-ifeanyi.png',
      listingCount: 58,
      rating: 4.8,
      promoted: true,
    },
    {
      id: 'eden-organics',
      name: 'Eden Organics',
      logo: '/assets/images/admin-stores/store-eden.png',
      location: '54 Ajao Estate, Lagos',
      linkedUser: 'Abogu Ruth',
      linkedUserAvatar: '/assets/images/admin-stores/user-abogu.png',
      listingCount: 300,
      rating: 3.5,
      promoted: false,
    },
    {
      id: 'amazing-fragrances',
      name: 'Amazing Fragrances',
      logo: '/assets/images/admin-stores/store-amazing.png',
      location: '54 Ajao Estate, Lagos',
      linkedUser: 'Ifeanyi Austin',
      linkedUserAvatar: '/assets/images/admin-stores/user-ifeanyi.png',
      listingCount: 123,
      rating: 5,
      promoted: false,
    },
    {
      id: 'vine-collections-2',
      name: 'The Vine Collections',
      logo: '/assets/images/admin-stores/store-vine.png',
      location: '54 Ajao Estate, Lagos',
      linkedUser: 'Abogu Ruth',
      linkedUserAvatar: '/assets/images/admin-stores/user-abogu.png',
      listingCount: 7,
      rating: 4.4,
      promoted: true,
    },
    {
      id: 'amazing-fragrances-2',
      name: 'Amazing Fragrances',
      logo: '/assets/images/admin-stores/store-amazing.png',
      location: '54 Ajao Estate, Lagos',
      linkedUser: 'Ifeanyi Austin',
      linkedUserAvatar: '/assets/images/admin-stores/user-ifeanyi.png',
      listingCount: 0,
      rating: 4.7,
      promoted: true,
    },
    {
      id: 'eden-organics-2',
      name: 'Eden Organics',
      logo: '/assets/images/admin-stores/store-eden.png',
      location: '54 Ajao Estate, Lagos',
      linkedUser: 'Abogu Ruth',
      linkedUserAvatar: '/assets/images/admin-stores/user-abogu.png',
      listingCount: 28,
      rating: 2.5,
      promoted: false,
    },
    {
      id: 'vine-collections-3',
      name: 'The Vine Collections',
      logo: '/assets/images/admin-stores/store-vine.png',
      location: '54 Ajao Estate, Lagos',
      linkedUser: 'Ifeanyi Austin',
      linkedUserAvatar: '/assets/images/admin-stores/user-ifeanyi.png',
      listingCount: 44,
      rating: 1.3,
      promoted: false,
    },
  ];

  readonly visibleDesktopStores = computed(() => this.filteredStores());
  readonly visibleMobileStores = computed(() => this.filteredStores().slice(0, 3));

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

  private filteredStores(): AdminStoreRecord[] {
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
  }
}
