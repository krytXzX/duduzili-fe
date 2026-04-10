import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Listing, ListingCardComponent } from '../../components/listings/listing-card.component';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/layout/navbar.component';
import { FooterComponent } from '../../components/layout/footer.component';
import { Store, StoreCardComponent } from '../../components/stores/store-card.component';

interface SearchResultSection {
  title: string;
  viewAllCount: string;
  listings: Listing[];
}

@Component({
  selector: 'app-category-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NavbarComponent,
    ListingCardComponent,
    FooterComponent,
    StoreCardComponent
  ],
  templateUrl: './category-page.component.html',
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
export class CategoryPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly queryParamMap = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  readonly searchTerm = computed(() => this.queryParamMap().get('q') ?? 'iPhone');
  readonly listingsCount = signal('23,356');
  readonly floatingSearchTerm = computed(() => this.queryParamMap().get('q') ?? 'Mustard seed');
  readonly activeFilter = signal<string | null>(null);

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

  readonly stores = signal<Store[]>([
    {
      id: 's1',
      name: 'The Vine Collections',
      banner: '/assets/images/product_sneakers_lifestyle.png',
      logo: '/assets/images/product_sneakers_lifestyle.png',
      followers: '0',
      metaLabel: 'Ikeja, Lagos',
      isVerified: true,
      route: ['/category'],
    },
    {
      id: 's2',
      name: 'Eden Organics',
      banner: '/assets/images/product_keyboard_rgb.png',
      logo: '/assets/images/product_keyboard_rgb.png',
      followers: '0',
      metaLabel: 'Ikeja, Lagos',
      isVerified: true,
      route: ['/category'],
    },
    {
      id: 's3',
      name: 'Snap Thrifts',
      banner: '/assets/images/fashion_menswear_hero.png',
      logo: '/assets/images/fashion_menswear_hero.png',
      followers: '0',
      metaLabel: 'Ikeja, Lagos',
      isVerified: true,
      route: ['/category'],
    },
    {
      id: 's4',
      name: 'goMelon',
      banner: '/assets/images/product_watch_luxury.png',
      logo: '/assets/images/product_watch_luxury.png',
      followers: '0',
      metaLabel: 'Ikeja, Lagos',
      isVerified: true,
      route: ['/category'],
    },
  ]);

  readonly phonesAndLaptops = [
    { id: '1', title: 'Iphone 17 pro max', price: '₦2,500,000', location: 'Lagos', timeAgo: '5 mins ago', isVerified: true, images: ['/assets/images/product_watch_luxury.png', '/assets/images/product_keyboard_rgb.png', '/assets/images/product_sneakers_lifestyle.png'] },
    { id: '2', title: 'Logitech ergonomic mouse', price: '₦35,000', location: 'Lagos', timeAgo: '12 mins ago', isVerified: true, images: ['/assets/images/product_keyboard_rgb.png', '/assets/images/product_watch_luxury.png'] },
    { id: '3', title: 'RGB keyboard', price: '₦35,000', location: 'Lagos', timeAgo: '15 mins ago', isVerified: true, images: ['/assets/images/product_keyboard_rgb.png', '/assets/images/product_sneakers_lifestyle.png'] },
    { id: '4', title: 'Iphone X (64 gb)', price: '₦35,000', location: 'Lagos', timeAgo: '20 mins ago', isVerified: true, images: ['/assets/images/product_watch_luxury.png', '/assets/images/product_keyboard_rgb.png'] },
    { id: '5', title: 'Ergonomic chair', price: '₦35,000', location: 'Lagos', timeAgo: '2 mins ago', isVerified: true, images: ['/assets/images/product_sneakers_lifestyle.png', '/assets/images/product_watch_luxury.png'] },
  ] satisfies Listing[];

  readonly men = [
    { id: 'm1', title: 'Tie', price: '₦35,000', location: 'Ikeja, Lagos', timeAgo: 'Now', isVerified: true, images: ['/assets/images/fashion_menswear_hero.png'] },
    { id: 'm2', title: 'Maserati', price: '₦35,000', location: 'Ikeja, Lagos', timeAgo: 'Used', isVerified: true, images: ['/assets/images/product_watch_luxury.png'] },
    { id: 'm3', title: 'Nike sneaker', price: '₦35,000', location: 'Ikeja, Lagos', timeAgo: 'New', isVerified: true, images: ['/assets/images/product_sneakers_lifestyle.png'] },
    { id: 'm4', title: 'Dior sauvage', price: '₦35,000', location: 'Ikeja, Lagos', timeAgo: 'New', isVerified: true, images: ['/assets/images/product_keyboard_rgb.png'] },
    { id: 'm5', title: 'G-shock wrist watch', price: '₦35,000', location: 'Ikeja, Lagos', timeAgo: 'New', isVerified: true, images: ['/assets/images/product_watch_luxury.png'] },
  ] satisfies Listing[];

  readonly women = [
    { id: 'w1', title: 'Nike sneaker', price: '₦35,000', location: 'Ikeja, Lagos', timeAgo: 'New', isVerified: true, images: ['/assets/images/product_sneakers_lifestyle.png'] },
    { id: 'w2', title: 'Bone straight wig', price: '₦35,000', location: 'Ikeja, Lagos', timeAgo: 'Used', isVerified: true, images: ['/assets/images/fashion_menswear_hero.png'] },
    { id: 'w3', title: 'Ergonomic chair', price: '₦35,000', location: 'Ikeja, Lagos', timeAgo: 'New', isVerified: true, images: ['/assets/images/product_sneakers_lifestyle.png'] },
    { id: 'w4', title: 'Dinnerware set', price: '₦35,000', location: 'Ikeja, Lagos', timeAgo: 'New', isVerified: true, images: ['/assets/images/product_keyboard_rgb.png'] },
    { id: 'w5', title: 'Sweatshirt', price: '₦35,000', location: 'Ikeja, Lagos', timeAgo: 'Used', isVerified: true, images: ['/assets/images/fashion_menswear_hero.png'] },
  ] satisfies Listing[];

  readonly sections = signal<SearchResultSection[]>([
    { title: 'Phones & Laptops', viewAllCount: '3,341', listings: this.phonesAndLaptops },
    { title: 'Men', viewAllCount: '3,341', listings: this.men },
    { title: 'Women', viewAllCount: '3,341', listings: this.women },
  ]);

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

  readonly conditionLabel = computed(() => {
    return this.selectedCondition().length ? 'Condition' : 'Condition';
  });

  readonly verificationLabel = computed(() => {
    return this.selectedVerification().length ? 'Verification status' : 'Verification status';
  });

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
}
