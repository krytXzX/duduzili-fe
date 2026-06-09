import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Listing, ListingCardComponent } from '../../components/listings/listing-card.component';
import { Review } from '../../components/product/review-card.component';
import { CustomDropdownComponent, type CustomDropdownOption } from '../../components/ui/custom-dropdown.component';
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
import { AppToastService } from '../../services/app-toast.service';
import {
  AdminStoreDetailResponse,
  AdminStoreDetailsService,
  AdminStoreListingResponse,
  AdminStoreReviewResponse,
  AdminStoreReviewTagResponse,
} from '../../services/admin-store-details.service';

type AdminStoreDetailsTab = 'listings' | 'reviews';
type AdminStoreCategoryChip = string;

interface AdminStoreDetailsRecord {
  id: string;
  name: string;
  banner: string;
  logo: string;
  description: string;
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

type AdminStoreReviewSort = 'most-recent' | 'highest-rated';

@Component({
  selector: 'app-admin-store-details-page',
  imports: [RouterLink, NgIcon, NgOptimizedImage, ListingCardComponent, CustomDropdownComponent],
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
          @if (store().banner) {
            <img [ngSrc]="store().banner" [alt]="store().name" width="1200" height="220" loading="lazy" sizes="100vw" class="h-full w-full object-cover" />
          }
          <div class="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-white via-white/85 to-transparent"></div>
        </div>

        <div class="relative z-10 -mt-14 flex flex-col gap-6 md:-mt-16 md:flex-row md:items-end md:justify-between">
          <div class="flex flex-1 flex-col gap-5">
            <div class="flex items-end gap-5">
              <div
                class="h-24 w-24 overflow-hidden rounded-full border-[6px] border-white bg-white shadow-md md:h-28 md:w-28"
              >
                @if (store().logo) {
                  <img [ngSrc]="store().logo" [alt]="store().name" width="112" height="112" loading="lazy" sizes="112px" class="h-full w-full rounded-full object-cover" />
                } @else {
                  <div class="flex h-full w-full items-center justify-center rounded-full bg-[#EEF0F4] text-[24px] font-semibold text-[#1A1C21]">
                    {{ store().name.charAt(0) }}
                  </div>
                }
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
              (click)="handlePrimaryStoreAction()"
              class="inline-flex items-center gap-2 rounded-full border border-[#E7E9EE] bg-white px-6 py-3 text-sm font-medium text-[#1A1C21] transition hover:bg-[#F8F8FB]"
            >
              <ng-icon name="heroNoSymbol" class="text-[16px]"></ng-icon>
              {{ primaryStoreActionLabel() }}
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

        @if (store().description) {
          <div class="mt-8 max-w-[860px]">
            <p class="text-[16px] leading-7 text-[#1A1C21]">
              {{ store().description }}
            </p>
          </div>
        }

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
                          <span class="text-[40px] font-semibold leading-[48px] text-[#2D2D2D] md:text-[56px] md:leading-[64px]">{{ overallRatingDisplay() }}</span>
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
                          @for (bar of ratingBreakdown(); track bar.stars) {
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
                    <h2 class="text-[20px] font-semibold leading-6 text-[#1F1F1F]">{{ totalReviewsLabel() }}</h2>
                    <app-custom-dropdown
                      [options]="reviewSortOptions"
                      [value]="reviewSort()"
                      [ariaLabel]="'Sort store reviews'"
                      [buttonClass]="'inline-flex h-8 items-center gap-1 rounded-[32px] border border-[#EAEAEA] bg-white px-2 text-[14px] text-[#1A1B1D]'"
                      [labelClass]="'truncate text-[14px] text-[#1A1B1D]'"
                      [iconClass]="'text-[#8C8C92]'"
                      [menuClass]="'min-w-[156px]'"
                      [optionClass]="'w-full rounded-[14px] px-4 py-3 text-left text-[14px] text-[#1A1B1D] transition hover:bg-[#F5F6FA]'"
                      [activeOptionClass]="'bg-[#F5F1FF] text-[#5932EA]'"
                      (valueChange)="reviewSort.set($event)"
                    ></app-custom-dropdown>
                  </div>

                  <p class="text-[16px] font-medium leading-6 text-[#1F1F1F] md:hidden">This listing is great at..</p>
                  <p class="hidden text-[16px] font-medium leading-6 text-[#1F1F1F] md:block">This vendor is great at..</p>
                  <div class="mt-3 flex flex-wrap gap-x-2 gap-y-3 md:hidden">
                    @for (tag of reviewTagsMobile(); track tag.label) {
                      <div class="rounded-full border border-[#EAEAEA] bg-[#F9F9F9] px-3 py-2 text-[16px] leading-6 text-[#5A5A5A]">
                        {{ tag.label }} ({{ tag.count }})
                      </div>
                    }
                  </div>
                  <div class="mt-3 hidden flex-wrap gap-3 md:flex">
                    @for (tag of reviewTags(); track tag.label) {
                      <div class="rounded-full border border-[#EAEAEA] bg-[#F9F9F9] px-4 py-2 text-[16px] leading-6 text-[#5A5A5A]">
                        {{ tag.label }} ({{ tag.count }})
                      </div>
                    }
                  </div>

                  <div class="mt-8 space-y-8">
                    @for (review of visibleReviews(); track review.author + review.date) {
                      <article class="w-full max-w-full overflow-hidden">
                        <div class="flex items-center gap-2">
                          <div class="h-11 w-11 shrink-0 overflow-hidden rounded-full">
                            @if (review.avatar) {
                              <img [ngSrc]="review.avatar" [alt]="review.author" width="44" height="44" loading="lazy" sizes="44px" class="h-full w-full rounded-full object-cover" />
                            } @else {
                              <div
                                class="flex h-full w-full items-center justify-center rounded-full text-[12px] font-semibold text-white"
                                [style.background]="avatarGradientForLabel(review.author)"
                              >
                                {{ initialsFromLabel(review.author) }}
                              </div>
                            }
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
                                <img [ngSrc]="image" alt="" width="117" height="117" loading="lazy" sizes="(max-width: 767px) 78px, 117px" class="h-full w-full object-cover" />
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

      @if (isSuspendStoreConfirmOpen()) {
        <button
          type="button"
          class="fixed inset-0 z-40 bg-[#1A1C21]/55"
          aria-label="Close suspend store confirmation"
          (click)="closeSuspendStoreConfirm()"
        ></button>

        <div class="fixed inset-0 z-50 hidden items-center justify-center px-6 md:flex">
          <section
            class="w-full max-w-[560px] rounded-[28px] bg-white p-8 shadow-[0_30px_80px_rgba(17,24,39,0.22)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-suspend-store-title"
            aria-describedby="admin-suspend-store-description"
          >
            <div class="flex items-start justify-between gap-6">
              <div>
                <h2 id="admin-suspend-store-title" class="text-[24px] font-semibold tracking-[-0.03em] text-[#1A1C21]">
                  Suspend store
                </h2>
                <p id="admin-suspend-store-description" class="mt-2 text-[15px] leading-6 text-[#6B7280]">
                  Please provide a reason before suspending this store.
                </p>
              </div>

              <button
                type="button"
                class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#E7E9EE] bg-white text-[#8C8C92] transition hover:bg-[#F8F8FB] hover:text-[#1A1C21]"
                aria-label="Close suspend store confirmation"
                (click)="closeSuspendStoreConfirm()"
              >
                <span class="text-[24px] leading-none">×</span>
              </button>
            </div>

            <label class="mt-6 block">
              <span class="mb-2 block text-sm font-medium text-[#1A1C21]">Reason for suspension</span>
              <textarea
                #desktopSuspensionReasonInput
                class="min-h-[168px] w-full resize-none rounded-[20px] border border-[#E7E9EE] px-5 py-4 text-[15px] leading-6 text-[#1A1C21] outline-hidden transition placeholder:text-[#9CA3AF] focus:border-[#5932EA]"
                placeholder="Type the reason for suspending this store"
                [value]="suspensionReason()"
                (input)="updateSuspensionReason(desktopSuspensionReasonInput.value)"
              ></textarea>
            </label>

            <div class="mt-8 flex items-center justify-end gap-3">
              <button
                type="button"
                class="inline-flex h-12 items-center justify-center rounded-full border border-[#E7E9EE] bg-white px-6 text-sm font-medium text-[#1A1C21] transition hover:bg-[#F8F8FB]"
                (click)="closeSuspendStoreConfirm()"
              >
                Cancel
              </button>
              <button
                type="button"
                class="inline-flex h-12 items-center justify-center rounded-full bg-[#E05555] px-6 text-sm font-semibold text-white transition hover:bg-[#C84747] disabled:cursor-not-allowed disabled:bg-[#F2B7B7]"
                [disabled]="!canConfirmSuspendStore()"
                (click)="confirmSuspendStore()"
              >
                Suspend store
              </button>
            </div>
          </section>
        </div>

        <div class="fixed inset-x-0 bottom-0 z-50 md:hidden">
          <section
            class="rounded-t-[32px] bg-white px-5 pb-8 pt-4 shadow-[0_-18px_40px_rgba(17,24,39,0.18)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-suspend-store-title-mobile"
            aria-describedby="admin-suspend-store-description-mobile"
          >
            <div class="mx-auto mb-5 h-1.5 w-20 rounded-full bg-[#E5E7EB]"></div>

            <div class="flex items-start justify-between gap-4">
              <div>
                <h2 id="admin-suspend-store-title-mobile" class="text-[22px] font-semibold tracking-[-0.03em] text-[#1A1C21]">
                  Suspend store
                </h2>
                <p id="admin-suspend-store-description-mobile" class="mt-2 text-[15px] leading-6 text-[#6B7280]">
                  Please provide a reason before suspending this store.
                </p>
              </div>

              <button
                type="button"
                class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#E7E9EE] bg-white text-[#8C8C92] transition hover:bg-[#F8F8FB] hover:text-[#1A1C21]"
                aria-label="Close suspend store confirmation"
                (click)="closeSuspendStoreConfirm()"
              >
                <span class="text-[24px] leading-none">×</span>
              </button>
            </div>

            <label class="mt-6 block">
              <span class="mb-2 block text-sm font-medium text-[#1A1C21]">Reason for suspension</span>
              <textarea
                #mobileSuspensionReasonInput
                class="min-h-[168px] w-full resize-none rounded-[20px] border border-[#E7E9EE] px-5 py-4 text-[15px] leading-6 text-[#1A1C21] outline-hidden transition placeholder:text-[#9CA3AF] focus:border-[#5932EA]"
                placeholder="Type the reason for suspending this store"
                [value]="suspensionReason()"
                (input)="updateSuspensionReason(mobileSuspensionReasonInput.value)"
              ></textarea>
            </label>

            <div class="mt-8 flex flex-col gap-3">
              <button
                type="button"
                class="inline-flex h-12 items-center justify-center rounded-full bg-[#E05555] px-6 text-sm font-semibold text-white transition hover:bg-[#C84747] disabled:cursor-not-allowed disabled:bg-[#F2B7B7]"
                [disabled]="!canConfirmSuspendStore()"
                (click)="confirmSuspendStore()"
              >
                Suspend store
              </button>
              <button
                type="button"
                class="inline-flex h-12 items-center justify-center rounded-full border border-[#E7E9EE] bg-white px-6 text-sm font-medium text-[#1A1C21] transition hover:bg-[#F8F8FB]"
                (click)="closeSuspendStoreConfirm()"
              >
                Cancel
              </button>
            </div>
          </section>
        </div>
      }
    </section>
  `,
  host: {
    class: 'block h-full',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminStoreDetailsPageComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly adminStoreDetailsService = inject(AdminStoreDetailsService);
  private readonly toast = inject(AppToastService);
  readonly adminListingRoute = ['/admin/listings'];

  readonly activeTab = signal<AdminStoreDetailsTab>('listings');
  readonly activeCategory = signal<AdminStoreCategoryChip>('All');
  readonly reviewSort = signal<AdminStoreReviewSort>('most-recent');
  readonly isSuspendStoreConfirmOpen = signal(false);
  readonly suspensionReason = signal('');
  readonly isActionPending = signal(false);
  readonly canConfirmSuspendStore = computed(() => this.suspensionReason().trim().length > 0);
  private readonly storeId = signal('');
  private readonly storeState = signal<AdminStoreDetailsRecord>({
    id: '',
    name: 'Store',
    banner: '',
    logo: '',
    description: '',
    location: '---',
    followers: '0',
    listings: '0',
    rating: '0.0',
    dateCreated: '---',
    linkedUser: 'Unknown user',
    linkedUserInitials: 'U',
    linkedUserBackground: this.avatarGradientForLabel('Unknown user'),
    promoted: false,
    hasListings: false,
    hasReviews: false,
  });
  private readonly sections = signal<AdminStoreProductSection[]>([]);
  private readonly reviews = signal<Review[]>([]);
  readonly ratingBreakdown = signal<ReviewBreakdownItem[]>([
    { stars: 5, percentage: 0 },
    { stars: 4, percentage: 0 },
    { stars: 3, percentage: 0 },
    { stars: 2, percentage: 0 },
    { stars: 1, percentage: 0 },
  ]);
  readonly reviewTags = signal<ReviewTag[]>([]);
  private readonly totalReviews = signal(0);
  private readonly overallRating = signal(0);

  readonly store = computed(() => this.storeState());
  readonly categoryChips = computed<AdminStoreCategoryChip[]>(() => {
    const categories = this.sections().map((section) => section.title).filter((category) => category.length > 0);
    return ['All', ...categories];
  });
  readonly filteredSections = computed(() => {
    const activeCategory = this.activeCategory();
    const sections = this.sections();
    if (activeCategory === 'All') {
      return sections;
    }
    return sections.filter((section) => section.title === activeCategory);
  });
  readonly visibleReviews = computed(() => {
    const reviews = [...this.reviews()];
    return this.reviewSort() === 'highest-rated'
      ? reviews.sort((left, right) => right.rating - left.rating)
      : reviews;
  });
  readonly reviewTagsMobile = computed(() => this.reviewTags().slice(0, 5));
  readonly overallRatingDisplay = computed(() => this.overallRating().toFixed(2));
  readonly totalReviewsLabel = computed(() => {
    const totalReviews = this.totalReviews();
    return `${this.formatInteger(totalReviews)} review${totalReviews === 1 ? '' : 's'}`;
  });
  readonly primaryStoreActionLabel = computed(() =>
    this.isStoreSuspended() ? 'Lift suspension' : 'Suspend store',
  );
  readonly isStoreSuspended = computed(() => this.rawStoreSuspended());

  private readonly rawStoreSuspended = signal(false);

  readonly reviewSortOptions: readonly CustomDropdownOption<AdminStoreReviewSort>[] = [
    { value: 'most-recent', label: 'Most recent' },
    { value: 'highest-rated', label: 'Highest rated' },
  ];

  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const storeId = params.get('id')?.trim() ?? '';
        this.storeId.set(storeId);
        if (!storeId) {
          return;
        }

        this.loadStorePage(storeId);
      });
  }

  reviewStars(rating: number): boolean[] {
    return Array.from({ length: 5 }, (_, index) => index < rating);
  }

  initialsFromLabel(label: string): string {
    const parts = label.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      return 'NA';
    }
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  avatarGradientForLabel(label: string): string {
    const palette = [
      'linear-gradient(135deg, #4FC3C8 0%, #2FB8A8 100%)',
      'linear-gradient(135deg, #F6B14B 0%, #F28D28 100%)',
      'linear-gradient(135deg, #7C83FD 0%, #5932EA 100%)',
      'linear-gradient(135deg, #F87171 0%, #DC2626 100%)',
    ];
    const source = label.trim() || 'user';
    const sum = Array.from(source).reduce((total, character) => total + character.charCodeAt(0), 0);
    return palette[sum % palette.length];
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

  openSuspendStoreConfirm(): void {
    if (this.isActionPending()) {
      return;
    }
    this.isSuspendStoreConfirmOpen.set(true);
  }

  closeSuspendStoreConfirm(): void {
    this.isSuspendStoreConfirmOpen.set(false);
    this.suspensionReason.set('');
  }

  updateSuspensionReason(value: string): void {
    this.suspensionReason.set(value);
  }

  handlePrimaryStoreAction(): void {
    if (this.isStoreSuspended()) {
      this.liftStoreSuspension();
      return;
    }

    this.openSuspendStoreConfirm();
  }

  confirmSuspendStore(): void {
    if (!this.canConfirmSuspendStore()) {
      return;
    }

    const storeId = this.storeId();
    if (!storeId || this.isActionPending()) {
      return;
    }

    this.isActionPending.set(true);
    this.adminStoreDetailsService.suspendStore(storeId, this.suspensionReason().trim()).subscribe({
      next: (response) => {
        this.rawStoreSuspended.set(response.is_suspended);
        this.storeState.update((store) => ({
          ...store,
          hasListings: store.hasListings,
          hasReviews: store.hasReviews,
        }));
        this.closeSuspendStoreConfirm();
        this.toast.show({ message: response.detail || 'Store suspended successfully.' });
      },
      error: () => {
        this.toast.show({ message: 'We could not suspend this store right now.' });
      },
      complete: () => {
        this.isActionPending.set(false);
      },
    });
  }

  private liftStoreSuspension(): void {
    const storeId = this.storeId();
    if (!storeId || this.isActionPending()) {
      return;
    }

    this.isActionPending.set(true);
    this.adminStoreDetailsService.liftSuspension(storeId).subscribe({
      next: (response) => {
        this.rawStoreSuspended.set(response.is_suspended);
        this.toast.show({ message: response.detail || 'Store restored successfully.' });
      },
      error: () => {
        this.toast.show({ message: 'We could not restore this store right now.' });
      },
      complete: () => {
        this.isActionPending.set(false);
      },
    });
  }

  private loadStorePage(storeId: string): void {
    this.adminStoreDetailsService.getStore(storeId).subscribe({
      next: (response) => {
        this.hydrateFromResponse(response);
      },
      error: () => {
        this.toast.show({ message: 'We could not load this store right now.' });
      },
    });
  }

  private hydrateFromResponse(response: AdminStoreDetailResponse): void {
    const store = response.store;
    const listingSections = this.mapProductSections(response.listings);
    const reviews = response.reviews.map((review) => this.mapReview(review));

    this.storeState.set({
      id: store.id,
      name: store.store_name,
      banner: store.cover_image ?? '',
      logo: store.profile_photo ?? '',
      description: store.store_bio ?? '',
      location: store.location || '---',
      followers: this.formatCompactCount(store.followers_count),
      listings: this.formatInteger(store.listings_count),
      rating: this.formatDecimal(store.average_rating, 1),
      dateCreated: this.formatDate(store.date_joined) ?? '---',
      linkedUser: store.linked_user.name,
      linkedUserInitials: store.linked_user.initials || this.initialsFromLabel(store.linked_user.name),
      linkedUserBackground: this.avatarGradientForLabel(store.linked_user.name),
      promoted: store.is_promoted,
      hasListings: response.listings.length > 0,
      hasReviews: response.reviews.length > 0,
    });
    this.rawStoreSuspended.set(store.is_suspended);
    this.sections.set(listingSections);
    this.reviews.set(reviews);
    this.overallRating.set(response.rating_breakdown.overall_rating);
    this.totalReviews.set(response.rating_breakdown.total_reviews);
    this.ratingBreakdown.set([
      { stars: 5, percentage: response.rating_breakdown.five_star_pct },
      { stars: 4, percentage: response.rating_breakdown.four_star_pct },
      { stars: 3, percentage: response.rating_breakdown.three_star_pct },
      { stars: 2, percentage: response.rating_breakdown.two_star_pct },
      { stars: 1, percentage: response.rating_breakdown.one_star_pct },
    ]);
    this.reviewTags.set(this.mapReviewTags(response.rating_breakdown.tags));
    this.activeCategory.set('All');
  }

  private mapProductSections(records: AdminStoreListingResponse[]): AdminStoreProductSection[] {
    const sections = new Map<string, Listing[]>();

    for (const record of records) {
      const category = record.category?.trim() || 'Other';
      const items = sections.get(category) ?? [];
      items.push(this.mapListing(record));
      sections.set(category, items);
    }

    return Array.from(sections.entries()).map(([title, items]) => ({
      id: this.toSlug(title),
      title,
      countLabel: this.formatInteger(items.length),
      items,
    }));
  }

  private mapListing(record: AdminStoreListingResponse): Listing {
    const image = record.thumbnail ?? '';
    return {
      id: record.id,
      title: record.title,
      price: this.formatPrice(record.price),
      images: image ? [image] : [],
      location: this.composeListingLocation(record),
      timeAgo: this.timeAgo(record.created_at),
      isVerified: record.is_verified ?? false,
      favoriteFilled: record.is_saved ?? false,
    };
  }

  private mapReview(record: AdminStoreReviewResponse): Review {
    const author =
      record.reviewer?.full_name?.trim()
      || record.reviewer?.username?.trim()
      || 'Anonymous user';

    return {
      author,
      date: this.formatLongDate(record.created_at),
      rating: record.rating,
      text: record.comment,
      avatar: record.reviewer?.avatar ?? undefined,
      images: record.photos
        .map((photo) => photo.image)
        .filter((image): image is string => typeof image === 'string' && image.length > 0),
    };
  }

  private mapReviewTags(records: AdminStoreReviewTagResponse[]): ReviewTag[] {
    return records
      .map((tag) => ({
        label: tag.name,
        count: tag.count,
      }))
      .sort((left, right) => right.count - left.count);
  }

  private composeListingLocation(record: AdminStoreListingResponse): string {
    if (record.location?.trim()) {
      return record.location.trim();
    }
    const parts = [record.city?.trim(), record.state?.trim()].filter((part): part is string => Boolean(part));
    return parts.join(', ') || '---';
  }

  private timeAgo(value?: string): string {
    if (!value) {
      return 'Recently';
    }

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
      return 'Recently';
    }

    const differenceMs = Date.now() - parsedDate.getTime();
    const minutes = Math.max(1, Math.floor(differenceMs / 60000));
    if (minutes < 60) {
      return `${minutes}m ago`;
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours}h ago`;
    }
    const days = Math.floor(hours / 24);
    if (days < 30) {
      return `${days}d ago`;
    }
    const months = Math.floor(days / 30);
    if (months < 12) {
      return `${months}mo ago`;
    }
    const years = Math.floor(months / 12);
    return `${years}y ago`;
  }

  private formatCompactCount(value: number): string {
    return new Intl.NumberFormat('en', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  }

  private formatInteger(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
  }

  private formatDecimal(value: number, maximumFractionDigits: number): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 1,
      maximumFractionDigits,
    }).format(value);
  }

  private formatPrice(value: string): string {
    const amount = Number.parseFloat(value);
    if (!Number.isFinite(amount)) {
      return value;
    }

    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  private formatDate(value: string): string | null {
    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
      return null;
    }

    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(parsedDate);
  }

  private formatLongDate(value: string): string {
    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
      return '---';
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(parsedDate);
  }

  private toSlug(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
