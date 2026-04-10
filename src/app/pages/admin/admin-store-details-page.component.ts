import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Listing, ListingCardComponent } from '../../components/listings/listing-card.component';
import { Review } from '../../components/product/review-card.component';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroArrowTopRightOnSquare,
  heroCheckBadge,
  heroChevronLeft,
  heroChevronRight,
  heroCube,
  heroEllipsisHorizontal,
  heroMapPin,
  heroNoSymbol,
  heroStar,
} from '@ng-icons/heroicons/outline';
import { heroStarSolid } from '@ng-icons/heroicons/solid';

type AdminStoreDetailsTab = 'listings' | 'reviews';
type AdminStoreCategoryChip =
  | 'All'
  | 'Phones & Laptops'
  | 'Women'
  | 'Men'
  | 'Beauty'
  | 'Food & Drinks'
  | 'Baby & Toddler'
  | 'Home'
  | 'Properties'
  | 'Fitness & Nutrition';

interface AdminStoreDetailsRecord {
  id: string;
  name: string;
  banner: string;
  logo: string;
  location: string;
  followers: string;
  listings: string;
  rating: string;
  dateCreated: string;
  linkedUser: string;
  linkedUserInitials: string;
  linkedUserBackground: string;
  promoted: boolean;
  hasListings: boolean;
  hasReviews: boolean;
}

interface AdminStoreProductSection {
  id: string;
  title: string;
  countLabel: string;
  items: Listing[];
}

interface ReviewBreakdownItem {
  stars: number;
  percentage: number;
}

interface ReviewTag {
  label: string;
  count: number;
}

@Component({
  selector: 'app-admin-store-details-page',
  imports: [RouterLink, NgIcon, NgOptimizedImage, ListingCardComponent],
  providers: [
    provideIcons({
      heroArrowTopRightOnSquare,
      heroCheckBadge,
      heroChevronLeft,
      heroChevronRight,
      heroCube,
      heroEllipsisHorizontal,
      heroMapPin,
      heroNoSymbol,
      heroStar,
      heroStarSolid,
    }),
  ],
  template: `
    <section class="flex h-full flex-col rounded-[32px] border border-[#EEF0F4] bg-white">
      <div class="border-b border-[#EEF0F4] px-6 py-5 sm:px-8">
        <nav class="flex items-center gap-3 text-sm text-[#8C8C92]">
          <a routerLink="/admin/stores" class="transition-colors hover:text-[#5B3DF5]">Stores</a>
          <span>/</span>
          <span class="font-medium text-[#1A1C21]">Store information</span>
        </nav>
      </div>

      <div class="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
        <div class="relative h-[184px] overflow-hidden rounded-[32px] bg-[#F4F6FB] md:h-[220px]">
          <img [src]="store().banner" [alt]="store().name" class="h-full w-full object-cover" />
          <div class="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-white via-white/85 to-transparent"></div>
        </div>

        <div class="relative z-10 -mt-14 flex flex-col gap-6 md:-mt-16 md:flex-row md:items-end md:justify-between">
          <div class="flex flex-1 flex-col gap-5">
            <div class="flex items-end gap-5">
              <div
                class="h-24 w-24 overflow-hidden rounded-full border-[6px] border-white bg-white shadow-md md:h-28 md:w-28"
              >
                <img [src]="store().logo" [alt]="store().name" class="h-full w-full object-cover" />
              </div>

              <div class="pb-2">
                <div class="flex flex-wrap items-center gap-2">
                  <h1 class="text-[24px] font-semibold tracking-tight text-[#1A1C21] md:text-[28px]">
                    {{ store().name }}
                  </h1>
                  <ng-icon name="heroCheckBadge" class="text-[18px] text-[#5932EA]"></ng-icon>
                  @if (store().promoted) {
                    <span class="ml-3 inline-flex items-center gap-2 rounded-full border border-[#E7E9EE] bg-white px-5 py-2 text-[14px] font-medium text-[#1A1C21] shadow-[0_8px_20px_-18px_rgba(17,24,39,0.45)]">
                      🚀 Promoted
                    </span>
                  }
                </div>

                <div class="mt-1 flex items-center gap-1.5 text-[#7B7D88]">
                  <ng-icon name="heroMapPin" class="text-[14px]"></ng-icon>
                  <span class="text-sm">{{ store().location }}</span>
                </div>
              </div>
            </div>

            <div class="flex flex-wrap items-stretch gap-5 md:gap-0">
              <div class="pr-5 md:border-r md:border-[#EEF0F4] md:pr-8">
                <p class="text-sm text-[#8C8C92]">Followers</p>
                <p class="mt-1 text-[18px] font-semibold text-[#1A1C21]">{{ store().followers }}</p>
              </div>
              <div class="md:border-r md:border-[#EEF0F4] md:px-8">
                <p class="text-sm text-[#8C8C92]">Listings</p>
                <p class="mt-1 text-[18px] font-semibold text-[#1A1C21]">{{ store().listings }}</p>
              </div>
              <div class="md:border-r md:border-[#EEF0F4] md:px-8">
                <p class="text-sm text-[#8C8C92]">Rating</p>
                <div class="mt-1 flex items-center gap-1">
                  <span class="text-[18px] font-semibold text-[#1A1C21]">{{ store().rating }}</span>
                  <ng-icon name="heroStarSolid" class="text-[14px] text-[#E0C419]"></ng-icon>
                </div>
              </div>
              <div class="md:border-r md:border-[#EEF0F4] md:px-8">
                <p class="text-sm text-[#8C8C92]">Date created</p>
                <p class="mt-1 text-[18px] font-semibold text-[#1A1C21]">{{ store().dateCreated }}</p>
              </div>
              <div class="md:pl-8">
                <p class="text-sm text-[#8C8C92]">Linked user</p>
                <div class="mt-1 flex items-center gap-3">
                  <span
                    class="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                    [style.background]="store().linkedUserBackground"
                  >
                    {{ store().linkedUserInitials }}
                  </span>
                  <span class="text-[18px] font-semibold text-[#1A1C21]">{{ store().linkedUser }}</span>
                  <ng-icon name="heroArrowTopRightOnSquare" class="text-[16px] text-[#1A1C21]"></ng-icon>
                </div>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-full border border-[#E7E9EE] bg-white px-6 py-3 text-sm font-medium text-[#1A1C21] transition hover:bg-[#F8F8FB]"
            >
              <ng-icon name="heroNoSymbol" class="text-[16px]"></ng-icon>
              Suspend store
            </button>

            <button
              type="button"
              class="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#E7E9EE] bg-white text-[#1A1C21] transition hover:bg-[#F8F8FB]"
              aria-label="More actions"
            >
              <ng-icon name="heroEllipsisHorizontal" class="text-[18px]"></ng-icon>
            </button>
          </div>
        </div>

        <div class="mt-8 flex items-center gap-8 border-b border-[#EEF0F4]">
          <button
            type="button"
            (click)="activeTab.set('listings')"
            class="flex items-center gap-2 border-b-2 px-1 pb-4 pt-1 text-[15px] font-medium transition"
            [class.border-[#5932EA]]="activeTab() === 'listings'"
            [class.text-[#5932EA]]="activeTab() === 'listings'"
            [class.border-transparent]="activeTab() !== 'listings'"
            [class.text-[#8C8C92]]="activeTab() !== 'listings'"
          >
            <ng-icon name="heroCube" class="text-[16px]"></ng-icon>
            Listings
          </button>

          <button
            type="button"
            (click)="activeTab.set('reviews')"
            class="flex items-center gap-2 border-b-2 px-1 pb-4 pt-1 text-[15px] font-medium transition"
            [class.border-[#5932EA]]="activeTab() === 'reviews'"
            [class.text-[#5932EA]]="activeTab() === 'reviews'"
            [class.border-transparent]="activeTab() !== 'reviews'"
            [class.text-[#8C8C92]]="activeTab() !== 'reviews'"
          >
            <ng-icon name="heroStar" class="text-[16px]"></ng-icon>
            Reviews
          </button>
        </div>

        @if (activeTab() === 'listings') {
          @if (store().hasListings) {
            <div class="pt-8">
              <div class="mb-8 overflow-x-auto pb-2">
                <div class="flex min-w-max items-center gap-3 pr-14">
                  @for (chip of categoryChips; track chip) {
                    <button
                      type="button"
                      (click)="activeCategory.set(chip)"
                      class="rounded-full px-5 py-3 text-[15px] font-medium transition"
                      [class.bg-[#1A1C21]]="activeCategory() === chip"
                      [class.text-white]="activeCategory() === chip"
                      [class.bg-[#F5F6FA]]="activeCategory() !== chip"
                      [class.text-[#1A1C21]]="activeCategory() !== chip"
                    >
                      {{ chip }}
                    </button>
                  }
                </div>
              </div>

              <div class="space-y-10">
                @for (section of filteredSections(); track section.id) {
                  <section>
                    <div class="mb-6 flex items-center justify-between gap-4">
                      <h2 class="text-[20px] font-medium text-[#1A1C21]">{{ section.title }}</h2>

                      <div class="flex items-center gap-3">
                        <button
                          type="button"
                          class="flex items-center gap-2 text-[15px] font-medium text-[#1A1C21]"
                        >
                          View all ({{ section.countLabel }})
                          <ng-icon name="heroChevronRight" class="text-[16px]"></ng-icon>
                        </button>

                        <div class="flex items-center gap-2">
                          <button
                            type="button"
                            class="flex h-10 w-10 items-center justify-center rounded-full border border-[#E6E8EF] bg-white text-[#9CA3AF] transition hover:text-[#1A1C21]"
                          >
                            <ng-icon name="heroChevronLeft" class="text-[18px]"></ng-icon>
                          </button>
                          <button
                            type="button"
                            class="flex h-10 w-10 items-center justify-center rounded-full border border-[#E6E8EF] bg-white text-[#1A1C21] transition hover:bg-[#F7F7FA]"
                          >
                            <ng-icon name="heroChevronRight" class="text-[18px]"></ng-icon>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
                      @for (item of section.items; track item.id) {
                        <app-listing-card
                          [listing]="item"
                          [listingRoute]="adminListingRoute"
                          [showFavorite]="false"
                        />
                      }
                    </div>
                  </section>
                }
              </div>
            </div>
          } @else {
            <div class="flex min-h-[420px] flex-col items-center justify-center px-4 py-12 text-center">
              <img
                ngSrc="/assets/images/empty_state.svg"
                alt=""
                width="170"
                height="170"
                class="mb-6 opacity-30"
              />
              <h2 class="text-[20px] font-semibold tracking-[-0.03em] text-[#1A1C21]">
                Looks a little empty here 👀
              </h2>
              <p class="mt-2 max-w-[420px] text-[15px] font-medium text-[#8C8C92]">
                When they add some listings, they’ll appear here
              </p>
            </div>
          }
        } @else {
          @if (store().hasReviews) {
            <div class="pt-8">
              <div class="grid gap-8 xl:grid-cols-[260px_minmax(0,1fr)]">
                <div class="space-y-5">
                  <div class="rounded-[28px] bg-[#FCFCFD] p-6">
                    <div class="mb-4 flex items-end gap-2">
                      <span class="text-[58px] font-semibold leading-none text-[#1A1C21]">4.57</span>
                      <span class="mb-1 text-[22px] font-semibold text-[#C8CBD4]">/5</span>
                    </div>

                    <div class="mb-6 flex items-center gap-2 text-[#D3DC35]">
                      @for (star of [1, 2, 3, 4, 5]; track star) {
                        <ng-icon name="heroStarSolid" class="text-[20px]"></ng-icon>
                      }
                    </div>

                    <p class="mb-4 text-[16px] font-semibold text-[#1A1C21]">Overall rating</p>

                    <div class="space-y-3">
                      @for (bar of ratingBreakdown; track bar.stars) {
                        <div class="flex items-center gap-3">
                          <span class="w-7 text-[15px] font-medium text-[#1A1C21]">{{ bar.stars }} ★</span>
                          <div class="h-[6px] flex-1 overflow-hidden rounded-full bg-[#ECEEF4]">
                            <div
                              class="h-full rounded-full bg-[#3A3C43]"
                              [style.width.%]="bar.percentage"
                            ></div>
                          </div>
                          <span class="w-9 text-right text-[15px] text-[#8C8C92]">{{ bar.percentage }}%</span>
                        </div>
                      }
                    </div>
                  </div>
                </div>

                <div>
                  <div class="mb-7 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h2 class="text-[18px] font-semibold text-[#1A1C21]">215 reviews</h2>
                      <p class="mt-8 text-[18px] font-medium text-[#1A1C21]">This vendor is great at..</p>

                      <div class="mt-4 flex flex-wrap gap-3">
                        @for (tag of reviewTags; track tag.label) {
                          <div class="rounded-full border border-[#E6E8EF] px-4 py-2 text-[15px] text-[#4B5563]">
                            {{ tag.label }} ({{ tag.count }})
                          </div>
                        }
                      </div>
                    </div>

                    <button
                      type="button"
                      class="flex items-center gap-2 self-start rounded-full border border-[#E6E8EF] bg-white px-4 py-2.5 text-[15px] font-medium text-[#1A1C21]"
                    >
                      Most recent
                      <ng-icon name="heroChevronRight" class="rotate-90 text-[16px] text-[#8C8C92]"></ng-icon>
                    </button>
                  </div>

                  <div class="space-y-8">
                    @for (review of reviews(); track review.author + review.date) {
                      <article class="rounded-[24px] bg-white">
                        <div class="flex gap-4">
                          <div class="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#F3F4F6]">
                            <img
                              [src]="review.avatar || '/assets/images/image-3-1.jpg'"
                              [alt]="review.author"
                              class="h-full w-full object-cover"
                            />
                          </div>

                          <div class="min-w-0 flex-1">
                            <h3 class="text-[16px] font-medium text-[#1A1C21]">{{ review.author }}</h3>

                            <div class="mt-2 flex items-center gap-2">
                              <div class="flex items-center gap-1 text-[#3A3C43]">
                                @for (filled of reviewStars(review.rating); track $index) {
                                  <ng-icon
                                    name="heroStarSolid"
                                    class="text-[13px]"
                                    [class.text-[#3A3C43]]="filled"
                                    [class.text-[#E5E7EB]]="!filled"
                                  ></ng-icon>
                                }
                              </div>
                              <span class="text-[11px] text-[#D1D5DB]">•</span>
                              <span class="text-[14px] text-[#8C8C92]">{{ review.date }}</span>
                            </div>

                            <p class="mt-3 text-[15px] leading-8 text-[#2F3138]">{{ review.text }}</p>

                            @if (review.images?.length) {
                              <div class="mt-4 flex flex-wrap gap-3">
                                @for (image of review.images!.slice(0, 6); track $index) {
                                  <div class="relative h-28 w-28 overflow-hidden rounded-[18px] bg-[#F3F4F6]">
                                    <img [src]="image" alt="" class="h-full w-full object-cover" />

                                    @if ($index === 5 && review.images!.length > 6) {
                                      <div class="absolute inset-0 flex items-center justify-center bg-black/45 text-[28px] font-semibold text-white">
                                        +{{ review.images!.length - 5 }}
                                      </div>
                                    }
                                  </div>
                                }
                              </div>
                            }
                          </div>
                        </div>
                      </article>
                    }
                  </div>
                </div>
              </div>
            </div>
          } @else {
            <div class="flex min-h-[420px] flex-col items-center justify-center px-4 py-12 text-center">
              <img
                ngSrc="/assets/images/empty_state.svg"
                alt=""
                width="170"
                height="170"
                class="mb-6 opacity-30"
              />
              <h2 class="text-[20px] font-semibold tracking-[-0.03em] text-[#1A1C21]">
                No reviews yet
              </h2>
              <p class="mt-2 max-w-[420px] text-[15px] font-medium text-[#8C8C92]">
                Reviews for this store will appear here once buyers leave feedback.
              </p>
            </div>
          }
        }
      </div>
    </section>
  `,
  host: {
    class: 'block h-full',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminStoreDetailsPageComponent {
  private readonly route = inject(ActivatedRoute);
  readonly adminListingRoute = ['/admin/listings'];

  readonly activeTab = signal<AdminStoreDetailsTab>('listings');
  readonly activeCategory = signal<AdminStoreCategoryChip>('All');
  readonly storeId = computed(() => this.route.snapshot.paramMap.get('id') ?? 'vine-collections');
  readonly categoryChips: AdminStoreCategoryChip[] = [
    'All',
    'Phones & Laptops',
    'Women',
    'Men',
    'Beauty',
    'Food & Drinks',
    'Baby & Toddler',
    'Home',
    'Properties',
    'Fitness & Nutrition',
  ];

  private readonly stores: Record<string, AdminStoreDetailsRecord> = {
    'vine-collections': {
      id: 'vine-collections',
      name: 'The Vine Collections',
      banner: '/assets/images/store-1-banner.png',
      logo: '/assets/images/store-1-banner.png',
      location: 'Ikeja, Lagos',
      followers: '2.5k',
      listings: '1,456',
      rating: '4.8',
      dateCreated: '16 Feb, 2024',
      linkedUser: 'Ifeanyi Austin',
      linkedUserInitials: 'IA',
      linkedUserBackground: 'linear-gradient(135deg, #F6B14B 0%, #F28D28 100%)',
      promoted: true,
      hasListings: true,
      hasReviews: true,
    },
    'vine-collections-2': {
      id: 'vine-collections-2',
      name: 'The Vine Collections',
      banner: '/assets/images/store-1-banner.png',
      logo: '/assets/images/store-1-banner.png',
      location: 'Ikeja, Lagos',
      followers: '2.5k',
      listings: '1,456',
      rating: '4.4',
      dateCreated: '16 Feb, 2024',
      linkedUser: 'Abogu Ruth',
      linkedUserInitials: 'AR',
      linkedUserBackground: 'linear-gradient(135deg, #4FC3C8 0%, #2FB8A8 100%)',
      promoted: false,
      hasListings: true,
      hasReviews: true,
    },
    'vine-collections-3': {
      id: 'vine-collections-3',
      name: 'The Vine Collections',
      banner: '/assets/images/store-1-banner.png',
      logo: '/assets/images/store-1-banner.png',
      location: 'Ikeja, Lagos',
      followers: '2.5k',
      listings: '1,456',
      rating: '1.3',
      dateCreated: '16 Feb, 2024',
      linkedUser: 'Ifeanyi Austin',
      linkedUserInitials: 'IA',
      linkedUserBackground: 'linear-gradient(135deg, #F6B14B 0%, #F28D28 100%)',
      promoted: false,
      hasListings: true,
      hasReviews: true,
    },
    'eden-organics': {
      id: 'eden-organics',
      name: 'Eden Organics',
      banner: '/assets/images/store-2-banner.png',
      logo: '/assets/images/store-2-banner.png',
      location: 'Ikeja, Lagos',
      followers: '1.8k',
      listings: '300',
      rating: '3.5',
      dateCreated: '09 Mar, 2024',
      linkedUser: 'Abogu Ruth',
      linkedUserInitials: 'AR',
      linkedUserBackground: 'linear-gradient(135deg, #4FC3C8 0%, #2FB8A8 100%)',
      promoted: true,
      hasListings: true,
      hasReviews: true,
    },
    'eden-organics-2': {
      id: 'eden-organics-2',
      name: 'Eden Organics',
      banner: '/assets/images/store-2-banner.png',
      logo: '/assets/images/store-2-banner.png',
      location: 'Ikeja, Lagos',
      followers: '1.8k',
      listings: '28',
      rating: '2.5',
      dateCreated: '09 Mar, 2024',
      linkedUser: 'Abogu Ruth',
      linkedUserInitials: 'AR',
      linkedUserBackground: 'linear-gradient(135deg, #4FC3C8 0%, #2FB8A8 100%)',
      promoted: false,
      hasListings: true,
      hasReviews: false,
    },
    'amazing-fragrances': {
      id: 'amazing-fragrances',
      name: 'Amazing Fragrances',
      banner: '/assets/images/store-3-banner.png',
      logo: '/assets/images/store-3-banner.png',
      location: 'Ikeja, Lagos',
      followers: '960',
      listings: '123',
      rating: '5.0',
      dateCreated: '12 Apr, 2024',
      linkedUser: 'Ifeanyi Austin',
      linkedUserInitials: 'IA',
      linkedUserBackground: 'linear-gradient(135deg, #F6B14B 0%, #F28D28 100%)',
      promoted: false,
      hasListings: true,
      hasReviews: true,
    },
    'amazing-fragrances-2': {
      id: 'amazing-fragrances-2',
      name: 'Amazing Fragrances',
      banner: '/assets/images/store-3-banner.png',
      logo: '/assets/images/store-3-banner.png',
      location: 'Ikeja, Lagos',
      followers: '960',
      listings: '0',
      rating: '4.7',
      dateCreated: '12 Apr, 2024',
      linkedUser: 'Ifeanyi Austin',
      linkedUserInitials: 'IA',
      linkedUserBackground: 'linear-gradient(135deg, #F6B14B 0%, #F28D28 100%)',
      promoted: false,
      hasListings: false,
      hasReviews: false,
    },
  };

  readonly store = computed(() => this.stores[this.storeId()] ?? this.stores['vine-collections']);

  private readonly listingSectionsByStore: Record<string, AdminStoreProductSection[]> = {
    'vine-collections': [
      {
        id: 'phones-and-laptops',
        title: 'Phones & Laptops',
        countLabel: '3,341',
        items: [
          this.createListing('iphone-17-pro-max', 'Iphone 17 pro max', '₦2,500,000', '/assets/images/image-1-1.jpg', 'Phones & Laptops', true),
          this.createListing('logitech-mouse', 'Logitech ergonomic mouse', '₦35,000', '/assets/images/image-2-1.jpg', 'Phones & Laptops'),
          this.createListing('rgb-keyboard', 'RGB keyboard', '₦35,000', '/assets/images/product_keyboard_rgb.png', 'Phones & Laptops'),
          this.createListing('iphone-x', 'Iphone X (64 gig)', '₦35,000', '/assets/images/image-4-1.jpg', 'Phones & Laptops'),
          this.createListing('ergonomic-chair', 'Ergonomic chair', '₦35,000', '/assets/images/hero_img_4.png', 'Phones & Laptops'),
        ],
      },
      {
        id: 'men',
        title: 'Men',
        countLabel: '3,341',
        items: [
          this.createListing('tie', 'Tie', '₦35,000', '/assets/images/fashion_menswear.png', 'Men'),
          this.createListing('maserati', 'Maserati', '₦35,000', '/assets/images/product_watch_luxury.png', 'Men'),
          this.createListing('nike-sneaker', 'Nike sneaker', '₦35,000', '/assets/images/product_sneakers_lifestyle.png', 'Men'),
          this.createListing('dior-sauvage', 'Dior sauvage', '₦35,000', '/assets/images/hero_img_3.png', 'Men'),
          this.createListing('g-shock', 'G-shock wrist watch', '₦35,000', '/assets/images/product_watch_luxury.png', 'Men'),
        ],
      },
    ],
    'vine-collections-2': [
      {
        id: 'home',
        title: 'Home',
        countLabel: '1,142',
        items: [
          this.createListing('ergonomic-chair-2', 'Ergonomic chair', '₦35,000', '/assets/images/hero_img_4.png', 'Home'),
          this.createListing('kitchen-utensils', 'Kitchen utensils', '₦35,000', '/assets/images/hero-bg.png', 'Home'),
        ],
      },
    ],
    'vine-collections-3': [
      {
        id: 'beauty',
        title: 'Beauty',
        countLabel: '418',
        items: [
          this.createListing('bone-straight-wig', 'Bone straight wig', '₦35,000', '/assets/images/image-3-1.jpg', 'Beauty'),
        ],
      },
    ],
    'eden-organics': [
      {
        id: 'food-and-drinks',
        title: 'Food & Drinks',
        countLabel: '892',
        items: [
          this.createListing('organic-oil', 'Organic body oil', '₦35,000', '/assets/images/store-2-banner.png', 'Food & Drinks'),
          this.createListing('fresh-produce', 'Fresh produce pack', '₦35,000', '/assets/images/store-2-banner.png', 'Food & Drinks'),
        ],
      },
    ],
    'eden-organics-2': [
      {
        id: 'beauty-2',
        title: 'Beauty',
        countLabel: '126',
        items: [
          this.createListing('organic-serum', 'Organic serum', '₦35,000', '/assets/images/store-2-banner.png', 'Beauty'),
        ],
      },
    ],
    'amazing-fragrances': [
      {
        id: 'beauty-3',
        title: 'Beauty',
        countLabel: '543',
        items: [
          this.createListing('signature-scent', 'Signature scent', '₦35,000', '/assets/images/store-3-banner.png', 'Beauty'),
          this.createListing('fragrance-set', 'Fragrance set', '₦35,000', '/assets/images/store-3-banner.png', 'Beauty'),
        ],
      },
    ],
    'amazing-fragrances-2': [],
  };

  readonly filteredSections = computed(() => {
    const sections = this.listingSectionsByStore[this.store().id] ?? [];
    const activeCategory = this.activeCategory();

    if (activeCategory === 'All') {
      return sections;
    }

    return sections.filter((section) => section.title === activeCategory);
  });

  readonly ratingBreakdown: ReviewBreakdownItem[] = [
    { stars: 5, percentage: 65 },
    { stars: 4, percentage: 11 },
    { stars: 3, percentage: 9 },
    { stars: 2, percentage: 3 },
    { stars: 1, percentage: 2 },
  ];

  readonly reviewTags: ReviewTag[] = [
    { label: 'Timely response', count: 16 },
    { label: 'Safety', count: 7 },
    { label: 'Credibility', count: 7 },
    { label: 'Manners', count: 7 },
    { label: 'Hospitality', count: 7 },
  ];

  readonly reviews = computed<Review[]>(() => [
    {
      author: 'Mary Jane',
      date: 'August 14, 2025',
      rating: 4,
      text: 'Contacted the seller. Went to their office to purchase the item and their hospitality was okay. Truly reliable. And he’s a funny man 😂',
      avatar: '/assets/images/image-3-1.jpg',
    },
    {
      author: 'Apeli Obubra',
      date: 'August 14, 2025',
      rating: 4,
      text: 'Straightforward guy! easy transaction great goods',
      avatar: '/assets/images/image-2-1.jpg',
    },
    {
      author: 'Ibiso Amiesimaka',
      date: 'August 14, 2025',
      rating: 4,
      text: 'infact it was amazing if everyone is like this Nigeria will be better than this i advice everybody that wants to buy laptop should call this man',
      avatar: '/assets/images/image-1-1.jpg',
      images: [
        '/assets/images/fashion_menswear_hero.png',
        '/assets/images/image-1-1.jpg',
        '/assets/images/hero-bg.png',
        '/assets/images/empty_state.svg',
        '/assets/images/empty_state.svg',
        '/assets/images/product_watch_luxury.png',
      ],
    },
  ]);

  private createListing(
    id: string,
    title: string,
    price: string,
    image: string,
    _category: string,
    isVerified = true,
  ): Listing {
    return {
      id,
      title,
      price,
      images: [image],
      location: 'Ikeja, Lagos',
      timeAgo: 'Now',
      isVerified,
    };
  }

  reviewStars(rating: number): boolean[] {
    return Array.from({ length: 5 }, (_, index) => index < rating);
  }
}
