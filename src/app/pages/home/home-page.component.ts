import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  input,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { NgOptimizedImage, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MobileBottomNavComponent } from '../../components/layout/mobile-bottom-nav.component';
import { Store, StoreCardComponent } from '../../components/stores/store-card.component';
import { Listing, ListingCardComponent } from '../../components/listings/listing-card.component';
import { HOME_HERO_CARD_SETS, HOME_HERO_HEADLINE_ITEMS } from './home-hero.config';
import {
  HomeAdvertisementResponse,
  HomeCategoryResponse,
  HomeListingResponse,
  HomeResponse,
  HomeService,
  HomeStoreResponse,
} from '../../services/home.service';
import { environment } from '../../../environments/environment';

type HomeCategory = {
  id: string;
  label: string;
  icon: string;
};

type HomeListing = {
  id: string;
  title: string;
  price: string;
  location: string;
  tag?: string;
  badge?: string;
};

type HomePromotion = {
  id: string;
  image: string;
};

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

type HomeLocationValue =
  | 'all-nigeria'
  | 'abia'
  | 'adamawa'
  | 'akwa-ibom'
  | 'anambra'
  | 'bauchi'
  | 'bayelsa'
  | 'benue'
  | 'borno'
  | 'cross-river'
  | 'delta'
  | 'ebonyi'
  | 'lagos'
  | 'abuja'
  | 'gombe'
  | 'imo'
  | 'jigawa'
  | 'kebbi'
  | 'kogi'
  | 'kwara'
  | 'nasarawa'
  | 'niger'
  | 'ondo'
  | 'osun'
  | 'plateau'
  | 'rivers'
  | 'sokoto'
  | 'taraba'
  | 'yobe'
  | 'zamfara'
  | 'oyo'
  | 'enugu'
  | 'kaduna'
  | 'edo'
  | 'kano'
  | 'ogun';

type HomeLocationGroup = {
  value: HomeLocationValue;
  label: string;
  desktopLabel?: string;
  cities: readonly string[];
};

@Component({
  selector: 'app-home-page',
  imports: [
    NgOptimizedImage,
    RouterLink,
    MobileBottomNavComponent,
    StoreCardComponent,
    ListingCardComponent,
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
  host: {
    class: 'block h-full overflow-auto bg-white text-[#1f1f1f]',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {
  private readonly categoryRail = viewChild<ElementRef<HTMLDivElement>>('categoryRail');
  private readonly platformId = inject(PLATFORM_ID);
  private readonly homeService = inject(HomeService);
  private readonly router = inject(Router);
  private readonly apiOrigin = new URL(environment.apiUrl).origin;
  private heroCarouselIntervalId: number | null = null;
  private heroCarouselAdvanceTimeoutId: number | null = null;
  private currentHomeRequestId = 0;

  readonly showPublicChrome = input(true);
  readonly showBottomNav = input(true);
  readonly showAppDownloadBanner = signal(true);
  readonly showMobileMenu = signal(false);
  readonly isCategoriesSheetOpen = signal(false);
  readonly isLocationPickerOpen = signal(false);
  readonly activeLocationPanel = signal<HomeLocationValue | null>(null);
  readonly isMobileSearchOverlayOpen = signal(false);
  readonly selectedLocation = signal<HomeLocationValue>('all-nigeria');
  readonly selectedCity = signal<string | null>(null);
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
  readonly homeError = signal<string | null>(null);
  readonly homeResponse = signal<HomeResponse | null>(null);
  readonly recentSearches = signal([
    'bags for men',
    'watch for men',
    'male accessories',
    'necklaces for men',
  ]);
  readonly popularSearches = [
    'bags for men',
    'watch for men',
    'male accessories',
    'necklaces for men',
    'Toyota camry 2016 model',
    'Miniflat in Lagos',
    'shirt for men',
  ] as const;

  readonly locationGroups: readonly HomeLocationGroup[] = [
    {
      value: 'all-nigeria',
      label: 'All Nigeria',
      desktopLabel: 'All of Nigeria',
      cities: ['Nationwide'],
    },
    {
      value: 'lagos',
      label: 'Lagos',
      cities: ['Ikeja', 'Lekki', 'Yaba', 'Surulere'],
    },
    {
      value: 'abuja',
      label: 'Abuja',
      cities: ['Maitama', 'Wuse', 'Gwarinpa', 'Asokoro'],
    },
    {
      value: 'rivers',
      label: 'Port Harcourt',
      cities: ['GRA', 'Rumuola', 'Ada George', 'Eliozu'],
    },
    {
      value: 'abia',
      label: 'Abia',
      cities: ['Umuahia', 'Aba', 'Ohafia', 'Arochukwu'],
    },
    {
      value: 'adamawa',
      label: 'Adamawa',
      cities: ['Yola', 'Mubi', 'Jimeta', 'Numan'],
    },
    {
      value: 'akwa-ibom',
      label: 'Akwa Ibom',
      cities: ['Uyo', 'Eket', 'Ikot Ekpene', 'Oron'],
    },
    {
      value: 'anambra',
      label: 'Anambra',
      cities: ['Awka', 'Onitsha', 'Nnewi', 'Ekwulobia'],
    },
    {
      value: 'bauchi',
      label: 'Bauchi',
      cities: ['Bauchi', 'Azare', 'Misau', 'Jama’are'],
    },
    {
      value: 'bayelsa',
      label: 'Bayelsa',
      cities: ['Yenagoa', 'Brass', 'Ogbia', 'Sagbama'],
    },
    {
      value: 'benue',
      label: 'Benue',
      cities: ['Makurdi', 'Gboko', 'Otukpo', 'Katsina-Ala'],
    },
    {
      value: 'borno',
      label: 'Borno',
      cities: ['Maiduguri', 'Biu', 'Dikwa', 'Konduga'],
    },
    {
      value: 'cross-river',
      label: 'Cross River',
      cities: ['Calabar', 'Ikom', 'Ogoja', 'Ugep'],
    },
    {
      value: 'delta',
      label: 'Delta',
      cities: ['Asaba', 'Warri', 'Sapele', 'Ughelli'],
    },
    {
      value: 'ebonyi',
      label: 'Ebonyi',
      cities: ['Abakaliki', 'Afikpo', 'Onueke', 'Ikwo'],
    },
    {
      value: 'oyo',
      label: 'Oyo',
      cities: ['Ibadan', 'Ogbomoso', 'Oyo Town', 'Iseyin'],
    },
    {
      value: 'enugu',
      label: 'Enugu',
      cities: ['Independence Layout', 'New Haven', 'Uwani', 'Abakpa'],
    },
    {
      value: 'kaduna',
      label: 'Kaduna',
      cities: ['Barnawa', 'Kawo', 'Sabon Tasha', 'Zaria'],
    },
    {
      value: 'gombe',
      label: 'Gombe',
      cities: ['Gombe', 'Kumo', 'Billiri', 'Dukku'],
    },
    {
      value: 'edo',
      label: 'Edo',
      cities: ['Benin City', 'Ekpoma', 'Uromi', 'Auchi'],
    },
    {
      value: 'imo',
      label: 'Imo',
      cities: ['Owerri', 'Orlu', 'Okigwe', 'Mbaise'],
    },
    {
      value: 'jigawa',
      label: 'Jigawa',
      cities: ['Dutse', 'Hadejia', 'Gumel', 'Kazaure'],
    },
    {
      value: 'kano',
      label: 'Kano',
      cities: ['Nasarawa', 'Fagge', 'Tarauni', 'Bompai'],
    },
    {
      value: 'kebbi',
      label: 'Kebbi',
      cities: ['Birnin Kebbi', 'Argungu', 'Yauri', 'Zuru'],
    },
    {
      value: 'kogi',
      label: 'Kogi',
      cities: ['Lokoja', 'Okene', 'Anyigba', 'Idah'],
    },
    {
      value: 'kwara',
      label: 'Kwara',
      cities: ['Ilorin', 'Offa', 'Omu-Aran', 'Jebba'],
    },
    {
      value: 'ogun',
      label: 'Ogun',
      cities: ['Abeokuta', 'Ijebu Ode', 'Sagamu', 'Ota'],
    },
    {
      value: 'nasarawa',
      label: 'Nasarawa',
      cities: ['Lafia', 'Keffi', 'Akwanga', 'Karu'],
    },
    {
      value: 'niger',
      label: 'Niger',
      cities: ['Minna', 'Bida', 'Suleja', 'Kontagora'],
    },
    {
      value: 'ondo',
      label: 'Ondo',
      cities: ['Akure', 'Ondo Town', 'Owo', 'Ikare'],
    },
    {
      value: 'osun',
      label: 'Osun',
      cities: ['Osogbo', 'Ile-Ife', 'Ilesa', 'Ede'],
    },
    {
      value: 'plateau',
      label: 'Plateau',
      cities: ['Jos', 'Bukuru', 'Pankshin', 'Shendam'],
    },
    {
      value: 'sokoto',
      label: 'Sokoto',
      cities: ['Sokoto', 'Tambuwal', 'Wurno', 'Gwadabawa'],
    },
    {
      value: 'taraba',
      label: 'Taraba',
      cities: ['Jalingo', 'Wukari', 'Bali', 'Takum'],
    },
    {
      value: 'yobe',
      label: 'Yobe',
      cities: ['Damaturu', 'Potiskum', 'Gashua', 'Nguru'],
    },
    {
      value: 'zamfara',
      label: 'Zamfara',
      cities: ['Gusau', 'Kaura Namoda', 'Talata Mafara', 'Anka'],
    },
  ];

  readonly selectedLocationOption = computed(
    () =>
      this.locationGroups.find((option) => option.value === this.selectedLocation()) ??
      this.locationGroups[0],
  );

  readonly activeLocationPanelOption = computed(
    () =>
      this.locationGroups.find((option) => option.value === this.activeLocationPanel()) ?? null,
  );

  readonly selectedLocationDisplay = computed(() => {
    const location = this.selectedLocationOption();
    if (location.value === 'all-nigeria' || this.selectedCity() === null) {
      return {
        mobile: location.label,
        desktop: location.desktopLabel ?? location.label,
      };
    }

    return {
      mobile: `${this.selectedCity()}, ${location.label}`,
      desktop: `${this.selectedCity()}, ${location.desktopLabel ?? location.label}`,
    };
  });

  readonly fallbackCategories: readonly HomeCategory[] = [
    { id: 'automotives', label: 'Automotives', icon: '/assets/images/category-automotives.png' },
    {
      id: 'real-estate',
      label: 'Real Estate & Properties',
      icon: '/assets/images/category-real-estate-properties.png',
    },
    { id: 'phones', label: 'Phone & Tablet', icon: '/assets/images/category-phone-tablet.png' },
    { id: 'electronics', label: 'Electronics', icon: '/assets/images/category-electronics.png' },
    {
      id: 'home',
      label: 'Home, Furniture & Appliances',
      icon: '/assets/images/category-home-furniture-appliances.png',
    },
    { id: 'menswear', label: 'Men’s fashion', icon: '/assets/images/category-mens-fashion.png' },
    {
      id: 'womenswear',
      label: 'Women’s fashion',
      icon: '/assets/images/category-womens-fashion.png',
    },
    {
      id: 'children-baby',
      label: 'Children & Baby fashion',
      icon: '/assets/images/category-children-baby-fashion.png',
    },
    {
      id: 'fashion-design',
      label: 'Fashion & Design',
      icon: '/assets/images/category-fashion-design.png',
    },
    {
      id: 'beauty',
      label: 'Beauty & Personal Care',
      icon: '/assets/images/category-beauty-personal-care.png',
    },
    {
      id: 'industrial-home',
      label: 'Industrial & Home Supplies',
      icon: '/assets/images/category-industrial-home-supplies.png',
    },
    {
      id: 'business-industrial',
      label: 'Business & Industrial',
      icon: '/assets/images/category-business-industrial.png',
    },
    {
      id: 'school-office',
      label: 'School, Office & General Supplies',
      icon: '/assets/images/category-school-office-general-supplies.png',
    },
    {
      id: 'leisure',
      label: 'Leisure & Activities',
      icon: '/assets/images/category-leisure-activities.png',
    },
    { id: 'grocery', label: 'Grocery', icon: '/assets/images/category-grocery.png' },
    { id: 'party', label: 'Party Supplies', icon: '/assets/images/category-party-supplies.png' },
    {
      id: 'food',
      label: 'Food, Agriculture & Farming',
      icon: '/assets/images/category-food-agriculture-farming.png',
    },
    { id: 'pets', label: 'Animals & Pets', icon: '/assets/images/category-animals-pets.png' },
    {
      id: 'books',
      label: 'Books, Movies & Music',
      icon: '/assets/images/category-books-movies-music.png',
    },
  ];

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

  readonly fallbackSponsoredListings: readonly HomeListing[] = [
    {
      id: 's1',
      title: 'Nike sneaker',
      price: '₦35,000',
      location: 'Ikeja, Lagos',
      tag: 'Verified',
      badge: 'Used',
    },
    {
      id: 's2',
      title: 'Bone straight wig',
      price: '₦45,000',
      location: 'Ikeja, Lagos',
      tag: 'Verified',
      badge: 'Used',
    },
    {
      id: 's3',
      title: 'iPhone X (64 gig)',
      price: '₦450,000',
      location: 'Ikeja, Lagos',
      tag: 'Verified',
      badge: 'Used',
    },
    {
      id: 's4',
      title: 'Ergonomic chair',
      price: '₦85,000',
      location: 'Ikeja, Lagos',
      tag: 'Verified',
      badge: 'Used',
    },
  ];

  readonly fallbackNearbyListings: readonly HomeListing[] = [
    {
      id: 'n1',
      title: 'Orange iPhone',
      price: '₦450,000',
      location: 'Ikeja, Lagos',
      tag: 'Verified',
    },
    {
      id: 'n2',
      title: 'Leather sandals',
      price: '₦25,000',
      location: 'Ikeja, Lagos',
      badge: 'Used',
    },
    {
      id: 'n3',
      title: 'Mechanical keyboard',
      price: '₦65,000',
      location: 'Ikeja, Lagos',
      tag: 'Verified',
    },
    { id: 'n4', title: 'White shirt', price: '₦18,500', location: 'Ikeja, Lagos', tag: 'Verified' },
    { id: 'n5', title: 'Perfume set', price: '₦32,000', location: 'Ikeja, Lagos' },
    {
      id: 'n6',
      title: 'Luxury watch',
      price: '₦120,000',
      location: 'Ikeja, Lagos',
      tag: 'Verified',
    },
    {
      id: 'n7',
      title: 'Orange iPhone',
      price: '₦450,000',
      location: 'Ikeja, Lagos',
      tag: 'Verified',
    },
    { id: 'n8', title: 'Leather sandals', price: '₦25,000', location: 'Ikeja, Lagos' },
    {
      id: 'n9',
      title: 'Mechanical keyboard',
      price: '₦65,000',
      location: 'Ikeja, Lagos',
      tag: 'Verified',
    },
    { id: 'n10', title: 'White shirt', price: '₦18,500', location: 'Ikeja, Lagos', badge: 'Used' },
    {
      id: 'n11',
      title: 'Ceramic set',
      price: '₦15,500',
      location: 'Ikeja, Lagos',
      tag: 'Verified',
    },
    { id: 'n12', title: 'Luxury watch', price: '₦120,000', location: 'Ikeja, Lagos' },
    {
      id: 'n13',
      title: 'Orange iPhone',
      price: '₦450,000',
      location: 'Ikeja, Lagos',
      tag: 'Verified',
    },
    {
      id: 'n14',
      title: 'Leather sandals',
      price: '₦25,000',
      location: 'Ikeja, Lagos',
      badge: 'Used',
    },
    {
      id: 'n15',
      title: 'Mechanical keyboard',
      price: '₦65,000',
      location: 'Ikeja, Lagos',
      tag: 'Verified',
    },
  ];

  readonly fallbackPromotions: readonly HomePromotion[] = [
    { id: 'p1', image: '/assets/images/home-promo-1.png' },
    { id: 'p2', image: '/assets/images/home-promo-2.png' },
    { id: 'p3', image: '/assets/images/home-promo-3.png' },
  ];

  readonly fallbackFeaturedStores: readonly Store[] = [
    {
      id: 'st1',
      name: 'The Vine Collections',
      location: 'Ikeja, Lagos',
      coverImage: '/assets/images/store-vine-cover-desktop.png',
      mobileCoverImage: '/assets/images/store-vine-cover-mobile.png',
      logoImage: '/assets/images/store-vine-logo-desktop.png',
      mobileLogoImage: '/assets/images/store-vine-logo-mobile.png',
      route: ['/'],
    },
    {
      id: 'st2',
      name: 'Eden Organics',
      location: 'Ikeja, Lagos',
      coverImage: '/assets/images/store-eden-cover-desktop.png',
      mobileCoverImage: '/assets/images/store-eden-cover-mobile.png',
      logoImage: '/assets/images/store-eden-logo-desktop.png',
      mobileLogoImage: '/assets/images/store-eden-logo-mobile.png',
      route: ['/'],
    },
    {
      id: 'st3',
      name: 'Snap Thrifts',
      location: 'Ikeja, Lagos',
      coverImage: '/assets/images/store-snap-cover-desktop.png',
      mobileCoverImage: '/assets/images/store-snap-cover-mobile.png',
      logoImage: '/assets/images/store-snap-logo-desktop.png',
      mobileLogoImage: '/assets/images/store-snap-logo-mobile.png',
      route: ['/'],
    },
    {
      id: 'st4',
      name: 'goMelon',
      location: 'Ikeja, Lagos',
      coverImage: '/assets/images/store-gomelon-cover-desktop.png',
      mobileCoverImage: '/assets/images/store-gomelon-cover-mobile.png',
      logoImage: '/assets/images/store-gomelon-logo-desktop.png',
      mobileLogoImage: '/assets/images/store-gomelon-logo-mobile.png',
      route: ['/'],
    },
    {
      id: 'st5',
      name: 'Amazing Fragrances',
      location: 'Ikeja, Lagos',
      coverImage: '/assets/images/store-amazing-cover-desktop.png',
      mobileCoverImage: '/assets/images/store-amazing-cover-desktop.png',
      logoImage: '/assets/images/store-amazing-logo-desktop.png',
      mobileLogoImage: '/assets/images/store-amazing-logo-desktop.png',
      route: ['/'],
    },
    {
      id: 'st6',
      name: 'None Electronics',
      location: 'Ikeja, Lagos',
      coverImage: '/assets/images/store-none-cover-desktop.png',
      mobileCoverImage: '/assets/images/store-none-cover-desktop.png',
      logoImage: '/assets/images/store-none-logo-desktop.png',
      mobileLogoImage: '/assets/images/store-none-logo-desktop.png',
      route: ['/'],
    },
    {
      id: 'st7',
      name: 'New Age Properties',
      location: 'Ikeja, Lagos',
      coverImage: '/assets/images/store-newage-cover-desktop.png',
      mobileCoverImage: '/assets/images/store-newage-cover-desktop.png',
      logoImage: '/assets/images/store-newage-logo-desktop.png',
      mobileLogoImage: '/assets/images/store-newage-logo-desktop.png',
      route: ['/'],
    },
    {
      id: 'st8',
      name: 'Swift Wears',
      location: 'Ikeja, Lagos',
      coverImage: '/assets/images/store-swift-cover-desktop.png',
      mobileCoverImage: '/assets/images/store-swift-cover-desktop.png',
      logoImage: '/assets/images/store-swift-logo-desktop.png',
      mobileLogoImage: '/assets/images/store-swift-logo-desktop.png',
      route: ['/'],
    },
  ];

  readonly categories = computed(() => {
    const response = this.homeResponse();
    if (!response) {
      return this.fallbackCategories;
    }

    return (response.categories ?? []).map((category) => this.toHomeCategory(category));
  });

  readonly sponsoredListingCards = computed(() => {
    const response = this.homeResponse();
    if (!response) {
      return this.fallbackSponsoredListings.map((listing) => this.toReusableListing(listing));
    }

    return (response.sponsored_listings ?? []).map((listing, index) =>
      this.toListingCard(listing, `sponsored-${index}`),
    );
  });

  readonly nearbyListingCards = computed(() => {
    const response = this.homeResponse();
    if (!response) {
      return this.fallbackNearbyListings.map((listing) => this.toReusableListing(listing));
    }

    return (response.nearby_listings ?? []).map((listing, index) =>
      this.toListingCard(listing, `nearby-${index}`),
    );
  });

  readonly promotions = computed(() => {
    const response = this.homeResponse();
    if (!response) {
      return this.fallbackPromotions;
    }

    return (response.advertisements ?? [])
      .map((advertisement, index) => this.toPromotion(advertisement, index))
      .filter((promotion): promotion is HomePromotion => promotion !== null);
  });

  readonly featuredStores = computed(() => {
    const response = this.homeResponse();
    if (!response) {
      return this.fallbackFeaturedStores;
    }

    return (response.featured_stores ?? []).map((store, index) =>
      this.toStoreCard(store, `featured-store-${index}`),
    );
  });

  readonly mobilePromotion = computed(() => {
    const promotions = this.promotions();
    if (promotions.length > 0) {
      return promotions[0];
    }

    return this.homeResponse() ? null : this.fallbackPromotions[0];
  });

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.startHeroCarousel();
    }

    void this.loadHome();
  }

  dismissAppDownloadBanner(): void {
    this.showAppDownloadBanner.set(false);
  }

  toggleMobileMenu(): void {
    this.showMobileMenu.update((isOpen) => !isOpen);
  }

  closeMobileMenu(): void {
    this.showMobileMenu.set(false);
  }

  openLocationPicker(): void {
    this.isLocationPickerOpen.set(true);
  }

  closeLocationPicker(): void {
    this.isLocationPickerOpen.set(false);
    this.activeLocationPanel.set(null);
  }

  openLocationCities(location: HomeLocationValue): void {
    this.activeLocationPanel.set(location);
  }

  closeLocationCities(): void {
    this.activeLocationPanel.set(null);
  }

  isLocationSelected(location: HomeLocationValue): boolean {
    return this.selectedLocation() === location && this.selectedCity() === null;
  }

  selectLocationCity(location: HomeLocationValue, city: string): void {
    this.selectedLocation.set(location);
    this.selectedCity.set(city);
    this.closeLocationPicker();
    void this.loadHome();
  }

  selectLocationGroup(location: HomeLocationValue): void {
    this.selectedLocation.set(location);
    this.selectedCity.set(null);
    this.closeLocationPicker();
    void this.loadHome();
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
  }

  closeMobileSearchOverlay(): void {
    this.isMobileSearchOverlayOpen.set(false);
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

    const query = this.homeSearchQuery().trim() || this.mobileSearchQuery().trim() || 'iPhone';
    this.isMobileSearchOverlayOpen.set(false);
    void this.router.navigate(['/search'], { queryParams: { q: query } });
  }

  removeRecentSearch(term: string): void {
    this.recentSearches.update((current) => current.filter((item) => item !== term));
  }

  clearRecentSearchHistory(): void {
    this.recentSearches.set([]);
  }

  applySearchTerm(term: string): void {
    this.mobileSearchQuery.set(term);
    this.homeSearchQuery.set(term);
  }

  scrollCategories(): void {
    this.categoryRail()?.nativeElement.scrollBy({
      left: 540,
      behavior: 'smooth',
    });
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
    } catch (error: unknown) {
      if (requestId !== this.currentHomeRequestId) {
        return;
      }

      this.homeError.set(error instanceof Error ? error.message : 'Request failed.');
      this.homeResponse.set(null);
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

  private toReusableListing(listing: HomeListing): Listing {
    return {
      id: listing.id,
      title: listing.title,
      price: listing.price,
      location: listing.location,
      images: ['/assets/images/home-item-placeholder.png'],
      timeAgo: listing.badge ?? '',
      isVerified: listing.tag === 'Verified',
      discountBadge:
        listing.tag && listing.tag !== 'Verified' ? listing.tag.toUpperCase() : undefined,
    };
  }

  private selectedLocationQuery(): string | undefined {
    const location = this.selectedLocationOption();
    if (location.value === 'all-nigeria') {
      return 'All Nigeria';
    }

    if (this.selectedCity()) {
      return `${this.selectedCity()}, ${location.label}`;
    }

    return location.label;
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

  private toListingCard(record: HomeListingResponse, fallbackId: string): Listing {
    const images = this.extractImageList(record);
    const location = this.buildLocationLabel(record);
    const verified =
      this.readBoolean(record['is_verified']) ??
      this.readBoolean(record['verified']) ??
      this.readBoolean(record['isVerified']) ??
      false;

    return {
      id: this.readId(record, fallbackId),
      title:
        this.readString(record['title']) ??
        this.readString(record['name']) ??
        this.readString(record['listing_name']) ??
        'Listing',
      price: this.formatPrice(
        record['price'] ??
          record['amount'] ??
          record['sale_price'] ??
          record['formatted_price'],
      ),
      originalPrice: this.formatPriceOptional(record['original_price'] ?? record['originalPrice']),
      location,
      images: images.length > 0 ? images : ['/assets/images/home-item-placeholder.png'],
      timeAgo:
        this.readString(record['time_ago']) ??
        this.readString(record['condition']) ??
        this.relativeTimeFromDate(
          this.readString(record['created_at']) ?? this.readString(record['createdAt']),
        ) ??
        '',
      isVerified: verified,
      discountBadge:
        this.formatDiscountBadge(record['discount_percentage']) ??
        this.readString(record['discount_badge']) ??
        this.readString(record['badge']) ??
        undefined,
    };
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
    };
  }

  private toStoreCard(record: HomeStoreResponse, fallbackId: string): Store {
    const banner =
      this.resolveMediaUrl(record.cover_image ?? null) ??
      this.resolveMediaUrl(this.readString(record['banner'])) ??
      this.resolveMediaUrl(this.readString(record['cover'])) ??
      '/assets/images/store-vine-cover-desktop.png';
    const user = record.user ?? null;
    const logo =
      this.resolveMediaUrl(record.profile_photo ?? null) ??
      this.resolveMediaUrl(user?.avatar ?? null) ??
      this.resolveMediaUrl(this.readString(record['logo'])) ??
      this.resolveMediaUrl(this.readString(record['avatar'])) ??
      this.resolveMediaUrl(this.readString(record['profile_image'])) ??
      '/assets/images/store-vine-logo-desktop.png';

    return {
      id: this.readId(record, fallbackId),
      name:
        record.store_name?.trim() ||
        this.readString(record['name']) ||
        this.readString(record['business_name']) ||
        'Store',
      description:
        record.store_bio?.trim() ||
        this.readString(record['description']) ||
        this.readString(record['bio']) ||
        undefined,
      location: this.buildLocationLabel(record),
      coverImage: banner,
      mobileCoverImage: banner,
      logoImage: logo,
      mobileLogoImage: logo,
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
      route: ['/'],
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
    const location =
      this.readString(record['location']) ??
      this.readString(record['city']) ??
      this.readString(record['address']);

    const state = this.readString(record['state']);

    if (location && state && !location.includes(state)) {
      return `${location}, ${state}`;
    }

    return location ?? state ?? 'Nigeria';
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
    return normalized === null ? '₦0' : `₦${new Intl.NumberFormat('en-NG').format(normalized)}`;
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
