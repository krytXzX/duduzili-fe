import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { BuyerDashboardNavbarComponent } from '../../components/layout/buyer-dashboard-navbar.component';
import { PublicHomeNavbarComponent } from '../../components/layout/public-home-navbar.component';
import { HomeFooterComponent } from '../../components/layout/home-footer.component';
import { AuthSessionService } from '../../services/auth-session.service';
import { Listing, ListingCardComponent } from '../../components/listings/listing-card.component';
import { ListingsApiItem, ListingsSearchResponse, ListingsService } from '../../services/listings.service';
import { environment } from '../../../environments/environment';

interface CategoryFilterChip {
  id: string;
  label: string;
  trailingIcon?: 'chevron' | 'close';
}

interface CategoryListingView extends Listing {
  favoriteFilled?: boolean;
}

@Component({
  selector: 'app-category-page',
  imports: [
    RouterLink,
    BuyerDashboardNavbarComponent,
    PublicHomeNavbarComponent,
    HomeFooterComponent,
    ListingCardComponent,
  ],
  templateUrl: './category-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block h-full overflow-auto bg-white',
  },
})
export class CategoryPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly authSession = inject(AuthSessionService);
  private readonly listingsService = inject(ListingsService);
  private readonly queryParamMap = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });
  private readonly apiOrigin = new URL(environment.apiUrl).origin;
  private currentCategoryRequestId = 0;

  readonly isAuthenticated = this.authSession.isAuthenticated;
  readonly isMobileExpanded = signal(false);
  readonly isCategoryLoading = signal(false);
  readonly categoryError = signal<string | null>(null);
  readonly resultCount = signal(0);
  readonly listings = signal<CategoryListingView[]>([]);

  readonly categoryId = computed(() => this.queryParamMap().get('category')?.trim() || '1');
  readonly categoryName = computed(() => this.queryParamMap().get('name')?.trim() || 'Phone & Tablet');
  readonly totalResults = computed(() => new Intl.NumberFormat('en-NG').format(this.resultCount()));

  readonly desktopFilters: readonly CategoryFilterChip[] = [
    { id: 'location', label: 'Location', trailingIcon: 'chevron' },
    { id: 'price', label: 'Price', trailingIcon: 'chevron' },
    { id: 'condition', label: 'Condition', trailingIcon: 'chevron' },
    { id: 'verification', label: 'Verification status', trailingIcon: 'chevron' },
    { id: 'following', label: 'Following', trailingIcon: 'close' },
    { id: 'sort', label: 'Sort by: Recommended', trailingIcon: 'chevron' },
  ];

  readonly mobileFilters: readonly CategoryFilterChip[] = [
    { id: 'location', label: 'Location', trailingIcon: 'chevron' },
    { id: 'price', label: 'Price', trailingIcon: 'chevron' },
    { id: 'condition', label: 'Condition', trailingIcon: 'chevron' },
    { id: 'sort', label: 'Sort by', trailingIcon: 'chevron' },
  ];

  readonly visibleMobileListings = computed(() => (
    this.isMobileExpanded() ? this.listings() : this.listings().slice(0, 8)
  ));

  readonly canShowMoreMobile = computed(() => !this.isMobileExpanded() && this.listings().length > 8);

  constructor() {
    effect(() => {
      const categoryId = this.categoryId();
      void this.loadCategoryListings(categoryId);
    });
  }

  showMoreMobileListings(): void {
    this.isMobileExpanded.set(true);
  }

  private async loadCategoryListings(categoryId: string): Promise<void> {
    const normalizedCategoryId = categoryId.trim();
    const requestId = ++this.currentCategoryRequestId;

    this.isMobileExpanded.set(false);

    if (!normalizedCategoryId) {
      this.listings.set([]);
      this.resultCount.set(0);
      this.categoryError.set(null);
      this.isCategoryLoading.set(false);
      return;
    }

    this.isCategoryLoading.set(true);
    this.categoryError.set(null);

    try {
      const response = await firstValueFrom(this.listingsService.getCategoryListings(normalizedCategoryId));
      if (requestId !== this.currentCategoryRequestId) {
        return;
      }

      const items = this.extractItems(response);
      const mappedListings = items
        .map((item, index) => this.toListing(item, index))
        .filter((listing): listing is Listing => listing !== null);
      const totalCount = this.extractCount(response, mappedListings.length);

      this.listings.set(mappedListings);
      this.resultCount.set(totalCount);
      this.categoryError.set(null);
    } catch (error) {
      if (requestId !== this.currentCategoryRequestId) {
        return;
      }

      this.listings.set([]);
      this.resultCount.set(0);
      this.categoryError.set(this.extractErrorMessage(error));
    } finally {
      if (requestId === this.currentCategoryRequestId) {
        this.isCategoryLoading.set(false);
      }
    }
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

  private extractCount(response: ListingsSearchResponse, fallback: number): number {
    if (Array.isArray(response)) {
      return response.length;
    }

    return typeof response.count === 'number' ? response.count : fallback;
  }

  private toListing(item: ListingsApiItem, index: number): CategoryListingView | null {
    const id = this.readId(item, index);
    const title = this.readString(item, ['title', 'name', 'listing_name']);
    const priceValue = this.formatPriceValue(item['price'] ?? item['amount'] ?? item['price_display']);
    const images = this.extractImageList(item);

    if (!title || !priceValue) {
      return null;
    }

    return {
      id,
      title,
      price: priceValue,
      originalPrice: this.formatPriceOptional(item['original_price'] ?? item['originalPrice']),
      discountBadge: this.formatDiscountBadge(item['discount_percentage']),
      location: this.buildLocationLabel(item),
      timeAgo: this.relativeTimeFromDate(this.readString(item, ['created_at', 'published_at', 'date_created'])),
      isVerified: this.readBoolean(item, ['is_verified', 'verified']) || false,
      favoriteFilled: this.readBoolean(item, ['is_favorited']) || false,
      images,
    };
  }

  private extractImageList(item: ListingsApiItem): string[] {
    const directKeys = ['images', 'photos', 'gallery'];
    for (const key of directKeys) {
      const value = item[key];
      if (Array.isArray(value)) {
        const urls = value
          .map((entry) => {
            if (typeof entry === 'string') {
              return this.resolveMediaUrl(entry);
            }

            if (entry && typeof entry === 'object') {
              const candidate = this.readString(entry as Record<string, unknown>, ['image', 'url', 'photo', 'src']);
              return candidate ? this.resolveMediaUrl(candidate) : null;
            }

            return null;
          })
          .filter((url): url is string => !!url);
        if (urls.length) {
          return urls;
        }
      }
    }

    const singleImage = this.readString(item, ['image', 'thumbnail', 'photo', 'featured_image', 'cover_image']);
    if (singleImage) {
      return [this.resolveMediaUrl(singleImage)];
    }

    return ['/assets/images/home-item-placeholder.png'];
  }

  private buildLocationLabel(item: ListingsApiItem): string {
    const city = this.readString(item, ['city']);
    const state = this.readString(item, ['state']);
    const location = this.readString(item, ['location', 'address']);

    if (city && state) {
      return `${city}, ${state}`;
    }

    if (location) {
      return location;
    }

    return state || city || 'Nigeria';
  }

  private resolveMediaUrl(path: string): string {
    if (/^https?:\/\//i.test(path)) {
      return path;
    }

    return `${this.apiOrigin}${path.startsWith('/') ? path : `/${path}`}`;
  }

  private readString(source: Record<string, unknown>, keys: string[]): string | null {
    for (const key of keys) {
      const value = source[key];
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed) {
          return trimmed;
        }
      }
    }

    return null;
  }

  private readBoolean(source: Record<string, unknown>, keys: string[]): boolean | null {
    for (const key of keys) {
      const value = source[key];
      if (typeof value === 'boolean') {
        return value;
      }
    }

    return null;
  }

  private readId(source: Record<string, unknown>, index: number): string {
    const raw = source['id'] ?? source['pk'] ?? source['uuid'] ?? index;
    return String(raw);
  }

  private formatPriceValue(value: unknown): string {
    const normalized = this.normalizePriceValue(value);
    return normalized === null ? '' : `₦${new Intl.NumberFormat('en-NG').format(normalized)}`;
  }

  private formatPriceOptional(value: unknown): string | undefined {
    const normalized = this.normalizePriceValue(value);
    return normalized === null ? undefined : `₦${new Intl.NumberFormat('en-NG').format(normalized)}`;
  }

  private normalizePriceValue(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) {
        return null;
      }

      const numeric = Number(trimmed.replace(/[^0-9.]/g, ''));
      return Number.isFinite(numeric) ? numeric : null;
    }

    return null;
  }

  private formatDiscountBadge(value: unknown): string | undefined {
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      return `-${Math.round(value)}%`;
    }

    if (typeof value === 'string' && value.trim()) {
      const numeric = Number(value.trim());
      if (Number.isFinite(numeric) && numeric > 0) {
        return `-${Math.round(numeric)}%`;
      }
    }

    return undefined;
  }

  private relativeTimeFromDate(value: string | null): string {
    if (!value) {
      return 'Recently';
    }

    const timestamp = Date.parse(value);
    if (Number.isNaN(timestamp)) {
      return 'Recently';
    }

    const diffMs = Date.now() - timestamp;
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diffMs < minute) {
      return 'Just now';
    }

    if (diffMs < hour) {
      return `${Math.max(1, Math.floor(diffMs / minute))} mins ago`;
    }

    if (diffMs < day) {
      return `${Math.max(1, Math.floor(diffMs / hour))} hrs ago`;
    }

    return `${Math.max(1, Math.floor(diffMs / day))} days ago`;
  }

  private extractErrorMessage(error: unknown): string {
    if (error && typeof error === 'object') {
      const maybeError = error as { error?: unknown; message?: unknown };

      if (typeof maybeError.message === 'string' && maybeError.message.trim()) {
        return maybeError.message;
      }

      if (maybeError.error && typeof maybeError.error === 'object') {
        const backendError = maybeError.error as Record<string, unknown>;
        const detail = this.readString(backendError, ['detail', 'message', 'error']);
        if (detail) {
          return detail;
        }
      }
    }

    return 'We could not load this category right now.';
  }
}
