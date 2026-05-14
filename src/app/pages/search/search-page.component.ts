import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Listing, ListingCardComponent } from '../../components/listings/listing-card.component';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BuyerDashboardNavbarComponent } from '../../components/layout/buyer-dashboard-navbar.component';
import { PublicHomeNavbarComponent } from '../../components/layout/public-home-navbar.component';
import { FooterComponent } from '../../components/layout/footer.component';
import { Store, StoreCardComponent } from '../../components/stores/store-card.component';
import { AuthSessionService } from '../../services/auth-session.service';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ListingsApiItem, ListingsSearchResponse, ListingsService } from '../../services/listings.service';

interface SearchResultSection {
  title: string;
  viewAllCount: string;
  listings: Listing[];
}

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    BuyerDashboardNavbarComponent,
    PublicHomeNavbarComponent,
    ListingCardComponent,
    FooterComponent,
    StoreCardComponent,
  ],
  templateUrl: './search-page.component.html',
  styles: `
    .price-range-input {
      pointer-events: none;
    }

    .price-range-input::-webkit-slider-thumb {
      pointer-events: auto;
      appearance: none;
      width: 28px;
      height: 28px;
      border-radius: 9999px;
      border: 1px solid #e5e7eb;
      background: #ffffff;
      box-shadow: 0 10px 24px -18px rgba(17, 24, 39, 0.45);
      cursor: pointer;
    }

    .price-range-input::-moz-range-thumb {
      pointer-events: auto;
      width: 28px;
      height: 28px;
      border-radius: 9999px;
      border: 1px solid #e5e7eb;
      background: #ffffff;
      box-shadow: 0 10px 24px -18px rgba(17, 24, 39, 0.45);
      cursor: pointer;
    }
  `,
  host: { class: 'block h-full overflow-auto' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly authSession = inject(AuthSessionService);
  private readonly listingsService = inject(ListingsService);
  private readonly queryParamMap = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });
  private readonly apiOrigin = new URL(environment.apiUrl).origin;
  private currentSearchRequestId = 0;

  readonly isAuthenticated = this.authSession.isAuthenticated;
  readonly searchTerm = computed(() => this.queryParamMap().get('q')?.trim() ?? '');
  readonly listingsCount = computed(() => new Intl.NumberFormat('en-NG').format(this.resultCount()));
  readonly floatingSearchTerm = computed(() => this.searchTerm());
  readonly activeFilter = signal<string | null>(null);
  readonly isSearchLoading = signal(false);
  readonly searchError = signal<string | null>(null);
  readonly resultCount = signal(0);
  readonly searchListings = signal<Listing[]>([]);

  readonly categoryOptions = [
    'Phones & Laptops',
    'Women',
    'Men',
    'Beauty',
    'Food & Drinks',
    'Baby & Toddler',
    'Home',
    'Properties',
    'Fitness & Nutrition',
    'Accessories',
    'Pet supplies',
    'Toys & Games',
    'Electronics',
    'Arts & Crafts',
    'Luggage & Bags',
    'Sporting goods',
  ];
  readonly locationOptions = [
    'Abuja', 'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
    'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe',
    'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
    'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
    'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
  ];
  readonly conditionOptions = ['New', 'Fairly used'];
  readonly verificationOptions = ['Verified', 'Unverified'];
  readonly sortOptions = [
    'Recommended (default)',
    'Newest listings',
    'Price: Low to High',
    'Price: High to Low',
    'Most viewed',
    'Trending',
    'Nearest to me',
  ];

  readonly selectedCategories = signal<string[]>(['Phones & Laptops']);
  readonly selectedLocations = signal<string[]>(['Akwa Ibom', 'Lagos', 'Rivers']);
  readonly selectedCondition = signal<string[]>(['Fairly used']);
  readonly selectedVerification = signal<string[]>(['Verified']);
  readonly selectedFollowing = signal<string[]>(['Amazing Fragrances']);
  readonly selectedSort = signal('Recommended (default)');
  readonly vendorSearch = signal('');
  readonly minPrice = signal(2000);
  readonly maxPrice = signal(700000000);

  readonly filters = computed(() => ([
    { key: 'category', label: this.categoryLabel() },
    { key: 'location', label: this.locationLabel() },
    { key: 'price', label: 'Price' },
    { key: 'condition', label: this.conditionLabel() },
    { key: 'verification', label: this.verificationLabel() },
    { key: 'following', label: 'Following' },
    { key: 'sort', label: `Sort by: ${this.selectedSort()}` },
  ]));

  readonly stores = signal<Store[]>([]);

  readonly sections = computed<SearchResultSection[]>(() => {
    const listings = this.searchListings();
    if (!listings.length) {
      return [];
    }

    return [
      {
        title: 'Listings',
        viewAllCount: this.listingsCount(),
        listings,
      },
    ];
  });

  readonly filteredStores = computed(() => {
    const query = this.vendorSearch().trim().toLowerCase();
    if (!query) {
      return this.stores();
    }

    return this.stores().filter((store) => store.name.toLowerCase().includes(query));
  });

  readonly categoryLabel = computed(() => {
    const count = this.selectedCategories().length;
    return count ? `Category (${count})` : 'Category';
  });

  readonly locationLabel = computed(() => {
    return this.selectedLocations().length ? `Location (${this.selectedLocations().length})` : 'Location';
  });

  readonly conditionLabel = computed(() => 'Condition');
  readonly verificationLabel = computed(() => 'Verification status');

  constructor() {
    effect(() => {
      const term = this.searchTerm();
      void this.loadSearchResults(term);
    });
  }

  toggleFilter(key: string): void {
    this.activeFilter.update((current) => current === key ? null : key);
  }

  closeFilters(): void {
    this.activeFilter.set(null);
  }

  toggleCategory(category: string): void {
    this.selectedCategories.update((current) =>
      current.includes(category) ? current.filter((item) => item !== category) : [...current, category],
    );
  }

  toggleLocation(location: string): void {
    this.selectedLocations.update((current) =>
      current.includes(location) ? current.filter((item) => item !== location) : [...current, location],
    );
  }

  toggleCondition(condition: string): void {
    this.selectedCondition.update((current) =>
      current.includes(condition) ? current.filter((item) => item !== condition) : [...current, condition],
    );
  }

  toggleVerification(status: string): void {
    this.selectedVerification.update((current) =>
      current.includes(status) ? current.filter((item) => item !== status) : [...current, status],
    );
  }

  toggleFollowing(storeName: string): void {
    this.selectedFollowing.update((current) =>
      current.includes(storeName) ? current.filter((item) => item !== storeName) : [...current, storeName],
    );
  }

  selectSort(option: string): void {
    this.selectedSort.set(option);
  }

  updateVendorSearch(value: string): void {
    this.vendorSearch.set(value);
  }

  updateMinPrice(value: string): void {
    const parsed = Number(value);
    const nextValue = Number.isNaN(parsed) ? this.minPrice() : Math.min(parsed, this.maxPrice());
    this.minPrice.set(nextValue);
  }

  updateMaxPrice(value: string): void {
    const parsed = Number(value);
    const nextValue = Number.isNaN(parsed) ? this.maxPrice() : Math.max(parsed, this.minPrice());
    this.maxPrice.set(nextValue);
  }

  resetActiveFilter(): void {
    switch (this.activeFilter()) {
      case 'category':
        this.selectedCategories.set([]);
        break;
      case 'location':
        this.selectedLocations.set([]);
        break;
      case 'price':
        this.minPrice.set(2000);
        this.maxPrice.set(700000000);
        break;
      case 'condition':
        this.selectedCondition.set([]);
        break;
      case 'verification':
        this.selectedVerification.set([]);
        break;
      case 'following':
        this.selectedFollowing.set([]);
        this.vendorSearch.set('');
        break;
      case 'sort':
        this.selectedSort.set('Recommended (default)');
        break;
      default:
        break;
    }
  }

  resetAllFilters(): void {
    this.selectedCategories.set(['Phones & Laptops']);
    this.selectedLocations.set(['Akwa Ibom', 'Lagos', 'Rivers']);
    this.minPrice.set(2000);
    this.maxPrice.set(700000000);
    this.selectedCondition.set(['Fairly used']);
    this.selectedVerification.set(['Verified']);
    this.selectedFollowing.set(['Amazing Fragrances']);
    this.selectedSort.set('Recommended (default)');
    this.vendorSearch.set('');
    this.closeFilters();
  }

  formatPrice(value: number): string {
    return `₦${new Intl.NumberFormat('en-NG').format(value)}`;
  }

  private async loadSearchResults(term: string): Promise<void> {
    const normalizedTerm = term.trim();
    const requestId = ++this.currentSearchRequestId;

    if (!normalizedTerm) {
      this.searchListings.set([]);
      this.resultCount.set(0);
      this.searchError.set(null);
      this.isSearchLoading.set(false);
      return;
    }

    this.isSearchLoading.set(true);
    this.searchError.set(null);

    try {
      const response = await firstValueFrom(this.listingsService.searchListings(normalizedTerm));
      if (requestId !== this.currentSearchRequestId) {
        return;
      }

      const items = this.extractItems(response);
      const mappedListings = items.map((item, index) => this.toListing(item, index)).filter((listing): listing is Listing => listing !== null);
      const totalCount = this.extractCount(response, mappedListings.length);

      this.searchListings.set(mappedListings);
      this.resultCount.set(totalCount);
      this.searchError.set(null);
    } catch (error) {
      if (requestId !== this.currentSearchRequestId) {
        return;
      }

      this.searchListings.set([]);
      this.resultCount.set(0);
      this.searchError.set(this.extractErrorMessage(error));
    } finally {
      if (requestId === this.currentSearchRequestId) {
        this.isSearchLoading.set(false);
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

  private toListing(item: ListingsApiItem, index: number): Listing | null {
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
      return `${Math.round(value)}% off`;
    }

    if (typeof value === 'string' && value.trim()) {
      const numeric = Number(value.trim());
      if (Number.isFinite(numeric) && numeric > 0) {
        return `${Math.round(numeric)}% off`;
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

    return 'We could not load search results right now.';
  }
}
