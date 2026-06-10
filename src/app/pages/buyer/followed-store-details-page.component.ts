import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DOCUMENT, NgOptimizedImage } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Listing, ListingCardComponent } from '../../components/listings/listing-card.component';
import { Review } from '../../components/product/review-card.component';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { firstValueFrom } from 'rxjs';
import {
  heroChevronRight,
  heroMapPin,
  heroCheckBadge,
  heroChevronDown,
  heroChevronLeft,
  heroChevronRight as heroChevronRightOutline,
  heroCube,
  heroStar,
  heroChatBubbleLeftRight,
  heroPhone,
  heroChatBubbleOvalLeftEllipsis,
} from '@ng-icons/heroicons/outline';
import { heroStarSolid } from '@ng-icons/heroicons/solid';
import { AuthSessionService } from '../../services/auth-session.service';
import { AppToastComponent } from '../../components/common/app-toast.component';
import { AppToastService } from '../../services/app-toast.service';
import { MessagesService } from '../../services/messages.service';
import { BuyerDashboardNavbarComponent } from '../../components/layout/buyer-dashboard-navbar.component';
import { BuyerDashboardSidebarComponent } from '../../components/layout/buyer-dashboard-sidebar.component';
import { HomeFooterComponent } from '../../components/layout/home-footer.component';
import { MobileBottomNavComponent } from '../../components/layout/mobile-bottom-nav.component';
import { PublicHomeNavbarComponent } from '../../components/layout/public-home-navbar.component';
import {
  CreateVendorReviewPayload,
  VendorFollowResponse,
  VendorListingRecord,
  VendorRecord,
  VendorReviewRecord,
  VendorListingsResponse,
  VendorReviewsResponse,
  VendorsService,
} from '../../services/vendors.service';
import { environment } from '../../../environments/environment';

type BuyerStoreTab = 'products' | 'reviews';

interface BuyerStoreStats {
  followers: string;
  products: string;
  rating: string;
  dateJoined: string;
}

interface BuyerStoreProfile {
  id: string;
  ownerUserId: string | null;
  name: string;
  logo: string;
  banner: string;
  location: string;
  description: string;
  whatsappNumber: string;
  callNumber: string;
  isVerified: boolean;
  isFollowed: boolean;
  stats: BuyerStoreStats;
}

interface ProductSection {
  id: string;
  title: string;
  countLabel: string;
  items: Listing[];
}

type MobileProductSection = {
  title: string;
  items: Listing[];
};

type StoreReview = Review & {
  tags?: string[];
};

type VendorTagSummary = {
  id?: number;
  label: string;
  count: number;
};

@Component({
  selector: 'app-followed-store-details-page',
  imports: [
    CommonModule,
    RouterLink,
    ListingCardComponent,
    NgIcon,
    NgOptimizedImage,
    AppToastComponent,
    BuyerDashboardNavbarComponent,
    BuyerDashboardSidebarComponent,
    PublicHomeNavbarComponent,
    HomeFooterComponent,
    MobileBottomNavComponent,
  ],
  providers: [
    provideIcons({
      heroChevronRight,
      heroMapPin,
      heroCheckBadge,
      heroChevronDown,
      heroChevronLeft,
      heroChevronRightOutline,
      heroCube,
      heroStar,
      heroStarSolid,
      heroChatBubbleLeftRight,
      heroPhone,
      heroChatBubbleOvalLeftEllipsis,
    }),
  ],
  host: { class: 'block h-full overflow-auto bg-white' },
  styles: [
    `
      .skeleton-shimmer {
        position: relative;
        overflow: hidden;
        background: #f1f3f6;
      }

      .skeleton-shimmer::after {
        position: absolute;
        inset: 0;
        content: '';
        transform: translateX(-100%);
        background: linear-gradient(
          90deg,
          rgba(255, 255, 255, 0) 0%,
          rgba(255, 255, 255, 0.72) 50%,
          rgba(255, 255, 255, 0) 100%
        );
        animation: buyer-store-skeleton-shimmer 1.45s ease-in-out infinite;
      }

      @keyframes buyer-store-skeleton-shimmer {
        100% {
          transform: translateX(100%);
        }
      }
    `,
  ],
  template: `
    <div [class]="pageShellClass()">
      @if (isAuthenticated()) {
        <app-buyer-dashboard-navbar />
      } @else {
        <app-public-home-navbar />
      }

      @if (isAuthenticated()) {
        <div class="flex min-h-0 flex-1 overflow-hidden lg:gap-4">
          <aside class="hidden w-64 shrink-0 lg:block">
            <app-buyer-dashboard-sidebar class="h-full" />
          </aside>

          <main class="min-h-0 min-w-0 flex-1 overflow-y-auto bg-white lg:rounded-4xl lg:shadow-sm">
            <div class="bg-white pb-[120px] lg:px-4 lg:pb-12 lg:pt-20">
              <ng-container [ngTemplateOutlet]="storeDetailsContent" />
            </div>
            <div class="h-[120px] lg:hidden" aria-hidden="true"></div>
          </main>
        </div>
      } @else {
        <main class="min-h-0 flex-1 bg-white pb-[48px] pt-0 lg:px-4 lg:pt-[112px]">
          <ng-container [ngTemplateOutlet]="storeDetailsContent" />
        </main>
      }

      @if (!isAuthenticated()) {
        <app-home-footer />
      } @else {
        <app-mobile-bottom-nav variant="buyer" />
      }

      <ng-template #storeDetailsContent>
      <section class="bg-white pb-[32px] md:hidden">
        <div class="h-[54px] px-5">
          <div class="flex h-full items-center">
            <a
              [routerLink]="backRoute()"
              aria-label="Back"
              class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f3f3f3]"
            >
              <ng-icon name="heroChevronLeft" class="text-[18px] text-[#2d2d2d]"></ng-icon>
            </a>
          </div>
        </div>

        <div class="px-5">
          <div class="relative h-[91px] overflow-hidden rounded-t-[11px]">
            @if (hasStoreBanner(); as hasBanner) {
              @if (hasBanner) {
                <img
                  [ngSrc]="store().banner"
                  [alt]="store().name + ' banner'"
                  width="350"
                  height="91"
                  loading="lazy"
                  class="h-full w-full object-cover"
                />
              } @else {
                <div class="h-full w-full animate-pulse bg-[#EEF2FF]"></div>
              }
            }
            <div
              class="pointer-events-none absolute inset-x-0 bottom-0 h-[56px] bg-[linear-gradient(180deg,rgba(255,255,255,0)_0.5%,#fff_93%)]"
            ></div>
          </div>

          <div class="relative -mt-2 flex flex-col items-center">
            <div
              class="h-[74px] w-[74px] overflow-hidden rounded-full border-4 border-white bg-[#3d785f]"
            >
              @if (hasStoreLogo()) {
                <img
                  [ngSrc]="store().logo"
                  [alt]="store().name + ' logo'"
                  width="74"
                  height="74"
                  loading="lazy"
                  class="h-full w-full object-cover"
                />
              } @else {
                <div class="h-full w-full animate-pulse bg-[#E5E7EB]"></div>
              }
            </div>
            <h1
              class="mt-2 flex items-center gap-1 text-[18px] font-medium leading-[1.1] text-[#1f1f1f]"
            >
              {{ store().name }}
              @if (store().isVerified) {
                <img
                  ngSrc="/assets/icons/home-store-verified.svg"
                  alt=""
                  width="16"
                  height="16"
                  class="h-4 w-4"
                  aria-hidden="true"
                />
              }
            </h1>
            <p class="mt-1 flex items-center gap-1 text-[14px] text-[#959595]">
              <img
                ngSrc="/assets/icons/home-store-location.svg"
                alt=""
                width="14"
                height="14"
                class="h-[14px] w-[14px]"
                aria-hidden="true"
              />
              {{ store().location }}
            </p>
          </div>

          <div class="mt-4 flex items-center justify-between rounded-[16px]">
            <div class="text-left">
              <p class="text-[12px] text-[#777]">Followers</p>
              <p class="text-[14px] font-medium text-[#1f1f1f]">{{ store().stats.followers }}</p>
            </div>
            <div class="h-9 w-px bg-[#eaeaea]"></div>
            <div class="text-left">
              <p class="text-[12px] text-[#777]">Products</p>
              <p class="text-[14px] font-medium text-[#1f1f1f]">{{ store().stats.products }}</p>
            </div>
            <div class="h-9 w-px bg-[#eaeaea]"></div>
            <div class="text-left">
              <p class="text-[12px] text-[#777]">Rating</p>
              <p class="flex items-center gap-0.5 text-[14px] font-medium text-[#1f1f1f]">
                {{ store().stats.rating }} <span class="text-[#E0C419]">★</span>
              </p>
            </div>
            <div class="h-9 w-px bg-[#eaeaea]"></div>
            <div class="text-left">
              <p class="text-[12px] text-[#777]">Date joined</p>
              <p class="text-[14px] font-medium text-[#1f1f1f]">
                {{ store().stats.dateJoined }}
              </p>
            </div>
          </div>

          <div class="mt-4 flex items-center justify-center gap-2">
            <button
              type="button"
              (click)="toggleVendorFollow()"
              class="h-10 w-[122px] rounded-full bg-[#6453d9] text-[14px] font-medium text-white shadow-[0_4px_8px_rgba(81,35,173,0.4)]"
            >
              {{ store().isFollowed ? 'Unfollow' : 'Follow' }}
            </button>
            <button
              type="button"
              class="flex h-10 w-[122px] items-center justify-center gap-1 rounded-full bg-[#f4f4f4] text-[14px] font-medium text-[#2d2d2d]"
            >
              Contact
              <ng-icon name="heroChevronDown" class="text-[14px] text-[#777]"></ng-icon>
            </button>
          </div>

          <p class="mt-4 text-center text-[16px] leading-[1.2] text-[#1f1f1f]">
            {{ store().description }}
          </p>
        </div>

        <div class="mt-6 border-b border-[#eaeaea] px-5">
          <div class="flex items-center gap-8">
            <button
              type="button"
              (click)="activeTab.set('products')"
              class="border-b-2 pb-2 text-[16px] font-medium"
              [class.border-[#6453d9]]="activeTab() === 'products'"
              [class.text-[#6453d9]]="activeTab() === 'products'"
              [class.border-transparent]="activeTab() !== 'products'"
              [class.text-[#959595]]="activeTab() !== 'products'"
            >
              Products
            </button>
            <button
              type="button"
              (click)="activeTab.set('reviews')"
              class="border-b-2 pb-2 text-[16px] font-medium"
              [class.border-[#6453d9]]="activeTab() === 'reviews'"
              [class.text-[#6453d9]]="activeTab() === 'reviews'"
              [class.border-transparent]="activeTab() !== 'reviews'"
              [class.text-[#959595]]="activeTab() !== 'reviews'"
            >
              Reviews
            </button>
          </div>
        </div>

        @if (activeTab() === 'products') {
          <div class="mt-4 overflow-x-auto px-5 pb-1">
            <div class="flex min-w-max gap-[10px]">
              @for (chip of mobileCategoryChips(); track chip) {
                <button
                  type="button"
                  (click)="activeCategory.set(chip)"
                  class="h-10 rounded-[16px] px-4 text-[14px] font-medium"
                  [class.bg-[#1a1a1a]]="activeCategory() === chip"
                  [class.text-white]="activeCategory() === chip"
                  [class.bg-[#f4f4f4]]="activeCategory() !== chip"
                  [class.text-black]="activeCategory() !== chip"
                >
                  {{ chip }}
                </button>
              }
            </div>
          </div>

          <div class="mt-4 space-y-8 px-5">
            @if (isListingsLoading()) {
              @for (card of [1, 2, 3, 4]; track card) {
                <div class="space-y-3">
                  <div class="h-6 w-40 rounded-full skeleton-shimmer"></div>
                  <div class="grid grid-cols-2 gap-[8px]">
                    @for (tile of [1, 2]; track tile) {
                      <div class="overflow-hidden rounded-[18px] border border-[#F1F3F7] bg-white">
                        <div class="aspect-[0.84] skeleton-shimmer"></div>
                        <div class="space-y-2 p-3">
                          <div class="h-4 w-3/4 rounded-full skeleton-shimmer"></div>
                          <div class="h-4 w-1/2 rounded-full skeleton-shimmer"></div>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }
            } @else if (mobileSections().length) {
              @for (section of mobileSections(); track section.title) {
                <section>
                  <div class="mb-4 flex items-center justify-between">
                    <h2 class="text-[20px] font-medium text-[#1f1f1f]">{{ section.title }}</h2>
                    <button type="button" class="flex items-center gap-1 text-[16px] text-[#1f1f1f]">
                      View all ({{ section.items.length }})
                      <ng-icon name="heroChevronRightOutline" class="text-[16px]"></ng-icon>
                    </button>
                  </div>
                  <div class="grid grid-cols-2 gap-[8px]">
                    @for (item of section.items; track item.id) {
                      <app-listing-card [listing]="item" [favoriteFilled]="true" />
                    }
                  </div>
                </section>
              }
            } @else {
              <div class="rounded-[20px] border border-[#EEF0F4] bg-[#FCFCFD] px-4 py-6 text-center text-[14px] text-[#6B7280]">
                This store hasn’t added any listings yet.
              </div>
            }
          </div>
        } @else {
          <div class="mt-4 px-5">
            <div class="rounded-[16px] bg-white p-4 shadow-[0_2px_14px_rgba(17,24,39,0.06)]">
              <div class="mb-3 flex items-end gap-1">
                <span class="text-[40px] font-semibold leading-none text-[#1A1C21]">
                  {{ store().stats.rating }}
                </span>
                <span class="pb-1 text-[18px] font-semibold text-[#C8CBD4]">/5</span>
              </div>
              <div class="mb-4 flex items-center gap-1 text-[#D3DC35]">
                @for (star of [1, 2, 3, 4, 5]; track star) {
                  <ng-icon name="heroStarSolid" class="text-[16px]"></ng-icon>
                }
              </div>
              <p class="mb-3 text-[14px] font-semibold text-[#1A1C21]">Overall rating</p>
              <div class="space-y-2.5">
                @for (bar of ratingBreakdown(); track bar.stars) {
                  <div class="flex items-center gap-2">
                    <span class="w-6 text-[12px] font-medium text-[#1A1C21]"
                      >{{ bar.stars }} ★</span
                    >
                    <div class="h-[5px] flex-1 overflow-hidden rounded-full bg-[#ECEEF4]">
                      <div
                        class="h-full rounded-full bg-[#3A3C43]"
                        [style.width.%]="bar.percentage"
                      ></div>
                    </div>
                    <span class="w-8 text-right text-[12px] text-[#8C8C92]"
                      >{{ bar.percentage }}%</span
                    >
                  </div>
                }
              </div>
            </div>
            <button
              type="button"
              (click)="void openLeaveReviewModal()"
              class="mt-4 w-full rounded-full bg-[#5932EA] px-6 py-3 text-[14px] font-medium text-white"
            >
              Leave a review
            </button>
          </div>

          <div class="mt-6 px-5">
            <div class="mb-5 flex items-center justify-between gap-4">
                <h2 class="text-[18px] font-semibold text-[#1A1C21]">
                  {{ reviewCountLabel() }} reviews
                </h2>
              <button
                type="button"
                class="flex items-center gap-1 rounded-full border border-[#E6E8EF] px-3 py-1.5 text-[13px] text-[#1A1C21]"
              >
                Most recent
                <ng-icon name="heroChevronDown" class="text-[14px] text-[#8C8C92]"></ng-icon>
              </button>
            </div>

            @if (vendorTags().length) {
              <p class="text-[16px] font-medium text-[#1A1C21]">This vendor is great at..</p>
              <div class="mt-3 flex flex-wrap gap-2">
                @for (tag of vendorTags(); track tag.label) {
                  <div
                    class="rounded-full border border-[#E6E8EF] px-3 py-1.5 text-[12px] text-[#4B5563]"
                  >
                    {{ tag.label }} ({{ tag.count }})
                  </div>
                }
              </div>
            }

            <div class="mt-5 space-y-6">
              @if (isReviewsLoading()) {
                @for (item of [1, 2, 3]; track item) {
                  <div class="flex gap-3 border-b border-[#F0F1F4] pb-5">
                    <div class="h-9 w-9 rounded-full skeleton-shimmer"></div>
                    <div class="flex-1 space-y-2">
                      <div class="h-4 w-32 rounded-full skeleton-shimmer"></div>
                      <div class="h-3 w-24 rounded-full skeleton-shimmer"></div>
                      <div class="h-3 w-full rounded-full skeleton-shimmer"></div>
                      <div class="h-3 w-5/6 rounded-full skeleton-shimmer"></div>
                    </div>
                  </div>
                }
              } @else if (reviews().length) {
                @for (review of reviews(); track review.author + review.date) {
                  <article class="border-b border-[#F0F1F4] pb-5 last:border-b-0 last:pb-0">
                    <div class="flex gap-3">
                      <div class="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#F3F4F6]">
                        @if (review.avatar; as avatar) {
                          <img
                            [ngSrc]="avatar"
                            [alt]="review.author"
                            width="36"
                            height="36"
                            loading="lazy"
                            class="h-full w-full object-cover"
                          />
                        } @else {
                          <span class="text-[12px] font-semibold text-[#6B7280]">{{ initialsFromName(review.author) }}</span>
                        }
                      </div>
                      <div class="min-w-0 flex-1">
                        <h3 class="text-[14px] font-medium text-[#1A1C21]">{{ review.author }}</h3>
                        <div class="mt-1 flex items-center gap-1.5">
                          <div class="flex items-center gap-0.5 text-[#3A3C43]">
                            @for (filled of reviewStars(review.rating); track $index) {
                              <ng-icon
                                name="heroStarSolid"
                                class="text-[11px]"
                                [class.text-[#3A3C43]]="filled"
                                [class.text-[#E5E7EB]]="!filled"
                              ></ng-icon>
                            }
                          </div>
                          <span class="text-[10px] text-[#D1D5DB]">•</span>
                          <span class="text-[12px] text-[#8C8C92]">{{ review.date }}</span>
                        </div>
                        <p class="mt-2 text-[13px] leading-6 text-[#2F3138]">{{ review.text }}</p>
                        @if (review.images?.length) {
                          <div class="mt-3 flex flex-wrap gap-2">
                            @for (image of review.images!.slice(0, 4); track $index) {
                              <div
                                class="h-[68px] w-[68px] overflow-hidden rounded-[10px] bg-[#F3F4F6]"
                              >
                                <img [ngSrc]="image" alt="" width="68" height="68" loading="lazy" class="h-full w-full object-cover" />
                              </div>
                            }
                          </div>
                        }
                      </div>
                    </div>
                  </article>
                }
              } @else {
                <div class="rounded-[20px] border border-[#EEF0F4] bg-[#FCFCFD] px-4 py-6 text-center text-[14px] text-[#6B7280]">
                  This store doesn’t have any reviews yet.
                </div>
              }
            </div>
          </div>
        }
      </section>

      <section class="hidden min-h-full px-6 py-6 md:block md:px-8">
        <nav class="mb-6 flex items-center gap-3 text-sm text-[#8C8C92]">
          <a [routerLink]="backRoute()" class="transition-colors hover:text-[#5932EA]">
            {{ breadcrumbRootLabel() }}
          </a>
          <span>/</span>
          <span class="font-medium text-[#1A1C21]">Vendor information</span>
        </nav>

        <div class="overflow-hidden rounded-[36px] border border-[#EEF0F4] bg-white">
          <div class="px-6 pb-8 pt-6 md:px-8 md:pb-10">
            <div
              class="relative h-[184px] overflow-hidden rounded-[32px] bg-[#F4F6FB] md:h-[220px]"
            >
              @if (hasStoreBanner()) {
                <img [ngSrc]="store().banner" [alt]="store().name" width="1200" height="220" loading="lazy" sizes="100vw" class="h-full w-full object-cover" />
              } @else {
                <div class="h-full w-full animate-pulse bg-[#EEF2FF]"></div>
              }
              <div
                class="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-white via-white/85 to-transparent"
              ></div>
            </div>

            <div
              class="relative z-10 -mt-14 flex flex-col gap-6 md:-mt-16 md:flex-row md:items-end md:justify-between"
            >
              <div class="flex flex-1 flex-col gap-5">
                <div class="flex items-end gap-5 w-full">
                  <div
                    class="h-24 w-24 shrink-0 aspect-square overflow-hidden rounded-full border-[6px] border-white bg-white shadow-md md:h-28 md:w-28"
                  >
                    @if (hasStoreLogo()) {
                      <img
                        [ngSrc]="store().logo"
                        [alt]="store().name"
                        width="112"
                        height="112"
                        loading="lazy"
                        class="h-full w-full rounded-full object-cover"
                      />
                    } @else {
                      <div class="h-full w-full animate-pulse rounded-full bg-[#E5E7EB]"></div>
                    }
                  </div>

                  <div class="pb-2">
                    <div class="flex flex-wrap items-center gap-2">
                      <h1
                        class="text-[24px] font-semibold tracking-tight text-[#1A1C21] md:text-[28px]"
                      >
                        {{ store().name }}
                      </h1>
                      @if (store().isVerified) {
                        <ng-icon name="heroCheckBadge" class="text-[18px] text-[#5932EA]"></ng-icon>
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
                    <p class="text-[13px] text-[#8C8C92]">Followers</p>
                    <p class="mt-1 text-[16px] font-semibold text-[#1A1C21]">
                      {{ store().stats.followers }}
                    </p>
                  </div>
                  <div class="md:border-r md:border-[#EEF0F4] md:px-8">
                    <p class="text-[13px] text-[#8C8C92]">Products</p>
                    <p class="mt-1 text-[16px] font-semibold text-[#1A1C21]">
                      {{ store().stats.products }}
                    </p>
                  </div>
                  <div class="md:border-r md:border-[#EEF0F4] md:px-8">
                    <p class="text-[13px] text-[#8C8C92]">Rating</p>
                    <div class="mt-1 flex items-center gap-1">
                      <span class="text-[16px] font-semibold text-[#1A1C21]">
                        {{ store().stats.rating }}
                      </span>
                      <ng-icon name="heroStarSolid" class="text-[14px] text-[#E0C419]"></ng-icon>
                    </div>
                  </div>
                  <div class="md:pl-8">
                    <p class="text-[13px] text-[#8C8C92]">Date joined</p>
                    <p class="mt-1 text-[16px] font-semibold text-[#1A1C21]">
                      {{ store().stats.dateJoined }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="flex flex-wrap items-center gap-3 self-end">
                <button
                  type="button"
                  (click)="toggleVendorFollow()"
                  class="rounded-full bg-[#F3F4F6] px-6 py-3 text-sm font-medium text-[#1A1C21] transition hover:bg-[#EDEEF2]"
                >
                  {{ store().isFollowed ? 'Unfollow seller' : 'Follow seller' }}
                </button>

                <div class="relative">
                  <button
                    type="button"
                    (click)="showContactMenu.update((value) => !value)"
                    class="flex items-center gap-2 rounded-full bg-[#5932EA] px-6 py-3 text-sm font-medium text-white shadow-[0_10px_24px_-12px_rgba(89,50,234,0.7)] transition hover:bg-[#4E27DD]"
                  >
                    Contact seller
                    <ng-icon name="heroChevronDown" class="text-[16px]"></ng-icon>
                  </button>

                  @if (showContactMenu()) {
                    <div
                      class="absolute right-0 top-[calc(100%+12px)] z-20 min-w-[320px] overflow-hidden rounded-[24px] border border-[#EEF0F4] bg-white p-2 shadow-xl"
                    >
                      <button
                        type="button"
                        (click)="openInAppChat()"
                        [disabled]="isOwnStore()"
                        class="flex w-full items-center gap-3 rounded-[18px] px-4 py-3 text-left text-sm font-medium text-[#1A1C21] transition hover:bg-[#F7F7FA]"
                        [class.cursor-not-allowed]="isOwnStore()"
                        [class.opacity-55]="isOwnStore()"
                      >
                        <ng-icon
                          name="heroChatBubbleOvalLeftEllipsis"
                          class="text-[18px] text-[#6B7280]"
                        ></ng-icon>
                        {{ isOwnStore() ? 'You own this store' : 'Message in-app' }}
                      </button>
                      <button
                        type="button"
                        (click)="openWhatsApp()"
                        class="flex w-full items-center gap-3 rounded-[18px] px-4 py-3 text-left text-sm font-medium text-[#1A1C21] transition hover:bg-[#F7F7FA]"
                      >
                        <span
                          class="flex h-[18px] w-[18px] items-center justify-center text-[#6B7280]"
                          >⌾</span
                        >
                        Message on WhatsApp ({{ store().whatsappNumber || store().callNumber }})
                      </button>
                      <button
                        type="button"
                        (click)="callSeller()"
                        class="flex w-full items-center gap-3 rounded-[18px] px-4 py-3 text-left text-sm font-medium text-[#1A1C21] transition hover:bg-[#F7F7FA]"
                      >
                        <ng-icon name="heroPhone" class="text-[18px] text-[#6B7280]"></ng-icon>
                        Call phone number ({{ store().callNumber || store().whatsappNumber }})
                      </button>
                    </div>
                    <button
                      type="button"
                      class="fixed inset-0 z-10 cursor-default"
                      aria-label="Close contact menu"
                      (click)="showContactMenu.set(false)"
                    ></button>
                  }
                </div>
              </div>
            </div>

            @if (store().description) {
              <div class="mb-8 max-w-[860px]">
                <p class="text-[16px] leading-7 text-[#1F1F1F]">
                  {{ store().description }}
                </p>
              </div>
            }

            <div class="flex items-center gap-8 border-b border-[#EEF0F4]">
              <button
                type="button"
                (click)="activeTab.set('products')"
                class="flex items-center gap-2 border-b-2 px-1 pb-4 pt-1 text-[15px] font-medium transition"
                [class.border-[#5932EA]]="activeTab() === 'products'"
                [class.text-[#5932EA]]="activeTab() === 'products'"
                [class.border-transparent]="activeTab() !== 'products'"
                [class.text-[#8C8C92]]="activeTab() !== 'products'"
              >
                <ng-icon name="heroCube" class="text-[16px]"></ng-icon>
                Products
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

            @if (activeTab() === 'products') {
              <div class="pt-8">
                <div class="mb-8 overflow-x-auto pb-2">
                  <div class="flex min-w-max items-center gap-3">
                    @for (chip of categoryChips(); track chip) {
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
                  @if (isListingsLoading()) {
                    @for (section of [1, 2]; track section) {
                      <div class="space-y-6">
                        <div class="h-7 w-44 rounded-full skeleton-shimmer"></div>
                        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
                          @for (card of [1, 2, 3, 4, 5]; track card) {
                            <div class="overflow-hidden rounded-[24px] border border-[#F1F3F7] bg-white">
                              <div class="aspect-[0.82] skeleton-shimmer"></div>
                              <div class="space-y-3 p-4">
                                <div class="h-4 w-3/4 rounded-full skeleton-shimmer"></div>
                                <div class="h-4 w-1/2 rounded-full skeleton-shimmer"></div>
                              </div>
                            </div>
                          }
                        </div>
                      </div>
                    }
                  } @else if (filteredSections().length) {
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
                              <ng-icon name="heroChevronRightOutline" class="text-[16px]"></ng-icon>
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
                                <ng-icon name="heroChevronRightOutline" class="text-[18px]"></ng-icon>
                              </button>
                            </div>
                          </div>
                        </div>

                        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
                          @for (item of section.items; track item.id) {
                            <app-listing-card [listing]="item" />
                          }
                        </div>
                      </section>
                    }
                  } @else {
                    <div class="rounded-[24px] border border-[#EEF0F4] bg-[#FCFCFD] px-6 py-10 text-center text-[15px] text-[#6B7280]">
                      This store hasn’t added any listings yet.
                    </div>
                  }
                </div>
              </div>
            } @else {
              <div class="pt-8">
                <div class="grid gap-8 xl:grid-cols-[260px_minmax(0,1fr)]">
                  <div class="space-y-5">
                    <div class="rounded-[28px] bg-[#FCFCFD] p-6">
                      <div class="mb-4 flex items-end gap-2">
                        <span class="text-[58px] font-semibold leading-none text-[#1A1C21]">
                          {{ store().stats.rating }}
                        </span>
                        <span class="mb-1 text-[22px] font-semibold text-[#C8CBD4]">/5</span>
                      </div>

                      <div class="mb-6 flex items-center gap-2 text-[#D3DC35]">
                        @for (star of [1, 2, 3, 4, 5]; track star) {
                          <ng-icon name="heroStarSolid" class="text-[20px]"></ng-icon>
                        }
                      </div>

                      <p class="mb-4 text-[16px] font-semibold text-[#1A1C21]">Overall rating</p>

                      <div class="space-y-3">
                        @for (bar of ratingBreakdown(); track bar.stars) {
                          <div class="flex items-center gap-3">
                            <span class="w-7 text-[15px] font-medium text-[#1A1C21]"
                              >{{ bar.stars }} ★</span
                            >
                            <div class="h-[6px] flex-1 overflow-hidden rounded-full bg-[#ECEEF4]">
                              <div
                                class="h-full rounded-full bg-[#3A3C43]"
                                [style.width.%]="bar.percentage"
                              ></div>
                            </div>
                            <span class="w-9 text-right text-[15px] text-[#8C8C92]"
                              >{{ bar.percentage }}%</span
                            >
                          </div>
                        }
                      </div>
                    </div>

                    <button
                      type="button"
                      (click)="void openLeaveReviewModal()"
                      class="w-full rounded-full bg-[#5932EA] px-6 py-3.5 text-sm font-medium text-white shadow-[0_10px_24px_-12px_rgba(89,50,234,0.7)] transition hover:bg-[#4E27DD]"
                    >
                      Leave a review
                    </button>
                  </div>

                  <div>
                    <div
                      class="mb-7 flex flex-col gap-5 md:flex-row md:items-start md:justify-between"
                    >
                      <div>
                        <h2 class="text-[18px] font-semibold text-[#1A1C21]">
                          {{ reviewCountLabel() }} reviews
                        </h2>
                        @if (vendorTags().length) {
                          <p class="mt-8 text-[18px] font-medium text-[#1A1C21]">
                            This vendor is great at..
                          </p>

                          <div class="mt-4 flex flex-wrap gap-3">
                            @for (tag of vendorTags(); track tag.label) {
                              <div
                                class="rounded-full border border-[#E6E8EF] px-4 py-2 text-[15px] text-[#4B5563]"
                              >
                                {{ tag.label }} ({{ tag.count }})
                              </div>
                            }
                          </div>
                        }
                      </div>

                      <button
                        type="button"
                        class="flex items-center gap-2 self-start rounded-full border border-[#E6E8EF] bg-white px-4 py-2.5 text-[15px] font-medium text-[#1A1C21]"
                      >
                        Most recent
                        <ng-icon
                          name="heroChevronDown"
                          class="text-[16px] text-[#8C8C92]"
                        ></ng-icon>
                      </button>
                    </div>

                    <div class="space-y-8">
                      @if (isReviewsLoading()) {
                        @for (item of [1, 2, 3]; track item) {
                          <div class="flex gap-4 rounded-[24px] bg-white">
                            <div class="h-10 w-10 rounded-full skeleton-shimmer"></div>
                            <div class="flex-1 space-y-3">
                              <div class="h-4 w-32 rounded-full skeleton-shimmer"></div>
                              <div class="h-3 w-24 rounded-full skeleton-shimmer"></div>
                              <div class="h-3 w-full rounded-full skeleton-shimmer"></div>
                              <div class="h-3 w-5/6 rounded-full skeleton-shimmer"></div>
                            </div>
                          </div>
                        }
                      } @else if (reviews().length) {
                        @for (review of reviews(); track review.author + review.date) {
                          <article class="rounded-[24px] bg-white">
                            <div class="flex gap-4">
                              <div
                                class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#F3F4F6]"
                              >
                                @if (review.avatar; as avatar) {
                                  <img
                                    [ngSrc]="avatar"
                                    [alt]="review.author"
                                    width="40"
                                    height="40"
                                    loading="lazy"
                                    class="h-full w-full object-cover"
                                  />
                                } @else {
                                  <span class="text-[13px] font-semibold text-[#6B7280]">{{ initialsFromName(review.author) }}</span>
                                }
                              </div>

                              <div class="min-w-0 flex-1">
                                <h3 class="text-[16px] font-medium text-[#1A1C21]">
                                  {{ review.author }}
                                </h3>

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

                              <p class="mt-3 text-[15px] leading-8 text-[#2F3138]">
                                {{ review.text }}
                              </p>

                              @if (review.images?.length) {
                                <div class="mt-4 flex flex-wrap gap-3">
                                  @for (image of review.images!.slice(0, 6); track $index) {
                                    <div
                                      class="relative h-28 w-28 overflow-hidden rounded-[18px] bg-[#F3F4F6]"
                                    >
                                      <img
                                        [ngSrc]="image"
                                        alt=""
                                        width="112"
                                        height="112"
                                        loading="lazy"
                                        class="h-full w-full object-cover"
                                      />

                                      @if ($index === 5 && review.images!.length > 6) {
                                        <div
                                          class="absolute inset-0 flex items-center justify-center bg-black/45 text-[28px] font-semibold text-white"
                                        >
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
                      } @else {
                        <div class="rounded-[24px] border border-[#EEF0F4] bg-[#FCFCFD] px-6 py-10 text-center text-[15px] text-[#6B7280]">
                          This store doesn’t have any reviews yet.
                        </div>
                      }
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        @if (showLeaveReviewModal()) {
          <div
            class="fixed inset-0 z-50 flex items-end justify-center bg-black/35 px-0 pt-8 backdrop-blur-sm md:items-center md:p-4"
          >
            <div
              class="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-[32px] bg-white px-5 pb-7 pt-6 shadow-2xl md:max-h-[calc(100dvh-2rem)] md:max-w-6xl md:rounded-[36px] md:p-8"
            >
              <button
                type="button"
                (click)="closeLeaveReviewModal()"
                class="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-full border border-[#E6E8EF] bg-white text-[#6B7280] transition hover:bg-[#F7F7FA] md:right-6 md:top-6"
                aria-label="Close leave review modal"
              >
                <span class="text-[28px] leading-none">&times;</span>
              </button>

              <div class="mb-4 flex justify-center md:hidden">
                <div class="h-1.5 w-14 rounded-full bg-[#D7DAE2]"></div>
              </div>

              <div class="grid gap-7 md:gap-8 md:grid-cols-[260px_minmax(0,1fr)] md:gap-10">
                <div
                  class="border-b border-[#EEF0F4] pb-6 md:border-b-0 md:border-r md:pb-0 md:pr-10"
                >
                  <h2 class="max-w-[260px] pr-14 text-[24px] font-semibold leading-tight text-[#1A1C21] md:max-w-[220px] md:pr-0 md:text-[28px]">
                    Leave a review for this seller
                  </h2>

                  <div class="mt-6 overflow-hidden rounded-[24px] border border-[#EEF0F4] bg-white md:mt-8 md:rounded-[28px]">
                    <div class="h-24 overflow-hidden bg-[#F4F6FB]">
                      @if (hasStoreBanner()) {
                        <img
                          [ngSrc]="store().banner"
                          [alt]="store().name"
                          width="320"
                          height="96"
                          loading="lazy"
                          class="h-full w-full object-cover"
                        />
                      } @else {
                        <div class="h-full w-full animate-pulse bg-[#EEF2FF]"></div>
                      }
                    </div>
                    <div class="relative px-5 pb-5 pt-10">
                      <div
                        class="absolute -top-8 left-5 h-16 w-16 overflow-hidden rounded-full border-4 border-white bg-white shadow-sm"
                      >
                        @if (hasStoreLogo()) {
                          <img
                            [ngSrc]="store().logo"
                            [alt]="store().name"
                            width="64"
                            height="64"
                            loading="lazy"
                            class="h-full w-full object-cover"
                          />
                        } @else {
                          <div class="h-full w-full animate-pulse bg-[#E5E7EB]"></div>
                        }
                      </div>

                      <h3 class="flex items-center gap-1 text-[16px] font-medium text-[#1A1C21]">
                        {{ store().name }}
                        @if (store().isVerified) {
                          <ng-icon
                            name="heroCheckBadge"
                            class="text-[16px] text-[#5932EA]"
                          ></ng-icon>
                        }
                      </h3>

                      <div class="mt-1 flex items-center gap-1.5 text-[#7B7D88]">
                        <ng-icon name="heroMapPin" class="text-[14px]"></ng-icon>
                        <span class="text-sm">{{ store().location }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div>
                    <h3 class="text-[17px] font-semibold text-[#1A1C21] md:text-[18px]">
                      How would you rate your experience with this seller?
                    </h3>

                    <div class="mt-5 flex flex-wrap items-center gap-3 md:gap-4">
                      <div class="flex items-center gap-2.5 md:gap-3">
                        @for (star of [1, 2, 3, 4, 5]; track star) {
                          <button
                            type="button"
                            (click)="reviewRating.set(star)"
                            class="transition hover:scale-105"
                            [attr.aria-label]="'Rate ' + star + ' stars'"
                          >
                            <span
                              class="text-[42px] leading-none md:text-[52px]"
                              [class.text-[#D3DC35]]="star <= reviewRating()"
                              [class.text-[#E5E7EB]]="star > reviewRating()"
                            >
                              ★
                            </span>
                          </button>
                        }
                      </div>

                      <span class="text-[16px] text-[#6B7280]">{{ ratingLabel() }}</span>
                    </div>
                  </div>

                  <div class="mt-8 md:mt-10">
                    <h3 class="text-[17px] font-semibold text-[#1A1C21] md:text-[18px]">
                      What stood out about this seller?
                      <span class="font-normal text-[#6B7280]">(optional)</span>
                    </h3>

                    <div class="mt-5 flex flex-wrap gap-3">
                      @for (tag of vendorTags(); track tag.label) {
                        <button
                          type="button"
                          (click)="toggleReviewTag(tag.label)"
                          class="rounded-full px-4 py-2 text-[15px] transition"
                          [class.border]="!selectedReviewTags().includes(tag.label)"
                          [class.border-[#E6E8EF]]="!selectedReviewTags().includes(tag.label)"
                          [class.bg-[#F7F7FA]]="!selectedReviewTags().includes(tag.label)"
                          [class.text-[#4B5563]]="!selectedReviewTags().includes(tag.label)"
                          [class.border-[#7C6AF2]]="selectedReviewTags().includes(tag.label)"
                          [class.bg-white]="selectedReviewTags().includes(tag.label)"
                          [class.text-[#5932EA]]="selectedReviewTags().includes(tag.label)"
                        >
                          {{ tag.label }}
                        </button>
                      }
                    </div>
                  </div>

                  <div class="mt-8 md:mt-10">
                    <h3 class="text-[17px] font-semibold text-[#1A1C21] md:text-[18px]">Share more details</h3>
                    <label class="mt-4 block text-[15px] text-[#4B5563]">
                      What should others know about this seller?
                    </label>
                    <textarea
                      [value]="reviewText()"
                      #reviewTextInput
                      (input)="reviewText.set(reviewTextInput.value)"
                      rows="5"
                      class="mt-3 w-full rounded-[18px] border border-[#E6E8EF] px-5 py-4 text-[15px] text-[#1A1C21] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#CFC7FF]"
                    ></textarea>
                  </div>

                  <div class="mt-8 md:mt-10">
                    <h3 class="text-[17px] font-semibold text-[#1A1C21] md:text-[18px]">
                      Attach some pictures
                      <span class="font-normal text-[#6B7280]">(optional)</span>
                    </h3>

                    <div
                      class="mt-5 rounded-[24px] border border-dashed border-[#D6DAE4] bg-[#FCFCFD] p-6"
                    >
                      <input
                        #reviewImageInput
                        type="file"
                        multiple
                        accept="image/png,image/jpeg"
                        class="hidden"
                        (change)="onReviewImagesSelected(reviewImageInput)"
                      />

                      <div class="flex flex-col items-center justify-center gap-3 text-center">
                        <button
                          type="button"
                          (click)="reviewImageInput.click()"
                          class="rounded-full border border-[#E6E8EF] bg-white px-6 py-3 text-[15px] font-medium text-[#1A1C21]"
                        >
                          Add file
                        </button>
                        <p class="text-sm text-[#8C8C92]">PNG, JPEG under 2MB</p>
                      </div>

                      @if (reviewImagePreviews().length) {
                        <div class="mt-6 flex flex-wrap gap-3">
                          @for (preview of reviewImagePreviews(); track preview) {
                            <div class="h-20 w-20 overflow-hidden rounded-[16px] bg-[#F3F4F6]">
                              <img [src]="preview" alt="" class="h-full w-full object-cover" />
                            </div>
                          }
                        </div>
                      }
                    </div>
                  </div>

                  <div class="mt-8 flex flex-col-reverse gap-3 md:mt-10 md:flex-row md:items-center md:justify-end">
                    <button
                      type="button"
                      (click)="closeLeaveReviewModal()"
                      class="w-full rounded-full bg-[#F3F4F6] px-6 py-3 text-sm font-medium text-[#1A1C21] transition hover:bg-[#EDEEF2] md:w-auto"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      (click)="submitReview()"
                      [disabled]="isSubmittingReview()"
                      class="w-full rounded-full bg-[#5932EA] px-6 py-3 text-sm font-medium text-white shadow-[0_10px_24px_-12px_rgba(89,50,234,0.7)] transition hover:bg-[#4E27DD] md:w-auto"
                      [class.opacity-70]="isSubmittingReview()"
                    >
                      {{ isSubmittingReview() ? 'Submitting...' : 'Submit review' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      </section>
      </ng-template>
    </div>

    <app-toast />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuyerFollowedStoreDetailsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly authSession = inject(AuthSessionService);
  private readonly appToastService = inject(AppToastService);
  private readonly messagesService = inject(MessagesService);
  private readonly vendorsService = inject(VendorsService);
  private readonly apiOrigin = new URL(environment.apiUrl).origin;

  readonly activeTab = signal<BuyerStoreTab>('products');
  readonly activeCategory = signal('All');
  readonly showContactMenu = signal(false);
  readonly showLeaveReviewModal = signal(false);
  readonly isFollowPending = signal(false);
  readonly isStartingConversation = signal(false);
  readonly isSubmittingReview = signal(false);
  readonly isProfileLoading = signal(true);
  readonly isListingsLoading = signal(true);
  readonly isReviewsLoading = signal(true);
  readonly isAuthenticated = this.authSession.isAuthenticated;
  readonly isOwnStore = computed(() => {
    const currentUserId = this.authSession.user()?.id;
    const ownerUserId = this.store().ownerUserId;

    return currentUserId !== undefined && ownerUserId !== null && String(currentUserId) === ownerUserId;
  });
  readonly reviewRating = signal(2);
  readonly selectedReviewTags = signal<string[]>([]);
  readonly reviewText = signal('');
  readonly reviewImagePreviews = signal<string[]>([]);
  readonly reviewImageFiles = signal<readonly File[]>([]);
  readonly reviewTagSummaries = signal<VendorTagSummary[]>([]);
  private readonly storeId = this.route.snapshot.paramMap.get('id') ?? 'bf1';

  readonly store = signal<BuyerStoreProfile>({
    id: this.storeId,
    ownerUserId: null,
    name: '',
    logo: '',
    banner: '',
    location: '',
    description: '',
    whatsappNumber: '',
    callNumber: '',
    isVerified: false,
    isFollowed: false,
    stats: {
      followers: '0',
      products: '0',
      rating: '0.0',
      dateJoined: '',
    },
  });

  constructor() {
    void this.loadVendorProfile();
    void this.loadVendorListings();
    void this.loadVendorReviews();
    this.applyInitialReviewIntent();
  }

  readonly categoryChips = computed(() => [
    'All',
    ...this.productSections().map((section) => section.title),
  ]);

  readonly mobileCategoryChips = computed(() => this.categoryChips().slice(0, 5));
  readonly backRoute = computed(() => (this.isAuthenticated() ? '/followed-stores' : '/'));
  readonly breadcrumbRootLabel = computed(() =>
    this.isAuthenticated() ? 'Followed vendors' : 'Home',
  );
  readonly pageShellClass = computed(() =>
    this.isAuthenticated()
      ? 'flex h-screen flex-col bg-white lg:gap-4 lg:bg-gray-100 lg:p-4'
      : 'flex min-h-screen flex-col bg-white overflow-x-hidden',
  );
  readonly hasStoreBanner = computed(() => this.store().banner.trim().length > 0);
  readonly hasStoreLogo = computed(() => this.store().logo.trim().length > 0);
  readonly hasLoadedAnyStoreData = computed(
    () =>
      this.store().name.trim().length > 0 ||
      this.productSections().length > 0 ||
      this.reviews().length > 0,
  );

  private applyInitialReviewIntent(): void {
    const queryParams = this.route.snapshot.queryParamMap;
    if (queryParams.get('tab') === 'reviews') {
      this.activeTab.set('reviews');
    }

    if (queryParams.get('review') === '1') {
      void this.openLeaveReviewModal();
    }
  }

  readonly mobileSections = computed<readonly MobileProductSection[]>(() =>
    this.filteredSections()
      .slice(0, 2)
      .map((section) => ({
        title: section.title,
        items: section.items.slice(0, 4),
      })),
  );

  readonly productSections = signal<ProductSection[]>([]);

  readonly reviews = signal<StoreReview[]>([]);

  readonly vendorTags = computed(() => {
    if (this.reviewTagSummaries().length > 0) {
      return this.reviewTagSummaries();
    }

    const counts = new Map<string, number>();

    for (const review of this.reviews()) {
      const tags = this.extractReviewTags(review);
      for (const tag of tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }

    return Array.from(counts.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label))
      .slice(0, 5);
  });

  readonly ratingBreakdown = computed(() => {
    const reviews = this.reviews();
    const total = reviews.length;

    return [5, 4, 3, 2, 1].map((stars) => {
      const matching = reviews.filter((review) => review.rating === stars).length;
      const percentage = total > 0 ? Math.round((matching / total) * 100) : 0;
      return { stars, percentage };
    });
  });

  readonly reviewCountLabel = computed(() => new Intl.NumberFormat('en-NG').format(this.reviews().length));

  readonly ratingLabel = computed(() => {
    switch (this.reviewRating()) {
      case 1:
        return 'Very poor';
      case 2:
        return 'Needs improvement';
      case 3:
        return 'Average';
      case 4:
        return 'Good experience';
      case 5:
        return 'Excellent';
      default:
        return 'Needs improvement';
    }
  });

  readonly filteredSections = computed(() => {
    const category = this.activeCategory();

    if (category === 'All') {
      return this.productSections();
    }

    return this.productSections().filter((section) => section.title === category);
  });

  reviewStars(rating: number) {
    return Array.from({ length: 5 }, (_, index) => index < rating);
  }

  async openLeaveReviewModal(): Promise<void> {
    if (!this.authSession.isAuthenticated()) {
      await this.router.navigate(['/sign-in']);
      return;
    }

    this.showLeaveReviewModal.set(true);
  }

  async openInAppChat(): Promise<void> {
    this.showContactMenu.set(false);

    if (this.isStartingConversation()) {
      return;
    }

    if (this.isOwnStore()) {
      this.appToastService.show({
        message: 'You cannot message your own store.',
      });
      return;
    }

    if (!this.authSession.isAuthenticated()) {
      await this.router.navigate(['/sign-in']);
      return;
    }

    const storeId = this.store().id;
    if (!storeId) {
      return;
    }

    this.isStartingConversation.set(true);

    try {
      const response = await firstValueFrom(this.messagesService.startConversation(storeId));
      const conversationId =
        this.readString(response['id']) ?? this.readString(response['chat_id']);

      await this.router.navigate(['/chats'], {
        queryParams: conversationId ? { conversation: conversationId } : undefined,
      });
    } catch (error) {
      this.appToastService.show({
        message: this.extractErrorMessage(error) ?? 'We couldn’t open this chat right now. Please try again.',
      });
    } finally {
      this.isStartingConversation.set(false);
    }
  }

  openWhatsApp() {
    this.showContactMenu.set(false);
    const phoneNumber = this.store().whatsappNumber || this.store().callNumber;
    if (!phoneNumber) {
      return;
    }

    const sanitizedNumber = phoneNumber.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/234${sanitizedNumber.replace(/^0/, '')}`;
    globalThis.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  }

  callSeller() {
    this.showContactMenu.set(false);
    const phoneNumber = this.store().callNumber || this.store().whatsappNumber;
    if (!phoneNumber) {
      return;
    }

    this.document.location.href = `tel:${phoneNumber}`;
  }

  toggleReviewTag(tag: string) {
    this.selectedReviewTags.update((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag],
    );
  }

  onReviewImagesSelected(input: HTMLInputElement) {
    const files = Array.from(input.files ?? []);
    const limitedFiles = files.slice(0, 6);
    const previews = limitedFiles.map((file) => URL.createObjectURL(file));
    this.revokeReviewPreviewUrls();
    this.reviewImageFiles.set(limitedFiles);
    this.reviewImagePreviews.set(previews);
    input.value = '';
  }

  closeLeaveReviewModal() {
    this.showLeaveReviewModal.set(false);
    this.resetReviewDraft();
  }

  async submitReview(): Promise<void> {
    if (this.isSubmittingReview()) {
      return;
    }

    if (!this.authSession.isAuthenticated()) {
      await this.router.navigate(['/sign-in']);
      return;
    }

    const vendorId = this.store().id;
    if (!vendorId) {
      this.appToastService.show({
        message: 'Your review couldn’t be submitted right now. Please try again.',
      });
      return;
    }

    const payload = this.buildReviewPayload();

    this.isSubmittingReview.set(true);

    try {
      await firstValueFrom(this.vendorsService.createVendorReview(vendorId, payload));
      await this.loadVendorReviews();
      this.showLeaveReviewModal.set(false);
      this.resetReviewDraft();
      this.appToastService.show({
        message: 'Review submitted.',
      });
    } catch (error: unknown) {
      this.appToastService.show({
        message: this.extractReviewErrorMessage(error),
        durationMs: 5000,
      });
    } finally {
      this.isSubmittingReview.set(false);
    }
  }

  async toggleVendorFollow(): Promise<void> {
    if (this.isFollowPending()) {
      return;
    }

    if (!this.authSession.isAuthenticated()) {
      if (typeof window !== 'undefined') {
        void Promise.resolve().then(() => (window.location.href = '/sign-in'));
      }
      return;
    }

    const vendorId = this.store().id;
    if (!vendorId) {
      return;
    }

    const previousState = this.store().isFollowed;
    this.isFollowPending.set(true);

    try {
      const response = await firstValueFrom(this.vendorsService.toggleFollow(vendorId));
      const nextState = this.resolveFollowState(response, previousState);
      const nextFollowers = this.resolveFollowerCount(
        response['followers_count'],
        this.store().stats.followers,
        previousState,
        nextState,
      );

      this.store.update((store) => ({
        ...store,
        isFollowed: nextState,
        stats: {
          ...store.stats,
          followers: nextFollowers,
        },
      }));
    } finally {
      this.isFollowPending.set(false);
    }
  }

  private async loadVendorProfile(): Promise<void> {
    this.isProfileLoading.set(true);

    try {
      const record = await firstValueFrom(this.vendorsService.getVendorDetails(this.storeId));
      this.applyVendorProfile(record);
    } catch {
      this.store.update((store) => ({
        ...store,
        id: this.storeId,
        ownerUserId: null,
        name: '',
        logo: '',
        banner: '',
        location: '',
        description: '',
        whatsappNumber: '',
        callNumber: '',
        isVerified: false,
        isFollowed: false,
        stats: {
          followers: '0',
          products: '0',
          rating: '0.0',
          dateJoined: '',
        },
      }));
    } finally {
      this.isProfileLoading.set(false);
    }
  }

  private async loadVendorListings(): Promise<void> {
    this.isListingsLoading.set(true);

    try {
      const response = await firstValueFrom(this.vendorsService.getVendorListings(this.storeId));
      const sections = this.groupVendorListings(this.extractVendorListingItems(response));
      this.productSections.set(sections);
    } catch {
      this.productSections.set([]);
    } finally {
      this.isListingsLoading.set(false);
    }
  }

  private async loadVendorReviews(): Promise<void> {
    this.isReviewsLoading.set(true);

    try {
      const response = await firstValueFrom(this.vendorsService.getVendorReviews(this.storeId));
      const items = this.extractVendorReviewItems(response);
      const reviews = items
        .map((review, index) => this.toReview(review, index))
        .filter((review): review is Review => review !== null);
      this.reviewTagSummaries.set(this.extractVendorTagSummaries(items));
      this.reviews.set(reviews);
    } catch {
      this.reviewTagSummaries.set([]);
      this.reviews.set([]);
    } finally {
      this.isReviewsLoading.set(false);
    }
  }

  private resetReviewDraft(): void {
    this.reviewRating.set(2);
    this.selectedReviewTags.set([]);
    this.reviewText.set('');
    this.reviewImageFiles.set([]);
    this.revokeReviewPreviewUrls();
    this.reviewImagePreviews.set([]);
  }

  private buildReviewPayload(): CreateVendorReviewPayload {
    const vendorId = this.store().id;
    const tagIds = this.selectedReviewTags()
      .map((label) => this.reviewTagSummaries().find((tag) => tag.label === label)?.id)
      .filter((tagId): tagId is number => typeof tagId === 'number');

    return {
      vendor: vendorId,
      rating: this.reviewRating(),
      comment: this.reviewText().trim(),
      tag_ids: tagIds,
      photo_files: this.reviewImageFiles(),
    };
  }

  private revokeReviewPreviewUrls(): void {
    for (const preview of this.reviewImagePreviews()) {
      if (preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    }
  }

  private applyVendorProfile(record: VendorRecord): void {
    const userRecord = this.readRecord(record['user']);
    const location = this.composeLocation(record);
    const storeName = this.readString(record['store_name']) ?? this.readString(record['name']);
    const description =
      this.readString(record['store_bio']) ?? this.readString(record['description']);
    const logo =
      this.resolveMediaUrl(this.readString(record['profile_photo'])) ??
      this.resolveMediaUrl(this.readString(record['logo'])) ??
      this.resolveMediaUrl(this.readString(userRecord?.['avatar']));
    const banner =
      this.resolveMediaUrl(this.readString(record['cover_image'])) ??
      this.resolveMediaUrl(this.readString(record['banner'])) ??
      this.resolveMediaUrl(this.readString(record['image']));
    const rating =
      this.formatRating(record['average_rating']) ?? this.formatRating(record['store_rating']);
    const followers =
      this.formatCompactCount(record['followers_count']) ?? this.store().stats.followers;
    const products =
      this.formatCompactCount(record['products_count']) ?? this.store().stats.products;
    const dateJoined =
      this.formatDate(record['date_joined']) ??
      this.formatDate(record['created_at']) ??
      this.store().stats.dateJoined;
    const isVerified =
      this.readBoolean(userRecord?.['is_verified']) ??
      this.readBoolean(record['is_verified']) ??
      this.store().isVerified;
    const isFollowed = this.readBoolean(record['is_followed']) ?? this.store().isFollowed;
    const whatsappNumber =
      this.readString(record['whatsapp_number']) ?? this.store().whatsappNumber;
    const callNumber = this.readString(record['call_number']) ?? this.store().callNumber;
    const ownerUserId =
      this.readString(userRecord?.['id']) ?? this.readString(record['user_id']) ?? this.store().ownerUserId;

    this.store.update((store) => ({
      ...store,
      id: this.readString(record['id']) ?? store.id,
      ownerUserId,
      name: storeName ?? store.name,
      logo: logo ?? store.logo,
      banner: banner ?? store.banner,
      location: location ?? store.location,
      description: description ?? store.description,
      whatsappNumber,
      callNumber,
      isVerified,
      isFollowed,
      stats: {
        followers,
        products,
        rating: rating ?? store.stats.rating,
        dateJoined,
      },
    }));
  }

  private extractVendorListingItems(response: VendorListingsResponse): VendorListingRecord[] {
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

  private groupVendorListings(records: VendorListingRecord[]): ProductSection[] {
    const sectionMap = new Map<string, ProductSection>();

    records.forEach((record, index) => {
      const listing = this.toListing(record, index);
      if (!listing) {
        return;
      }

      const category = this.readString(record['category']) ?? 'Products';
      const section = sectionMap.get(category);

      if (section) {
        section.items.push(listing);
        section.countLabel = new Intl.NumberFormat('en-NG').format(section.items.length);
        return;
      }

      sectionMap.set(category, {
        id: this.slugify(category),
        title: category,
        countLabel: '1',
        items: [listing],
      });
    });

    return Array.from(sectionMap.values());
  }

  private toListing(record: VendorListingRecord, index: number): Listing | null {
    const id = this.readString(record['id']) ?? `vendor-listing-${index + 1}`;
    const title = this.readString(record['title']) ?? this.readString(record['name']);
    const price = this.formatPrice(record['price']);

    if (!title || !price) {
      return null;
    }

    return {
      id,
      title,
      price,
      originalPrice: this.formatPrice(record['original_price']) ?? undefined,
      discountBadge: this.formatDiscountBadge(record['discount_percentage']) ?? undefined,
      images: this.extractListingImages(record),
      location: this.composeListingLocation(record) ?? this.store().location,
      timeAgo: this.formatRelativeTime(record['created_at']) ?? 'Just now',
      isVerified: this.readBoolean(record['is_verified']) ?? false,
    };
  }

  private extractVendorReviewItems(response: VendorReviewsResponse): VendorReviewRecord[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response.results)) {
      return response.results;
    }

    if (Array.isArray(response.data)) {
      return response.data;
    }

    if (Array.isArray(response.reviews)) {
      return response.reviews;
    }

    return [];
  }

  private toReview(record: VendorReviewRecord, index: number): StoreReview | null {
    const reviewerRecord = this.readRecord(record['reviewer']);
    const author =
      this.readString(record['author']) ??
      this.readString(record['username']) ??
      this.readString(reviewerRecord?.['username']) ??
      this.readString(this.readRecord(record['user'])?.['username']) ??
      this.readString(record['full_name']) ??
      `Customer ${index + 1}`;
    const text =
      this.readString(record['text']) ??
      this.readString(record['comment']) ??
      this.readString(record['review']) ??
      this.readString(record['content']);
    const rating = this.clampRating(record['rating']);

    if (!text || rating === null) {
      return null;
    }

    return {
      author,
      avatar:
        this.resolveMediaUrl(this.readString(record['avatar'])) ??
        this.resolveMediaUrl(this.readString(reviewerRecord?.['avatar'])) ??
        this.resolveMediaUrl(this.readString(this.readRecord(record['user'])?.['avatar'])) ??
        undefined,
      rating,
      text,
      date: this.formatReviewDate(record['created_at']) ?? 'Recently',
      images: this.extractReviewImages(record),
      tags:
        this.readStringArray(record['tags']).length > 0
          ? this.readStringArray(record['tags'])
          : this.readStringArray(record['highlights']).length > 0
            ? this.readStringArray(record['highlights'])
            : this.readStringArray(record['strengths']),
    };
  }

  private extractVendorTagSummaries(records: VendorReviewRecord[]): VendorTagSummary[] {
    const tags = new Map<string, VendorTagSummary>();

    for (const record of records) {
      const value = record['tags'];
      if (!Array.isArray(value)) {
        continue;
      }

      for (const item of value) {
        if (typeof item === 'string' && item.trim().length > 0) {
          const label = item.trim();
          const current = tags.get(label);
          tags.set(label, {
            id: current?.id,
            label,
            count: (current?.count ?? 0) + 1,
          });
          continue;
        }

        if (typeof item !== 'object' || item === null) {
          continue;
        }

        const tagRecord = item as Record<string, unknown>;
        const label = this.readString(tagRecord['name']) ?? this.readString(tagRecord['label']);
        const count = this.toNumber(tagRecord['count']) ?? 1;
        const id = this.toNumber(tagRecord['id']) ?? undefined;
        if (!label) {
          continue;
        }

        const current = tags.get(label);
        tags.set(label, {
          id: current?.id ?? id,
          label,
          count: Math.max(current?.count ?? 0, count),
        });
      }
    }

    return Array.from(tags.values())
      .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label))
      .slice(0, 5);
  }

  private extractReviewErrorMessage(error: unknown): string {
    if (typeof error !== 'object' || error === null) {
      return 'Your review couldn’t be submitted right now. Please try again.';
    }

    const errorRecord = error as Record<string, unknown>;
    const responseError =
      typeof errorRecord['error'] === 'object' && errorRecord['error'] !== null
        ? (errorRecord['error'] as Record<string, unknown>)
        : null;

    const detail = this.readString(responseError?.['detail']);
    if (detail) {
      return detail;
    }

    const nonField = this.readStringArray(responseError?.['non_field_errors']);
    if (nonField.length > 0) {
      return nonField[0];
    }

    const commentError = this.readStringArray(responseError?.['comment']);
    if (commentError.length > 0) {
      return commentError[0];
    }

    const ratingError = this.readStringArray(responseError?.['rating']);
    if (ratingError.length > 0) {
      return ratingError[0];
    }

    return 'Your review couldn’t be submitted right now. Please try again.';
  }

  private extractReviewTags(review: StoreReview): string[] {
    const tags = this.readStringArray(review.tags);
    if (tags.length > 0) {
      return tags;
    }

    return [];
  }

  protected initialsFromName(value: string): string {
    const parts = value
      .split(/\s+/)
      .map((part) => part.trim())
      .filter((part) => part.length > 0)
      .slice(0, 2);

    if (parts.length === 0) {
      return '?';
    }

    return parts.map((part) => part[0]?.toUpperCase() ?? '').join('');
  }

  private resolveFollowState(response: VendorFollowResponse, previousState: boolean): boolean {
    const directState = response['is_followed'];
    if (typeof directState === 'boolean') {
      return directState;
    }

    const nestedState =
      typeof response['data'] === 'object' && response['data'] !== null
        ? (response['data'] as Record<string, unknown>)['is_followed']
        : null;

    if (typeof nestedState === 'boolean') {
      return nestedState;
    }

    return !previousState;
  }

  private resolveFollowerCount(
    backendValue: unknown,
    currentValue: string,
    previousState: boolean,
    nextState: boolean,
  ): string {
    const backendCount = this.formatCompactCount(backendValue);
    if (backendCount) {
      return backendCount;
    }

    const currentCount = this.toNumber(currentValue);
    if (currentCount === null || previousState === nextState) {
      return currentValue;
    }

    const nextCount = nextState ? currentCount + 1 : Math.max(0, currentCount - 1);
    return this.formatCompactCount(nextCount) ?? currentValue;
  }

  private extractListingImages(record: VendorListingRecord): string[] {
    const directImages = record['images'];
    if (Array.isArray(directImages)) {
      const mapped = directImages
        .map((image) => {
          if (typeof image === 'string') {
            return this.resolveMediaUrl(image);
          }

          if (typeof image === 'object' && image !== null) {
            const imageRecord = image as Record<string, unknown>;
            return this.resolveMediaUrl(
              this.readString(imageRecord['image']) ??
                this.readString(imageRecord['url']) ??
                this.readString(imageRecord['src']),
            );
          }

          return null;
        })
        .filter((image): image is string => image !== null);

      if (mapped.length > 0) {
        return mapped;
      }
    }

    const thumbnail =
      this.resolveMediaUrl(this.readString(record['thumbnail'])) ??
      this.resolveMediaUrl(this.readString(record['image'])) ??
      this.resolveMediaUrl(this.readString(record['cover_image'])) ??
      this.resolveMediaUrl(this.readString(record['featured_image']));

    return thumbnail ? [thumbnail] : [];
  }

  private composeListingLocation(record: VendorListingRecord): string | null {
    const location = this.readString(record['location']);
    if (location) {
      return location;
    }

    const city = this.readString(record['city']);
    const state = this.readString(record['state']);
    return [city, state].filter((value): value is string => Boolean(value)).join(', ') || null;
  }

  private formatPrice(value: unknown): string | null {
    const parsed = this.toNumber(value);
    if (parsed === null) {
      return null;
    }

    return `₦${new Intl.NumberFormat('en-NG', { maximumFractionDigits: 0 }).format(parsed)}`;
  }

  private formatDiscountBadge(value: unknown): string | null {
    const parsed = this.toNumber(value);
    if (parsed === null || parsed <= 0) {
      return null;
    }

    return `-${Math.round(parsed)}%`;
  }

  private formatRelativeTime(value: unknown): string | null {
    if (typeof value !== 'string' || value.trim().length === 0) {
      return null;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    const diffMs = Date.now() - parsed.getTime();
    const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

    if (diffMinutes < 1) {
      return 'Just now';
    }

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

  private extractReviewImages(record: VendorReviewRecord): string[] | undefined {
    const value = Array.isArray(record['photos']) ? record['photos'] : record['images'];
    if (!Array.isArray(value)) {
      return undefined;
    }

    const images = value
      .map((image) => {
        if (typeof image === 'string') {
          return this.resolveMediaUrl(image);
        }

        if (typeof image === 'object' && image !== null) {
          const imageRecord = image as Record<string, unknown>;
          return this.resolveMediaUrl(
            this.readString(imageRecord['image']) ??
              this.readString(imageRecord['url']) ??
              this.readString(imageRecord['src']),
          );
        }

        return null;
      })
      .filter((image): image is string => image !== null);

    return images.length > 0 ? images : undefined;
  }

  private readStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .map((item) => {
        if (typeof item === 'string') {
          return item.trim();
        }

        if (typeof item === 'object' && item !== null) {
          const record = item as Record<string, unknown>;
          return this.readString(record['name']) ?? this.readString(record['label']) ?? '';
        }

        return '';
      })
      .filter((item) => item.length > 0);
  }

  private clampRating(value: unknown): number | null {
    const parsed = this.toNumber(value);
    if (parsed === null) {
      return null;
    }

    return Math.min(5, Math.max(1, Math.round(parsed)));
  }

  private formatReviewDate(value: unknown): string | null {
    if (typeof value !== 'string' || value.trim().length === 0) {
      return null;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return new Intl.DateTimeFormat('en-NG', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(parsed);
  }

  private slugify(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private composeLocation(record: VendorRecord): string | null {
    const directLocation = this.readString(record['location']);
    if (directLocation) {
      return directLocation;
    }

    const city = this.readString(record['city']);
    const state = this.readString(record['state']);
    return [city, state].filter((value): value is string => Boolean(value)).join(', ') || null;
  }

  private resolveMediaUrl(value: string | null | undefined): string | null {
    if (!value) {
      return null;
    }

    if (/^https?:\/\//i.test(value) || value.startsWith('data:')) {
      return value;
    }

    return value.startsWith('/') ? `${this.apiOrigin}${value}` : `${this.apiOrigin}/${value}`;
  }

  private formatDate(value: unknown): string | null {
    if (typeof value !== 'string' || value.trim().length === 0) {
      return null;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return new Intl.DateTimeFormat('en-NG', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(parsed);
  }

  private formatRating(value: unknown): string | null {
    const parsed = this.toNumber(value);
    if (parsed === null) {
      return null;
    }

    return parsed.toFixed(1);
  }

  private readString(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
  }

  private readBoolean(value: unknown): boolean | null {
    return typeof value === 'boolean' ? value : null;
  }

  private readRecord(value: unknown): Record<string, unknown> | null {
    return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
  }

  private extractErrorMessage(error: unknown): string | null {
    if (!(error instanceof HttpErrorResponse)) {
      return null;
    }

    const errorPayload = this.readRecord(error.error);
    if (!errorPayload) {
      return null;
    }

    const detail = this.readString(errorPayload['detail']);
    if (detail) {
      return detail;
    }

    const message = this.readString(errorPayload['message']);
    if (message) {
      return message;
    }

    return null;
  }

  private formatCompactCount(value: unknown): string | null {
    const parsed = this.toNumber(value);
    if (parsed === null) {
      return null;
    }

    if (parsed >= 1000) {
      return `${(parsed / 1000).toFixed(parsed >= 10000 ? 0 : 1).replace(/\.0$/, '')}k`;
    }

    return new Intl.NumberFormat('en-NG').format(parsed);
  }

  private toNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (normalized.endsWith('k')) {
        const parsed = Number(normalized.slice(0, -1));
        return Number.isFinite(parsed) ? parsed * 1000 : null;
      }

      const parsed = Number(normalized.replace(/,/g, ''));
      return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
  }
}
