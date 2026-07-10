import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  input,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { NgOptimizedImage, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faBrandInstagram, faBrandXTwitter } from '@ng-icons/font-awesome/brands';
import { firstValueFrom } from 'rxjs';
import { MobileBottomNavComponent } from '../../components/layout/mobile-bottom-nav.component';
import { Store, StoreCardComponent } from '../../components/stores/store-card.component';
import { Listing, ListingCardComponent } from '../../components/listings/listing-card.component';
import {
  PublicHomeLocationSelection,
  PublicHomeNavbarComponent,
} from '../../components/layout/public-home-navbar.component';
import { AuthSessionService } from '../../services/auth-session.service';
import { LocationService } from '../../services/location.service';
import { HOME_HERO_CARD_SETS, HOME_HERO_HEADLINE_ITEMS } from './home-hero.config';
import {
  HomeAdvertisementResponse,
  HomeCategoryResponse,
  HomeListingResponse,
  HomeResponse,
  HomeService,
  HomeStoreResponse,
} from '../../services/home.service';
import {
  ListingsSearchResponse,
  ListingsService,
} from '../../services/listings.service';
import { formatListingPricing } from '../../utils/listing-pricing';
import { environment } from '../../../environments/environment';

type HomeCategory = {
  id: string;
  label: string;
  icon: string;
};

type HomePromotion = {
  id: string;
  image: string;
  link?: string;
};

const HOME_RECENT_SEARCHES_KEY = 'duduzili.home.recent-searches';
const HOME_RECENT_SEARCHES_LIMIT = 8;
const HOME_NEARBY_LISTINGS_PAGE_SIZE = 10;

const CATEGORY_ICON_BY_SLUG: Record<string, string> = {
  automotives: '/assets/images/category-automotives.png',
  'real-estate': '/assets/images/category-real-estate-properties.png',
  properties: '/assets/images/category-real-estate-properties.png',
  'real-estate-properties': '/assets/images/category-real-estate-properties.png',
  'phones-laptops': '/assets/images/category-phone-tablet.png',
  phones: '/assets/images/category-phone-tablet.png',
  laptops: '/assets/images/category-phone-tablet.png',
  'phone-tablet': '/assets/images/category-phone-tablet.png',
  electronics: '/assets/images/category-electronics.png',
  'home-furniture-appliances': '/assets/images/category-home-furniture-appliances.png',
  home: '/assets/images/category-home-furniture-appliances.png',
  furniture: '/assets/images/category-home-furniture-appliances.png',
  appliances: '/assets/images/category-home-furniture-appliances.png',
  'mens-fashion': '/assets/images/category-mens-fashion.png',
  menswear: '/assets/images/category-mens-fashion.png',
  'women-fashion': '/assets/images/category-womens-fashion.png',
  womenswear: '/assets/images/category-womens-fashion.png',
  'children-baby-fashion': '/assets/images/category-children-baby-fashion.png',
  'fashion-design': '/assets/images/category-fashion-design.png',
  beauty: '/assets/images/category-beauty-personal-care.png',
  'beauty-personal-care': '/assets/images/category-beauty-personal-care.png',
  'industrial-home-supplies': '/assets/images/category-industrial-home-supplies.png',
  'business-industrial': '/assets/images/category-business-industrial.png',
  'school-office-general-supplies': '/assets/images/category-school-office-general-supplies.png',
  leisure: '/assets/images/category-leisure-activities.png',
  grocery: '/assets/images/category-grocery.png',
  'party-supplies': '/assets/images/category-party-supplies.png',
  'food-agriculture-farming': '/assets/images/category-food-agriculture-farming.png',
  pets: '/assets/images/category-animals-pets.png',
  'animals-pets': '/assets/images/category-animals-pets.png',
  'books-movies-music': '/assets/images/category-books-movies-music.png',
};

@Component({
  selector: 'app-home-page',
  imports: [
    NgOptimizedImage,
    RouterLink,
    MobileBottomNavComponent,
    StoreCardComponent,
    ListingCardComponent,
    PublicHomeNavbarComponent,
    NgIcon,
  ],
  providers: [
    provideIcons({
      faBrandInstagram,
      faBrandXTwitter,
    }),
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
  host: {
    class: 'block h-full overflow-auto bg-white text-[#1f1f1f]',
    '(document:click)': 'onDocumentClick($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {
  private readonly categoryRail = viewChild<ElementRef<HTMLDivElement>>('categoryRail');
  private readonly desktopSearchShell = viewChild<ElementRef<HTMLDivElement>>('desktopSearchShell');
  private readonly mobileSearchInput = viewChild<ElementRef<HTMLInputElement>>('mobileSearchInput');
  private readonly platformId = inject(PLATFORM_ID);
  private readonly homeService = inject(HomeService);
  private readonly listingsService = inject(ListingsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authSession = inject(AuthSessionService);
  private readonly locationService = inject(LocationService);
  private readonly apiOrigin = new URL(environment.apiUrl).origin;
  private heroCarouselIntervalId: number | null = null;
  private heroCarouselAdvanceTimeoutId: number | null = null;
  private currentHomeRequestId = 0;

  readonly showPublicChrome = input(true);
  readonly showBottomNav = input(true);
  readonly isCategoriesSheetOpen = signal(false);
  readonly isMobileSearchOverlayOpen = signal(false);
  readonly isDesktopSearchOverlayOpen = signal(false);
  readonly activeHeroCardSetIndex = signal(0);
  readonly enteringHeroCardSetIndex = signal(1);
  readonly isHeroCarouselAnimating = signal(false);
  readonly isHeroCarouselResetting = signal(false);
  readonly activeHeroHeadlineIndex = signal(0);
  readonly enteringHeroHeadlineIndex = signal(1);
  readonly isHeroHeadlineAnimating = signal(false);
  readonly isHeroHeadlineResetting = signal(false);
  readonly homeSearchQuery = signal('');
  readonly mobileSearchQuery = signal('');
  readonly isHomeLoading = signal(false);
  readonly isLoadingMoreNearbyListings = signal(false);
  readonly homeError = signal<string | null>(null);
  readonly homeResponse = signal<HomeResponse | null>(null);
  private readonly cachedCategories = signal<HomeCategoryResponse[]>([]);
  readonly extraNearbyListingRecords = signal<readonly HomeListingResponse[]>([]);
  readonly nearbyListingsPage = signal(1);
  readonly hasMoreNearbyListings = signal(true);
  readonly recentSearches = signal<string[]>([]);
  readonly popularSearches = computed(() => {
    const response = this.homeResponse();
    if (!response) {
      return [] as string[];
    }

    return this.extractPopularSearches(response);
  });
  readonly promotedContentEnabled = computed(
    () => this.homeResponse()?.subscriptions_enabled ?? this.authSession.subscriptionsEnabled(),
  );
  readonly categorySkeletonItems = [1, 2, 3, 4, 5, 6, 7, 8] as const;
  readonly listingSkeletonItems = [1, 2, 3, 4] as const;
  readonly nearbyListingSkeletonItems = [1, 2, 3, 4, 5] as const;
  readonly promotionSkeletonItems = [1, 2] as const;
  readonly storeSkeletonItems = [1, 2, 3, 4] as const;

  readonly heroCardSets = HOME_HERO_CARD_SETS;
  readonly heroHeadlineItems = HOME_HERO_HEADLINE_ITEMS;

  readonly activeHeroCardSet = computed(
    () => this.heroCardSets[this.activeHeroCardSetIndex()] ?? this.heroCardSets[0],
  );

  readonly enteringHeroCardSet = computed(
    () => this.heroCardSets[this.enteringHeroCardSetIndex()] ?? this.heroCardSets[0],
  );

  readonly activeHeroHeadline = computed(
    () => this.heroHeadlineItems[this.activeHeroHeadlineIndex()] ?? this.heroHeadlineItems[0],
  );

  readonly enteringHeroHeadline = computed(
    () =>
      this.heroHeadlineItems[this.enteringHeroHeadlineIndex()] ?? this.heroHeadlineItems[0],
  );

  readonly heroHeadlineViewportWidth = computed(() => {
    const activeWidth = this.activeHeroHeadline().width;
    const enteringWidth = this.enteringHeroHeadline().width;
    return this.isHeroHeadlineAnimating() ? Math.max(activeWidth, enteringWidth) : activeWidth;
  });

  readonly categories = computed(() => {
    const response = this.homeResponse();
    const loadedCategories = (response?.categories ?? []).map((category) => this.toHomeCategory(category));
    if (loadedCategories.length > 0) {
      return loadedCategories;
    }
    return this.cachedCategories().map((category) => this.toHomeCategory(category));
  });

  readonly sponsoredListingCards = computed(() => {
    if (!this.promotedContentEnabled()) {
      return [];
    }
    const response = this.homeResponse();
    return (response?.sponsored_listings ?? [])
      .map((listing, index) => this.toListingCard(listing, `sponsored-${index}`))
      .filter((listing): listing is Listing => listing !== null);
  });

  readonly nearbyListingCards = computed(() => {
    const response = this.homeResponse();
    return [
      ...(response?.nearby_listings ?? []),
      ...this.extraNearbyListingRecords(),
    ]
      .map((listing, index) => this.toListingCard(listing, `nearby-${index}`))
      .filter((listing): listing is Listing => listing !== null);
  });

  readonly initialFavoritedListingIds = computed(() => {
    const response = this.homeResponse();
    if (!response) {
      return [];
    }

    return [
      ...(this.promotedContentEnabled() ? (response.sponsored_listings ?? []) : []),
      ...(response.nearby_listings ?? []),
      ...this.extraNearbyListingRecords(),
    ]
      .filter((listing) => listing['is_saved'] === true)
      .map((listing) => String(listing['id']));
  });

  readonly promotions = computed(() => {
    if (!this.promotedContentEnabled()) {
      return [];
    }
    const response = this.homeResponse();
    return (response?.advertisements ?? [])
      .map((advertisement, index) => this.toPromotion(advertisement, index))
      .filter((promotion): promotion is HomePromotion => promotion !== null);
  });

  readonly featuredStores = computed(() => {
    const response = this.homeResponse();
    return (response?.featured_stores ?? [])
      .map((store, index) => this.toStoreCard(store, `featured-store-${index}`))
      .filter((store): store is Store => store !== null);
  });

  readonly mobilePromotion = computed(() => {
    const promotions = this.promotions();
    return promotions[0] ?? null;
  });

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const code = this.route.snapshot.queryParams['code'];
      if (code) {
        void this.router.navigate(['/sign-in'], { queryParams: this.route.snapshot.queryParams });
        return;
      }
      this.restoreRecentSearches();
      this.startHeroCarousel();
      try {
        const stored = localStorage.getItem('duduzili.home.categories');
        if (stored) {
          this.cachedCategories.set(JSON.parse(stored));
        }
      } catch {
        // Ignore
      }
    }

    effect(() => {
      if (
        !isPlatformBrowser(this.platformId) ||
        !this.showPublicChrome() ||
        !this.authSession.isBootstrapComplete() ||
        !this.authSession.isAuthenticated()
      ) {
        return;
      }

      const redirectTarget = this.authSession.isSuperuser() ? '/admin' : '/en';
      if (this.router.url !== redirectTarget) {
        void this.router.navigate([redirectTarget]);
      }
    });

    effect(() => {
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }
      const currentPromotions = this.promotions();
      if (currentPromotions.length > 0) {
        currentPromotions.forEach((promo) => {
          this.trackAdView(promo.id);
        });
      }
    });

    effect(() => {
      const query = this.locationService.selectedLocationQuery();
      void this.loadHome();
    });
  }

  onLocationChange(selection: PublicHomeLocationSelection): void {
    // Handled reactively via LocationService selectedLocationQuery effect
  }

  openCategoriesSheet(): void {
    this.isCategoriesSheetOpen.set(true);
  }

  closeCategoriesSheet(): void {
    this.isCategoriesSheetOpen.set(false);
  }

  openCategory(category: HomeCategory): void {
    this.closeCategoriesSheet();
    void this.router.navigate(['/category'], {
      queryParams: {
        category: category.id,
        name: category.label,
      },
    });
  }

  openMobileSearchOverlay(): void {
    this.isMobileSearchOverlayOpen.set(true);
    setTimeout(() => {
      this.mobileSearchInput()?.nativeElement?.focus();
    }, 50);
  }

  closeMobileSearchOverlay(): void {
    this.isMobileSearchOverlayOpen.set(false);
  }

  openDesktopSearchOverlay(): void {
    this.isDesktopSearchOverlayOpen.set(true);
  }

  closeDesktopSearchOverlay(): void {
    this.isDesktopSearchOverlayOpen.set(false);
  }

  onDocumentClick(event: Event): void {
    if (!this.isDesktopSearchOverlayOpen()) {
      return;
    }

    const searchShell = this.desktopSearchShell()?.nativeElement;
    const target = event.target;
    if (!(searchShell instanceof HTMLElement) || !(target instanceof Node)) {
      return;
    }

    if (!searchShell.contains(target)) {
      this.closeDesktopSearchOverlay();
    }
  }

  updateMobileSearchQuery(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.mobileSearchQuery.set(target?.value ?? '');
  }

  updateHomeSearchQuery(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.homeSearchQuery.set(target?.value ?? '');
  }

  submitHomeSearch(event?: Event): void {
    event?.preventDefault();

    const query = this.submittedSearchQuery(event);
    this.homeSearchQuery.set(query);
    this.mobileSearchQuery.set(query);

    if (!query) {
      this.openSearchOverlayForSubmit(event);
      return;
    }

    this.pushRecentSearch(query);
    this.isMobileSearchOverlayOpen.set(false);
    this.isDesktopSearchOverlayOpen.set(false);
    void this.router.navigate(['/search'], { queryParams: { q: query } });
  }

  removeRecentSearch(term: string): void {
    this.recentSearches.update((current) => {
      const next = current.filter((item) => item !== term);
      this.persistRecentSearches(next);
      return next;
    });
  }

  clearRecentSearchHistory(): void {
    this.recentSearches.set([]);
    this.persistRecentSearches([]);
  }

  applySearchTerm(term: string): void {
    this.mobileSearchQuery.set(term);
    this.homeSearchQuery.set(term);
    this.pushRecentSearch(term);
    this.isMobileSearchOverlayOpen.set(false);
    this.isDesktopSearchOverlayOpen.set(false);
    void this.router.navigate(['/search'], { queryParams: { q: term } });
  }

  scrollCategories(): void {
    this.categoryRail()?.nativeElement.scrollBy({
      left: 540,
      behavior: 'smooth',
    });
  }

  async loadMoreNearbyListings(): Promise<void> {
    if (this.isLoadingMoreNearbyListings() || !this.hasMoreNearbyListings()) {
      return;
    }

    const nextPage = this.nearbyListingsPage() + 1;
    this.isLoadingMoreNearbyListings.set(true);

    try {
      const response = await firstValueFrom(
        this.listingsService.searchListings({
          location: this.selectedLocationQuery(),
          page: nextPage,
          page_size: HOME_NEARBY_LISTINGS_PAGE_SIZE,
        }),
      );
      const existingIds = new Set(this.nearbyListingCards().map((listing) => listing.id));
      const records = this.extractSearchListingItems(response);
      const uniqueRecords = records.filter((record, index) => {
        const id = this.readId(record, `nearby-page-${nextPage}-${index}`);
        if (existingIds.has(id)) {
          return false;
        }

        existingIds.add(id);
        return true;
      });

      this.extraNearbyListingRecords.update((current) => [...current, ...uniqueRecords]);
      this.nearbyListingsPage.set(nextPage);
      this.hasMoreNearbyListings.set(this.searchResponseHasMore(response, records.length));
    } catch {
      this.homeError.set('We couldn’t load more listings right now. Please try again.');
    } finally {
      this.isLoadingMoreNearbyListings.set(false);
    }
  }

  private async loadHome(): Promise<void> {
    const requestId = ++this.currentHomeRequestId;
    this.isHomeLoading.set(true);
    this.homeError.set(null);

    try {
      const response = await firstValueFrom(
        this.homeService.getHome(this.selectedLocationQuery()),
      );

      if (requestId !== this.currentHomeRequestId) {
        return;
      }

      this.homeResponse.set(response);
      if (isPlatformBrowser(this.platformId) && response.categories && response.categories.length > 0) {
        try {
          localStorage.setItem('duduzili.home.categories', JSON.stringify(response.categories));
        } catch {
          // Ignore
        }
      }
      this.extraNearbyListingRecords.set([]);
      this.nearbyListingsPage.set(1);
      this.hasMoreNearbyListings.set((response.nearby_listings?.length ?? 0) >= HOME_NEARBY_LISTINGS_PAGE_SIZE);
    } catch (error: unknown) {
      if (requestId !== this.currentHomeRequestId) {
        return;
      }

      this.homeError.set('We’re having trouble loading the homepage right now. Please try again in a moment.');
      this.homeResponse.set(null);
      this.extraNearbyListingRecords.set([]);
      this.nearbyListingsPage.set(1);
      this.hasMoreNearbyListings.set(false);
    } finally {
      if (requestId === this.currentHomeRequestId) {
        this.isHomeLoading.set(false);
      }
    }
  }

  private startHeroCarousel(): void {
    this.heroCarouselIntervalId = window.setInterval(() => {
      this.advanceHeroCarousel();
    }, 4200);
  }

  private advanceHeroCarousel(): void {
    if (this.isHeroCarouselAnimating() || this.isHeroHeadlineAnimating()) {
      return;
    }

    const nextCardIndex = (this.activeHeroCardSetIndex() + 1) % this.heroCardSets.length;
    const nextHeadlineIndex =
      (this.activeHeroHeadlineIndex() + 1) % this.heroHeadlineItems.length;

    this.enteringHeroCardSetIndex.set(nextCardIndex);
    this.enteringHeroHeadlineIndex.set(nextHeadlineIndex);
    this.isHeroCarouselAnimating.set(true);
    this.isHeroHeadlineAnimating.set(true);

    this.heroCarouselAdvanceTimeoutId = window.setTimeout(() => {
      this.isHeroCarouselResetting.set(true);
      this.isHeroHeadlineResetting.set(true);

      this.activeHeroCardSetIndex.set(nextCardIndex);
      this.enteringHeroCardSetIndex.set((nextCardIndex + 1) % this.heroCardSets.length);
      this.isHeroCarouselAnimating.set(false);

      this.activeHeroHeadlineIndex.set(nextHeadlineIndex);
      this.enteringHeroHeadlineIndex.set(
        (nextHeadlineIndex + 1) % this.heroHeadlineItems.length,
      );
      this.isHeroHeadlineAnimating.set(false);

      window.requestAnimationFrame(() => {
        this.isHeroCarouselResetting.set(false);
        this.isHeroHeadlineResetting.set(false);
      });
    }, 620);
  }

  private selectedLocationQuery(): string | undefined {
    return this.locationService.selectedLocationQuery();
  }

  private restoreRecentSearches(): void {
    const storage = this.browserStorage();
    if (!storage) {
      return;
    }

    try {
      const rawValue = storage.getItem(HOME_RECENT_SEARCHES_KEY);
      if (!rawValue) {
        return;
      }

      const parsedValue: unknown = JSON.parse(rawValue);
      if (!Array.isArray(parsedValue)) {
        storage.removeItem(HOME_RECENT_SEARCHES_KEY);
        return;
      }

      const searches = parsedValue
        .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
        .filter((entry) => entry.length > 0)
        .slice(0, HOME_RECENT_SEARCHES_LIMIT);

      this.recentSearches.set(searches);
    } catch {
      storage.removeItem(HOME_RECENT_SEARCHES_KEY);
    }
  }

  private pushRecentSearch(term: string): void {
    const normalizedTerm = term.trim();
    if (!normalizedTerm) {
      return;
    }

    this.recentSearches.update((current) => {
      const next = [
        normalizedTerm,
        ...current.filter((item) => item.toLowerCase() !== normalizedTerm.toLowerCase()),
      ].slice(0, HOME_RECENT_SEARCHES_LIMIT);

      this.persistRecentSearches(next);
      return next;
    });
  }

  private submittedSearchQuery(event?: Event): string {
    const submittedForm = event?.currentTarget;
    if (submittedForm instanceof HTMLFormElement) {
      const input = submittedForm.querySelector('input[type="search"], input[type="text"]');
      if (input instanceof HTMLInputElement) {
        return input.value.trim();
      }
    }

    return (this.homeSearchQuery().trim() || this.mobileSearchQuery().trim()).trim();
  }

  private openSearchOverlayForSubmit(event?: Event): void {
    const submittedForm = event?.currentTarget;
    const input =
      submittedForm instanceof HTMLFormElement
        ? submittedForm.querySelector('input[type="search"], input[type="text"]')
        : null;

    if (input instanceof HTMLInputElement && input.id === 'mobile-home-search') {
      this.openMobileSearchOverlay();
      return;
    }

    if (this.isMobileSearchOverlayOpen()) {
      return;
    }

    this.openDesktopSearchOverlay();
  }

  private persistRecentSearches(searches: readonly string[]): void {
    const storage = this.browserStorage();
    if (!storage) {
      return;
    }

    if (searches.length === 0) {
      storage.removeItem(HOME_RECENT_SEARCHES_KEY);
      return;
    }

    storage.setItem(HOME_RECENT_SEARCHES_KEY, JSON.stringify(searches));
  }

  private browserStorage(): Storage | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    return window.localStorage;
  }

  private extractPopularSearches(response: HomeResponse): string[] {
    const explicitSuggestions =
      this.readSearchTerms(response.popular_searches) ??
      this.readSearchTerms(response.popular_search_terms) ??
      this.readSearchTerms(response.search_suggestions) ??
      this.readSearchTerms(response.trending_searches);

    if (explicitSuggestions && explicitSuggestions.length > 0) {
      return explicitSuggestions.slice(0, 7);
    }

    const derivedSuggestions = [
      ...(this.promotedContentEnabled() ? (response.sponsored_listings ?? []) : [])
        .map((listing) => this.extractSearchLabelFromListing(listing))
        .filter((label): label is string => label !== null),
      ...(response.nearby_listings ?? [])
        .map((listing) => this.extractSearchLabelFromListing(listing))
        .filter((label): label is string => label !== null),
      ...(response.categories ?? [])
        .map((category) => category.name?.trim() || null)
        .filter((label): label is string => !!label),
    ];

    return Array.from(
      new Map(
        derivedSuggestions.map((label) => [label.toLowerCase(), label]),
      ).values(),
    ).slice(0, 7);
  }

  private readSearchTerms(value: unknown): string[] | null {
    if (!Array.isArray(value)) {
      return null;
    }

    const terms = value
      .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
      .filter((entry) => entry.length > 0);

    return terms.length > 0 ? terms : null;
  }

  private extractSearchLabelFromListing(record: HomeListingResponse): string | null {
    return (
      this.readString(record['title']) ??
      this.readString(record['name']) ??
      this.readString(record['listing_name']) ??
      this.readString(record['category_name']) ??
      this.readString(record['subcategory_name'])
    );
  }

  private extractSearchListingItems(response: ListingsSearchResponse): HomeListingResponse[] {
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

  private searchResponseHasMore(response: ListingsSearchResponse, receivedCount: number): boolean {
    if (Array.isArray(response)) {
      return receivedCount >= HOME_NEARBY_LISTINGS_PAGE_SIZE;
    }

    if (typeof response.next === 'string' && response.next.length > 0) {
      return true;
    }

    if ('next' in response && response.next === null) {
      return false;
    }

    if (typeof response.count === 'number') {
      return this.nearbyListingCards().length < response.count;
    }

    return receivedCount >= HOME_NEARBY_LISTINGS_PAGE_SIZE;
  }

  private toHomeCategory(category: HomeCategoryResponse): HomeCategory {
    const fallbackIcon =
      (category.slug ? CATEGORY_ICON_BY_SLUG[category.slug] : null) ??
      CATEGORY_ICON_BY_SLUG[this.slugify(category.name)] ??
      '/assets/images/category-electronics.png';

    return {
      id: String(category.id),
      label: category.name,
      icon: this.resolveMediaUrl(category.icon) ?? fallbackIcon,
    };
  }

  private toListingCard(record: HomeListingResponse, fallbackId: string): Listing | null {
    const status = this.readString(record['status'])?.toLowerCase();
    const isActive = this.readBoolean(record['is_active']) ?? true;
    if ((status && status !== 'published') || !isActive) {
      return null;
    }

    const images = this.extractImageList(record);
    const title =
      this.readString(record['title']) ??
      this.readString(record['name']) ??
      this.readString(record['listing_name']);
    if (!title) {
      return null;
    }

    const location = this.buildLocationLabel(record);
    const verified =
      this.readBoolean(record['is_verified']) ??
      this.readBoolean(record['verified']) ??
      this.readBoolean(record['isVerified']) ??
      false;

    const pricing = this.extractListingPricing(record);

    return {
      id: this.readId(record, fallbackId),
      title,
      price: pricing.price,
      originalPrice: pricing.originalPrice,
      condition: this.readString(record['condition']) ?? undefined,
      location,
      images,
      timeAgo:
        this.readString(record['time_ago']) ??
        this.readString(record['condition']) ??
        this.relativeTimeFromDate(
          this.readString(record['created_at']) ?? this.readString(record['createdAt']),
        ) ??
        '',
      isVerified: verified,
      discountBadge: pricing.discountBadge,
    };
  }

  private extractListingPricing(record: HomeListingResponse): {
    readonly price: string;
    readonly originalPrice?: string;
    readonly discountBadge?: string;
  } {
    return formatListingPricing(record);
  }

  private toPromotion(
    record: HomeAdvertisementResponse,
    index: number,
  ): HomePromotion | null {
    const image =
      this.resolveMediaUrl(this.readString(record['image'])) ??
      this.resolveMediaUrl(this.readString(record['banner'])) ??
      this.resolveMediaUrl(this.readString(record['image_url'])) ??
      this.resolveMediaUrl(this.readString(record['banner_url']));

    if (!image) {
      return null;
    }

    return {
      id: this.readId(record, `advertisement-${index}`),
      image,
      link:
        this.readString(record['link']) ??
        this.readString(record['target_url']) ??
        this.readString(record['url']) ??
        undefined,
    };
  }

  private readonly trackedAdViews = new Set<string>();

  private trackAdView(adId: string): void {
    if (this.trackedAdViews.has(adId)) {
      return;
    }
    this.trackedAdViews.add(adId);
    this.homeService.trackAd(adId, 'view').subscribe({
      error: (err) => console.error(`[HomePage] Error tracking ad view for ID ${adId}:`, err),
    });
  }

  openPromotion(promotion: HomePromotion): void {
    if (isPlatformBrowser(this.platformId)) {
      this.homeService.trackAd(promotion.id, 'click').subscribe({
        error: (err) => console.error(`[HomePage] Error tracking ad click for ID ${promotion.id}:`, err),
      });
    }

    if (!promotion.link) {
      return;
    }

    const trimmedLink = promotion.link.trim();
    if (!trimmedLink) {
      return;
    }

    const isBrowser = isPlatformBrowser(this.platformId);
    const baseUrl = isBrowser ? window.location.origin : this.apiOrigin;

    try {
      const resolved = new URL(trimmedLink, baseUrl);
      if (isBrowser) {
        window.open(resolved.toString(), '_blank', 'noopener,noreferrer');
      }
    } catch {
      if (!isBrowser) {
        return;
      }

      window.open(trimmedLink, '_blank', 'noopener,noreferrer');
    }
  }

  private toStoreCard(record: HomeStoreResponse, fallbackId: string): Store | null {
    const id = this.readId(record, fallbackId);
    const name =
      record.store_name?.trim() ||
      this.readString(record['name']) ||
      this.readString(record['business_name']);
    if (!id || !name) {
      return null;
    }

    const banner =
      this.resolveMediaUrl(record.cover_image ?? null) ??
      this.resolveMediaUrl(this.readString(record['banner'])) ??
      this.resolveMediaUrl(this.readString(record['cover']));
    const user = record.user ?? null;
    const logo =
      this.resolveMediaUrl(record.profile_photo ?? null) ??
      this.resolveMediaUrl(user?.avatar ?? null) ??
      this.resolveMediaUrl(this.readString(record['logo'])) ??
      this.resolveMediaUrl(this.readString(record['avatar'])) ??
      this.resolveMediaUrl(this.readString(record['profile_image']));

    return {
      id,
      name,
      description:
        record.store_bio?.trim() ||
        this.readString(record['description']) ||
        this.readString(record['bio']) ||
        undefined,
      location: this.buildLocationLabel(record),
      coverImage: banner ?? undefined,
      mobileCoverImage: banner ?? undefined,
      logoImage: logo ?? undefined,
      mobileLogoImage: logo ?? undefined,
      isVerified:
        user?.is_verified ??
        this.readBoolean(record['is_verified']) ??
        this.readBoolean(record['verified']) ??
        true,
      followers:
        record.followers_count !== undefined && record.followers_count !== null
          ? `${record.followers_count} followers`
          : undefined,
      callNumber: record.call_number?.trim() || undefined,
      route: ['/stores', id],
    };
  }

  private extractImageList(record: Record<string, unknown>): string[] {
    const directList = this.readStringArray(record['images']);
    if (directList.length > 0) {
      return directList
        .map((image) => this.resolveMediaUrl(image))
        .filter((image): image is string => image !== null);
    }

    const imageObjects = record['images'];
    if (Array.isArray(imageObjects)) {
      const mapped = imageObjects
        .map((imageObject) => {
          if (!imageObject || typeof imageObject !== 'object') {
            return null;
          }

          const objectRecord = imageObject as Record<string, unknown>;
          return (
            this.resolveMediaUrl(this.readString(objectRecord['image'])) ??
            this.resolveMediaUrl(this.readString(objectRecord['url'])) ??
            this.resolveMediaUrl(this.readString(objectRecord['src']))
          );
        })
        .filter((image): image is string => image !== null);

      if (mapped.length > 0) {
        return mapped;
      }
    }

    const singleImage =
      this.resolveMediaUrl(this.readString(record['image'])) ??
      this.resolveMediaUrl(this.readString(record['thumbnail'])) ??
      this.resolveMediaUrl(this.readString(record['photo'])) ??
      this.resolveMediaUrl(this.readString(record['image_url']));

    return singleImage ? [singleImage] : [];
  }

  private buildLocationLabel(record: Record<string, unknown>): string {
    const city =
      this.readString(record['city']) ??
      this.readString(record['location_city']);

    const state =
      this.readString(record['state']) ??
      this.readString(record['location_state']);

    if (city && state && !city.includes(state)) {
      return `${city}, ${state}`;
    }

    const location =
      this.readString(record['location']) ??
      this.readString(record['address']);

    if (location && state && !location.includes(state)) {
      return `${location}, ${state}`;
    }

    return city ?? location ?? state ?? '';
  }

  private readId(record: Record<string, unknown>, fallbackId: string): string {
    const id = record['id'];
    if (typeof id === 'number' || typeof id === 'string') {
      return String(id);
    }

    const slug = this.readString(record['slug']);
    return slug ?? fallbackId;
  }

  private formatPrice(value: unknown): string {
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

  private resolveMediaUrl(value: string | null | undefined): string | null {
    if (!value) {
      return null;
    }

    if (/^https?:\/\//i.test(value) || value.startsWith('data:')) {
      return value;
    }

    if (value.startsWith('/')) {
      return `${this.apiOrigin}${value}`;
    }

    return `${this.apiOrigin}/${value.replace(/^\/+/, '')}`;
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private readString(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
  }

  private readBoolean(value: unknown): boolean | null {
    return typeof value === 'boolean' ? value : null;
  }

  private readStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  }

  private relativeTimeFromDate(value: string | null): string | null {
    if (!value) {
      return null;
    }

    const createdAt = new Date(value);
    if (Number.isNaN(createdAt.getTime())) {
      return null;
    }

    const diffMs = Date.now() - createdAt.getTime();
    const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    }

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) {
      return `${diffDays}d ago`;
    }

    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 5) {
      return `${diffWeeks}w ago`;
    }

    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) {
      return `${diffMonths}mo ago`;
    }

    const diffYears = Math.floor(diffDays / 365);
    return `${diffYears}y ago`;
  }

  ngOnDestroy(): void {
    if (this.heroCarouselIntervalId !== null) {
      window.clearInterval(this.heroCarouselIntervalId);
    }

    if (this.heroCarouselAdvanceTimeoutId !== null) {
      window.clearTimeout(this.heroCarouselAdvanceTimeoutId);
    }
  }
}
