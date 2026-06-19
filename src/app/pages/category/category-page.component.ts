import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { BuyerDashboardNavbarComponent } from '../../components/layout/buyer-dashboard-navbar.component';
import { PublicHomeNavbarComponent } from '../../components/layout/public-home-navbar.component';
import { HomeFooterComponent } from '../../components/layout/home-footer.component';
import { AppToastComponent } from '../../components/common/app-toast.component';
import { AuthSessionService } from '../../services/auth-session.service';
import { LocationService } from '../../services/location.service';
import { Listing, ListingCardComponent } from '../../components/listings/listing-card.component';
import {
  ListingsApiItem,
  ListingsSearchResponse,
  ListingsService,
  SearchListingsParams,
} from '../../services/listings.service';
import { environment } from '../../../environments/environment';

interface CategoryListingView extends Listing {
  favoriteFilled?: boolean;
}

const ORDERING_PARAM_BY_LABEL: Record<string, string | undefined> = {
  'Recommended (default)': undefined,
  'Newest listings': '-created_at',
  'Price: Low to High': 'price',
  'Price: High to Low': '-price',
  'Most viewed': '-views_count',
  Trending: '-views_count',
  'Nearest to me': undefined,
};

@Component({
  selector: 'app-category-page',
  imports: [
    CommonModule,
    RouterLink,
    BuyerDashboardNavbarComponent,
    PublicHomeNavbarComponent,
    HomeFooterComponent,
    AppToastComponent,
    ListingCardComponent,
  ],
  templateUrl: './category-page.component.html',
  styles: `
    .category-skeleton {
      position: relative;
      overflow: hidden;
      background: #eceef3;
    }

    .category-skeleton::after {
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
      animation: category-skeleton-shimmer 1.4s ease-in-out infinite;
    }

    @keyframes category-skeleton-shimmer {
      100% {
        transform: translateX(100%);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .category-skeleton::after {
        animation: none;
      }
    }

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
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block h-full overflow-auto bg-white',
  },
})
export class CategoryPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly authSession = inject(AuthSessionService);
  private readonly listingsService = inject(ListingsService);
  private readonly locationService = inject(LocationService);
  private readonly queryParamMap = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });
  private readonly apiOrigin = new URL(environment.apiUrl).origin;
  private currentCategoryRequestId = 0;

  readonly isAuthenticated = this.authSession.isAuthenticated;
  readonly isCategoryLoading = signal(false);
  readonly categoryError = signal<string | null>(null);
  readonly resultCount = signal(0);
  readonly listings = signal<CategoryListingView[]>([]);
  readonly desktopListingLimit = signal(15);
  readonly mobileListingLimit = signal(8);
  readonly desktopSkeletonItems = Array.from({ length: 15 }, (_, index) => index);
  readonly mobileSkeletonItems = Array.from({ length: 8 }, (_, index) => index);

  readonly categoryId = computed(() => this.queryParamMap().get('category')?.trim() || '1');
  readonly categoryName = computed(
    () => this.queryParamMap().get('name')?.trim() || 'Phone & Tablet',
  );
  readonly totalResults = computed(() => new Intl.NumberFormat('en-NG').format(this.resultCount()));

  // Filter signals
  readonly selectedLocation = signal<string | null>(null);
  readonly minPrice = signal<number>(2000);
  readonly maxPrice = signal<number>(700000000);
  readonly selectedCondition = signal<string | null>(null);
  readonly selectedVerification = signal<string | null>(null);
  readonly selectedFollowing = signal<boolean>(false);
  readonly selectedSort = signal<string>('Recommended (default)');
  readonly activeFilter = signal<string | null>(null);

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

  // Dynamic filter chip labels
  readonly locationLabel = computed(() => {
    const loc = this.selectedLocation();
    return loc ? loc : 'Location';
  });

  readonly priceLabel = computed(() => {
    const min = this.minPrice();
    const max = this.maxPrice();
    if (min === 2000 && max === 700000000) {
      return 'Price';
    }
    return `Price: ${this.formatPriceShort(min)} - ${this.formatPriceShort(max)}`;
  });

  readonly conditionLabel = computed(() => {
    const cond = this.selectedCondition();
    return cond ? cond : 'Condition';
  });

  readonly verificationLabel = computed(() => {
    const ver = this.selectedVerification();
    return ver ? ver : 'Verification status';
  });

  readonly followingLabel = computed(() => {
    return this.selectedFollowing() ? 'Following: Yes' : 'Following';
  });

  readonly sortLabel = computed(() => {
    const sort = this.selectedSort();
    return sort === 'Recommended (default)' ? 'Sort by' : `Sort by: ${sort}`;
  });

  readonly activeSearchParams = computed<SearchListingsParams>(() => {
    const params: SearchListingsParams = {
      category: this.categoryId(),
    };

    const selectedLoc = this.selectedLocation();
    if (selectedLoc) {
      params.state = selectedLoc;
    }

    const selectedCond = this.selectedCondition();
    if (selectedCond) {
      params.condition = selectedCond === 'New' ? 'new' : 'used';
    }

    const selectedVer = this.selectedVerification();
    if (selectedVer) {
      params.is_verified = selectedVer === 'Verified' ? 'true' : 'false';
    }

    if (this.selectedFollowing()) {
      params.following = 'true';
    }

    if (this.minPrice() !== 2000) {
      params.min_price = String(this.minPrice());
    }
    if (this.maxPrice() !== 700000000) {
      params.max_price = String(this.maxPrice());
    }

    const sort = this.selectedSort();
    const ordering = ORDERING_PARAM_BY_LABEL[sort];
    if (ordering) {
      params.ordering = ordering;
    }

    return params;
  });

  readonly visibleDesktopListings = computed(() =>
    this.listings().slice(0, this.desktopListingLimit()),
  );

  readonly visibleMobileListings = computed(() =>
    this.listings().slice(0, this.mobileListingLimit()),
  );

  readonly canShowMoreDesktop = computed(() => this.desktopListingLimit() < this.listings().length);
  readonly canShowMoreMobile = computed(() => this.mobileListingLimit() < this.listings().length);

  constructor() {
    effect(() => {
      const params = this.activeSearchParams();
      void this.loadCategoryListings(params);
    });

    effect(() => {
      const loc = this.locationService.selectedLocationOption();
      if (loc.value === 'all-nigeria') {
        const currentLoc = this.selectedLocation();
        const hasMatchingGroup = currentLoc && this.locationService.locationGroups.some(
          (g) => g.label.toLowerCase() === currentLoc.toLowerCase()
        );
        if (hasMatchingGroup || !currentLoc) {
          this.selectedLocation.set(null);
        }
      } else {
        const match = this.locationOptions.find(
          (opt) => opt.toLowerCase() === loc.label.toLowerCase()
        );
        if (match) {
          this.selectedLocation.set(match);
        }
      }
    });
  }

  toggleFilter(key: string): void {
    this.activeFilter.update((current) => (current === key ? null : key));
  }

  closeFilters(): void {
    this.activeFilter.set(null);
  }

  toggleLocation(location: string): void {
    const isCurrentlySelected = this.selectedLocation() === location;
    if (isCurrentlySelected) {
      this.locationService.selectLocationGroup('all-nigeria');
    } else {
      const match = this.locationService.locationGroups.find(
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

  toggleFollowing(): void {
    this.selectedFollowing.update((current) => !current);
  }

  selectSort(option: string): void {
    this.selectedSort.set(option);
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
        this.selectedFollowing.set(false);
        break;
      case 'sort':
        this.selectedSort.set('Recommended (default)');
        break;
      default:
        break;
    }
  }

  resetAllFilters(): void {
    this.selectedLocation.set(null);
    this.minPrice.set(2000);
    this.maxPrice.set(700000000);
    this.selectedCondition.set(null);
    this.selectedVerification.set(null);
    this.selectedFollowing.set(false);
    this.selectedSort.set('Recommended (default)');
    this.closeFilters();
  }

  formatPrice(value: number): string {
    return `₦${new Intl.NumberFormat('en-NG').format(value)}`;
  }

  private formatPriceShort(value: number): string {
    if (value >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toFixed(1)}B`;
    }
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(0)}k`;
    }
    return String(value);
  }

  showMoreDesktopListings(): void {
    this.desktopListingLimit.update((limit) => Math.min(limit + 10, this.listings().length));
  }

  showMoreMobileListings(): void {
    this.mobileListingLimit.update((limit) => Math.min(limit + 8, this.listings().length));
  }

  private async loadCategoryListings(params: SearchListingsParams): Promise<void> {
    const requestId = ++this.currentCategoryRequestId;

    this.desktopListingLimit.set(15);
    this.mobileListingLimit.set(8);

    if (!params.category) {
      this.listings.set([]);
      this.resultCount.set(0);
      this.categoryError.set(null);
      this.isCategoryLoading.set(false);
      return;
    }

    this.isCategoryLoading.set(true);
    this.categoryError.set(null);

    try {
      const response = await firstValueFrom(
        this.listingsService.searchListings(params),
      );
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
    const priceValue = this.formatPriceValue(
      item['price'] ?? item['amount'] ?? item['price_display'],
    );
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
      timeAgo: this.relativeTimeFromDate(
        this.readString(item, ['created_at', 'published_at', 'date_created']),
      ),
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
              const candidate = this.readString(entry as Record<string, unknown>, [
                'image',
                'url',
                'photo',
                'src',
              ]);
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

    const singleImage = this.readString(item, [
      'image',
      'thumbnail',
      'photo',
      'featured_image',
      'cover_image',
    ]);
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
    return normalized === null
      ? undefined
      : `₦${new Intl.NumberFormat('en-NG').format(normalized)}`;
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
    if ((error as any).status === 500 || (error as any).status === 0) {
      return 'Something went wrong, try again.';
    }
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

    return 'This category isn’t available right now. Please try again in a moment.';
  }
}
