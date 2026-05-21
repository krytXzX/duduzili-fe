import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  AddListingModalComponent,
  ListingData,
} from '../../components/listings/add-listing-modal.component';
import { PromoteListingModalComponent } from '../../components/listings/promote-listing-modal.component';
import {
  StoreItemCardComponent,
  StoreItemCardData,
} from '../../components/stores/store-item-card.component';
import {
  StoreReviewCardComponent,
  StoreReviewCardData,
} from '../../components/stores/store-review-card.component';
import { StoreEditSidePanelComponent } from '../../components/stores/store-edit-side-panel.component';
import { CustomDropdownComponent, type CustomDropdownOption } from '../../components/ui/custom-dropdown.component';
import { AppModeService } from '../../services/app-mode.service';
import {
  VendorsService,
  type VendorListingRecord,
  type VendorListingsResponse,
  type VendorRecord,
  type VendorReviewRecord,
  type VendorReviewsResponse,
} from '../../services/vendors.service';
import { environment } from '../../../environments/environment';

type StoreTab = 'listings' | 'reviews';
type StoreReviewSort = 'most-recent' | 'highest-rated';

interface StoreProfile {
  id: string;
  name: string;
  description?: string;
  logo: string;
  mobileLogo: string;
  banner: string;
  mobileBanner: string;
  isVerified: boolean;
  products: string;
  followers: string;
  rating: string;
  dateCreated: string;
  dateJoined: string;
  promoted: boolean;
  location: string;
  whatsappNumber?: string;
  callNumber?: string;
  alternateCallNumber?: string;
}

interface StoreProduct extends StoreItemCardData {}

interface ProductSection {
  id: string;
  title: string;
  viewAllLabel: string;
  items: StoreProduct[];
}

interface ReviewTagCount {
  readonly label: string;
  readonly count: number;
}

@Component({
  selector: 'app-store-details-dashboard',
  imports: [
    CommonModule,
    RouterLink,
    NgOptimizedImage,
    PromoteListingModalComponent,
    StoreEditSidePanelComponent,
    AddListingModalComponent,
    StoreItemCardComponent,
    StoreReviewCardComponent,
    CustomDropdownComponent,
  ],
  host: {
    class: 'block min-h-full',
  },
  template: `
    <div class="min-h-full bg-white lg:bg-transparent">
      @if (store(); as s) {
        <section class="px-5 pb-12 pt-2 lg:hidden">
          <div class="flex items-center gap-3">
            <a
          routerLink="/seller/my-stores"
              class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F3F3]"
              aria-label="Go back to my stores"
            >
              <img [ngSrc]="assets.backMobile" width="20" height="20" alt="" class="h-5 w-5" />
            </a>
            <h1 class="text-[20px] font-semibold leading-none text-black">Store information</h1>
          </div>

          <div class="mt-6">
            <div class="relative h-[91px] overflow-hidden rounded-t-[11.455px]">
              <img
                [ngSrc]="s.mobileBanner"
                width="350"
                height="91"
                alt=""
                priority
                class="h-full w-full object-cover"
              />
              <div
                class="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,235,191,0.5)_0%,rgba(255,255,255,0)_100%)]"
              ></div>
              <div
                class="absolute inset-x-0 bottom-0 h-[57px] bg-[linear-gradient(180deg,rgba(255,255,255,0)_0.54%,#FFFFFF_93.47%)]"
              ></div>
            </div>

            <div class="relative px-[11px]">
              <div class="flex items-start justify-between">
                <div class="-mt-[32px] flex flex-col items-start gap-2">
                  <div
                    class="aspect-square h-[74px] shrink-0 self-start overflow-hidden rounded-[50%] border-4 border-white bg-[#3D785F]"
                  >
                    <img
                      [ngSrc]="s.mobileLogo"
                      width="74"
                      height="74"
                      alt="{{ s.name }} logo"
                      class="aspect-square h-full w-full rounded-[50%] object-contain"
                    />
                  </div>

                  <div class="space-y-1">
                    <div class="flex items-center gap-1.5">
                      <h2 class="text-[18px] font-medium leading-[1.2] text-[#1F1F1F]">
                        {{ s.name }}
                      </h2>
                      @if (s.isVerified) {
                        <img
                          [ngSrc]="assets.verifyMobile"
                          width="16"
                          height="16"
                          alt=""
                          class="h-4 w-4"
                        />
                      }
                    </div>
                    <div class="flex items-center gap-1 text-[#959595]">
                      <img
                        [ngSrc]="assets.locationMobile"
                        width="14"
                        height="14"
                        alt=""
                        class="h-[14px] w-[14px]"
                      />
                      <span class="text-[14px] leading-none">{{ s.location }}</span>
                    </div>
                  </div>
                </div>

                <div class="mt-1 flex items-center gap-[9px]">
                  <button
                    type="button"
                    (click)="openEditModal()"
                    class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#DEDEDE] bg-white"
                    aria-label="Edit store"
                  >
                    <img
                      [ngSrc]="assets.editMobile"
                      width="20"
                      height="20"
                      alt=""
                      class="h-5 w-5"
                    />
                  </button>

                  <button
                    type="button"
                    (click)="showPromoteStoreModal.set(true)"
                    class="inline-flex h-9 items-center justify-center rounded-full border border-white bg-[#6453D9] px-4 text-[16px] font-medium text-white shadow-[0_4px_8px_rgba(81,35,173,0.4),0_0_0_1px_#2A6CE8]"
                  >
                    Promote
                  </button>
                </div>
              </div>

              <div class="mx-auto mt-7 flex w-full items-start justify-between rounded-[16px]">
                @for (item of mobileStats(); track item.label; let last = $last) {
                  <div class="flex items-center gap-4">
                    <div class="min-w-0">
                      <p class="text-[12px] leading-4 text-[#777777]">{{ item.label }}</p>
                      <div class="mt-1 flex items-center gap-1">
                        <span class="text-[14px] font-medium leading-5 text-[#1F1F1F]">{{
                          item.value
                        }}</span>
                        @if (item.highlightIcon === 'star') {
                          <img
                            [ngSrc]="assets.starMobile"
                            width="18"
                            height="18"
                            alt=""
                            class="h-[18px] w-[18px]"
                          />
                        }
                      </div>
                    </div>

                    @if (!last) {
                      <div class="h-9 w-px bg-[#EAEAEA]"></div>
                    }
                  </div>
                }
              </div>
            </div>
          </div>

          <div class="mt-8 flex items-end gap-1 border-b border-[#EAEAEA]">
            <button
              type="button"
              (click)="activeTab.set('listings')"
              class="flex items-center gap-1 px-3 pb-[10px] pt-1 text-[16px] font-medium"
              [class.text-[#6453D9]]="activeTab() === 'listings'"
              [class.text-[#959595]]="activeTab() !== 'listings'"
            >
              <img
                [ngSrc]="assets.tabListingsMobile"
                width="16"
                height="16"
                alt=""
                class="h-4 w-4"
              />
              Products
            </button>

            <button
              type="button"
              (click)="activeTab.set('reviews')"
              class="flex items-center gap-1 px-3 pb-[10px] pt-1 text-[16px] font-medium"
              [class.text-[#6453D9]]="activeTab() === 'reviews'"
              [class.text-[#959595]]="activeTab() !== 'reviews'"
            >
              <img
                [ngSrc]="assets.tabReviewsMobile"
                width="16"
                height="16"
                alt=""
                class="h-4 w-4"
              />
              Reviews
            </button>
          </div>
          @if (s.description) {
            <div class="mt-6">
              <p class="text-[16px] leading-7 text-[#1F1F1F]">
                {{ s.description }}
              </p>
            </div>
          }
          <div
            class="h-[2px] w-[102px] bg-[#6453D9] transition-transform duration-200"
            [style.transform]="mobileTabIndicatorTransform()"
          ></div>

          @if (activeTab() === 'listings') {
            <div
              class="mt-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <div class="flex min-w-max gap-[10px]">
                @for (chip of chips(); track chip) {
                  <button
                    type="button"
                    (click)="activeChip.set(chip)"
                    class="inline-flex h-10 items-center justify-center rounded-[16px] px-4 text-[14px] font-medium"
                    [class.bg-[#1A1A1A]]="activeChip() === chip"
                    [class.text-white]="activeChip() === chip"
                    [class.bg-[#F4F4F4]]="activeChip() !== chip"
                    [class.text-[#1F1F1F]]="activeChip() !== chip"
                  >
                    {{ chip }}
                  </button>
                }
              </div>
            </div>

            <div class="mt-6 space-y-8">
              @for (section of filteredMobileSections(); track section.id) {
                <section>
                  <div class="mb-4 flex items-center justify-between">
                    <h2 class="text-[20px] font-medium leading-6 text-[#1F1F1F]">
                      {{ section.title }}
                    </h2>
                    <button
                      type="button"
                      class="inline-flex items-center gap-1 text-[14px] text-[#1F1F1F]"
                    >
                      {{ section.viewAllLabel }}
                      <img
                        [ngSrc]="assets.arrowRightMobile"
                        width="16"
                        height="16"
                        alt=""
                        class="h-4 w-4"
                      />
                    </button>
                  </div>

                  <div class="grid grid-cols-2 gap-2">
                    @for (item of section.items.slice(0, 4); track item.id) {
                      <app-store-item-card
                        [item]="item"
                        mode="mobile"
                        [badgeIcon]="assets.badgeMobile"
                        [heartIcon]="assets.heartMobile"
                        [locationIcon]="assets.itemLocationMobile"
                        [leftArrowIcon]="assets.backMobile"
                        [rightArrowIcon]="assets.arrowRightMobile"
                      ></app-store-item-card>
                    }
                  </div>
                </section>
              }
            </div>
          } @else {
            <section class="space-y-8 pt-8">
              <div class="rounded-2xl bg-[#FAFAFA] px-3 py-[23px]">
                <div class="flex items-start gap-8">
                  <div class="space-y-[2px]">
                    <p class="text-[40px] font-semibold leading-[48px] text-[#2D2D2D]">
                      {{ overallRating() }}<span class="text-[20px] font-medium leading-6 text-[#BFBFBF]">/5</span>
                    </p>
                    <div class="flex h-5 items-center gap-1">
                      @for (star of reviewStarsRange; track star) {
                        <img
                          [ngSrc]="assets.reviewStarFilled"
                          width="20"
                          height="20"
                          alt=""
                          class="h-5 w-5"
                        />
                      }
                    </div>
                  </div>

                  <div class="min-w-0 flex-1 space-y-1">
                    <p class="text-[16px] font-semibold leading-6 text-[#2D2D2D]">Overall rating</p>

                    <div class="space-y-2">
                      @for (bar of reviewDistribution(); track bar.stars) {
                        <div class="grid grid-cols-[23px_84px_31px] items-center gap-3">
                          <div class="flex items-center gap-0.5">
                            <span
                              class="w-[9px] text-center text-[14px] leading-5 text-[#2D2D2D]"
                              >{{ bar.stars }}</span
                            >
                            <img
                              [ngSrc]="assets.reviewStarFilled"
                              width="12"
                              height="12"
                              alt=""
                              class="h-3 w-3"
                            />
                          </div>

                          <div class="h-[7px] overflow-hidden rounded-2xl bg-[#EAEAEA]">
                            <div
                              class="h-full rounded-2xl bg-[#2D2D2D]"
                              [style.width.%]="bar.percentage"
                            ></div>
                          </div>

                          <span class="text-center text-[14px] leading-5 text-[#959595]"
                            >{{ bar.percentage }}%</span
                          >
                        </div>
                      }
                    </div>
                  </div>
                </div>
              </div>

              <div class="space-y-7">
                <div class="flex items-center justify-between gap-4">
                  <h3 class="text-[20px] font-semibold leading-6 text-[#1F1F1F]">{{ reviewCount() }} reviews</h3>
                  <app-custom-dropdown
                    [options]="reviewSortOptions"
                    [value]="reviewSort()"
                    [ariaLabel]="'Sort store reviews'"
                    [buttonClass]="'inline-flex h-8 items-center gap-1 rounded-[32px] border border-[#EAEAEA] bg-white px-2 text-[14px] leading-5 text-[#1A1B1D]'"
                    [labelClass]="'truncate'"
                    [iconClass]="'text-[#777777]'"
                    [menuClass]="'min-w-[156px]'"
                    [optionClass]="'w-full rounded-[14px] px-4 py-3 text-left text-[14px] text-[#1A1B1D] transition hover:bg-[#F5F6FA]'"
                    [activeOptionClass]="'bg-[#F5F1FF] text-[#5932EA]'"
                    (valueChange)="reviewSort.set($event)"
                  ></app-custom-dropdown>
                </div>

                <div class="space-y-3">
                  <p class="text-[16px] font-medium leading-6 text-[#1F1F1F]">
                    This listing is great at..
                  </p>
                  <div class="flex flex-wrap gap-x-[7px] gap-y-[13px]">
                    @for (tag of mobileReviewTags(); track tag.label) {
                      <span
                        class="inline-flex items-center justify-center rounded-full border border-[#EAEAEA] bg-[#F9F9F9] px-3 py-2 text-[16px] font-medium leading-6 text-[#5A5A5A]"
                      >
                        {{ tag.label }} ({{ tag.count }})
                      </span>
                    }
                  </div>
                </div>

                <div class="space-y-8">
                  @for (review of visibleReviews(); track review.author) {
                    <app-store-review-card
                      [review]="review"
                      mode="mobile"
                      [starsImage]="assets.reviewStarsMobile"
                    ></app-store-review-card>
                  }
                </div>
              </div>
            </section>
          }
        </section>

        <section class="hidden lg:block">
          <nav class="flex items-center gap-2 px-1 pb-6 text-[16px] leading-6">
        <a routerLink="/seller/my-stores" class="text-[#959595] transition-colors hover:text-[#6453D9]"
              >My Stores</a
            >
            <span class="text-[#959595]">/</span>
            <span class="text-[#1F1F1F]">Store information</span>
          </nav>

          <div class="overflow-hidden rounded-[24px] bg-white">
            <div class="relative z-0 h-[197px] overflow-hidden rounded-t-[20px]">
              <img
                [ngSrc]="s.banner"
                width="1061"
                height="197"
                alt=""
                priority
                class="h-full w-full object-cover"
              />
              <div
                class="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,235,191,0.45)_0%,rgba(255,255,255,0)_100%)]"
              ></div>
              <div
                class="absolute inset-x-0 bottom-0 h-[99px] bg-[linear-gradient(180deg,rgba(255,255,255,0)_0.54%,#FFFFFF_93.47%)]"
              ></div>
            </div>

            <div class="relative z-10 px-9 pb-3">
              <div class="flex items-end justify-between">
                <div class="-mt-[58px] flex items-end gap-4">
                  <div
                    class="aspect-square h-[97px] shrink-0 overflow-hidden rounded-[50%] border-4 border-white bg-[#3D785F]"
                  >
                    <img
                      [ngSrc]="s.logo"
                      width="97"
                      height="97"
                      alt="{{ s.name }} logo"
                      class="aspect-square h-full w-full rounded-[50%] object-contain"
                    />
                  </div>

                  <div class="pb-2">
                    <div class="flex items-center gap-4">
                      <div>
                        <div class="flex items-center gap-1">
                          <h1 class="text-[24px] font-medium leading-8 text-[#1F1F1F]">
                            {{ s.name }}
                          </h1>
                          @if (s.isVerified) {
                            <img
                              [ngSrc]="assets.verifyDesktop"
                              width="14"
                              height="14"
                              alt=""
                              class="h-[14px] w-[14px]"
                            />
                          }
                        </div>
                        <div class="mt-1 flex items-center gap-1 text-[#777777]">
                          <img
                            [ngSrc]="assets.locationDesktop"
                            width="16"
                            height="16"
                            alt=""
                            class="h-4 w-4"
                          />
                          <span class="text-[16px] leading-6">{{ s.location }}</span>
                        </div>
                      </div>

                      @if (s.promoted) {
                        <div
                          class="inline-flex h-8 items-center gap-[6px] rounded-full border border-[#EAEAEA] bg-white px-4 text-[14px] text-[#2D2D2D] shadow-[0_4px_8px_rgba(202,202,202,0.25)]"
                        >
                          <span class="text-[14px] leading-none" aria-hidden="true">🚀</span>
                          Promoted
                        </div>
                      }
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-3 pt-8">
                  <button
                    type="button"
                    (click)="showPromoteStoreModal.set(true)"
                    class="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white bg-[#6453D9] px-5 text-[14px] font-medium text-white shadow-[0_4px_12px_rgba(81,35,173,0.33),0_0_0_1px_#6B5BD5]"
                  >
                    <img
                      [ngSrc]="assets.awardDesktop"
                      width="14"
                      height="14"
                      alt=""
                      class="h-[14px] w-[14px]"
                    />
                    Promote store
                  </button>

                  <button
                    type="button"
                    (click)="openEditModal()"
                    class="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#EAEAEA] bg-white px-5 text-[14px] font-medium text-black"
                  >
                    <img
                      [ngSrc]="assets.editDesktop"
                      width="14"
                      height="14"
                      alt=""
                      class="h-[14px] w-[14px]"
                    />
                    Edit store
                  </button>

                  <button
                    type="button"
                    class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#EAEAEA] bg-white"
                    aria-label="More options"
                  >
                    <img
                      [ngSrc]="assets.menuDotsDesktop"
                      width="16"
                      height="16"
                      alt=""
                      class="h-4 w-4"
                    />
                  </button>
                </div>
              </div>

              <div class="mt-6 flex items-center gap-8">
                @for (item of desktopStats(); track item.label; let last = $last) {
                  <div class="flex items-center gap-8">
                    <div>
                      <p class="text-[14px] leading-5 text-[#777777]">{{ item.label }}</p>
                      <div class="mt-1 flex items-center gap-1">
                        <span class="text-[16px] font-medium leading-6 text-[#1F1F1F]">{{
                          item.value
                        }}</span>
                        @if (item.highlightIcon === 'star') {
                          <img
                            [ngSrc]="assets.starDesktop"
                            width="18"
                            height="18"
                            alt=""
                            class="h-[18px] w-[18px]"
                          />
                        }
                      </div>
                    </div>

                    @if (!last) {
                      <div class="h-9 w-px bg-[#EAEAEA]"></div>
                    }
                  </div>
                }
              </div>
            </div>

            @if (s.description) {
              <div class="mt-8 max-w-[860px] px-2">
                <p class="text-[16px] leading-7 text-[#1F1F1F]">
                  {{ s.description }}
                </p>
              </div>
            }

            <div class="mt-5 border-b border-[#EAEAEA] px-1">
              <div class="flex items-end gap-2 px-2">
                <button
                  type="button"
                  (click)="activeTab.set('listings')"
                  class="flex items-center gap-1 rounded-t-[8px] px-3 pb-[10px] pt-1 text-[16px] font-medium"
                  [class.text-[#6453D9]]="activeTab() === 'listings'"
                  [class.text-[#959595]]="activeTab() !== 'listings'"
                >
                  <img
                    [ngSrc]="assets.tabListingsDesktop"
                    width="16"
                    height="16"
                    alt=""
                    class="h-4 w-4"
                  />
                  Listings
                </button>

                <button
                  type="button"
                  (click)="activeTab.set('reviews')"
                  class="flex items-center gap-1 rounded-t-[8px] px-3 pb-[10px] pt-1 text-[16px] font-medium"
                  [class.text-[#6453D9]]="activeTab() === 'reviews'"
                  [class.text-[#959595]]="activeTab() !== 'reviews'"
                >
                  <img
                    [ngSrc]="assets.tabReviewsDesktop"
                    width="16"
                    height="16"
                    alt=""
                    class="h-4 w-4"
                  />
                  Reviews
                </button>
              </div>
              <div
                class="h-[2px] w-[96px] bg-[#6453D9] transition-transform duration-200"
                [style.transform]="desktopTabIndicatorTransform()"
              ></div>
            </div>

            @if (activeTab() === 'listings') {
              <div class="relative overflow-hidden border-b border-transparent px-[14px] py-6">
                <div
                  class="flex items-center gap-[10px] overflow-x-auto pr-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  @for (chip of chips(); track chip) {
                    <button
                      type="button"
                      (click)="activeChip.set(chip)"
                      class="inline-flex h-10 shrink-0 items-center justify-center rounded-[16px] px-4 text-[14px] font-medium"
                      [class.bg-[#1A1A1A]]="activeChip() === chip"
                      [class.text-white]="activeChip() === chip"
                      [class.bg-[#F4F4F4]]="activeChip() !== chip"
                      [class.text-[#1F1F1F]]="activeChip() !== chip"
                    >
                      {{ chip }}
                    </button>
                  }
                </div>

                <div
                  class="pointer-events-none absolute inset-y-0 right-0 w-[162px] bg-[linear-gradient(270deg,#FFFFFF_22.77%,rgba(255,255,255,0)_100%)]"
                ></div>
                <button
                  type="button"
                  class="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#EAEAEA] bg-white shadow-[0_3.2px_6.4px_rgba(202,202,202,0.25)]"
                  aria-label="Scroll filters"
                >
                  <img
                    [ngSrc]="assets.arrowRightDesktop"
                    width="16"
                    height="16"
                    alt=""
                    class="h-4 w-4"
                  />
                </button>
              </div>

              <div class="space-y-10 px-6 pb-8 pt-4">
                @for (section of filteredDesktopSections(); track section.id) {
                  <section>
                    <div class="mb-4 flex items-center justify-between">
                      <h2 class="text-[20px] font-medium leading-6 text-[#1F1F1F]">
                        {{ section.title }}
                      </h2>

                      <div class="flex items-center gap-[25px]">
                        <button
                          type="button"
                          class="inline-flex items-center gap-1 text-[16px] text-[#1F1F1F]"
                        >
                          {{ section.viewAllLabel }}
                          <img
                            [ngSrc]="assets.arrowRightDesktop"
                            width="16"
                            height="16"
                            alt=""
                            class="h-4 w-4"
                          />
                        </button>

                        <div class="flex items-center gap-3">
                          <button
                            type="button"
                            class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#EAEAEA] bg-white shadow-[0_3.2px_6.4px_rgba(202,202,202,0.25)]"
                            aria-label="Previous products"
                          >
                            <img
                              [ngSrc]="assets.arrowLeftDesktop"
                              width="16"
                              height="16"
                              alt=""
                              class="h-4 w-4 opacity-30"
                            />
                          </button>
                          <button
                            type="button"
                            class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#EAEAEA] bg-white shadow-[0_3.2px_6.4px_rgba(202,202,202,0.25)]"
                            aria-label="Next products"
                          >
                            <img
                              [ngSrc]="assets.arrowRightDesktop"
                              width="16"
                              height="16"
                              alt=""
                              class="h-4 w-4"
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div class="grid grid-cols-5 gap-[19px]">
                      @for (item of section.items; track item.id) {
                        <app-store-item-card
                          [item]="item"
                          mode="desktop"
                          [badgeIcon]="assets.badgeDesktop"
                          [heartIcon]="assets.heartDesktop"
                          [locationIcon]="assets.itemLocationDesktop"
                          [leftArrowIcon]="assets.arrowLeftDesktop"
                          [rightArrowIcon]="assets.arrowRightDesktop"
                        ></app-store-item-card>
                      }
                    </div>
                  </section>
                }
              </div>
            } @else {
              <div class="grid grid-cols-[261px_minmax(0,1fr)] gap-[39px] px-4 pb-8 pt-8">
                <aside class="space-y-5">
                  <div class="rounded-2xl bg-[#FAFAFA] px-6 py-[23px]">
                    <div class="flex flex-col items-center gap-8">
                      <div class="flex flex-col items-center gap-[2px]">
                        <p
                          class="text-center text-[56px] font-semibold leading-[64px] text-[#2D2D2D]"
                        >
                          {{ overallRating() }}<span class="text-[28px] font-medium leading-10 text-[#BFBFBF]"
                            >/5</span
                          >
                        </p>

                        <div class="flex items-center justify-center gap-1">
                          @for (star of reviewStarsRange; track star) {
                            <img
                              [ngSrc]="assets.reviewStarFilled"
                              width="23"
                              height="23"
                              alt=""
                              class="h-[23px] w-[23px]"
                            />
                          }
                        </div>
                      </div>

                      <div class="w-full space-y-1">
                        <p class="text-[16px] font-semibold leading-6 text-[#2D2D2D]">
                          Overall rating
                        </p>

                        <div class="space-y-2">
                          @for (bar of reviewDistribution(); track bar.stars) {
                            <div class="grid grid-cols-[23px_132px_1fr] items-center gap-3">
                              <div class="flex items-center gap-0.5">
                                <span
                                  class="w-[9px] text-center text-[14px] leading-5 text-[#2D2D2D]"
                                  >{{ bar.stars }}</span
                                >
                                <img
                                  [ngSrc]="assets.reviewStarFilled"
                                  width="12"
                                  height="12"
                                  alt=""
                                  class="h-3 w-3"
                                />
                              </div>

                              <div class="h-[7px] overflow-hidden rounded-2xl bg-[#EAEAEA]">
                                <div
                                  class="h-full rounded-2xl bg-[#2D2D2D]"
                                  [style.width.%]="bar.percentage"
                                ></div>
                              </div>

                              <span class="text-right text-[14px] leading-5 text-[#959595]"
                                >{{ bar.percentage }}%</span
                              >
                            </div>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </aside>

                <div class="space-y-7">
                  <div class="flex items-center justify-between gap-4">
                    <h3 class="text-[20px] font-semibold leading-6 text-[#1F1F1F]">{{ reviewCount() }} reviews</h3>
                    <app-custom-dropdown
                      [options]="reviewSortOptions"
                      [value]="reviewSort()"
                      [ariaLabel]="'Sort store reviews'"
                      [buttonClass]="'inline-flex h-8 items-center gap-2 rounded-[32px] border border-[#EAEAEA] bg-white px-2 text-[14px] leading-5 text-[#1A1B1D]'"
                      [labelClass]="'truncate'"
                      [iconClass]="'text-[#777777]'"
                      [menuClass]="'min-w-[156px]'"
                      [optionClass]="'w-full rounded-[14px] px-4 py-3 text-left text-[14px] text-[#1A1B1D] transition hover:bg-[#F5F6FA]'"
                      [activeOptionClass]="'bg-[#F5F1FF] text-[#5932EA]'"
                      (valueChange)="reviewSort.set($event)"
                    ></app-custom-dropdown>
                  </div>

                  <div class="space-y-3">
                    <p class="text-[16px] font-medium leading-6 text-[#1F1F1F]">
                      This vendor is great at..
                    </p>
                    <div class="flex flex-wrap gap-3">
                      @for (tag of desktopReviewTags(); track tag.label) {
                        <span
                          class="inline-flex items-center justify-center rounded-full border border-[#EAEAEA] bg-[#F9F9F9] px-4 py-2 text-[16px] font-medium leading-6 text-[#5A5A5A]"
                        >
                          {{ tag.label }} ({{ tag.count }})
                        </span>
                      }
                    </div>
                  </div>

                  <div class="space-y-8">
                    @for (review of visibleReviews(); track review.author) {
                      <app-store-review-card
                        [review]="review"
                        mode="desktop"
                        [starsImage]="assets.reviewStarsDesktop"
                      ></app-store-review-card>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        </section>
      }

      @if (showEditModal()) {
        <app-store-edit-side-panel
          [store]="store()"
          (close)="showEditModal.set(false)"
          (save)="onSaveStore($event)"
        ></app-store-edit-side-panel>
      }

      @if (showPromoteStoreModal()) {
        <app-promote-listing-modal
          promoteTarget="store"
          (close)="showPromoteStoreModal.set(false)"
          (promoted)="showPromoteStoreModal.set(false)"
        ></app-promote-listing-modal>
      }

      @if (showAddListingModal()) {
        <app-add-listing-modal
          (close)="showAddListingModal.set(false)"
          (save)="onPublishListing($event)"
        ></app-add-listing-modal>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreDetailsDashboardComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly vendorsService = inject(VendorsService);
  private readonly appMode = inject(AppModeService);
  private readonly apiOrigin = this.resolveApiOrigin();

  protected readonly assets = {
    awardDesktop: '/assets/icons/store-filled-award-desktop.svg',
    backMobile: '/assets/icons/store-filled-back-mobile.svg',
    badgeDesktop: '/assets/icons/store-filled-badge-mobile.svg',
    badgeMobile: '/assets/icons/store-filled-badge-mobile.svg',
    editDesktop: '/assets/icons/store-filled-edit-desktop.svg',
    editMobile: '/assets/icons/store-filled-edit-mobile.svg',
    arrowLeftDesktop: '/assets/icons/store-filled-arrow-left-desktop.svg',
    arrowRightDesktop: '/assets/icons/store-filled-arrow-right-desktop.svg',
    arrowRightMobile: '/assets/icons/store-filled-arrow-right-mobile.svg',
    heartDesktop: '/assets/icons/store-filled-heart-desktop.svg',
    heartMobile: '/assets/icons/store-filled-heart-mobile.svg',
    itemLocationDesktop: '/assets/icons/store-filled-item-location-desktop.svg',
    itemLocationMobile: '/assets/icons/store-filled-item-location-mobile.svg',
    locationDesktop: '/assets/icons/store-filled-location-desktop.svg',
    locationMobile: '/assets/icons/store-filled-location-mobile.svg',
    menuDotsDesktop: '/assets/icons/store-filled-menu-dots-desktop.svg',
    starDesktop: '/assets/icons/store-filled-star-desktop.svg',
    starMobile: '/assets/icons/store-filled-star-mobile.svg',
    tabListingsDesktop: '/assets/icons/store-filled-tab-listings-desktop.svg',
    tabListingsMobile: '/assets/icons/store-filled-tab-listings-mobile.svg',
    tabReviewsDesktop: '/assets/icons/store-filled-tab-reviews-desktop.svg',
    tabReviewsMobile: '/assets/icons/store-filled-tab-reviews-mobile.svg',
    reviewSortArrowDesktop: '/assets/icons/store-reviews-sort-arrow-desktop.svg',
    reviewSortArrowMobile: '/assets/icons/store-reviews-sort-arrow-mobile.svg',
    reviewStarFilled: '/assets/icons/store-reviews-star-filled.svg',
    reviewStarEmpty: '/assets/icons/store-reviews-star-empty.svg',
    reviewStarsDesktop: '/assets/images/store-reviews-stars-desktop.svg',
    reviewStarsMobile: '/assets/images/store-reviews-stars-mobile.svg',
    verifyDesktop: '/assets/icons/store-filled-verify-desktop.svg',
    verifyMobile: '/assets/icons/store-filled-verify-mobile.svg',
  } as const;

  readonly activeTab = signal<StoreTab>('listings');
  readonly activeChip = signal<string>('All');
  readonly reviewSort = signal<StoreReviewSort>('most-recent');
  readonly showEditModal = signal(false);
  readonly showAddListingModal = signal(false);
  readonly showPromoteStoreModal = signal(false);

  readonly store = signal<StoreProfile>({
    id: '1',
    name: 'The Vine Collections',
    logo: '/assets/images/store-filled-logo-desktop.png',
    mobileLogo: '/assets/images/store-filled-logo-mobile.png',
    banner: '/assets/images/store-filled-banner-desktop.png',
    mobileBanner: '/assets/images/store-filled-banner-mobile.png',
    isVerified: true,
    products: '1,456',
    followers: '2.5k',
    rating: '4.8',
    dateCreated: '16 Feb, 2024',
    dateJoined: '16 Feb, 2024',
    promoted: true,
    location: 'Ikeja, Lagos',
    description: 'Premium gadgets, fashion finds, and curated essentials delivered with care.',
    whatsappNumber: '0816 939 7444',
    callNumber: '0816 939 7444',
    alternateCallNumber: '0701 234 5678',
  });

  readonly desktopSections = signal<ProductSection[]>([
    {
      id: 'Phones & Laptops',
      title: 'Phones & Laptops',
      viewAllLabel: 'View all (3,341)',
      items: [
        {
          id: 'd-1',
          title: 'Iphone 17 pro max',
          image: '/assets/images/store-filled-item-01.png',
          price: '₦2,500,000',
          location: 'Ikeja, Lagos',
          showCarousel: true,
        },
        {
          id: 'd-2',
          title: 'Logitech ergonomic mouse',
          image: '/assets/images/store-filled-item-02.png',
          price: '₦35,000',
          location: 'Ikeja, Lagos',
        },
        {
          id: 'd-3',
          title: 'RGB keyboard',
          image: '/assets/images/store-filled-item-03.png',
          price: '₦35,000',
          location: 'Ikeja, Lagos',
        },
        {
          id: 'd-4',
          title: 'Iphone X (64 gig)',
          image: '/assets/images/store-filled-item-04.png',
          price: '₦35,000',
          location: 'Ikeja, Lagos',
          condition: 'Used',
          isVerified: true,
          discount: '-22%',
          originalPrice: '₦35,000',
        },
        {
          id: 'd-5',
          title: 'Ergonomic chair',
          image: '/assets/images/store-filled-item-05.png',
          price: '₦35,000',
          location: 'Ikeja, Lagos',
          condition: 'New',
        },
      ],
    },
    {
      id: 'Men',
      title: 'Men',
      viewAllLabel: 'View all (3,341)',
      items: [
        {
          id: 'd-6',
          title: 'Corporate shirt',
          image: '/assets/images/store-filled-item-06.png',
          price: '₦35,000',
          location: 'Ikeja, Lagos',
        },
        {
          id: 'd-7',
          title: 'Mclaren sports car',
          image: '/assets/images/store-filled-item-07.png',
          price: '₦35,000',
          location: 'Ikeja, Lagos',
        },
        {
          id: 'd-8',
          title: 'Nike sneaker',
          image: '/assets/images/store-filled-item-08.png',
          price: '₦35,000',
          location: 'Ikeja, Lagos',
          isVerified: true,
        },
        {
          id: 'd-9',
          title: 'Sauvage perfume',
          image: '/assets/images/store-filled-item-09.png',
          price: '₦35,000',
          location: 'Ikeja, Lagos',
        },
        {
          id: 'd-10',
          title: 'Luxury wrist watch',
          image: '/assets/images/store-filled-item-10.png',
          price: '₦35,000',
          location: 'Ikeja, Lagos',
        },
      ],
    },
  ]);

  readonly mobileSections = signal<ProductSection[]>([
    {
      id: 'Phones & Laptops',
      title: 'Phones & Laptops',
      viewAllLabel: 'View all (3,341)',
      items: [
        {
          id: 'm-1',
          title: 'Nike sneaker',
          image: '/assets/images/store-filled-item-08.png',
          price: '₦35,000',
          location: 'Ikeja, Lagos',
          condition: 'Used',
          isVerified: true,
        },
        {
          id: 'm-2',
          title: 'Bone straight wig',
          image: '/assets/images/store-filled-item-11.png',
          price: '₦35,000',
          location: 'Ikeja, Lagos',
          condition: 'Used',
          showCarousel: true,
        },
        {
          id: 'm-3',
          title: 'Iphone X (64 gig)',
          image: '/assets/images/store-filled-item-04.png',
          price: '₦35,000',
          originalPrice: '₦35,000',
          location: 'Ikeja, Lagos',
          condition: 'Used',
          isVerified: true,
          discount: '-22%',
        },
        {
          id: 'm-4',
          title: 'Ergonomic chair',
          image: '/assets/images/store-filled-item-05.png',
          price: 'Free',
          location: 'Ikeja, Lagos',
          condition: 'New',
          isVerified: true,
        },
      ],
    },
    {
      id: 'Men',
      title: 'Men',
      viewAllLabel: 'View all (3,341)',
      items: [
        {
          id: 'm-5',
          title: 'Nike sneaker',
          image: '/assets/images/store-filled-item-08.png',
          price: '₦35,000',
          location: 'Ikeja, Lagos',
          condition: 'Used',
          isVerified: true,
        },
        {
          id: 'm-6',
          title: 'Bone straight wig',
          image: '/assets/images/store-filled-item-11.png',
          price: '₦35,000',
          location: 'Ikeja, Lagos',
          condition: 'Used',
          showCarousel: true,
        },
        {
          id: 'm-7',
          title: 'Iphone X (64 gig)',
          image: '/assets/images/store-filled-item-04.png',
          price: '₦35,000',
          originalPrice: '₦35,000',
          location: 'Ikeja, Lagos',
          condition: 'Used',
          isVerified: true,
          discount: '-22%',
        },
        {
          id: 'm-8',
          title: 'Ergonomic chair',
          image: '/assets/images/store-filled-item-05.png',
          price: 'Free',
          location: 'Ikeja, Lagos',
          condition: 'New',
          isVerified: true,
        },
      ],
    },
  ]);

  readonly reviews = signal<StoreReviewCardData[]>([
    {
      author: 'Mary Jane',
      avatar: '/assets/images/store-reviews-avatar-mary.jpg',
      rating: 5,
      text: 'Contacted the seller. Went to their office to purchase the item and their hospitality was okay. Truly reliable. And he’s a funny man 😂',
      desktopDate: 'August 14, 2025',
      mobileDate: 'August 2025',
    },
    {
      author: 'Apeli Obubra',
      avatar: '/assets/images/store-reviews-avatar-apeli.jpg',
      rating: 3,
      text: 'Straightforward guy! easy transaction great goods',
      desktopDate: 'August 14, 2025',
      mobileDate: 'August 2025',
    },
    {
      author: 'Ibiso Amiesimaka',
      avatar: '/assets/images/store-reviews-avatar-ibiso.png',
      rating: 4,
      text: 'infact it was amazing if everyone is like this Nigeria will be better than this i advice everybody that wants to by laptop should call this man',
      desktopDate: 'August 14, 2025',
      mobileDate: 'August 2025',
      galleryOverflowCount: 6,
      galleryImages: [
        '/assets/images/store-reviews-gallery-1.png',
        '/assets/images/store-reviews-gallery-2.png',
        '/assets/images/store-reviews-gallery-3.png',
        '/assets/images/store-reviews-gallery-4.png',
        '/assets/images/store-reviews-gallery-5.png',
        '/assets/images/store-reviews-gallery-6.png',
      ],
    },
  ]);
  readonly reviewRecords = signal<readonly VendorReviewRecord[]>([]);
  readonly chips = computed(() => [
    'All',
    ...this.desktopSections().map((section) => section.id),
  ]);
  readonly visibleReviews = computed(() => {
    const reviews = [...this.reviews()];
    return this.reviewSort() === 'highest-rated'
      ? reviews.sort((a, b) => b.rating - a.rating)
      : reviews;
  });
  readonly reviewSortOptions: readonly CustomDropdownOption<StoreReviewSort>[] = [
    { value: 'most-recent', label: 'Most recent' },
    { value: 'highest-rated', label: 'Highest rated' },
  ];
  readonly reviewCount = computed(() => this.reviews().length);
  readonly overallRating = computed(() => {
    const reviews = this.reviews();
    if (reviews.length === 0) {
      return '0.00';
    }

    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(2);
  });

  protected readonly desktopStats = computed(() => [
    { label: 'Followers', value: this.store().followers },
    { label: 'Listings', value: this.store().products },
    { label: 'Rating', value: this.store().rating, highlightIcon: 'star' as const },
    { label: 'Date created', value: this.store().dateCreated },
  ]);

  protected readonly mobileStats = computed(() => [
    { label: 'Followers', value: this.store().followers },
    { label: 'Products', value: this.store().products },
    { label: 'Rating', value: this.store().rating, highlightIcon: 'star' as const },
    { label: 'Date joined', value: this.store().dateJoined },
  ]);

  protected readonly filteredDesktopSections = computed(() => {
    const chip = this.activeChip();
    const sections = this.desktopSections();
    return chip === 'All' ? sections : sections.filter((section) => section.id === chip);
  });

  protected readonly filteredMobileSections = computed(() => {
    const chip = this.activeChip();
    const sections = this.mobileSections();
    return chip === 'All' ? sections : sections.filter((section) => section.id === chip);
  });

  protected readonly reviewDistribution = computed(() => {
    const reviews = this.reviews();
    const total = reviews.length;

    return [5, 4, 3, 2, 1].map((stars) => {
      const count = reviews.filter((review) => review.rating === stars).length;
      return {
        stars,
        percentage: total === 0 ? 0 : Math.round((count / total) * 100),
      };
    });
  });

  protected readonly desktopReviewTags = computed<readonly ReviewTagCount[]>(() =>
    this.extractReviewTags().slice(0, 5),
  );

  protected readonly mobileReviewTags = computed<readonly ReviewTagCount[]>(() =>
    this.extractReviewTags().slice(0, 5),
  );

  protected readonly reviewStarsRange = [1, 2, 3, 4, 5] as const;

  protected readonly desktopTabIndicatorTransform = computed(() =>
    this.activeTab() === 'listings' ? 'translateX(8px)' : 'translateX(109px)',
  );

  protected readonly mobileTabIndicatorTransform = computed(() =>
    this.activeTab() === 'listings' ? 'translateX(12px)' : 'translateX(114px)',
  );

  constructor() {
    if (this.appMode.isBackendEnabled()) {
      void this.loadStorePage();
    }
  }

  private async loadStorePage(): Promise<void> {
    const storeId = this.route.snapshot.paramMap.get('id')?.trim();
    if (!storeId) {
      return;
    }

    const [storeResult, listingsResult, reviewsResult] = await Promise.allSettled([
      firstValueFrom(this.vendorsService.getVendorDetails(storeId)),
      firstValueFrom(this.vendorsService.getVendorListings(storeId)),
      firstValueFrom(this.vendorsService.getVendorReviews(storeId)),
    ]);

    if (storeResult.status === 'fulfilled') {
      this.store.set(this.mapStore(storeResult.value));
    }

    if (listingsResult.status === 'fulfilled') {
      const listings = this.extractListingRecords(listingsResult.value);
      const sections = this.mapProductSections(listings);
      this.desktopSections.set(sections);
      this.mobileSections.set(
        sections.map((section) => ({
          ...section,
          items: section.items.slice(0, 4),
        })),
      );
    }

    if (reviewsResult.status === 'fulfilled') {
      const reviewRecords = this.extractReviewRecords(reviewsResult.value);
      const reviews = reviewRecords.map((review) =>
        this.mapReview(review),
      );
      this.reviewRecords.set(reviewRecords);
      this.reviews.set(reviews);
    }
  }

  private mapStore(record: VendorRecord): StoreProfile {
    const name = this.readString(record['store_name']) ?? this.store().name;
    const profilePhoto =
      this.resolveMediaUrl(this.readString(record['profile_photo'])) ?? this.store().logo;
    const coverImage =
      this.resolveMediaUrl(this.readString(record['cover_image'])) ?? this.store().banner;
    const averageRating = this.readNumber(record['average_rating']);
    const productCount = this.readNumber(record['products_count']);
    const followerCount = this.readNumber(record['followers_count']);
    const joinedAt = this.readString(record['date_joined']);

    return {
      id: this.readId(record['id']) ?? this.store().id,
      name,
      description: this.readString(record['store_bio']) ?? '',
      logo: profilePhoto,
      mobileLogo: profilePhoto,
      banner: coverImage,
      mobileBanner: coverImage,
      isVerified: this.readBoolean(this.readRecord(record['user'])?.['is_verified']) ?? false,
      products: productCount !== null ? this.formatCount(productCount) : '0',
      followers: followerCount !== null ? this.formatCount(followerCount) : '0',
      rating: averageRating !== null ? averageRating.toFixed(1) : '0.0',
      dateCreated: this.formatDate(joinedAt) ?? '---',
      dateJoined: this.formatDate(joinedAt) ?? '---',
      promoted: this.readBoolean(record['is_promoted']) ?? false,
      location:
        this.readString(record['location']) ??
        this.composeLocation(record) ??
        this.store().location,
      whatsappNumber: this.readString(record['whatsapp_number']) ?? undefined,
      callNumber: this.readString(record['call_number']) ?? undefined,
      alternateCallNumber: this.readString(record['call_number_2']) ?? undefined,
    };
  }

  private extractListingRecords(response: VendorListingsResponse): VendorListingRecord[] {
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

  private extractReviewRecords(response: VendorReviewsResponse): VendorReviewRecord[] {
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

  private mapProductSections(records: readonly VendorListingRecord[]): ProductSection[] {
    const grouped = new Map<string, StoreProduct[]>();

    for (const record of records) {
      const category = this.readString(record['category']) ?? 'Other';
      const current = grouped.get(category) ?? [];
      current.push(this.mapStoreProduct(record));
      grouped.set(category, current);
    }

    return Array.from(grouped.entries()).map(([category, items]) => ({
      id: category,
      title: category,
      viewAllLabel: `View all (${items.length})`,
      items,
    }));
  }

  private mapStoreProduct(record: VendorListingRecord): StoreProduct {
    const price = this.readNumber(record['price']);
    const originalPrice = this.readNumber(record['original_price']);
    const condition = this.readString(record['condition']);

    return {
      id: this.readId(record['id']) ?? this.readString(record['title']) ?? `listing-${Date.now()}`,
      title: this.readString(record['title']) ?? 'Untitled listing',
      image:
        this.resolveMediaUrl(this.readString(record['thumbnail'])) ??
        '/assets/images/store-filled-item-01.png',
      price: this.readBoolean(record['is_free']) ? 'Free' : this.formatCurrency(price),
      originalPrice:
        originalPrice !== null && !this.readBoolean(record['is_free'])
          ? this.formatCurrency(originalPrice)
          : undefined,
      location:
        this.readString(record['location']) ??
        this.composeLocation(record) ??
        this.store().location,
      condition:
        condition === 'new' ? 'New' : condition === 'used' ? 'Used' : undefined,
      isVerified: this.readBoolean(record['is_verified']) ?? false,
      discount:
        this.readNumber(record['discount_percentage']) !== null
          ? `-${this.readNumber(record['discount_percentage'])}%`
          : undefined,
    };
  }

  private mapReview(record: VendorReviewRecord): StoreReviewCardData {
    const reviewer = this.readRecord(record['reviewer']);
    const createdAt = this.readString(record['created_at']);
    const photos = Array.isArray(record['photos']) ? record['photos'] : [];
    const galleryImages = photos
      .map((photo) => this.resolveMediaUrl(this.readString(this.readRecord(photo)?.['image'])))
      .filter((value): value is string => Boolean(value));

    return {
      author:
        this.readString(reviewer?.['full_name']) ??
        this.readString(reviewer?.['username']) ??
        'Anonymous',
      avatar:
        this.resolveMediaUrl(this.readString(reviewer?.['avatar'])) ??
        '/assets/images/store-reviews-avatar-mary.jpg',
      rating: this.readNumber(record['rating']) ?? 0,
      text: this.readString(record['comment']) ?? '',
      desktopDate: this.formatLongDate(createdAt) ?? '---',
      mobileDate: this.formatMonthDate(createdAt) ?? '---',
      galleryImages: galleryImages.length > 0 ? galleryImages.slice(0, 6) : undefined,
      galleryOverflowCount:
        galleryImages.length > 6 ? galleryImages.length - 6 : undefined,
    };
  }

  private extractReviewTags(): readonly ReviewTagCount[] {
    const tagCounts = new Map<string, number>();

    for (const review of this.reviewRecords()) {
      const tags = Array.isArray(review['tags']) ? review['tags'] : [];

      for (const tag of tags) {
        const tagRecord = this.readRecord(tag);
        const label = this.readString(tagRecord?.['name']);
        const count = this.readNumber(tagRecord?.['count']) ?? 1;

        if (!label) {
          continue;
        }

        tagCounts.set(label, Math.max(tagCounts.get(label) ?? 0, count));
      }
    }

    return Array.from(tagCounts.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((left, right) => right.count - left.count);
  }

  private resolveApiOrigin(): string {
    const apiUrl = (environment.apiUrl ?? '').replace(/\/+$/, '');

    try {
      return new URL(apiUrl).origin;
    } catch {
      return '';
    }
  }

  private resolveMediaUrl(value: string | null): string | null {
    if (!value) {
      return null;
    }

    if (/^https?:\/\//i.test(value)) {
      return value;
    }

    if (value.startsWith('/')) {
      return `${this.apiOrigin}${value}`;
    }

    return `${this.apiOrigin}/${value}`;
  }

  private readRecord(value: unknown): Record<string, unknown> | null {
    return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
  }

  private readString(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
  }

  private readId(value: unknown): string | null {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }

    return null;
  }

  private readNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const parsed = Number(value.replace(/,/g, '').trim());
      return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
  }

  private readBoolean(value: unknown): boolean | null {
    return typeof value === 'boolean' ? value : null;
  }

  private composeLocation(record: Record<string, unknown>): string | null {
    const city = this.readString(record['city']);
    const state = this.readString(record['state']);

    if (city && state && city !== state) {
      return `${city}, ${state}`;
    }

    return city ?? state;
  }

  private formatCount(value: number): string {
    if (value >= 1000) {
      const formatted = value / 1000;
      return `${Number.isInteger(formatted) ? formatted.toFixed(0) : formatted.toFixed(1)}k`;
    }

    return value.toLocaleString('en-NG');
  }

  private formatCurrency(value: number | null): string {
    if (value === null) {
      return '₦0';
    }

    return `₦${value.toLocaleString('en-NG')}`;
  }

  private formatDate(value: string | null): string | null {
    if (!value) {
      return null;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(parsed);
  }

  private formatLongDate(value: string | null): string | null {
    if (!value) {
      return null;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('en-NG', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(parsed);
  }

  private formatMonthDate(value: string | null): string | null {
    if (!value) {
      return null;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('en-NG', {
      month: 'long',
      year: 'numeric',
    }).format(parsed);
  }

  openEditModal(): void {
    this.showEditModal.set(true);
  }

  onSaveStore(updatedStore: Partial<StoreProfile>): void {
    this.store.update((previousStore) => ({ ...previousStore, ...updatedStore }));
    this.showEditModal.set(false);
  }

  onPublishListing(data: ListingData): void {
    const product: StoreProduct = {
      id: `desktop-${Date.now()}`,
      title: data.name,
      image: '/assets/images/store-filled-item-12.png',
      price:
        data.currency === 'NGN'
          ? `₦${data.price.toLocaleString()}`
          : `$${data.price.toLocaleString()}`,
      location: this.store().location,
      condition: 'New',
    };

    this.desktopSections.update((sections) =>
      sections.map((section, index) =>
        index === 0 ? { ...section, items: [product, ...section.items] } : section,
      ),
    );
    this.mobileSections.update((sections) =>
      sections.map((section, index) =>
        index === 0 ? { ...section, items: [product, ...section.items] } : section,
      ),
    );
    this.showAddListingModal.set(false);
  }
}
