import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Listing, ListingCardComponent } from '../../components/listings/listing-card.component';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BuyerDashboardNavbarComponent } from '../../components/layout/buyer-dashboard-navbar.component';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faBrandInstagram, faBrandXTwitter } from '@ng-icons/font-awesome/brands';
import { PublicHomeNavbarComponent } from '../../components/layout/public-home-navbar.component';
import { Store, StoreCardComponent } from '../../components/stores/store-card.component';
import { AuthSessionService } from '../../services/auth-session.service';
import { LocationService } from '../../services/location.service';
import { AppToastComponent } from '../../components/common/app-toast.component';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ListingsApiItem,
  ListingsSearchResponse,
  ListingsService,
  SearchListingsParams,
} from '../../services/listings.service';
import { formatListingPricing } from '../../utils/listing-pricing';

interface SearchResultSection {
  title: string;
  viewAllCount: string;
  listings: Listing[];
}

const CATEGORY_PARAM_BY_LABEL: Record<string, string> = {
  'Phones & Laptops': '1',
  Women: '2',
  Men: '3',
  Beauty: '4',
  'Food & Drinks': '5',
  'Baby & Toddler': '6',
  Home: '7',
  Properties: '8',
  'Fitness & Nutrition': '9',
  Accessories: '10',
  'Pet supplies': '11',
  'Toys & Games': '12',
  Electronics: '13',
  'Arts & Crafts': '14',
  'Luggage & Bags': '15',
  'Sporting goods': '16',
};

const ORDERING_PARAM_BY_LABEL: Record<string, string | undefined> = {
  'Recommended (default)': undefined,
  'Newest listings': '-created_at',
  'Price: Low to High': 'price',
  'Price: High to Low': '-price',
  'Most viewed': undefined,
  Trending: undefined,
  'Nearest to me': undefined,
};

const CONDITION_PARAM_BY_LABEL: Record<string, string> = {
  New: 'new',
  'Fairly used': 'used',
};

const VERIFICATION_PARAM_BY_LABEL: Record<string, 'true' | 'false'> = {
  Verified: 'true',
  Unverified: 'false',
};

@Component({
  selector: 'app-search-page',
  imports: [
    CommonModule,
    NgOptimizedImage,
    RouterLink,
    BuyerDashboardNavbarComponent,
    PublicHomeNavbarComponent,
    ListingCardComponent,
    StoreCardComponent,
    AppToastComponent,
    NgIcon,
  ],
  providers: [
    provideIcons({
      faBrandInstagram,
      faBrandXTwitter,
    }),
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

    .search-skeleton {
      position: relative;
      overflow: hidden;
      background: #eceef3;
    }

    .search-skeleton::after {
      position: absolute;
      inset: 0;
      content: '';
      transform: translateX(-100%);
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.76) 50%,
        transparent 100%
      );
      animation: search-skeleton-shimmer 1.4s ease-in-out infinite;
    }

    @keyframes search-skeleton-shimmer {
      100% {
        transform: translateX(100%);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .search-skeleton::after {
        animation: none;
      }
    }
  `,
  host: { class: 'block h-full overflow-auto' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authSession = inject(AuthSessionService);
  private readonly listingsService = inject(ListingsService);
  private readonly locationService = inject(LocationService);
  private readonly queryParamMap = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });
  private readonly apiOrigin = new URL(environment.apiUrl).origin;
  private currentSearchRequestId = 0;

  readonly isAuthenticated = this.authSession.isAuthenticated;
  readonly searchTerm = computed(() => this.queryParamMap().get('q')?.trim() ?? '');
  readonly listingsCount = computed(() => new Intl.NumberFormat('en-NG').format(this.resultCount()));
  readonly floatingSearchQuery = signal('');
  readonly activeFilter = signal<string | null>(null);
  readonly isSearchLoading = signal(false);
  readonly searchError = signal<string | null>(null);
  readonly resultCount = signal(0);
  readonly searchListings = signal<Listing[]>([]);
  readonly skeletonItems = Array.from({ length: 10 }, (_, index) => index);

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
  readonly locationOptions = computed(() =>
    this.locationService.locationGroups()
      .filter((group) => group.value !== 'all-nigeria')
      .map((group) => group.label),
  );
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

  readonly selectedCategory = signal<string | null>(null);
  readonly selectedLocation = signal<string | null>(null);
  readonly selectedCondition = signal<string | null>(null);
  readonly selectedVerification = signal<string | null>(null);
  readonly selectedFollowing = signal<string | null>(null);
  readonly selectedSort = signal('Recommended (default)');
  readonly vendorSearch = signal('');
  readonly minPrice = signal(2000);
  readonly maxPrice = signal(700000000);
  readonly activeSearchParams = computed<SearchListingsParams>(() => {
    const params: SearchListingsParams = {};
    const search = this.searchTerm();
    const selectedCategory = this.selectedCategory();
    const selectedLocation = this.selectedLocation();
    const selectedCondition = this.selectedCondition();
    const selectedVerification = this.selectedVerification();
    const selectedFoll = this.selectedFollowing();
    const ordering = ORDERING_PARAM_BY_LABEL[this.selectedSort()];

    if (search) {
      params.search = search;
    }

    if (selectedCategory) {
      params.category = CATEGORY_PARAM_BY_LABEL[selectedCategory];
    }

    if (selectedLocation) {
      params.state = selectedLocation;
    }

    if (selectedCondition) {
      params.condition = CONDITION_PARAM_BY_LABEL[selectedCondition];
    }

    if (selectedVerification) {
      params.is_verified = VERIFICATION_PARAM_BY_LABEL[selectedVerification];
    }

    if (selectedFoll) {
      params.following = 'true';
    }

    params.min_price = String(this.minPrice());
    params.max_price = String(this.maxPrice());

    if (ordering) {
      params.ordering = ordering;
    }

    return params;
  });

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
    const cat = this.selectedCategory();
    return cat ? cat : 'Category';
  });

  readonly locationLabel = computed(() => {
    const loc = this.selectedLocation();
    return loc ? loc : 'Location';
  });

  protected storeInitials(name: string): string {
    return name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || 'S';
  }

  readonly conditionLabel = computed(() => {
    const cond = this.selectedCondition();
    return cond ? cond : 'Condition';
  });
  readonly verificationLabel = computed(() => {
    const ver = this.selectedVerification();
    return ver ? ver : 'Verification status';
  });

  constructor() {
    effect(() => {
      const params = this.activeSearchParams();
      this.floatingSearchQuery.set(params.search ?? '');
      void this.loadSearchResults(params);
    });

    effect(() => {
      const loc = this.locationService.selectedLocationOption();
      if (loc.value === 'all-nigeria') {
        const currentLoc = this.selectedLocation();
        const hasMatchingGroup = currentLoc && this.locationService.locationGroups().some(
          (g) => g.label.toLowerCase() === currentLoc.toLowerCase()
        );
        if (hasMatchingGroup || !currentLoc) {
          this.selectedLocation.set(null);
        }
      } else {
        const match = this.locationOptions().find(
          (opt) => opt.toLowerCase() === loc.label.toLowerCase()
        );
        if (match) {
          this.selectedLocation.set(match);
        }
      }
    });
  }

  updateFloatingSearchQuery(value: string): void {
    this.floatingSearchQuery.set(value);
  }

  submitFloatingSearch(event?: Event): void {
    event?.preventDefault();

    const query = this.floatingSearchQuery().trim();
    void this.router.navigate(['/search'], {
      queryParams: query ? { q: query } : {},
    });
  }

  toggleFilter(key: string): void {
    this.activeFilter.update((current) => current === key ? null : key);
  }

  closeFilters(): void {
    this.activeFilter.set(null);
  }

  toggleCategory(category: string): void {
    this.selectedCategory.update((current) => (current === category ? null : category));
  }

  toggleLocation(location: string): void {
    const isCurrentlySelected = this.selectedLocation() === location;
    if (isCurrentlySelected) {
      this.locationService.selectLocationGroup('all-nigeria');
    } else {
      const match = this.locationService.locationGroups().find(
        (g) => g.label.toLowerCase() === location.toLowerCase()
      );
      if (match) {
        this.locationService.selectLocationGroup(match.value);
      } else {
        this.locationService.selectLocationGroup('all-nigeria');
        this.selectedLocation.set(location);
      }
    }
  }

  toggleCondition(condition: string): void {
    this.selectedCondition.update((current) => (current === condition ? null : condition));
  }

  toggleVerification(status: string): void {
    this.selectedVerification.update((current) => (current === status ? null : status));
  }

  toggleFollowing(storeName: string): void {
    this.selectedFollowing.update((current) => (current === storeName ? null : storeName));
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
        this.selectedCategory.set(null);
        break;
      case 'location':
        this.selectedLocation.set(null);
        break;
      case 'price':
        this.minPrice.set(2000);
        this.maxPrice.set(700000000);
        break;
      case 'condition':
        this.selectedCondition.set(null);
        break;
      case 'verification':
        this.selectedVerification.set(null);
        break;
      case 'following':
        this.selectedFollowing.set(null);
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
    this.selectedCategory.set(null);
    this.selectedLocation.set(null);
    this.minPrice.set(2000);
    this.maxPrice.set(700000000);
    this.selectedCondition.set(null);
    this.selectedVerification.set(null);
    this.selectedFollowing.set(null);
    this.selectedSort.set('Recommended (default)');
    this.vendorSearch.set('');
    this.closeFilters();
  }

  formatPrice(value: number): string {
    return `₦${new Intl.NumberFormat('en-NG').format(value)}`;
  }

  private async loadSearchResults(params: SearchListingsParams): Promise<void> {
    const requestId = ++this.currentSearchRequestId;
    const hasQuery = Object.values(params).some((value) => !!value);

    if (!hasQuery) {
      this.searchListings.set([]);
      this.resultCount.set(0);
      this.searchError.set(null);
      this.isSearchLoading.set(false);
      return;
    }

    this.isSearchLoading.set(true);
    this.searchError.set(null);

    try {
      const response = await firstValueFrom(this.listingsService.searchListings(params));
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
    const pricing = formatListingPricing(item);
    const images = this.extractImageList(item);

    if (!title || !pricing.price) {
      return null;
    }

    return {
      id,
      title,
      price: pricing.price,
      originalPrice: pricing.originalPrice,
      discountBadge: pricing.discountBadge,
      location: this.buildLocationLabel(item),
      timeAgo: this.relativeTimeFromDate(this.readString(item, ['created_at', 'published_at', 'date_created'])),
      isVerified: this.readBoolean(item, ['is_verified', 'verified']) || false,
      favoriteFilled: this.readBoolean(item, ['is_saved']) || false,
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

    return [];
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

    return state || city || '';
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

    return 'Search results aren’t available right now. Please try again in a moment.';
  }

  private lastSelected(values: string[]): string | null {
    return values.length > 0 ? values[values.length - 1] : null;
  }
}
