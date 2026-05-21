import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { Listing, ListingCardComponent } from '../../components/listings/listing-card.component';
import {
  ListingsApiItem,
  ListingsService,
  WishlistResponse,
} from '../../services/listings.service';
import { environment } from '../../../environments/environment';
import { FavoritesStateService } from '../../services/favorites-state.service';

interface WishlistGroup {
  label: string;
  listings: Listing[];
}

interface WishlistEntry {
  label: string;
  listing: Listing;
}

type WishlistGroupedKey = 'today' | 'yesterday' | 'earlier';
type WishlistGroupedResponse = {
  today?: ListingsApiItem[];
  yesterday?: ListingsApiItem[];
  earlier?: ListingsApiItem[];
};

@Component({
  selector: 'app-buyer-wishlist-page',
  imports: [CommonModule, ListingCardComponent],
  template: `
    <section class="min-h-full bg-white">
      <div class="hidden lg:block">
        <header class="h-[69px] border-b border-[#EEEEEE] bg-white px-4">
          <h1 class="pt-4 text-[24px] font-medium leading-normal text-[#0d0d0d]">Wishlist</h1>
        </header>

        <div class="min-h-[calc(100vh-173px)] rounded-b-[24px] bg-white px-6 py-6 xl:px-8">
          @if (isLoading()) {
            <div class="flex min-h-[320px] items-center justify-center text-[16px] text-[#6B7280]">
              Loading wishlist...
            </div>
          } @else if (errorMessage()) {
            <div class="flex min-h-[320px] items-center justify-center text-center text-[16px] text-[#D14343]">
              {{ errorMessage() }}
            </div>
          } @else if (!desktopGroups().length) {
            <div class="flex min-h-[320px] items-center justify-center text-[16px] text-[#6B7280]">
              Your wishlist is empty.
            </div>
          } @else {
            <div class="space-y-11">
              @for (group of desktopGroups(); track group.label) {
                <section>
                  <h2 class="text-[20px] font-medium leading-6 text-[#222222]">{{ group.label }}</h2>

                  <div class="mt-[13px] grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    @for (listing of group.listings; track listing.id) {
                      <app-listing-card
                        [listing]="listing"
                        [favoriteFilled]="true"
                        (favoriteChanged)="handleFavoriteChanged($event)"
                      />
                    }
                  </div>
                </section>
              }
            </div>
          }
        </div>
      </div>

      <div class="mx-auto w-full max-w-[390px] px-5 pb-[120px] pt-3 lg:hidden">
        <h1 class="text-[24px] font-semibold leading-8 text-[#1a1b1d]">Wishlist</h1>

        @if (isLoading()) {
          <div class="flex min-h-[320px] items-center justify-center text-[15px] text-[#6B7280]">
            Loading wishlist...
          </div>
        } @else if (errorMessage()) {
          <div class="flex min-h-[320px] items-center justify-center text-center text-[15px] text-[#D14343]">
            {{ errorMessage() }}
          </div>
        } @else if (!mobileGroups().length) {
          <div class="flex min-h-[320px] items-center justify-center text-[15px] text-[#6B7280]">
            Your wishlist is empty.
          </div>
        } @else {
          <div class="mt-8 space-y-8 px-0">
            @for (group of mobileGroups(); track group.label) {
              <section>
                <h2 class="text-[20px] font-medium leading-normal text-[#2a2a2a]">{{ group.label }}</h2>

                <div class="mt-4 grid grid-cols-2 gap-2">
                  @for (listing of group.listings; track listing.id) {
                    <app-listing-card
                      [listing]="listing"
                      [favoriteFilled]="true"
                      (favoriteChanged)="handleFavoriteChanged($event)"
                    />
                  }
                </div>
              </section>
            }
          </div>
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuyerWishlistPageComponent {
  private readonly listingsService = inject(ListingsService);
  private readonly favoritesStateService = inject(FavoritesStateService);
  private readonly apiOrigin = new URL(environment.apiUrl).origin;

  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly allWishlistEntries = signal<WishlistEntry[]>([]);
  readonly wishlistEntries = computed(() => {
    const favoritedIds = new Set(this.favoritesStateService.favoritedIds());

    return this.allWishlistEntries().filter((entry) => favoritedIds.has(entry.listing.id));
  });

  readonly desktopGroups = computed(() => this.buildGroups(this.wishlistEntries()));
  readonly mobileGroups = computed(() => this.buildGroups(this.wishlistEntries()));

  constructor() {
    void this.loadFavorites();
  }

  private async loadFavorites(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const response = await firstValueFrom(this.listingsService.getWishlist());
      const entries = this.extractEntries(response)
        .map((entry, index) => this.toWishlistEntry(entry.label, entry.item, index))
        .filter((entry): entry is WishlistEntry => entry !== null);

      this.allWishlistEntries.set(entries);
      this.favoritesStateService.setAll(entries.map((entry) => entry.listing.id));
    } catch {
      this.errorMessage.set('We could not load your wishlist right now.');
    } finally {
      this.isLoading.set(false);
    }
  }

  private buildGroups(entries: WishlistEntry[]): WishlistGroup[] {
    if (entries.length === 0) {
      return [];
    }

    const grouped = new Map<string, Listing[]>();

    for (const entry of entries) {
      grouped.set(entry.label, [...(grouped.get(entry.label) ?? []), entry.listing]);
    }

    return this.groupLabels
      .map((label) => ({
        label,
        listings: grouped.get(label) ?? [],
      }))
      .filter((group) => group.listings.length > 0);
  }

  private extractEntries(response: WishlistResponse): Array<{ label: string; item: ListingsApiItem }> {
    if ('results' in response && Array.isArray(response.results)) {
      return response.results
        .map((entry) => {
          const record = this.readRecord(entry);
          if (!record) {
            return null;
          }

          const listingDetails = this.readRecord(record['listing_details']);
          if (!listingDetails) {
            return null;
          }

          return {
            label: this.groupLabelFromDate(this.readString(record['created_at'])),
            item: listingDetails,
          };
        })
        .filter((entry): entry is { label: string; item: ListingsApiItem } => entry !== null);
    }

    const groupedResponse = response as WishlistGroupedResponse;

    return this.groupLabels.flatMap((label) =>
      (groupedResponse[this.toResponseKey(label)] ?? []).map((item) => ({
        label,
        item,
      })),
    );
  }

  private toWishlistEntry(label: string, item: ListingsApiItem, index: number): WishlistEntry | null {
    const title =
      this.readString(item['title']) ??
      this.readString(item['name']) ??
      this.readString(item['listing_name']);
    const price = this.formatPrice(item['price']);

    if (!title || !price) {
      return null;
    }

    return {
      label,
      listing: {
        id: this.readString(item['id']) ?? `favorite-${index + 1}`,
        title,
        price,
        originalPrice: this.formatPrice(item['original_price']) ?? undefined,
        discountBadge: this.formatDiscountBadge(item['discount_percentage']) ?? undefined,
        location: this.composeLocation(item) ?? 'Nigeria',
        timeAgo: this.formatCondition(item['condition']) ?? 'Recently',
        isVerified: this.readBoolean(item['is_verified']) ?? false,
        images: this.extractImages(item),
      },
    };
  }

  handleFavoriteChanged(event: { id: string; isFavorited: boolean }): void {
    if (event.isFavorited) {
      this.favoritesStateService.add(event.id);
      return;
    }

    this.favoritesStateService.remove(event.id);
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

  private formatPrice(value: unknown): string | null {
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

  private readonly groupLabels = ['Today', 'Yesterday', 'Earlier'] as const;

  private groupLabelFromDate(value: string | null): string {
    if (!value) {
      return 'Earlier';
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return 'Earlier';
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    if (parsed >= todayStart) {
      return 'Today';
    }

    if (parsed >= yesterdayStart) {
      return 'Yesterday';
    }

    return 'Earlier';
  }

  private toResponseKey(label: (typeof this.groupLabels)[number]): WishlistGroupedKey {
    switch (label) {
      case 'Today':
        return 'today';
      case 'Yesterday':
        return 'yesterday';
      default:
        return 'earlier';
    }
  }
}
