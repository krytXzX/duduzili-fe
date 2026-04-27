import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store, StoreCardComponent } from '../../components/stores/store-card.component';

@Component({
  selector: 'app-followed-stores-page',
  imports: [CommonModule, StoreCardComponent],
  template: `
    <section class="min-h-full">
      <header class="flex flex-col gap-4 border-b border-[#EEF0F4] px-8 py-7 md:flex-row md:items-center md:justify-between">
        <h1 class="text-[24px] font-semibold tracking-tight text-[#1A1C21]">Followed stores</h1>

        <div class="relative w-full md:w-[340px]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clip-rule="evenodd"
            />
          </svg>

          <input
            type="text"
            [value]="searchQuery()"
            #storeSearchInput
            (input)="searchQuery.set(storeSearchInput.value)"
            placeholder="Search stores"
            class="w-full rounded-full bg-[#F7F7FA] py-3 pl-11 pr-4 text-sm font-medium text-[#1A1C21] outline-none transition placeholder:text-[#9CA3AF] focus:ring-2 focus:ring-[#E7E5FF]"
          />
        </div>
      </header>

      <div class="px-6 py-6 md:px-8">
        @if (filteredStores().length) {
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            @for (store of filteredStores(); track store.id) {
              <app-store-card [store]="store" [showFavorite]="false" />
            }
          </div>
        } @else {
          <div class="flex min-h-[360px] flex-col items-center justify-center rounded-[32px] border border-[#EEF0F4] bg-[#FCFCFD] px-6 text-center">
            <h2 class="text-[18px] font-semibold text-[#1A1C21]">No followed stores found</h2>
            <p class="mt-3 max-w-[420px] text-sm leading-7 text-[#6B7280]">
              Try a different search term to find one of the stores you already follow.
            </p>
          </div>
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuyerFollowedStoresPageComponent {
  readonly searchQuery = signal('');

  readonly stores = signal<Store[]>([
    {
      id: 'bf1',
      name: 'The Vine Collections',
      banner: '/assets/images/product_sneakers_lifestyle.png',
      logo: '/assets/images/product_sneakers_lifestyle.png',
      followers: '0',
      metaLabel: 'Ikeja, Lagos',
      isVerified: true,
      route: ['/followed-stores', 'bf1'],
    },
    {
      id: 'bf2',
      name: 'Eden Organics',
      banner: '/assets/images/product_keyboard_rgb.png',
      logo: '/assets/images/product_keyboard_rgb.png',
      followers: '0',
      metaLabel: 'Ikeja, Lagos',
      isVerified: true,
      route: ['/followed-stores', 'bf2'],
    },
    {
      id: 'bf3',
      name: 'Snap Thrifts',
      banner: '/assets/images/fashion_menswear_hero.png',
      logo: '/assets/images/fashion_menswear_hero.png',
      followers: '0',
      metaLabel: 'Ikeja, Lagos',
      isVerified: true,
      route: ['/followed-stores', 'bf3'],
    },
    {
      id: 'bf4',
      name: 'goMelon',
      banner: '/assets/images/product_watch_luxury.png',
      logo: '/assets/images/product_watch_luxury.png',
      followers: '0',
      metaLabel: 'Ikeja, Lagos',
      isVerified: true,
      route: ['/followed-stores', 'bf4'],
    },
    {
      id: 'bf5',
      name: 'Amazing Fragrances',
      banner: '/assets/images/product_watch_luxury.png',
      logo: '/assets/images/product_sneakers_lifestyle.png',
      followers: '0',
      metaLabel: 'Ikeja, Lagos',
      isVerified: true,
      route: ['/followed-stores', 'bf5'],
    },
    {
      id: 'bf6',
      name: 'New Age Properties',
      banner: '/assets/images/product_watch_luxury.png',
      logo: '/assets/images/product_watch_luxury.png',
      followers: '0',
      metaLabel: 'Ikeja, Lagos',
      isVerified: true,
      route: ['/followed-stores', 'bf6'],
    },
    {
      id: 'bf7',
      name: 'Swift Wears',
      banner: '/assets/images/fashion_menswear_hero.png',
      logo: '/assets/images/product_keyboard_rgb.png',
      followers: '0',
      metaLabel: 'Ikeja, Lagos',
      isVerified: true,
      route: ['/followed-stores', 'bf7'],
    },
  ]);

  readonly filteredStores = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();

    if (!query) {
      return this.stores();
    }

    return this.stores().filter((store) => store.name.toLowerCase().includes(query));
  });
}
