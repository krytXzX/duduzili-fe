import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Store, StoreCardComponent } from '../../components/stores/store-card.component';
import {
  VendorRecord,
  VendorsFollowingResponse,
  VendorsService,
} from '../../services/vendors.service';
import { environment } from '../../../environments/environment';

type MobileFollowedStore = {
  id: string;
  name: string;
  location: string;
  route: readonly string[];
  coverImage: string;
  logoImage: string;
  isVerified: boolean;
};

@Component({
  selector: 'app-followed-stores-page',
  imports: [CommonModule, StoreCardComponent, NgOptimizedImage, RouterLink],
  template: `
    <section class="min-h-full bg-[#f5f5f5] md:bg-white">
      <div class="mx-auto w-full max-w-[390px] bg-[#f5f5f5] px-5 pb-8 pt-3 md:hidden">
        <header class="flex h-[54px] items-center justify-between">
          <div class="flex items-center gap-2">
            <a
              routerLink="/more"
              aria-label="Back"
              class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#f3f3f3]"
            >
              <img
                ngSrc="/assets/icons/auth-shell-card-arrow-left.svg"
                alt=""
                width="20"
                height="20"
                class="h-5 w-5"
                aria-hidden="true"
              />
            </a>
            <h1 class="text-[20px] font-semibold leading-[1.2] text-black">Followed stores</h1>
          </div>

          <button
            type="button"
            aria-label="Search stores"
            class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#f3f3f3]"
          >
            <img
              ngSrc="/assets/icons/chats-search-mobile.svg"
              alt=""
              width="20"
              height="20"
              class="h-5 w-5"
              aria-hidden="true"
            />
          </button>
        </header>

        @if (isLoading()) {
          <div class="flex min-h-[320px] items-center justify-center text-[15px] text-[#6B7280]">
            Loading followed stores...
          </div>
        } @else if (errorMessage()) {
          <div class="flex min-h-[320px] items-center justify-center text-center text-[15px] text-[#D14343]">
            {{ errorMessage() }}
          </div>
        } @else if (!mobileStores().length) {
          <div class="flex min-h-[320px] items-center justify-center text-[15px] text-[#6B7280]">
            You are not following any stores yet.
          </div>
        } @else {
          <div class="mt-3 grid grid-cols-2 gap-2">
            @for (store of mobileStores(); track store.id) {
              <a
                [routerLink]="store.route"
                class="overflow-hidden rounded-[13.746px] border border-[#eaeaea] bg-white"
              >
                <div class="relative h-[90.5px] overflow-hidden rounded-t-[13.746px]">
                  <img
                    [ngSrc]="store.coverImage"
                    [alt]="store.name"
                    width="173"
                    height="90"
                    class="h-full w-full object-cover"
                  />

                  <div
                    class="pointer-events-none absolute inset-x-0 bottom-0 h-[57px] bg-[linear-gradient(180deg,rgba(255,255,255,0)_0.53734%,#ffffff_93.469%)]"
                    aria-hidden="true"
                  ></div>

                  <div
                    class="absolute left-[10.88px] top-[41.24px] h-[42.385px] w-[42.385px] overflow-hidden rounded-full border-[2.291px] border-white bg-white"
                  >
                    <img
                      [ngSrc]="store.logoImage"
                      [alt]="store.name + ' logo'"
                      width="42"
                      height="42"
                      class="h-full w-full object-cover"
                    />
                  </div>
                </div>

                <div class="px-[10.88px] pb-[10px] pt-[4px]">
                  <div class="flex items-center gap-[2.291px]">
                    <h2
                      class="line-clamp-1 text-[12px] font-medium leading-[13.746px] text-[#1f1f1f]"
                    >
                      {{ store.name }}
                    </h2>
                    @if (store.isVerified) {
                      <img
                        ngSrc="/assets/icons/home-store-verified.svg"
                        alt=""
                        width="12"
                        height="12"
                        class="h-3 w-3 shrink-0"
                        aria-hidden="true"
                      />
                    }
                  </div>

                  <p
                    class="mt-[2px] flex items-center gap-[2.242px] text-[10px] font-normal leading-[8.968px] text-[#959595]"
                  >
                    <img
                      ngSrc="/assets/icons/home-store-location.svg"
                      alt=""
                      width="10"
                      height="10"
                      class="h-[10px] w-[10px] shrink-0"
                      aria-hidden="true"
                    />
                    {{ store.location }}
                  </p>
                </div>
              </a>
            }
          </div>
        }
      </div>

      <div class="hidden md:block">
        <header
          class="flex flex-col gap-4 border-b border-[#EEF0F4] px-8 py-7 md:flex-row md:items-center md:justify-between"
        >
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
          @if (isLoading()) {
            <div class="flex min-h-[360px] items-center justify-center text-[16px] text-[#6B7280]">
              Loading followed stores...
            </div>
          } @else if (errorMessage()) {
            <div class="flex min-h-[360px] items-center justify-center text-center text-[16px] text-[#D14343]">
              {{ errorMessage() }}
            </div>
          } @else if (filteredStores().length) {
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              @for (store of filteredStores(); track store.id) {
                <app-store-card [store]="store" [showFavorite]="false" />
              }
            </div>
          } @else {
            <div
              class="flex min-h-[360px] flex-col items-center justify-center rounded-[32px] border border-[#EEF0F4] bg-[#FCFCFD] px-6 text-center"
            >
              <h2 class="text-[18px] font-semibold text-[#1A1C21]">No followed stores found</h2>
              <p class="mt-3 max-w-[420px] text-sm leading-7 text-[#6B7280]">
                Try a different search term to find one of the stores you already follow.
              </p>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuyerFollowedStoresPageComponent {
  private readonly vendorsService = inject(VendorsService);
  private readonly apiOrigin = new URL(environment.apiUrl).origin;

  readonly searchQuery = signal('');
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly stores = signal<Store[]>([]);

  readonly mobileStores = computed<readonly MobileFollowedStore[]>(() =>
    this.filteredStores().map((store) => ({
      id: store.id,
      name: store.name,
      location: store.location ?? store.metaLabel ?? 'Nigeria',
      route: store.route ?? ['/followed-stores', store.id],
      coverImage:
        store.mobileCoverImage ??
        store.coverImage ??
        store.banner ??
        '/assets/images/store-vine-cover-mobile.png',
      logoImage:
        store.mobileLogoImage ??
        store.logoImage ??
        store.logo ??
        '/assets/images/store-vine-logo-mobile.png',
      isVerified: store.isVerified ?? false,
    })),
  );

  readonly filteredStores = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();

    if (!query) {
      return this.stores();
    }

    return this.stores().filter((store) => store.name.toLowerCase().includes(query));
  });

  constructor() {
    void this.loadFollowingStores();
  }

  private async loadFollowingStores(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const response = await firstValueFrom(this.vendorsService.getFollowing());
      const items = this.extractItems(response);
      this.stores.set(
        items
          .map((store, index) => this.toStore(store, index))
          .filter((store): store is Store => store !== null),
      );
    } catch {
      this.errorMessage.set('We could not load followed stores right now.');
    } finally {
      this.isLoading.set(false);
    }
  }

  private extractItems(response: VendorsFollowingResponse): VendorRecord[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response.results)) {
      return response.results;
    }

    if (Array.isArray(response.data)) {
      return response.data;
    }

    if (Array.isArray(response.vendors)) {
      return response.vendors;
    }

    return [];
  }

  private toStore(record: VendorRecord, index: number): Store | null {
    const id =
      this.readString(record['id']) ??
      this.readString(record['store_id']) ??
      this.readString(record['slug']) ??
      `followed-store-${index + 1}`;
    const name =
      this.readString(record['store_name']) ??
      this.readString(record['name']) ??
      this.readString(record['vendor_name']);

    if (!name) {
      return null;
    }

    const logo =
      this.resolveMediaUrl(this.readString(record['profile_photo'])) ??
      this.resolveMediaUrl(this.readString(record['logo'])) ??
      this.resolveMediaUrl(this.readString(this.readRecord(record['user'])?.['avatar']));
    const banner =
      this.resolveMediaUrl(this.readString(record['cover_image'])) ??
      this.resolveMediaUrl(this.readString(record['banner'])) ??
      this.resolveMediaUrl(this.readString(record['image']));

    return {
      id,
      name,
      banner: banner ?? '/assets/images/product_sneakers_lifestyle.png',
      logo: logo ?? '/assets/images/product_sneakers_lifestyle.png',
      followers: this.formatCompactCount(record['followers_count']) ?? '0',
      metaLabel: this.composeLocation(record) ?? 'Nigeria',
      location: this.composeLocation(record) ?? 'Nigeria',
      isVerified:
        this.readBoolean(this.readRecord(record['user'])?.['is_verified']) ??
        this.readBoolean(record['is_verified']) ??
        false,
      route: ['/followed-stores', id],
      coverImage: banner ?? '/assets/images/product_sneakers_lifestyle.png',
      mobileCoverImage: banner ?? '/assets/images/product_sneakers_lifestyle.png',
      logoImage: logo ?? '/assets/images/product_sneakers_lifestyle.png',
      mobileLogoImage: logo ?? '/assets/images/product_sneakers_lifestyle.png',
      description: this.readString(record['store_bio']) ?? undefined,
      callNumber: this.readString(record['call_number']) ?? undefined,
    };
  }

  private composeLocation(record: VendorRecord): string | null {
    const location = this.readString(record['location']);
    if (location) {
      return location;
    }

    const city = this.readString(record['city']);
    const state = this.readString(record['state']);
    if (city && state && !city.includes(state)) {
      return `${city}, ${state}`;
    }

    return city ?? state ?? null;
  }

  private formatCompactCount(value: unknown): string | null {
    const parsed = this.readNumber(value);
    if (parsed === null) {
      return null;
    }

    if (parsed >= 1000) {
      return `${(parsed / 1000).toFixed(parsed >= 10000 ? 0 : 1).replace(/\.0$/, '')}k`;
    }

    return new Intl.NumberFormat('en-NG').format(parsed);
  }

  private resolveMediaUrl(value: string | null | undefined): string | null {
    if (!value) {
      return null;
    }

    if (/^https?:\/\//i.test(value)) {
      return value;
    }

    if (value.startsWith('/')) {
      return `${this.apiOrigin}${value}`;
    }

    return `${this.apiOrigin}/${value}`;
  }

  private readString(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
  }

  private readBoolean(value: unknown): boolean | null {
    return typeof value === 'boolean' ? value : null;
  }

  private readNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const parsed = Number(value.replace(/,/g, '').trim());
      return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
  }

  private readRecord(value: unknown): Record<string, unknown> | null {
    return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
  }
}
