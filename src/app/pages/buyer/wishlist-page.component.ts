import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { Listing, ListingCardComponent } from '../../components/listings/listing-card.component';
import {
  ListingsApiItem,
  ListingsSearchResponse,
  ListingsService,
} from '../../services/listings.service';
import { environment } from '../../../environments/environment';
import { FavoritesStateService } from '../../services/favorites-state.service';

interface WishlistGroup {
  label: string;
  listings: Listing[];
}

interface WishlistEntry {
  listing: Listing;
  createdAt: string | null;
}

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
  readonly wishlistEntries = signal<WishlistEntry[]>([]);

  readonly desktopGroups = computed(() => this.buildGroups(this.wishlistEntries()));
  readonly mobileGroups = computed(() => this.buildGroups(this.wishlistEntries()));

  constructor() {
    void this.loadFavorites();
  }

  private async loadFavorites(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const response = await firstValueFrom(this.listingsService.getMyFavorites());
      const items = this.extractItems(response);
      const entries = items
        .map((item, index) => this.toWishlistEntry(item, index))
        .filter((entry): entry is WishlistEntry => entry !== null);

      this.wishlistEntries.set(entries);
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
      const label = this.labelForListing(entry.createdAt);
      grouped.set(label, [...(grouped.get(label) ?? []), entry.listing]);
    }

    return Array.from(grouped.entries()).map(([label, groupedListings]) => ({
      label,
      listings: groupedListings,
    }));
  }

  private labelForListing(createdAtValue: string | null): string {
    const createdAt = this.parseDate(createdAtValue);
    if (!createdAt) {
      return 'Favorites';
    }

    const now = new Date();
    const isSameDay =
      createdAt.getDate() === now.getDate()
      && createdAt.getMonth() === now.getMonth()
      && createdAt.getFullYear() === now.getFullYear();

    if (isSameDay) {
      return 'Today';
    }

    return new Intl.DateTimeFormat('en-NG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(createdAt);
  }

  private parseDate(value: string | null): Date | null {
    if (!value) {
      return null;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  private extractItems(response: ListingsSearchResponse): ListingsApiItem[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response.results)) {
      return response.results;
    }

    if (Array.isArray(response.data)) {
      return response.data;
    }

    if (Array.isArray(response.listings)) {
      return response.listings;
    }

    return [];
  }

  private toWishlistEntry(item: ListingsApiItem, index: number): WishlistEntry | null {
    const listingDetails = this.readRecord(item['listing_details']) ?? item;
    const title =
      this.readString(listingDetails['title']) ??
      this.readString(listingDetails['name']) ??
      this.readString(listingDetails['listing_name']);
    const price = this.formatPrice(listingDetails['price']);

    if (!title || !price) {
      return null;
    }

    return {
      createdAt: this.readString(item['created_at']),
      listing: {
        id: this.readString(listingDetails['id']) ?? `favorite-${index + 1}`,
        title,
        price,
        originalPrice: this.formatPrice(listingDetails['original_price']) ?? undefined,
        discountBadge: this.formatDiscountBadge(listingDetails['discount_percentage']) ?? undefined,
        location: this.composeLocation(listingDetails) ?? 'Nigeria',
        timeAgo: this.formatCondition(listingDetails['condition']) ?? 'Recently',
        isVerified: this.readBoolean(listingDetails['is_verified']) ?? false,
        images: this.extractImages(listingDetails),
      },
    };
  }

  handleFavoriteChanged(event: { id: string; isFavorited: boolean }): void {
    if (event.isFavorited) {
      return;
    }

    this.wishlistEntries.update((entries) =>
      entries.filter((entry) => entry.listing.id !== event.id),
    );
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
}
