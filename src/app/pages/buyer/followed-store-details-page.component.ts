import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DOCUMENT, NgOptimizedImage } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Listing, ListingCardComponent } from '../../components/listings/listing-card.component';
import { Review } from '../../components/product/review-card.component';
import { NgIcon, provideIcons } from '@ng-icons/core';
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

type BuyerStoreTab = 'products' | 'reviews';

interface BuyerStoreStats {
  followers: string;
  products: string;
  rating: string;
  dateJoined: string;
}

interface BuyerStoreProfile {
  id: string;
  name: string;
  logo: string;
  banner: string;
  location: string;
  isVerified: boolean;
  stats: BuyerStoreStats;
}

interface ProductSection {
  id: string;
  title: string;
  countLabel: string;
  items: Listing[];
}

@Component({
  selector: 'app-followed-store-details-page',
  imports: [CommonModule, RouterLink, ListingCardComponent, NgIcon, NgOptimizedImage],
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
  template: `
    <div class="min-h-full">
      <section class="bg-white pb-[32px] md:hidden">
        <div class="h-[54px] px-5">
          <div class="flex h-full items-center">
            <a
              routerLink="/followed-stores"
              aria-label="Back"
              class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f3f3f3]"
            >
              <ng-icon name="heroChevronLeft" class="text-[18px] text-[#2d2d2d]"></ng-icon>
            </a>
          </div>
        </div>

        <div class="px-5">
          <div class="relative h-[91px] overflow-hidden rounded-t-[11px]">
            <img
              ngSrc="/assets/images/store-vine-cover-mobile.png"
              alt="The Vine Collections banner"
              width="350"
              height="91"
              class="h-full w-full object-cover"
            />
            <div
              class="pointer-events-none absolute inset-x-0 bottom-0 h-[56px] bg-[linear-gradient(180deg,rgba(255,255,255,0)_0.5%,#fff_93%)]"
            ></div>
          </div>

          <div class="relative -mt-2 flex flex-col items-center">
            <div
              class="h-[74px] w-[74px] overflow-hidden rounded-full border-4 border-white bg-[#3d785f]"
            >
              <img
                ngSrc="/assets/images/store-vine-logo-mobile.png"
                alt="The Vine Collections logo"
                width="74"
                height="74"
                class="h-full w-full object-cover"
              />
            </div>
            <h1
              class="mt-2 flex items-center gap-1 text-[18px] font-medium leading-[1.1] text-[#1f1f1f]"
            >
              The Vine Collections
              <img
                ngSrc="/assets/icons/home-store-verified.svg"
                alt=""
                width="16"
                height="16"
                class="h-4 w-4"
                aria-hidden="true"
              />
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
              Ikeja, Lagos
            </p>
          </div>

          <div class="mt-4 flex items-center justify-between rounded-[16px]">
            <div class="text-left">
              <p class="text-[12px] text-[#777]">Followers</p>
              <p class="text-[14px] font-medium text-[#1f1f1f]">2.5k</p>
            </div>
            <div class="h-9 w-px bg-[#eaeaea]"></div>
            <div class="text-left">
              <p class="text-[12px] text-[#777]">Products</p>
              <p class="text-[14px] font-medium text-[#1f1f1f]">1,456</p>
            </div>
            <div class="h-9 w-px bg-[#eaeaea]"></div>
            <div class="text-left">
              <p class="text-[12px] text-[#777]">Rating</p>
              <p class="flex items-center gap-0.5 text-[14px] font-medium text-[#1f1f1f]">
                4.8 <span class="text-[#E0C419]">★</span>
              </p>
            </div>
            <div class="h-9 w-px bg-[#eaeaea]"></div>
            <div class="text-left">
              <p class="text-[12px] text-[#777]">Date joined</p>
              <p class="text-[14px] font-medium text-[#1f1f1f]">16 Feb, 2024</p>
            </div>
          </div>

          <div class="mt-4 flex items-center justify-center gap-2">
            <button
              type="button"
              class="h-10 w-[122px] rounded-full bg-[#6453d9] text-[14px] font-medium text-white shadow-[0_4px_8px_rgba(81,35,173,0.4)]"
            >
              Follow
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
            We deal with all kinds of phones and gadgets
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
              @for (chip of mobileCategoryChips; track chip) {
                <button
                  type="button"
                  class="h-10 rounded-[16px] px-4 text-[14px] font-medium"
                  [class.bg-[#1a1a1a]]="chip === 'All'"
                  [class.text-white]="chip === 'All'"
                  [class.bg-[#f4f4f4]]="chip !== 'All'"
                  [class.text-black]="chip !== 'All'"
                >
                  {{ chip }}
                </button>
              }
            </div>
          </div>

          <div class="mt-4 space-y-8 px-5">
            @for (section of mobileSections; track section.title) {
              <section>
                <div class="mb-4 flex items-center justify-between">
                  <h2 class="text-[20px] font-medium text-[#1f1f1f]">{{ section.title }}</h2>
                  <button type="button" class="flex items-center gap-1 text-[16px] text-[#1f1f1f]">
                    View all (3,341)
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
          </div>
        } @else {
          <div class="mt-4 px-5">
            <div class="rounded-[16px] bg-white p-4 shadow-[0_2px_14px_rgba(17,24,39,0.06)]">
              <div class="mb-3 flex items-end gap-1">
                <span class="text-[40px] font-semibold leading-none text-[#1A1C21]">4.57</span>
                <span class="pb-1 text-[18px] font-semibold text-[#C8CBD4]">/5</span>
              </div>
              <div class="mb-4 flex items-center gap-1 text-[#D3DC35]">
                @for (star of [1, 2, 3, 4, 5]; track star) {
                  <ng-icon name="heroStarSolid" class="text-[16px]"></ng-icon>
                }
              </div>
              <p class="mb-3 text-[14px] font-semibold text-[#1A1C21]">Overall rating</p>
              <div class="space-y-2.5">
                @for (bar of ratingBreakdown; track bar.stars) {
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
              (click)="showLeaveReviewModal.set(true)"
              class="mt-4 w-full rounded-full bg-[#5932EA] px-6 py-3 text-[14px] font-medium text-white"
            >
              Leave a review
            </button>
          </div>

          <div class="mt-6 px-5">
            <div class="mb-5 flex items-center justify-between gap-4">
              <h2 class="text-[18px] font-semibold text-[#1A1C21]">215 reviews</h2>
              <button
                type="button"
                class="flex items-center gap-1 rounded-full border border-[#E6E8EF] px-3 py-1.5 text-[13px] text-[#1A1C21]"
              >
                Most recent
                <ng-icon name="heroChevronDown" class="text-[14px] text-[#8C8C92]"></ng-icon>
              </button>
            </div>

            <p class="text-[16px] font-medium text-[#1A1C21]">This vendor is great at..</p>
            <div class="mt-3 flex flex-wrap gap-2">
              @for (tag of vendorTags; track tag.label) {
                <div
                  class="rounded-full border border-[#E6E8EF] px-3 py-1.5 text-[12px] text-[#4B5563]"
                >
                  {{ tag.label }} ({{ tag.count }})
                </div>
              }
            </div>

            <div class="mt-5 space-y-6">
              @for (review of reviews(); track review.author + review.date) {
                <article class="border-b border-[#F0F1F4] pb-5 last:border-b-0 last:pb-0">
                  <div class="flex gap-3">
                    <div class="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#F3F4F6]">
                      <img
                        [src]="
                          review.avatar || 'https://cdn-icons-png.flaticon.com/512/1144/1144760.png'
                        "
                        [alt]="review.author"
                        class="h-full w-full object-cover"
                      />
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
                              <img [src]="image" alt="" class="h-full w-full object-cover" />
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
        }
      </section>

      <section class="hidden min-h-full px-6 py-6 md:block md:px-8">
        <nav class="mb-6 flex items-center gap-3 text-sm text-[#8C8C92]">
          <a routerLink="/followed-stores" class="transition-colors hover:text-[#5932EA]">
            Followed vendors
          </a>
          <span>/</span>
          <span class="font-medium text-[#1A1C21]">Vendor information</span>
        </nav>

        <div class="overflow-hidden rounded-[36px] border border-[#EEF0F4] bg-white">
          <div class="px-6 pb-8 pt-6 md:px-8 md:pb-10">
            <div
              class="relative h-[184px] overflow-hidden rounded-[32px] bg-[#F4F6FB] md:h-[220px]"
            >
              <img [src]="store().banner" [alt]="store().name" class="h-full w-full object-cover" />
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
                    <img
                      [src]="store().logo"
                      [alt]="store().name"
                      class="h-full w-full rounded-full object-cover"
                    />
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
                  class="rounded-full bg-[#F3F4F6] px-6 py-3 text-sm font-medium text-[#1A1C21] transition hover:bg-[#EDEEF2]"
                >
                  Unfollow seller
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
                        class="flex w-full items-center gap-3 rounded-[18px] px-4 py-3 text-left text-sm font-medium text-[#1A1C21] transition hover:bg-[#F7F7FA]"
                      >
                        <ng-icon
                          name="heroChatBubbleOvalLeftEllipsis"
                          class="text-[18px] text-[#6B7280]"
                        ></ng-icon>
                        Message in-app
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
                        Message on WhatsApp ({{ sellerPhoneNumber }})
                      </button>
                      <button
                        type="button"
                        (click)="callSeller()"
                        class="flex w-full items-center gap-3 rounded-[18px] px-4 py-3 text-left text-sm font-medium text-[#1A1C21] transition hover:bg-[#F7F7FA]"
                      >
                        <ng-icon name="heroPhone" class="text-[18px] text-[#6B7280]"></ng-icon>
                        Call phone number ({{ sellerPhoneNumber }})
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

            <div class="mt-8 flex items-center gap-8 border-b border-[#EEF0F4]">
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
                </div>
              </div>
            } @else {
              <div class="pt-8">
                <div class="grid gap-8 xl:grid-cols-[260px_minmax(0,1fr)]">
                  <div class="space-y-5">
                    <div class="rounded-[28px] bg-[#FCFCFD] p-6">
                      <div class="mb-4 flex items-end gap-2">
                        <span class="text-[58px] font-semibold leading-none text-[#1A1C21]"
                          >4.57</span
                        >
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
                      (click)="showLeaveReviewModal.set(true)"
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
                        <h2 class="text-[18px] font-semibold text-[#1A1C21]">215 reviews</h2>
                        <p class="mt-8 text-[18px] font-medium text-[#1A1C21]">
                          This vendor is great at..
                        </p>

                        <div class="mt-4 flex flex-wrap gap-3">
                          @for (tag of vendorTags; track tag.label) {
                            <div
                              class="rounded-full border border-[#E6E8EF] px-4 py-2 text-[15px] text-[#4B5563]"
                            >
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
                        <ng-icon
                          name="heroChevronDown"
                          class="text-[16px] text-[#8C8C92]"
                        ></ng-icon>
                      </button>
                    </div>

                    <div class="space-y-8">
                      @for (review of reviews(); track review.author + review.date) {
                        <article class="rounded-[24px] bg-white">
                          <div class="flex gap-4">
                            <div
                              class="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#F3F4F6]"
                            >
                              <img
                                [src]="
                                  review.avatar ||
                                  'https://cdn-icons-png.flaticon.com/512/1144/1144760.png'
                                "
                                [alt]="review.author"
                                class="h-full w-full object-cover"
                              />
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
                                        [src]="image"
                                        alt=""
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
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        @if (showLeaveReviewModal()) {
          <div
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm"
          >
            <div
              class="relative max-h-[calc(100dvh-2rem)] w-full max-w-6xl overflow-y-auto rounded-[36px] bg-white p-6 shadow-2xl md:p-8"
            >
              <button
                type="button"
                (click)="closeLeaveReviewModal()"
                class="absolute right-6 top-6 flex h-12 w-12 items-center justify-center rounded-full border border-[#E6E8EF] bg-white text-[#6B7280] transition hover:bg-[#F7F7FA]"
                aria-label="Close leave review modal"
              >
                <span class="text-[28px] leading-none">&times;</span>
              </button>

              <div class="grid gap-8 md:grid-cols-[260px_minmax(0,1fr)] md:gap-10">
                <div
                  class="border-b border-[#EEF0F4] pb-6 md:border-b-0 md:border-r md:pb-0 md:pr-10"
                >
                  <h2 class="max-w-[220px] text-[28px] font-semibold leading-tight text-[#1A1C21]">
                    Leave a review for this seller
                  </h2>

                  <div class="mt-8 overflow-hidden rounded-[28px] border border-[#EEF0F4] bg-white">
                    <div class="h-24 overflow-hidden bg-[#F4F6FB]">
                      <img
                        [src]="store().banner"
                        [alt]="store().name"
                        class="h-full w-full object-cover"
                      />
                    </div>
                    <div class="relative px-5 pb-5 pt-10">
                      <div
                        class="absolute -top-8 left-5 h-16 w-16 overflow-hidden rounded-full border-4 border-white bg-white shadow-sm"
                      >
                        <img
                          [src]="store().logo"
                          [alt]="store().name"
                          class="h-full w-full object-cover"
                        />
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
                    <h3 class="text-[18px] font-semibold text-[#1A1C21]">
                      How would you rate your experience with this seller?
                    </h3>

                    <div class="mt-5 flex flex-wrap items-center gap-4">
                      <div class="flex items-center gap-3">
                        @for (star of [1, 2, 3, 4, 5]; track star) {
                          <button
                            type="button"
                            (click)="reviewRating.set(star)"
                            class="transition hover:scale-105"
                            [attr.aria-label]="'Rate ' + star + ' stars'"
                          >
                            <span
                              class="text-[52px] leading-none"
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

                  <div class="mt-10">
                    <h3 class="text-[18px] font-semibold text-[#1A1C21]">
                      What stood out about this seller?
                      <span class="font-normal text-[#6B7280]">(optional)</span>
                    </h3>

                    <div class="mt-5 flex flex-wrap gap-3">
                      @for (tag of vendorTags; track tag.label) {
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

                  <div class="mt-10">
                    <h3 class="text-[18px] font-semibold text-[#1A1C21]">Share more details</h3>
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

                  <div class="mt-10">
                    <h3 class="text-[18px] font-semibold text-[#1A1C21]">
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

                  <div class="mt-10 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      (click)="closeLeaveReviewModal()"
                      class="rounded-full bg-[#F3F4F6] px-6 py-3 text-sm font-medium text-[#1A1C21] transition hover:bg-[#EDEEF2]"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      (click)="submitReview()"
                      class="rounded-full bg-[#5932EA] px-6 py-3 text-sm font-medium text-white shadow-[0_10px_24px_-12px_rgba(89,50,234,0.7)] transition hover:bg-[#4E27DD]"
                    >
                      Submit review
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuyerFollowedStoreDetailsPageComponent {
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);

  readonly activeTab = signal<BuyerStoreTab>('products');
  readonly activeCategory = signal('All');
  readonly showContactMenu = signal(false);
  readonly showLeaveReviewModal = signal(false);
  readonly sellerPhoneNumber = '08169397454';
  readonly reviewRating = signal(2);
  readonly selectedReviewTags = signal<string[]>(['Friendly']);
  readonly reviewText = signal('');
  readonly reviewImagePreviews = signal<string[]>([]);

  readonly store = signal<BuyerStoreProfile>({
    id: 'bf1',
    name: 'The Vine Collections',
    logo: '/assets/images/product_sneakers_lifestyle.png',
    banner: '/assets/images/fashion_menswear_hero.png',
    location: 'Ikeja, Lagos',
    isVerified: true,
    stats: {
      followers: '2.5k',
      products: '1,456',
      rating: '4.8',
      dateJoined: '16 Feb, 2024',
    },
  });

  readonly categoryChips = [
    'All',
    'Phones & Laptops',
    'Women',
    'Men',
    'Beauty',
    'Food & Drinks',
    'Baby & Toddler',
    'Home',
    'Properties',
    'Fitness & Wellness',
  ];

  readonly mobileCategoryChips = ['All', 'Phones & Laptops', 'Women', 'Men', 'Beauty'] as const;

  readonly mobileSections: readonly { title: string; items: Listing[] }[] = [
    {
      title: 'Phones & Laptops',
      items: [
        this.createListing(
          'm-nike-1',
          'Nike sneaker',
          '₦35,000',
          '/assets/images/listing-nike-sneaker-figma.png',
          'Phones & Laptops',
        ),
        this.createListing(
          'm-wig-1',
          'Bone straight wig',
          '₦35,000',
          '/assets/images/listing-bone-straight-wig-figma.png',
          'Phones & Laptops',
        ),
        this.createListing(
          'm-iphonex-1',
          'Iphone X (64 gig)',
          '₦35,000',
          '/assets/images/image-3-1.jpg',
          'Phones & Laptops',
        ),
        this.createListing(
          'm-chair-1',
          'Ergonomic chair',
          'Free',
          '/assets/images/image-2-1.jpg',
          'Phones & Laptops',
        ),
      ],
    },
    {
      title: 'Men',
      items: [
        this.createListing(
          'm-nike-2',
          'Nike sneaker',
          '₦35,000',
          '/assets/images/listing-nike-sneaker-figma.png',
          'Men',
        ),
        this.createListing(
          'm-wig-2',
          'Bone straight wig',
          '₦35,000',
          '/assets/images/listing-bone-straight-wig-figma.png',
          'Men',
        ),
        this.createListing(
          'm-iphonex-2',
          'Iphone X (64 gig)',
          '₦35,000',
          '/assets/images/image-3-1.jpg',
          'Men',
        ),
        this.createListing(
          'm-chair-2',
          'Ergonomic chair',
          'Free',
          '/assets/images/image-2-1.jpg',
          'Men',
        ),
      ],
    },
  ];

  readonly productSections = signal<ProductSection[]>([
    {
      id: 'phones',
      title: 'Phones & Laptops',
      countLabel: '3,341',
      items: [
        this.createListing(
          'iphone-17',
          'Iphone 17 pro max',
          '₦2,500,000',
          '/assets/images/image-1-1.jpg',
          'Phones & Laptops',
        ),
        this.createListing(
          'mouse-1',
          'Logitech ergonomic mouse',
          '₦35,000',
          '/assets/images/image-2-1.jpg',
          'Phones & Laptops',
        ),
        this.createListing(
          'keyboard-1',
          'RGB keyboard',
          '₦35,000',
          '/assets/images/product_keyboard_rgb.png',
          'Phones & Laptops',
        ),
        this.createListing(
          'iphone-x',
          'Iphone X (64 gig)',
          '₦35,000',
          '/assets/images/image-3-1.jpg',
          'Phones & Laptops',
        ),
        this.createListing(
          'chair-1',
          'Ergonomic chair',
          '₦35,000',
          '/assets/images/image-4-1.jpg',
          'Phones & Laptops',
        ),
      ],
    },
    {
      id: 'men',
      title: 'Men',
      countLabel: '3,341',
      items: [
        this.createListing(
          'tie-1',
          'Tie',
          '₦35,000',
          '/assets/images/fashion_menswear_hero.png',
          'Men',
        ),
        this.createListing(
          'car-1',
          'Masarati',
          '₦35,000',
          '/assets/images/product_watch_luxury.png',
          'Men',
        ),
        this.createListing(
          'sneaker-1',
          'Nike sneaker',
          '₦35,000',
          '/assets/images/product_sneakers_lifestyle.png',
          'Men',
        ),
        this.createListing(
          'perfume-1',
          'Dior sauvage',
          '₦35,000',
          '/assets/images/product_perfume.png',
          'Men',
        ),
        this.createListing(
          'watch-1',
          'G-shock wrist watch',
          '₦35,000',
          '/assets/images/product_watch_luxury.png',
          'Men',
        ),
      ],
    },
    {
      id: 'women',
      title: 'Women',
      countLabel: '3,341',
      items: [
        this.createListing(
          'sneaker-2',
          'Nike sneaker',
          '₦35,000',
          '/assets/images/product_sneakers_lifestyle.png',
          'Women',
        ),
        this.createListing(
          'wig-1',
          'Bone straight wig',
          '₦35,000',
          '/assets/images/image-4-1.jpg',
          'Women',
        ),
        this.createListing(
          'chair-2',
          'Ergonomic chair',
          '₦35,000',
          '/assets/images/image-2-1.jpg',
          'Women',
        ),
        this.createListing(
          'plate-1',
          'Kitchen utensils',
          '₦35,000',
          '/assets/images/image-3-1.jpg',
          'Women',
        ),
        this.createListing(
          'hoodie-1',
          'Sweatshirt',
          '₦35,000',
          '/assets/images/fashion_menswear.png',
          'Women',
        ),
      ],
    },
    {
      id: 'beauty',
      title: 'Beauty',
      countLabel: '3,341',
      items: [
        this.createListing(
          'perfume-2',
          'Luxury perfume set',
          '₦35,000',
          '/assets/images/product_perfume.png',
          'Beauty',
        ),
        this.createListing(
          'wig-2',
          'Bone straight wig',
          '₦35,000',
          '/assets/images/image-4-1.jpg',
          'Beauty',
        ),
        this.createListing(
          'plate-2',
          'Skin care collection',
          '₦35,000',
          '/assets/images/image-3-1.jpg',
          'Beauty',
        ),
        this.createListing(
          'hoodie-2',
          'Beauty essentials',
          '₦35,000',
          '/assets/images/fashion_menswear.png',
          'Beauty',
        ),
        this.createListing(
          'chair-3',
          'Salon chair',
          '₦35,000',
          '/assets/images/image-2-1.jpg',
          'Beauty',
        ),
      ],
    },
  ]);

  readonly reviews = signal<Review[]>([
    {
      author: 'Mary Jane',
      avatar: 'https://i.pravatar.cc/150?u=mary-jane',
      rating: 5,
      text: 'Contacted the seller. Went to their office to purchase the item and the hospitality was okay. Truly reliable. And he’s a funny man 😂',
      date: 'August 14, 2025',
    },
    {
      author: 'Apeli Obubra',
      avatar: 'https://i.pravatar.cc/150?u=apeli-obubra',
      rating: 4,
      text: 'Straightforward guy! easy transaction great goods',
      date: 'August 14, 2025',
    },
    {
      author: 'Ibiso Amiesimaka',
      avatar: 'https://i.pravatar.cc/150?u=ibiso-amiesimaka',
      rating: 4,
      text: 'infact it was amazing if everyone is like this Nigeria will be better than this i advice everybody that wants to by laptop should call this man',
      date: 'August 14, 2025',
      images: [
        '/assets/images/image-1-1.jpg',
        '/assets/images/image-2-1.jpg',
        '/assets/images/image-3-1.jpg',
        '/assets/images/image-4-1.jpg',
        '/assets/images/product_keyboard_rgb.png',
        '/assets/images/product_watch_luxury.png',
      ],
    },
  ]);

  readonly vendorTags = [
    { label: 'Fast response', count: 16 },
    { label: 'Friendly', count: 7 },
    { label: 'Smooth transaction', count: 7 },
    { label: 'On-time delivery', count: 7 },
    { label: 'Honest pricing', count: 7 },
  ];

  readonly ratingBreakdown = [
    { stars: 5, percentage: 65 },
    { stars: 4, percentage: 11 },
    { stars: 3, percentage: 9 },
    { stars: 2, percentage: 3 },
    { stars: 1, percentage: 2 },
  ];

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

  private createListing(
    id: string,
    title: string,
    price: string,
    image: string,
    _category: string,
  ): Listing {
    return {
      id,
      title,
      price,
      images: [image],
      location: 'Ikeja, Lagos',
      timeAgo: 'Just now',
      isVerified: true,
    };
  }

  reviewStars(rating: number) {
    return Array.from({ length: 5 }, (_, index) => index < rating);
  }

  openInAppChat() {
    this.showContactMenu.set(false);
    void this.router.navigate(['/chats']);
  }

  openWhatsApp() {
    this.showContactMenu.set(false);
    const sanitizedNumber = this.sellerPhoneNumber.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/234${sanitizedNumber.replace(/^0/, '')}`;
    globalThis.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  }

  callSeller() {
    this.showContactMenu.set(false);
    this.document.location.href = `tel:${this.sellerPhoneNumber}`;
  }

  toggleReviewTag(tag: string) {
    this.selectedReviewTags.update((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag],
    );
  }

  onReviewImagesSelected(input: HTMLInputElement) {
    const files = Array.from(input.files ?? []);
    const previews = files.slice(0, 6).map((file) => URL.createObjectURL(file));
    this.reviewImagePreviews.set(previews);
  }

  closeLeaveReviewModal() {
    this.showLeaveReviewModal.set(false);
  }

  submitReview() {
    this.showLeaveReviewModal.set(false);
  }
}
