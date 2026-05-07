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
    <section class="flex h-full w-full max-w-full flex-col overflow-x-hidden rounded-[32px] border border-[#EEF0F4] bg-white">
      <div class="flex h-[54px] items-center px-5 md:hidden">
        <a routerLink="/admin/stores" class="flex items-center gap-2">
          <span class="inline-flex h-8 w-11 items-center justify-center rounded-full bg-[#F3F3F3]">
            <ng-icon name="heroChevronLeft" class="text-[20px] text-black"></ng-icon>
          </span>
          <span class="text-[20px] font-semibold leading-[1.2] text-black">Store information</span>
        </a>
      </div>

      <div class="hidden border-b border-[#EEF0F4] px-6 py-5 sm:px-8 md:block">
        <nav class="flex items-center gap-3 text-sm text-[#8C8C92]">
          <a routerLink="/admin/stores" class="transition-colors hover:text-[#5B3DF5]">Stores</a>
          <span>/</span>
          <span class="font-medium text-[#1A1C21]">Store information</span>
        </nav>
      </div>

      <div class="flex-1 w-full max-w-full overflow-y-auto px-5 py-4 md:px-6 md:py-6 md:sm:px-8">
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
                <img [src]="store().logo" [alt]="store().name" class="h-full w-full rounded-full object-cover" />
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

                    <div class="grid grid-cols-2 gap-4 xl:grid-cols-5">
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
              <div class="grid w-full max-w-full gap-6 xl:grid-cols-[261px_minmax(0,1fr)]">
                <div class="min-w-0">
                  <div class="rounded-[16px] bg-[#FAFAFA] p-4 md:p-6">
                    <div class="flex flex-col gap-6">
                      <div class="min-w-[110px] md:min-w-0">
                        <div class="flex items-end gap-1">
                          <span class="text-[40px] font-semibold leading-[48px] text-[#2D2D2D] md:text-[56px] md:leading-[64px]">4.57</span>
                          <span class="pb-1 text-[20px] font-medium leading-6 text-[#BFBFBF] md:text-[28px] md:leading-10">/5</span>
                        </div>
                        <div class="mt-1 flex items-center gap-1 text-[#D3DC35] md:mt-2">
                          @for (star of [1, 2, 3, 4, 5]; track star) {
                            <ng-icon name="heroStarSolid" class="text-[16px] md:text-[20px]"></ng-icon>
                          }
                        </div>
                      </div>

                      <div class="flex-1 md:w-full">
                        <p class="mb-3 text-[16px] font-semibold text-[#2D2D2D]">Overall rating</p>
                        <div class="space-y-2.5">
                          @for (bar of ratingBreakdown; track bar.stars) {
                            <div class="flex items-center gap-2 md:gap-3">
                              <span class="w-6 text-[14px] text-[#2D2D2D] md:w-7">{{ bar.stars }} ★</span>
                              <div class="h-[7px] flex-1 overflow-hidden rounded-[16px] bg-[#EAEAEA]">
                                <div class="h-full rounded-[16px] bg-[#2D2D2D]" [style.width.%]="bar.percentage"></div>
                              </div>
                              <span class="w-8 text-right text-[14px] text-[#959595] md:w-9">{{ bar.percentage }}%</span>
                            </div>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div class="mb-7 flex items-center justify-between">
                    <h2 class="text-[20px] font-semibold leading-6 text-[#1F1F1F]">215 reviews</h2>
                    <button
                      type="button"
                      class="flex h-8 items-center gap-1 rounded-[32px] border border-[#EAEAEA] bg-white px-2 text-[14px] text-[#1A1B1D]"
                    >
                      Most recent
                      <ng-icon name="heroChevronRight" class="rotate-90 text-[14px] text-[#8C8C92]"></ng-icon>
                    </button>
                  </div>

                  <p class="text-[16px] font-medium leading-6 text-[#1F1F1F] md:hidden">This listing is great at..</p>
                  <p class="hidden text-[16px] font-medium leading-6 text-[#1F1F1F] md:block">This vendor is great at..</p>
                  <div class="mt-3 flex flex-wrap gap-x-2 gap-y-3 md:hidden">
                    @for (tag of reviewTagsMobile; track tag.label) {
                      <div class="rounded-full border border-[#EAEAEA] bg-[#F9F9F9] px-3 py-2 text-[16px] leading-6 text-[#5A5A5A]">
                        {{ tag.label }} ({{ tag.count }})
                      </div>
                    }
                  </div>
                  <div class="mt-3 hidden flex-wrap gap-3 md:flex">
                    @for (tag of reviewTags; track tag.label) {
                      <div class="rounded-full border border-[#EAEAEA] bg-[#F9F9F9] px-4 py-2 text-[16px] leading-6 text-[#5A5A5A]">
                        {{ tag.label }} ({{ tag.count }})
                      </div>
                    }
                  </div>

                  <div class="mt-8 space-y-8">
                    @for (review of reviews(); track review.author + review.date) {
                      <article class="w-full max-w-full overflow-hidden">
                        <div class="flex items-center gap-2">
                          <div class="h-11 w-11 shrink-0 overflow-hidden rounded-full">
                            <img [src]="review.avatar || '/assets/images/image-3-1.jpg'" [alt]="review.author" class="h-full w-full rounded-full object-cover" />
                          </div>
                          <div>
                            <h3 class="text-[16px] font-medium leading-6 text-[#0D0D0D]">{{ review.author }}</h3>
                            <div class="mt-1 flex items-center gap-2">
                              <div class="flex items-center gap-1">
                                @for (filled of reviewStars(review.rating); track $index) {
                                  <ng-icon name="heroStarSolid" class="text-[11px]" [class.text-[#2D2D2D]]="filled" [class.text-[#D3D4D9]]="!filled"></ng-icon>
                                }
                              </div>
                              <span class="text-[12px] text-[#D9D9D9]">•</span>
                              <span class="text-[14px] text-[#8C8C8C] md:hidden">{{ mobileReviewDate(review.date) }}</span>
                              <span class="hidden text-[14px] text-[#8C8C8C] md:inline">{{ review.date }}</span>
                            </div>
                          </div>
                        </div>

                        <p class="mt-3 text-[16px] leading-8 text-[#1F1F1F] md:leading-6">{{ review.text }}</p>

                        @if (review.images?.length) {
                          <div class="mt-4 flex w-full max-w-full flex-wrap gap-2 overflow-hidden pb-1 md:flex-nowrap md:gap-3">
                            @for (image of review.images!.slice(0, 6); track $index) {
                              <div class="relative h-[78px] w-[78px] shrink-0 overflow-hidden rounded-[11px] bg-[#E9E9E9] md:h-[117px] md:w-[117px] md:rounded-[16px]">
                                <img [src]="image" alt="" class="h-full w-full object-cover" />
                                @if ($index === 5 && review.images!.length > 6) {
                                  <div class="absolute inset-0 flex items-center justify-center bg-black/50 text-[12px] font-medium text-white md:text-[18px]">
                                    +{{ review.images!.length - 5 }}
                                  </div>
                                }
                              </div>
                            }
                          </div>
                        }
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
  readonly reviewTagsMobile: ReviewTag[] = [
    { label: 'Fast response', count: 16 },
    { label: 'Friendly', count: 7 },
    { label: 'Smooth transaction', count: 7 },
    { label: 'On-time delivery', count: 7 },
    { label: 'Honest pricing', count: 7 },
  ];

  readonly reviews = computed<Review[]>(() => [
    {
      author: 'Mary Jane',
      date: 'August 14, 2025',
      rating: 4,
      text: 'Contacted the seller. Went to their office to purchase the item and their hospitality was okay. Truly reliable. And he’s a funny man 😂',
      avatar: '/assets/images/admin-store-details/reviews/avatar-mary.png',
    },
    {
      author: 'Apeli Obubra',
      date: 'August 14, 2025',
      rating: 4,
      text: 'Straightforward guy! easy transaction great goods',
      avatar: '/assets/images/admin-store-details/reviews/avatar-apeli.png',
    },
    {
      author: 'Ibiso Amiesimaka',
      date: 'August 14, 2025',
      rating: 4,
      text: 'infact it was amazing if everyone is like this Nigeria will be better than this i advice everybody that wants to buy laptop should call this man',
      avatar: '/assets/images/admin-store-details/reviews/avatar-ibiso.png',
      images: [
        '/assets/images/admin-store-details/reviews/review-image-1.png',
        '/assets/images/admin-store-details/reviews/review-image-2.png',
        '/assets/images/admin-store-details/reviews/review-image-3.png',
        '/assets/images/admin-store-details/reviews/review-image-4.png',
        '/assets/images/admin-store-details/reviews/review-image-5.png',
        '/assets/images/admin-store-details/reviews/review-image-6.png',
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

  mobileReviewDate(date: string): string {
    const parts = date.split(',');
    if (parts.length < 2) {
      return date;
    }

    const left = parts[0].trim();
    const leftParts = left.split(' ');
    if (leftParts.length < 2) {
      return date;
    }

    return `${leftParts[0]} ${parts[1].trim()}`;
  }
}
