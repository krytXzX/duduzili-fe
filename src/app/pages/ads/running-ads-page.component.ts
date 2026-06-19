import { CommonModule, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  CreateBannerAdModalComponent,
  CreateBannerAdPayload,
} from '../promotions/components/create-banner-ad-modal.component';
import {
  CreateAdType,
  CreateAdTypeModalComponent,
} from './components/create-ad-type-modal.component';
import {
  SellerMonetizationService,
  type SellerAdRecord,
  type SubscriptionStatusData,
} from '../../services/seller-monetization.service';
import { AppToastService } from '../../services/app-toast.service';

type AdPlacement = 'promoted listings' | 'store promotions' | 'banner ads';
type AdStatus = 'active' | 'paused' | 'expired';
type PlanMetric = 'current plan' | 'automobile listings' | 'property listings' | 'other listings';

interface PlacementTab {
  readonly label: string;
  readonly value: AdPlacement;
  readonly activeIcon: string;
  readonly inactiveIcon: string;
}

interface StatusTab {
  readonly label: string;
  readonly value: AdStatus;
}

interface PlanSummaryItem {
  readonly label: PlanMetric;
  readonly value: string;
}

interface ListingCard {
  readonly id: string;
  readonly title: string;
  readonly imageSrc: string;
  readonly expiresOn: string;
  readonly price?: string;
  readonly subtitle?: string;
  readonly oldPrice?: string;
  readonly discount?: string;
  readonly tag?: string;
  readonly views: string;
  readonly clicks: string;
  readonly messages: string;
  readonly calls: string;
}

interface ListingSection {
  readonly id: string;
  readonly title: string;
  readonly viewAllCount?: string;
  readonly cards: readonly ListingCard[];
}

@Component({
  selector: 'app-running-ads-page',
  imports: [
    CommonModule,
    NgOptimizedImage,
    RouterLink,
    CreateBannerAdModalComponent,
    CreateAdTypeModalComponent,
  ],
  template: `
    <div class="mx-auto w-full max-w-[390px] bg-white px-5 pb-[124px] pt-4 md:hidden">
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <a
            routerLink="/seller/ads"
            aria-label="Back to Ads"
            class="inline-flex h-9 w-9 items-center justify-center rounded-[100px] bg-[#F3F3F3]"
          >
            <img [ngSrc]="arrowLeftIcon" width="20" height="20" alt="" class="h-5 w-5" />
          </a>
          <h1 class="text-[20px] font-semibold leading-[1.2] text-black">Running Ads</h1>
        </div>

        <button
          type="button"
          (click)="isCreateAdTypeModalOpen.set(true)"
          class="inline-flex h-10 w-10 items-center justify-center rounded-[64px] border border-white bg-[#6453D9] shadow-[0px_4px_12px_rgba(81,35,173,0.33),0px_0px_0px_1px_#6B5BD5]"
          aria-label="Create ad"
        >
          <img [ngSrc]="addIcon" width="18" height="18" alt="" class="h-[18px] w-[18px]" />
        </button>
      </div>

      <div class="mt-5 overflow-hidden rounded-[12px] border border-[#EDEDED]">
        <div class="grid grid-cols-4 bg-white">
          @for (item of planSummary(); track item.label) {
            <div class="border-r border-[#EDEDED] px-4 py-2.5 last:border-r-0">
              <p class="text-[14px] font-medium leading-none text-[rgba(26,27,29,0.5)]">
                {{ summaryLabel(item.label) }}
              </p>
              <p class="mt-2 text-[18px] font-semibold leading-6 text-[#1A1B1D]">
                {{ item.value }}
              </p>
            </div>
          }
        </div>
      </div>

      <div class="mt-6 border-b border-[#EAEAEA]">
        <div
          class="flex items-center gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          @for (tab of placementTabs; track tab.value) {
            <button
              type="button"
              (click)="selectPlacement(tab.value)"
              class="flex shrink-0 flex-col gap-[6px]"
            >
              <span class="inline-flex items-center gap-1 rounded-[8px] px-3 py-1">
                <img
                  [ngSrc]="activePlacement() === tab.value ? tab.activeIcon : tab.inactiveIcon"
                  width="16"
                  height="16"
                  alt=""
                  class="h-4 w-4"
                />
                <span
                  [class]="
                    activePlacement() === tab.value
                      ? 'text-[16px] font-medium leading-6 text-[#6453D9]'
                      : 'text-[16px] font-medium leading-6 text-[#959595]'
                  "
                >
                  {{ tab.label }}
                </span>
              </span>
              <span
                [class]="
                  activePlacement() === tab.value
                    ? 'h-[2px] w-full rounded-[25px] bg-[#6453D9]'
                    : 'h-px w-full rounded-[25px] bg-transparent'
                "
              ></span>
            </button>
          }
        </div>
      </div>

      <div
        class="mt-6 flex gap-[10px] overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        @for (tab of statusTabs; track tab.value) {
          <button
            type="button"
            (click)="selectStatus(tab.value)"
            [class]="statusButtonClass(tab.value)"
          >
            {{ tab.label }} ({{ countByStatus(tab.value) }})
          </button>
        }
      </div>

      @if (mobileSections().length) {
        <div class="mt-8 space-y-8">
          @for (section of mobileSections(); track section.id) {
            <section>
              <div class="mb-4 flex items-end justify-between gap-4">
                <h2 class="text-[20px] font-medium leading-6 text-[#1F1F1F]">
                  {{ section.title }}
                </h2>

                @if (section.viewAllCount) {
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 text-[14px] font-medium leading-6 text-[#1F1F1F]"
                  >
                    View all ({{ section.viewAllCount }})
                    <img [ngSrc]="arrowRightIcon" width="16" height="16" alt="" class="h-4 w-4" />
                  </button>
                }
              </div>

              <div class="grid grid-cols-2 gap-2">
                @for (card of section.cards; track card.id) {
                  <a
                    [routerLink]="['/seller/ads/running', card.id]"
                    [queryParams]="runningAdsQueryParams()"
                    class="overflow-hidden rounded-[13.451px] border border-[#EAEAEA] bg-white p-[2.242px]"
                  >
                    <div class="relative overflow-hidden rounded-[11.21px]">
                      <img
                        [ngSrc]="card.imageSrc"
                        width="170"
                        height="159"
                        [alt]="card.title"
                        class="h-[159px] w-full rounded-[11.21px] object-cover"
                      />

                      <div
                        class="absolute left-[6.73px] top-[6.73px] rounded-[8px] bg-[#F1FFAC] px-[6px] py-[2px] text-[10px] font-medium leading-4 text-[#4E3E07]"
                      >
                        Active until: {{ card.expiresOn }}
                      </div>

                      @if (card.discount) {
                        <div
                          class="absolute left-[6.73px] top-[29.76px] rounded-[8px] bg-[#E9FF7C] px-[6px] py-[2px] text-[10px] font-medium leading-4 text-[#4E3E07]"
                        >
                          {{ card.discount }}
                        </div>
                      }
                    </div>

                    <div class="px-[2.242px] pb-[8.407px] pt-[8px]">
                      <div class="flex items-start justify-between gap-2">
                        <div class="min-w-0 flex-1">
                          <p class="line-clamp-1 text-[13px] leading-[1.1] text-[#1F1F1F]">
                            {{ card.title }}
                          </p>
                          @if (card.subtitle) {
                            <p class="mt-1 line-clamp-1 text-[12px] leading-4 text-[#777777]">
                              {{ card.subtitle }}
                            </p>
                          }
                        </div>
                        @if (card.tag) {
                          <span
                            class="shrink-0 rounded-[1000px] bg-[#F0F0F0] px-[6px] py-[2px] text-[10px] leading-none text-[#1F1F1F]"
                          >
                            {{ card.tag }}
                          </span>
                        }
                      </div>

                      @if (card.price) {
                        <div class="mt-2 flex flex-wrap items-center gap-1">
                          <p class="text-[14px] font-medium leading-[13.451px] text-[#1F1F1F]">
                            {{ card.price }}
                          </p>
                          @if (card.oldPrice) {
                            <p class="text-[12px] leading-4 text-[#888888] line-through">
                              {{ card.oldPrice }}
                            </p>
                          }
                        </div>
                      }

                      @if (!card.price && card.subtitle) {
                        <div class="mt-2 h-[2px] w-10 rounded-full bg-[#F0F0F0]"></div>
                      }

                      <div
                        class="mt-2 flex flex-wrap items-center gap-[10px] text-[12px] text-[#959595]"
                      >
                        <span class="inline-flex items-center gap-[2px]">
                          <img [ngSrc]="eyeIcon" width="12" height="12" alt="" class="h-3 w-3" />
                          {{ card.views }}
                        </span>
                        <span class="inline-flex items-center gap-[2px]">
                          <img [ngSrc]="clickIcon" width="12" height="12" alt="" class="h-3 w-3" />
                          {{ card.clicks }}
                        </span>
                        <span class="inline-flex items-center gap-[2px]">
                          <img
                            [ngSrc]="messagesIcon"
                            width="12"
                            height="12"
                            alt=""
                            class="h-3 w-3"
                          />
                          {{ card.messages }}
                        </span>
                        <span class="inline-flex items-center gap-[2px]">
                          <img [ngSrc]="callIcon" width="12" height="12" alt="" class="h-3 w-3" />
                          {{ card.calls }}
                        </span>
                      </div>
                    </div>
                  </a>
                }
              </div>
            </section>
          }
        </div>
      } @else {
        <div class="flex min-h-[52vh] flex-col items-center justify-center px-6 text-center">
          <div class="relative mb-8 h-[150px] w-full max-w-[180px] opacity-70">
            <img
              ngSrc="assets/images/empty_state.svg"
              alt="No running ads"
              fill
              class="object-contain"
            />
          </div>
          <h2 class="text-[18px] font-medium leading-6 text-[#24262D]">
            {{ placementEmptyTitle() }}
          </h2>
          <p class="mt-2 text-[14px] leading-5 text-[#9297A1]">{{ placementEmptyDescription() }}</p>
        </div>
      }
    </div>

    <div class="hidden h-full flex-col md:flex">
      <div class="mb-6 flex items-center justify-between gap-4 px-2">
        <h1 class="text-[24px] font-medium leading-none text-[#0D0D0D]">Running Ads</h1>

        <button
          type="button"
          (click)="isCreateAdTypeModalOpen.set(true)"
          class="inline-flex h-10 items-center justify-center gap-2 rounded-[64px] border border-white bg-[#6453D9] px-5 shadow-[0px_4px_12px_rgba(81,35,173,0.33),0px_0px_0px_1px_#6B5BD5]"
        >
          <img [ngSrc]="addIcon" width="18" height="18" alt="" class="h-[18px] w-[18px]" />
          <span class="text-[14px] font-medium leading-5 text-white">Create ad</span>
        </button>
      </div>

      <div
        class="flex h-full flex-col rounded-[32px] border border-[#F1F1F4] bg-white px-[17px] pb-10 pt-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]"
      >
        <div class="border-b border-[#EAEAEA]">
          <div class="flex items-center gap-2">
            @for (tab of placementTabs; track tab.value) {
              <button
                type="button"
                (click)="selectPlacement(tab.value)"
                class="flex flex-col gap-[6px]"
              >
                <span class="inline-flex items-center gap-1 rounded-[8px] px-3 py-1">
                  <img
                    [ngSrc]="activePlacement() === tab.value ? tab.activeIcon : tab.inactiveIcon"
                    width="16"
                    height="16"
                    alt=""
                    class="h-4 w-4"
                  />
                  <span
                    [class]="
                      activePlacement() === tab.value
                        ? 'text-[16px] font-medium leading-6 text-[#6453D9]'
                        : 'text-[16px] font-medium leading-6 text-[#959595]'
                    "
                  >
                    {{ tab.label }}
                  </span>
                </span>
                <span
                  [class]="
                    activePlacement() === tab.value
                      ? 'h-[2px] w-full rounded-[25px] bg-[#6453D9]'
                      : 'h-px w-full rounded-[25px] bg-transparent'
                  "
                ></span>
              </button>
            }
          </div>
        </div>

        <div class="mt-6 flex gap-[10px]">
          @for (tab of statusTabs; track tab.value) {
            <button
              type="button"
              (click)="selectStatus(tab.value)"
              [class]="statusButtonClass(tab.value)"
            >
              {{ tab.label }} ({{ countByStatus(tab.value) }})
            </button>
          }
        </div>

        @if (desktopSections().length) {
          <div class="mt-10 space-y-[37px]">
            @for (section of desktopSections(); track section.id) {
              <section>
                <div class="mb-4 flex items-center justify-between gap-4">
                  <h2 class="text-[20px] font-medium leading-6 text-[#1F1F1F]">
                    {{ section.title }}
                  </h2>

                  @if (section.viewAllCount) {
                    <div class="flex items-center gap-[25px]">
                      <button
                        type="button"
                        class="inline-flex items-center gap-1 text-[16px] font-medium leading-6 text-[#1F1F1F]"
                      >
                        View all ({{ section.viewAllCount }})
                        <img
                          [ngSrc]="arrowRightIcon"
                          width="16"
                          height="16"
                          alt=""
                          class="h-4 w-4"
                        />
                      </button>

                      @if (section.cards.length > 1) {
                        <div class="flex items-center gap-3">
                          <button
                            type="button"
                            class="inline-flex h-8 w-8 items-center justify-center rounded-[80px] border border-[#EAEAEA] bg-white shadow-[0px_3.2px_6.4px_rgba(202,202,202,0.25)]"
                          >
                            <img
                              [ngSrc]="arrowLeftIcon"
                              width="16"
                              height="16"
                              alt=""
                              class="h-4 w-4 opacity-30"
                            />
                          </button>
                          <button
                            type="button"
                            class="inline-flex h-8 w-8 items-center justify-center rounded-[80px] border border-[#EAEAEA] bg-white shadow-[0px_3.2px_6.4px_rgba(202,202,202,0.25)]"
                          >
                            <img
                              [ngSrc]="arrowRightIcon"
                              width="16"
                              height="16"
                              alt=""
                              class="h-4 w-4"
                            />
                          </button>
                        </div>
                      }
                    </div>
                  }
                </div>

                <div
                  class="grid gap-5"
                  [style.gridTemplateColumns]="desktopGridTemplate(section.cards.length)"
                >
                  @for (card of section.cards; track card.id) {
                    <a
                      [routerLink]="['/seller/ads/running', card.id]"
                      [queryParams]="runningAdsQueryParams()"
                      class="overflow-hidden rounded-[24px] border border-[#EAEAEA] bg-white p-1"
                    >
                      <div class="relative overflow-hidden rounded-[20px]">
                        <img
                          [ngSrc]="card.imageSrc"
                          [priority]="
                            card.imageSrc === '/assets/images/running-ads-desktop-iphone17.png'
                          "
                          width="202"
                          height="224"
                          [alt]="card.title"
                          class="h-[224px] w-full rounded-[20px] object-cover"
                        />

                        <div
                          class="absolute left-[7.2px] top-[7px] rounded-[8px] bg-[#F1FFAC] px-[6px] py-[2px] text-[12px] font-medium leading-4 text-[#4E3E07]"
                        >
                          Active until: {{ card.expiresOn }}
                        </div>

                        @if (card.discount) {
                          <div
                            class="absolute left-[7.2px] top-[31px] rounded-[8px] bg-[#E9FF7C] px-[6px] py-[2px] text-[12px] font-medium leading-4 text-[#4E3E07]"
                          >
                            {{ card.discount }}
                          </div>
                        }
                      </div>

                      <div class="px-1 pb-3 pt-3">
                        <div class="flex items-start justify-between gap-2">
                          <div class="min-w-0 flex-1">
                            <p class="line-clamp-1 text-[14px] leading-5 text-[#1F1F1F]">
                              {{ card.title }}
                            </p>
                            @if (card.subtitle) {
                              <p class="mt-1 line-clamp-1 text-[12px] leading-4 text-[#777777]">
                                {{ card.subtitle }}
                              </p>
                            }
                          </div>
                          @if (card.tag) {
                            <span
                              class="shrink-0 rounded-[1000px] bg-[#F0F0F0] px-[6px] py-[2px] text-[10px] leading-none text-[#1F1F1F]"
                            >
                              {{ card.tag }}
                            </span>
                          }
                        </div>

                        @if (card.price) {
                          <div class="mt-1 flex flex-wrap items-center gap-1">
                            <p class="text-[16px] font-medium leading-6 text-[#1F1F1F]">
                              {{ card.price }}
                            </p>
                            @if (card.oldPrice) {
                              <p class="text-[12px] leading-4 text-[#888888] line-through">
                                {{ card.oldPrice }}
                              </p>
                            }
                          </div>
                        }

                        @if (!card.price && card.subtitle) {
                          <div class="mt-2 h-[2px] w-12 rounded-full bg-[#F0F0F0]"></div>
                        }

                        <div
                          class="mt-2 flex flex-wrap items-center gap-[10px] text-[12px] text-[#959595]"
                        >
                          <span class="inline-flex items-center gap-[2px]">
                            <img [ngSrc]="eyeIcon" width="12" height="12" alt="" class="h-3 w-3" />
                            {{ card.views }}
                          </span>
                          <span class="inline-flex items-center gap-[2px]">
                            <img
                              [ngSrc]="clickIcon"
                              width="12"
                              height="12"
                              alt=""
                              class="h-3 w-3"
                            />
                            {{ card.clicks }}
                          </span>
                          <span class="inline-flex items-center gap-[2px]">
                            <img
                              [ngSrc]="messagesIcon"
                              width="12"
                              height="12"
                              alt=""
                              class="h-3 w-3"
                            />
                            {{ card.messages }}
                          </span>
                          <span class="inline-flex items-center gap-[2px]">
                            <img [ngSrc]="callIcon" width="12" height="12" alt="" class="h-3 w-3" />
                            {{ card.calls }}
                          </span>
                        </div>
                      </div>
                    </a>
                  }
                </div>
              </section>
            }
          </div>
        } @else {
          <div class="flex min-h-[420px] flex-1 items-center justify-center px-6 text-center">
            <div>
              <div class="relative mx-auto mb-8 h-[180px] w-full max-w-[240px] opacity-70">
                <img
                  ngSrc="assets/images/empty_state.svg"
                  alt="No running ads"
                  fill
                  class="object-contain"
                />
              </div>
              <h2 class="text-[20px] font-medium leading-6 text-[#24262D]">
                {{ placementEmptyTitle() }}
              </h2>
              <p class="mt-2 text-[15px] leading-6 text-[#9297A1]">
                {{ placementEmptyDescription() }}
              </p>
            </div>
          </div>
        }

        <div
          class="mt-auto flex items-center justify-between px-2 pb-2 pt-8 text-[16px] leading-6 text-[#1A1B1D]"
        >
          <p>{{ totalResults() }} <span class="text-[rgba(26,27,29,0.5)]">results</span></p>
          <div class="flex items-center gap-3">
            <button
              type="button"
              (click)="previousPage()"
              [disabled]="!hasPreviousPage()"
              class="inline-flex h-8 w-8 items-center justify-center rounded-[80px] border border-[#EAEAEA] bg-white shadow-[0px_3.2px_6.4px_rgba(202,202,202,0.25)] disabled:opacity-40"
              aria-label="Previous page"
            >
              <img [ngSrc]="arrowLeftIcon" width="16" height="16" alt="" class="h-4 w-4" />
            </button>
            <span>Page {{ currentPage() }}</span>
            <button
              type="button"
              (click)="nextPage()"
              [disabled]="!hasNextPage()"
              class="inline-flex h-8 w-8 items-center justify-center rounded-[80px] border border-[#EAEAEA] bg-white shadow-[0px_3.2px_6.4px_rgba(202,202,202,0.25)] disabled:opacity-40"
              aria-label="Next page"
            >
              <img [ngSrc]="arrowRightIcon" width="16" height="16" alt="" class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    @if (isCreateAdTypeModalOpen()) {
      <app-create-ad-type-modal
        (close)="isCreateAdTypeModalOpen.set(false)"
        (continue)="handleCreateAdTypeSelection($event)"
        (promoteStore)="handleCreateStorePromotion($event)"
      ></app-create-ad-type-modal>
    }

    @if (isCreateBannerModalOpen()) {
      <app-create-banner-ad-modal
        [isSubmitting]="isSubmittingBanner()"
        (close)="isCreateBannerModalOpen.set(false)"
        (submit)="handleCreateBannerAd($event)"
      ></app-create-banner-ad-modal>
    }
  `,
  host: { class: 'block h-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RunningAdsPageComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly sellerMonetizationService = inject(SellerMonetizationService);
  private readonly appToastService = inject(AppToastService);

  readonly arrowLeftIcon = '/assets/icons/running-ads-arrow-left.svg';
  readonly arrowRightIcon = '/assets/icons/running-ads-arrow-right.svg';
  readonly addIcon = '/assets/icons/running-ads-add.svg';
  readonly eyeIcon = '/assets/icons/running-ads-eye.svg';
  readonly clickIcon = '/assets/icons/running-ads-click.svg';
  readonly messagesIcon = '/assets/icons/running-ads-messages.svg';
  readonly callIcon = '/assets/icons/running-ads-call.svg';

  readonly placementTabs: readonly PlacementTab[] = [
    {
      label: 'Promoted Listings',
      value: 'promoted listings',
      activeIcon: '/assets/icons/running-ads-tab-promoted.svg',
      inactiveIcon: '/assets/icons/running-ads-tab-promoted.svg',
    },
    {
      label: 'Store Promotions',
      value: 'store promotions',
      activeIcon: '/assets/icons/running-ads-tab-store.svg',
      inactiveIcon: '/assets/icons/running-ads-tab-store.svg',
    },
    {
      label: 'Banner Ads',
      value: 'banner ads',
      activeIcon: '/assets/icons/running-ads-tab-banner.svg',
      inactiveIcon: '/assets/icons/running-ads-tab-banner.svg',
    },
  ];

  readonly statusTabs: readonly StatusTab[] = [
    { label: 'Active', value: 'active' },
    { label: 'Paused', value: 'paused' },
    { label: 'Expired', value: 'expired' },
  ];

  readonly activePlacement = signal<AdPlacement>(this.readPlacementFromQuery());
  readonly activeStatus = signal<AdStatus>(this.readStatusFromQuery());
  readonly isCreateAdTypeModalOpen = signal(false);
  readonly isCreateBannerModalOpen = signal(false);
  readonly isSubmittingBanner = signal(false);
  readonly bannerModal = viewChild(CreateBannerAdModalComponent);
  readonly backendAds = signal<SellerAdRecord[]>([]);
  readonly subscription = signal<SubscriptionStatusData | null>(null);
  readonly backendCounts = signal<
    Record<
      'banner' | 'listing' | 'store',
      Record<'active' | 'paused' | 'expired' | 'pending' | 'rejected', number>
    >
  >({
    banner: { active: 0, paused: 0, expired: 0, pending: 0, rejected: 0 },
    listing: { active: 0, paused: 0, expired: 0, pending: 0, rejected: 0 },
    store: { active: 0, paused: 0, expired: 0, pending: 0, rejected: 0 },
  });
  readonly currentPage = signal(this.readPageFromQuery());
  readonly totalResults = signal(0);
  readonly hasNextPage = signal(false);
  readonly hasPreviousPage = signal(false);
  readonly runningAdsQueryParams = computed(() => ({
    placement: this.activePlacement(),
    status: this.activeStatus(),
    page: this.currentPage(),
  }));

  private readonly mobileSectionsByPlacement: Record<
    AdPlacement,
    Record<AdStatus, readonly ListingSection[]>
  > = {
    'promoted listings': {
      active: [
        {
          id: 'phones-laptops',
          title: 'Phones & Laptops',
          viewAllCount: '3,341',
          cards: [
            {
              id: 'mobile-1',
              title: 'Nike sneaker',
              imageSrc: '/assets/images/running-ads-mobile-sneaker.png',
              expiresOn: '24 May, 2025',
              price: '₦35,000',
              views: '1K',
              clicks: '500',
              messages: '41',
              calls: '8',
            },
            {
              id: 'mobile-2',
              title: 'Bone straight wig',
              imageSrc: '/assets/images/running-ads-mobile-wig.png',
              expiresOn: '24 May, 2025',
              price: '₦35,000',
              views: '1K',
              clicks: '500',
              messages: '41',
              calls: '8',
            },
            {
              id: 'other-4',
              title: 'Iphone X (64 gig)',
              imageSrc: '/assets/images/running-ads-mobile-iphone.png',
              expiresOn: '24 May, 2025',
              price: '₦35,000',
              oldPrice: '₦35,000',
              discount: '-22%',
              views: '1K',
              clicks: '500',
              messages: '41',
              calls: '8',
            },
            {
              id: 'other-5',
              title: 'Ergonomic chair',
              imageSrc: '/assets/images/running-ads-mobile-chair.png',
              expiresOn: '24 May, 2025',
              price: 'Free',
              views: '1K',
              clicks: '500',
              messages: '41',
              calls: '8',
            },
          ],
        },
        {
          id: 'automobile',
          title: 'Automobile listings',
          cards: [
            {
              id: 'auto-1',
              title: 'Nike sneaker',
              imageSrc: '/assets/images/running-ads-mobile-sneaker.png',
              expiresOn: '24 May, 2025',
              price: '₦35,000',
              views: '1K',
              clicks: '500',
              messages: '41',
              calls: '8',
            },
          ],
        },
        {
          id: 'property',
          title: 'Property listings',
          cards: [
            {
              id: 'property-1',
              title: 'Ergonomic chair',
              imageSrc: '/assets/images/running-ads-mobile-chair.png',
              expiresOn: '24 May, 2025',
              price: 'Free',
              views: '1K',
              clicks: '500',
              messages: '41',
              calls: '8',
            },
          ],
        },
      ],
      paused: [
        {
          id: 'paused',
          title: 'Phones & Laptops',
          cards: [
            {
              id: 'other-paused',
              title: 'Ergonomic chair',
              imageSrc: '/assets/images/running-ads-mobile-chair.png',
              expiresOn: '24 May, 2025',
              price: 'Free',
              tag: 'Used',
              views: '1K',
              clicks: '500',
              messages: '41',
              calls: '8',
            },
          ],
        },
      ],
      expired: [
        {
          id: 'expired',
          title: 'Phones & Laptops',
          cards: [
            {
              id: 'other-expired',
              title: 'Iphone X (64 gig)',
              imageSrc: '/assets/images/running-ads-mobile-iphone.png',
              expiresOn: '24 May, 2025',
              price: '₦35,000',
              oldPrice: '₦35,000',
              discount: '-22%',
              views: '1K',
              clicks: '500',
              messages: '41',
              calls: '8',
            },
          ],
        },
      ],
    },
    'store promotions': {
      active: [
        {
          id: 'store-mobile-active',
          title: 'Fashion & Lifestyle Stores',
          cards: [
            {
              id: 'store-1',
              title: 'The Vine Collections',
              subtitle: '43 active listings',
              imageSrc: '/assets/images/store-vine-cover-mobile.png',
              expiresOn: '24 May, 2025',
              views: '9.2K',
              clicks: '1.4K',
              messages: '121',
              calls: '31',
            },
            {
              id: 'store-3',
              title: 'Snap Thrifts',
              subtitle: '31 active listings',
              imageSrc: '/assets/images/store-snap-cover-mobile.png',
              expiresOn: '18 Jun, 2025',
              views: '6.8K',
              clicks: '870',
              messages: '94',
              calls: '16',
            },
          ],
        },
      ],
      paused: [
        {
          id: 'store-mobile-paused',
          title: 'Paused store promotions',
          cards: [
            {
              id: 'store-2',
              title: 'New Age Properties',
              subtitle: '43 active listings',
              imageSrc: '/assets/images/store-newage-cover-desktop.png',
              expiresOn: '09 Jul, 2025',
              tag: 'Paused',
              views: '3.1K',
              clicks: '402',
              messages: '28',
              calls: '7',
            },
          ],
        },
      ],
      expired: [
        {
          id: 'store-mobile-expired',
          title: 'Expired store promotions',
          cards: [
            {
              id: 'store-4',
              title: 'goMelon',
              subtitle: '19 active listings',
              imageSrc: '/assets/images/store-gomelon-cover-mobile.png',
              expiresOn: '03 Mar, 2025',
              tag: 'Expired',
              views: '1.4K',
              clicks: '180',
              messages: '12',
              calls: '4',
            },
          ],
        },
      ],
    },
    'banner ads': {
      active: [
        {
          id: 'banner-mobile-active',
          title: 'Active banner ads',
          cards: [
            {
              id: 'banner-1',
              title: 'Christmas Sale Banner',
              subtitle: 'Homepage hero placement',
              imageSrc: '/assets/images/banner-promotions-card-orange.png',
              expiresOn: '24 May, 2025',
              views: '12K',
              clicks: '1.9K',
              messages: '88',
              calls: '13',
            },
            {
              id: 'banner-2',
              title: 'Prime Deals Banner',
              subtitle: 'Category banner placement',
              imageSrc: '/assets/images/banner-promotions-card-blue.png',
              expiresOn: '30 May, 2025',
              views: '10K',
              clicks: '1.2K',
              messages: '64',
              calls: '10',
            },
          ],
        },
      ],
      paused: [
        {
          id: 'banner-mobile-paused',
          title: 'Paused banner ads',
          cards: [
            {
              id: 'banner-3',
              title: 'Weekend Gadget Banner',
              subtitle: 'Search results placement',
              imageSrc: '/assets/images/banner-details-hero.png',
              expiresOn: '18 May, 2025',
              tag: 'Paused',
              views: '2.8K',
              clicks: '340',
              messages: '14',
              calls: '2',
            },
          ],
        },
      ],
      expired: [
        {
          id: 'banner-mobile-expired',
          title: 'Expired banner ads',
          cards: [
            {
              id: 'banner-6',
              title: 'Lifestyle Refresh Banner',
              subtitle: 'Feed insertion placement',
              imageSrc: '/assets/images/banner-promotions-card-blue.png',
              expiresOn: '03 May, 2025',
              tag: 'Expired',
              views: '1.1K',
              clicks: '94',
              messages: '5',
              calls: '1',
            },
          ],
        },
      ],
    },
  };

  private readonly desktopSectionsByPlacement: Record<
    AdPlacement,
    Record<AdStatus, readonly ListingSection[]>
  > = {
    'promoted listings': {
      active: [
        {
          id: 'other',
          title: 'Other listings',
          viewAllCount: '3,341',
          cards: [
            {
              id: 'other-1',
              title: 'Iphone 17 pro max',
              imageSrc: '/assets/images/running-ads-desktop-iphone17.png',
              expiresOn: '24 May, 2025',
              price: '₦2,500,000',
              views: '1K',
              clicks: '500',
              messages: '41',
              calls: '8',
            },
            {
              id: 'other-2',
              title: 'Logitech ergonomic mouse',
              imageSrc: '/assets/images/running-ads-desktop-mouse.png',
              expiresOn: '24 May, 2025',
              price: '₦35,000',
              views: '1K',
              clicks: '500',
              messages: '41',
              calls: '8',
            },
            {
              id: 'other-3',
              title: 'RGB keyboard',
              imageSrc: '/assets/images/running-ads-desktop-keyboard.png',
              expiresOn: '24 May, 2025',
              price: '₦35,000',
              views: '1K',
              clicks: '500',
              messages: '41',
              calls: '8',
            },
            {
              id: 'other-4',
              title: 'Iphone X (64 gig)',
              imageSrc: '/assets/images/running-ads-desktop-iphonex.png',
              expiresOn: '24 May, 2025',
              price: '₦35,000',
              views: '1K',
              clicks: '500',
              messages: '41',
              calls: '8',
            },
            {
              id: 'other-5',
              title: 'Ergonomic chair',
              imageSrc: '/assets/images/running-ads-desktop-chair.png',
              expiresOn: '24 May, 2025',
              price: '₦35,000',
              views: '1K',
              clicks: '500',
              messages: '41',
              calls: '8',
            },
          ],
        },
        {
          id: 'automobile',
          title: 'Automobile listings',
          cards: [
            {
              id: 'auto-1',
              title: 'Maserati',
              imageSrc: '/assets/images/running-ads-desktop-car.png',
              expiresOn: '24 May, 2025',
              price: '₦35,000',
              views: '1K',
              clicks: '500',
              messages: '41',
              calls: '8',
            },
          ],
        },
        {
          id: 'property',
          title: 'Property listings',
          cards: [
            {
              id: 'property-1',
              title: 'Nike sneaker',
              imageSrc: '/assets/images/running-ads-desktop-sneaker.png',
              expiresOn: '24 May, 2025',
              price: '₦35,000',
              views: '1K',
              clicks: '500',
              messages: '41',
              calls: '8',
            },
          ],
        },
      ],
      paused: [
        {
          id: 'paused',
          title: 'Other listings',
          cards: [
            {
              id: 'other-paused',
              title: 'Ergonomic chair',
              imageSrc: '/assets/images/running-ads-desktop-chair.png',
              expiresOn: '24 May, 2025',
              price: 'Free',
              tag: 'Used',
              views: '1K',
              clicks: '500',
              messages: '41',
              calls: '8',
            },
          ],
        },
      ],
      expired: [
        {
          id: 'expired',
          title: 'Other listings',
          cards: [
            {
              id: 'other-expired',
              title: 'Iphone X (64 gig)',
              imageSrc: '/assets/images/running-ads-desktop-iphonex.png',
              expiresOn: '24 May, 2025',
              price: '₦35,000',
              oldPrice: '₦35,000',
              discount: '-22%',
              views: '1K',
              clicks: '500',
              messages: '41',
              calls: '8',
            },
          ],
        },
      ],
    },
    'store promotions': {
      active: [
        {
          id: 'store-desktop-active',
          title: 'Featured store promotions',
          viewAllCount: '248',
          cards: [
            {
              id: 'store-1',
              title: 'The Vine Collections',
              subtitle: '43 active listings',
              imageSrc: '/assets/images/store-vine-cover-desktop.png',
              expiresOn: '24 May, 2025',
              views: '9.2K',
              clicks: '1.4K',
              messages: '121',
              calls: '31',
            },
            {
              id: 'store-2',
              title: 'New Age Properties',
              subtitle: '43 active listings',
              imageSrc: '/assets/images/store-newage-cover-desktop.png',
              expiresOn: '10 Jun, 2025',
              views: '7.1K',
              clicks: '934',
              messages: '66',
              calls: '12',
            },
            {
              id: 'store-3',
              title: 'Snap Thrifts',
              subtitle: '31 active listings',
              imageSrc: '/assets/images/store-snap-cover-desktop.png',
              expiresOn: '18 Jun, 2025',
              views: '6.8K',
              clicks: '870',
              messages: '94',
              calls: '16',
            },
            {
              id: 'store-4',
              title: 'goMelon',
              subtitle: '19 active listings',
              imageSrc: '/assets/images/store-gomelon-cover-desktop.png',
              expiresOn: '28 Jun, 2025',
              views: '4.4K',
              clicks: '510',
              messages: '33',
              calls: '8',
            },
          ],
        },
      ],
      paused: [
        {
          id: 'store-desktop-paused',
          title: 'Paused store promotions',
          cards: [
            {
              id: 'store-2',
              title: 'New Age Properties',
              subtitle: '43 active listings',
              imageSrc: '/assets/images/store-newage-cover-desktop.png',
              expiresOn: '10 Jun, 2025',
              tag: 'Paused',
              views: '3.1K',
              clicks: '402',
              messages: '28',
              calls: '7',
            },
          ],
        },
      ],
      expired: [
        {
          id: 'store-desktop-expired',
          title: 'Expired store promotions',
          cards: [
            {
              id: 'store-4',
              title: 'goMelon',
              subtitle: '19 active listings',
              imageSrc: '/assets/images/store-gomelon-cover-desktop.png',
              expiresOn: '03 Mar, 2025',
              tag: 'Expired',
              views: '1.4K',
              clicks: '180',
              messages: '12',
              calls: '4',
            },
          ],
        },
      ],
    },
    'banner ads': {
      active: [
        {
          id: 'banner-desktop-active',
          title: 'Active banner ads',
          viewAllCount: '128',
          cards: [
            {
              id: 'banner-1',
              title: 'Christmas Sale Banner',
              subtitle: 'Homepage hero placement',
              imageSrc: '/assets/images/banner-promotions-card-orange.png',
              expiresOn: '24 May, 2025',
              views: '12K',
              clicks: '1.9K',
              messages: '88',
              calls: '13',
            },
            {
              id: 'banner-2',
              title: 'Prime Deals Banner',
              subtitle: 'Category banner placement',
              imageSrc: '/assets/images/banner-promotions-card-blue.png',
              expiresOn: '30 May, 2025',
              views: '10K',
              clicks: '1.2K',
              messages: '64',
              calls: '10',
            },
            {
              id: 'banner-4',
              title: 'Home Office Banner',
              subtitle: 'Feed insertion placement',
              imageSrc: '/assets/images/banner-details-hero.png',
              expiresOn: '03 Jun, 2025',
              views: '8.2K',
              clicks: '950',
              messages: '51',
              calls: '9',
            },
          ],
        },
      ],
      paused: [
        {
          id: 'banner-desktop-paused',
          title: 'Paused banner ads',
          cards: [
            {
              id: 'banner-3',
              title: 'Weekend Gadget Banner',
              subtitle: 'Search results placement',
              imageSrc: '/assets/images/banner-details-hero.png',
              expiresOn: '18 May, 2025',
              tag: 'Paused',
              views: '2.8K',
              clicks: '340',
              messages: '14',
              calls: '2',
            },
          ],
        },
      ],
      expired: [
        {
          id: 'banner-desktop-expired',
          title: 'Expired banner ads',
          cards: [
            {
              id: 'banner-6',
              title: 'Lifestyle Refresh Banner',
              subtitle: 'Feed insertion placement',
              imageSrc: '/assets/images/banner-promotions-card-blue.png',
              expiresOn: '03 May, 2025',
              tag: 'Expired',
              views: '1.1K',
              clicks: '94',
              messages: '5',
              calls: '1',
            },
          ],
        },
      ],
    },
  };

  readonly planSummary = computed<readonly PlanSummaryItem[]>(() => {
    const subscription = this.subscription();
    return [
      { label: 'current plan', value: subscription?.plan_name ?? 'Free' },
      {
        label: 'automobile listings',
        value: subscription
          ? `${Math.max(subscription.usage.automobile.max - subscription.usage.automobile.used, 0)}/${subscription.usage.automobile.max} left`
          : '0/0 left',
      },
      {
        label: 'property listings',
        value: subscription
          ? `${Math.max(subscription.usage.property.max - subscription.usage.property.used, 0)}/${subscription.usage.property.max} left`
          : '0/0 left',
      },
      {
        label: 'other listings',
        value: subscription
          ? `${Math.max(subscription.usage.other.max - subscription.usage.other.used, 0)}/${subscription.usage.other.max} left`
          : '0/0 left',
      },
    ];
  });

  readonly mobileSections = computed(() => this.buildSections('mobile'));
  readonly desktopSections = computed(() => this.buildSections('desktop'));

  constructor() {
    effect(() => {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: this.runningAdsQueryParams(),
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    });

    effect(() => {
      this.activePlacement();
      this.activeStatus();
      this.currentPage();
      this.loadAdsData();
    });
  }

  countByStatus(status: AdStatus): number {
    return this.backendCounts()[this.mapPlacementToAdType(this.activePlacement())][
      this.mapStatusToApiStatus(status)
    ];
  }

  summaryLabel(label: PlanMetric): string {
    switch (label) {
      case 'current plan':
        return 'Current plan';
      case 'automobile listings':
        return 'Automobile listings';
      case 'property listings':
        return 'Property listings';
      default:
        return 'Other listings';
    }
  }

  statusButtonClass(status: AdStatus): string {
    return this.activeStatus() === status
      ? 'inline-flex h-10 items-center justify-center rounded-[16px] bg-[#1A1A1A] px-4 text-[14px] font-medium leading-5 text-white'
      : 'inline-flex h-10 items-center justify-center rounded-[16px] bg-[#F4F4F4] px-4 text-[14px] font-medium leading-5 text-black';
  }

  desktopGridTemplate(count: number): string {
    return `repeat(${count}, 196px)`;
  }

  placementEmptyTitle(): string {
    return this.activePlacement() === 'store promotions'
      ? 'Store promotions will appear here'
      : 'Banner ads will appear here';
  }

  placementEmptyDescription(): string {
    return this.activePlacement() === 'store promotions'
      ? 'Switch back to promoted listings or create a store promotion to populate this section.'
      : 'Switch back to promoted listings or create a banner ad to populate this section.';
  }

  handleCreateAdTypeSelection(type: CreateAdType): void {
    this.isCreateAdTypeModalOpen.set(false);
    this.currentPage.set(1);

    switch (type) {
      case 'banner':
        this.activePlacement.set('banner ads');
        this.isCreateBannerModalOpen.set(true);
        break;
      case 'store':
        this.activePlacement.set('store promotions');
        break;
      default:
        this.activePlacement.set('promoted listings');
        break;
    }
  }

  selectPlacement(placement: AdPlacement): void {
    this.activePlacement.set(placement);
    this.currentPage.set(1);
  }

  selectStatus(status: AdStatus): void {
    this.activeStatus.set(status);
    this.currentPage.set(1);
  }

  handleCreateBannerAd(payload: CreateBannerAdPayload): void {
    if (!payload.mediaFile) {
      this.appToastService.show({ message: 'Please choose a banner image or video first.' });
      return;
    }

    this.isSubmittingBanner.set(true);

    this.sellerMonetizationService
      .createBannerAd({
        title: payload.title,
        destinationUrl: payload.destinationUrl,
        bannerType: payload.bannerType,
        mediaFile: payload.mediaFile,
      })
      .subscribe({
        next: () => {
          this.isSubmittingBanner.set(false);
          this.activePlacement.set('banner ads');
          this.activeStatus.set('active');
          this.currentPage.set(1);
          this.appToastService.show({ message: 'Banner ad submitted for review.' });
          this.loadAdsData();
        },
        error: () => {
          this.isSubmittingBanner.set(false);
          this.appToastService.show({
            message: 'That banner ad couldn’t be created right now. Please try again.',
          });
        },
      });
  }

  handleCreateStorePromotion(vendorId: string): void {
    this.sellerMonetizationService.createStorePromotion({ vendorId }).subscribe({
      next: () => {
        this.activePlacement.set('store promotions');
        this.activeStatus.set('active');
        this.currentPage.set(1);
        this.isCreateAdTypeModalOpen.set(false);
        this.appToastService.show({ message: 'Store promotion is now running.' });
        this.loadAdsData();
      },
      error: () => {
        this.appToastService.show({
          message: 'That store promotion couldn’t be created right now. Please try again.',
        });
      },
    });
  }

  navigateToPlans(): void {
    void this.router.navigateByUrl('/seller/ads/plans');
  }

  private loadAdsData(): void {
    this.sellerMonetizationService
      .getMyAds({
        page: this.currentPage(),
        adType: this.mapPlacementToAdType(this.activePlacement()),
        status: this.mapStatusToApiStatus(this.activeStatus()),
      })
      .subscribe({
        next: (response) => {
          this.backendAds.set(Array.isArray(response.results) ? response.results : []);
          this.subscription.set(response.subscription ?? null);
          this.totalResults.set(
            typeof response.count === 'number' ? response.count : (response.results?.length ?? 0),
          );
          this.hasNextPage.set(Boolean(response.next));
          this.hasPreviousPage.set(Boolean(response.previous));
          this.backendCounts.set({
            banner: {
              active: response.counts?.banner?.active ?? 0,
              paused: response.counts?.banner?.paused ?? 0,
              expired: response.counts?.banner?.expired ?? 0,
              pending: response.counts?.banner?.pending ?? 0,
              rejected: response.counts?.banner?.rejected ?? 0,
            },
            listing: {
              active: response.counts?.listing?.active ?? 0,
              paused: response.counts?.listing?.paused ?? 0,
              expired: response.counts?.listing?.expired ?? 0,
              pending: response.counts?.listing?.pending ?? 0,
              rejected: response.counts?.listing?.rejected ?? 0,
            },
            store: {
              active: response.counts?.store?.active ?? 0,
              paused: response.counts?.store?.paused ?? 0,
              expired: response.counts?.store?.expired ?? 0,
              pending: response.counts?.store?.pending ?? 0,
              rejected: response.counts?.store?.rejected ?? 0,
            },
          });
        },
        error: () => {
          this.backendAds.set([]);
          this.subscription.set(null);
          this.totalResults.set(0);
          this.hasNextPage.set(false);
          this.hasPreviousPage.set(false);
        },
      });
  }

  private buildSections(mode: 'mobile' | 'desktop'): readonly ListingSection[] {
    return this.sectionsFor(this.activePlacement(), this.activeStatus()).map((section) => ({
      ...section,
      viewAllCount: mode === 'desktop' || mode === 'mobile' ? section.viewAllCount : undefined,
    }));
  }

  private sectionsFor(placement: AdPlacement, status: AdStatus): readonly ListingSection[] {
    const matchingAds = this.backendAds().filter((ad) => {
      const adPlacement = this.mapAdTypeToPlacement(ad.ad_type);
      return adPlacement === placement && this.mapAdStatus(ad.status) === status;
    });

    if (matchingAds.length === 0) {
      return [];
    }

    return [
      {
        id: `${placement}-${status}`,
        title:
          placement === 'banner ads'
            ? 'Banner ads'
            : placement === 'store promotions'
              ? 'Store promotions'
              : 'Promoted listings',
        viewAllCount: String(this.totalResults()),
        cards: matchingAds.map((ad) => this.mapAdCard(ad)),
      },
    ];
  }

  private mapAdCard(ad: SellerAdRecord): ListingCard {
    const expiresOn = this.formatDate(ad.end_date);
    const amountPaid = this.formatCurrency(ad.amount_paid);

    return {
      id: String(ad.id),
      title: ad.title,
      imageSrc: ad.image || ad.promoted_store_image || '/assets/images/empty_state.svg',
      expiresOn,
      price: ad.ad_type === 'listing' ? amountPaid : undefined,
      subtitle:
        ad.ad_type === 'banner'
          ? this.readBannerSubtitle(ad.link)
          : ad.ad_type === 'store'
            ? ad.promoted_store_name || 'Promoted store'
            : 'Promoted listing',
      views: this.formatCompactNumber(ad.total_views),
      clicks: this.formatCompactNumber(ad.total_clicks),
      messages: '0',
      calls: '0',
    };
  }

  previousPage(): void {
    if (!this.hasPreviousPage()) {
      return;
    }
    this.currentPage.update((page) => Math.max(1, page - 1));
  }

  nextPage(): void {
    if (!this.hasNextPage()) {
      return;
    }
    this.currentPage.update((page) => page + 1);
  }

  private mapPlacementToAdType(placement: AdPlacement): 'banner' | 'listing' | 'store' {
    switch (placement) {
      case 'banner ads':
        return 'banner';
      case 'store promotions':
        return 'store';
      default:
        return 'listing';
    }
  }

  private mapAdTypeToPlacement(adType: SellerAdRecord['ad_type']): AdPlacement {
    switch (adType) {
      case 'banner':
        return 'banner ads';
      case 'store':
        return 'store promotions';
      default:
        return 'promoted listings';
    }
  }

  private mapStatusToApiStatus(status: AdStatus): 'active' | 'paused' | 'expired' {
    return status;
  }

  private mapAdStatus(status: SellerAdRecord['status']): AdStatus {
    if (status === 'paused') {
      return 'paused';
    }
    if (status === 'expired') {
      return 'expired';
    }
    return 'active';
  }

  private formatDate(date: string): string {
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }
    return new Intl.DateTimeFormat('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(parsedDate);
  }

  private formatCurrency(amount: string): string {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount)) {
      return `₦${amount}`;
    }
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(numericAmount);
  }

  private formatCompactNumber(value: number): string {
    return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(
      value,
    );
  }

  private readBannerSubtitle(link: string): string {
    if (!link) {
      return 'Banner ad';
    }

    try {
      return new URL(link).hostname.replace(/^www\./, '');
    } catch {
      return 'Banner ad';
    }
  }

  private readPlacementFromQuery(): AdPlacement {
    const value = this.route.snapshot.queryParamMap.get('placement');
    return value === 'store promotions' || value === 'banner ads' || value === 'promoted listings'
      ? value
      : 'promoted listings';
  }

  private readStatusFromQuery(): AdStatus {
    const value = this.route.snapshot.queryParamMap.get('status');
    return value === 'active' || value === 'paused' || value === 'expired' ? value : 'active';
  }

  private readPageFromQuery(): number {
    const value = Number(this.route.snapshot.queryParamMap.get('page') ?? '1');
    return Number.isFinite(value) && value > 0 ? Math.floor(value) : 1;
  }
}
