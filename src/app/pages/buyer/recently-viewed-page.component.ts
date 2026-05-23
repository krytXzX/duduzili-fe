import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Listing, ListingCardComponent } from '../../components/listings/listing-card.component';
import {
  ListingsApiItem,
  RecentlyViewedResponse,
  ListingsService,
} from '../../services/listings.service';
import { FavoritesStateService } from '../../services/favorites-state.service';
import { environment } from '../../../environments/environment';

interface RecentlyViewedGroup {
  label: string;
  listings: Array<Listing & { favoriteFilled?: boolean }>;
}

interface RecentlyViewedEntry {
  listing: Listing & { favoriteFilled?: boolean };
  createdAt: string | null;
  groupLabel: string;
}

@Component({
  selector: 'app-buyer-recently-viewed-page',
  imports: [CommonModule, ListingCardComponent, RouterLink, NgOptimizedImage],
  template: `
    <section class="min-h-full bg-white">
      <div class="md:hidden">
        <header class="h-[54px] px-5">
          <div class="flex h-full items-center gap-2">
            <a
              routerLink="/more"
              aria-label="Back"
              class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f3f3f3]"
            >
              <img
                ngSrc="/assets/icons/recently-viewed-mobile/arrow-left.svg"
                alt=""
                aria-hidden="true"
                width="20"
                height="20"
                class="h-5 w-5"
              />
            </a>
            <h1 class="text-[20px] font-semibold leading-[1.2] text-[#111]">Recently viewed</h1>
          </div>
        </header>

        <div class="space-y-6 px-5 pb-8 pt-3">
          @if (isLoading()) {
            <div class="flex min-h-[320px] items-center justify-center text-[15px] text-[#6B7280]">
              Loading recently viewed...
            </div>
          } @else if (errorMessage()) {
            <div class="flex min-h-[320px] items-center justify-center text-center text-[15px] text-[#D14343]">
              {{ errorMessage() }}
            </div>
          } @else if (!mobileGroups().length) {
            <div class="flex min-h-[320px] items-center justify-center text-[15px] text-[#6B7280]">
              You have not viewed any listings yet.
            </div>
          } @else {
            @for (group of mobileGroups(); track group.label) {
              <section>
                <h2 class="mb-4 text-[20px] font-medium leading-[1.2] text-[#2a2a2a]">{{ group.label }}</h2>
                <div class="grid grid-cols-2 gap-2">
                  @for (listing of group.listings; track listing.id) {
                    <app-listing-card
                      [listing]="listing"
                      [favoriteFilled]="listing.favoriteFilled ?? false"
                      (favoriteChanged)="handleFavoriteChanged($event)"
                    />
                  }
                </div>
              </section>
            }
          }
        </div>
      </div>

      <div class="hidden md:block">
        <header class="border-b border-[#EEF0F4] px-8 py-7">
          <h1 class="text-[24px] font-semibold tracking-tight text-[#1A1C21]">Recently viewed</h1>
        </header>

        <div class="space-y-12 px-8 py-8">
          @if (isLoading()) {
            <div class="flex min-h-[320px] items-center justify-center text-[16px] text-[#6B7280]">
              Loading recently viewed...
            </div>
          } @else if (errorMessage()) {
            <div class="flex min-h-[320px] items-center justify-center text-center text-[16px] text-[#D14343]">
              {{ errorMessage() }}
            </div>
          } @else if (!groups().length) {
            <div class="flex min-h-[320px] items-center justify-center text-[16px] text-[#6B7280]">
              You have not viewed any listings yet.
            </div>
          } @else {
            @for (group of groups(); track group.label) {
              <section>
                <h2 class="mb-5 text-[18px] font-medium text-[#1A1C21]">{{ group.label }}</h2>

                <div class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                  @for (listing of group.listings; track listing.id) {
                    <app-listing-card
                      [listing]="listing"
                      [favoriteFilled]="listing.favoriteFilled ?? false"
                      (favoriteChanged)="handleFavoriteChanged($event)"
                    />
                  }
                </div>
              </section>
            }
          }
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuyerRecentlyViewedPageComponent {
  private readonly listingsService = inject(ListingsService);
  private readonly favoritesStateService = inject(FavoritesStateService);
  private readonly apiOrigin = new URL(environment.apiUrl).origin;

  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly recentlyViewedEntries = signal<RecentlyViewedEntry[]>([]);

  readonly groups = computed(() => this.buildGroups(this.recentlyViewedEntries()));
  readonly mobileGroups = computed(() => this.buildGroups(this.recentlyViewedEntries()));

  constructor() {
    void this.loadRecentlyViewed();
  }

  private async loadRecentlyViewed(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const response = await firstValueFrom(this.listingsService.getRecentlyViewed());
      const entries = this.extractItems(response)
        .map(({ item, label }, index) => this.toRecentlyViewedEntry(item, label, index))
        .filter((entry): entry is RecentlyViewedEntry => entry !== null);

      this.recentlyViewedEntries.set(entries);
      const mergedFavoritedIds = new Set(this.favoritesStateService.favoritedIds());
      for (const entry of entries) {
        if (entry.listing.favoriteFilled) {
          mergedFavoritedIds.add(entry.listing.id);
        }
      }
      this.favoritesStateService.setAll(Array.from(mergedFavoritedIds));
    } catch {
      this.errorMessage.set('We could not load your recently viewed listings right now.');
    } finally {
      this.isLoading.set(false);
    }
  }

  handleFavoriteChanged(event: { id: string; isFavorited: boolean }): void {
    this.recentlyViewedEntries.update((entries) =>
      entries.map((entry) => (
        entry.listing.id === event.id
          ? {
              ...entry,
              listing: {
                ...entry.listing,
                favoriteFilled: event.isFavorited,
              },
            }
          : entry
      )),
    );

    if (event.isFavorited) {
      this.favoritesStateService.add(event.id);
      return;
    }

    this.favoritesStateService.remove(event.id);
  }

  private buildGroups(entries: RecentlyViewedEntry[]): RecentlyViewedGroup[] {
    if (entries.length === 0) {
      return [];
    }

    const grouped = new Map<string, Array<Listing & { favoriteFilled?: boolean }>>();

    for (const entry of entries) {
      grouped.set(entry.groupLabel, [...(grouped.get(entry.groupLabel) ?? []), entry.listing]);
    }

    const orderedLabels = ['Today', 'Yesterday', 'Earlier'];
    return orderedLabels
      .map((label) => {
        const listings = grouped.get(label);
        return listings ? { label, listings } : null;
      })
      .filter((group): group is RecentlyViewedGroup => group !== null);
  }

  private extractItems(
    response: RecentlyViewedResponse,
  ): Array<{ item: ListingsApiItem; label: string }> {
    const groups: Array<{ key: keyof RecentlyViewedResponse; label: string }> = [
      { key: 'today', label: 'Today' },
      { key: 'yesterday', label: 'Yesterday' },
      { key: 'earlier', label: 'Earlier' },
    ];

    return groups.flatMap(({ key, label }) => {
      const items = response[key];
      if (!Array.isArray(items)) {
        return [];
      }

      return items.map((item) => ({ item, label }));
    });
  }

  private toRecentlyViewedEntry(
    item: ListingsApiItem,
    groupLabel: string,
    index: number,
  ): RecentlyViewedEntry | null {
    const title =
      this.readString(item['title']) ??
      this.readString(item['name']) ??
      this.readString(item['listing_name']);
    const price = this.formatPrice(item['price'], this.readBoolean(item['is_free']) ?? false);

    if (!title || !price) {
      return null;
    }

    return {
      createdAt: this.readString(item['viewed_at']) ?? this.readString(item['created_at']),
      groupLabel,
      listing: {
        id: this.readString(item['id']) ?? `recently-viewed-${index + 1}`,
        title,
        price,
        originalPrice: this.formatPrice(item['original_price'], false) ?? undefined,
        discountBadge: this.formatDiscountBadge(item['discount_percentage']) ?? undefined,
        location: this.composeLocation(item) ?? 'Nigeria',
        timeAgo: this.formatCondition(item['condition']) ?? 'Recently viewed',
        isVerified: this.readBoolean(item['is_verified']) ?? false,
        favoriteFilled:
          this.readBoolean(item['is_saved']) ?? false,
        images: this.extractImages(item),
      },
    };
  }

  private extractImages(item: ListingsApiItem): string[] {
    const arrayCandidates = [item['images'], item['gallery'], item['photos']];

    for (const candidate of arrayCandidates) {
      if (!Array.isArray(candidate)) {
        continue;
      }

      const images = candidate
        .map((entry) => {
          if (typeof entry === 'string') {
            return this.resolveMediaUrl(entry);
          }

          const record = this.readRecord(entry);
          if (!record) {
            return null;
          }

          return (
            this.resolveMediaUrl(this.readString(record['image'])) ??
            this.resolveMediaUrl(this.readString(record['url'])) ??
            this.resolveMediaUrl(this.readString(record['src'])) ??
            this.resolveMediaUrl(this.readString(record['thumbnail']))
          );
        })
        .filter((image): image is string => typeof image === 'string' && image.length > 0);

      if (images.length > 0) {
        return images;
      }
    }

    const singleImage =
      this.resolveMediaUrl(this.readString(item['thumbnail'])) ??
      this.resolveMediaUrl(this.readString(item['image'])) ??
      this.resolveMediaUrl(this.readString(item['cover_image']));

    return singleImage ? [singleImage] : ['/assets/images/home-item-placeholder.png'];
  }

  private formatPrice(value: unknown, isFree: boolean): string | null {
    if (isFree) {
      return 'Free';
    }

    const parsed = this.readNumber(value);
    if (parsed === null) {
      return null;
    }

    return `₦${new Intl.NumberFormat('en-NG').format(parsed)}`;
  }

  private formatDiscountBadge(value: unknown): string | null {
    const parsed = this.readNumber(value);
    if (parsed === null || parsed <= 0) {
      return null;
    }

    return `-${Math.round(parsed)}%`;
  }

  private formatCondition(value: unknown): string | null {
    if (typeof value !== 'string' || !value.trim()) {
      return null;
    }

    return value
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  private composeLocation(record: ListingsApiItem): string | null {
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

  private readBoolean(value: unknown): boolean | null {
    return typeof value === 'boolean' ? value : null;
  }

  private readRecord(value: unknown): Record<string, unknown> | null {
    return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
  }
}
