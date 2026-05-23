import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  CreateBannerAdModalComponent,
  CreateBannerAdPayload,
} from './components/create-banner-ad-modal.component';
import { BannerPromotionsEmptyIllustrationComponent } from './components/banner-promotions-empty-illustration.component';
import {
  SellerMonetizationService,
  type SellerAdRecord,
} from '../../services/seller-monetization.service';
import { AppToastService } from '../../services/app-toast.service';

type PromotionStatus = 'active' | 'paused' | 'pending approval' | 'declined' | 'expired';

interface PromotionTab {
  label: string;
  value: PromotionStatus;
}

interface BannerPromotion {
  readonly id: string;
  readonly status: PromotionStatus;
  readonly imageSrc: string;
  readonly mobileImageSrc?: string;
  readonly expiresOn: string;
  readonly sponsorLabel: string;
  readonly views: string;
  readonly clicks: string;
  readonly desktopWidth: number;
  readonly route?: readonly string[];
  readonly showDesktopSponsor?: boolean;
  readonly showMobileSponsor?: boolean;
}

@Component({
  selector: 'app-banner-promotions-page',
  imports: [
    CommonModule,
    NgOptimizedImage,
    RouterLink,
    CreateBannerAdModalComponent,
    BannerPromotionsEmptyIllustrationComponent,
  ],
  template: `
    <div class="mx-auto w-full max-w-[390px] bg-white px-5 pb-[120px] md:hidden">
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <a
            routerLink="/more"
            aria-label="Back to More"
            class="flex h-8 w-8 items-center justify-center rounded-full bg-[#F3F3F3]"
          >
            <img
              ngSrc="/assets/icons/offers-back-mobile.svg"
              width="20"
              height="20"
              alt=""
              class="h-5 w-5"
            />
          </a>
          <h1 class="text-[20px] font-semibold leading-[1.2] text-black">Banner promotions</h1>
        </div>

        @if (promotions().length > 0) {
          <button
            type="button"
            (click)="isCreateModalOpen.set(true)"
            class="inline-flex h-10 w-10 items-center justify-center rounded-[64px] border border-white bg-[#6453D9] text-white shadow-[0px_4px_12px_rgba(81,35,173,0.33),0px_0px_0px_1px_#6B5BD5]"
            aria-label="Promote banner"
          >
            <img
              ngSrc="/assets/icons/banner-promotions-empty-add.svg"
              width="18"
              height="18"
              alt=""
              class="h-[18px] w-[18px]"
            />
          </button>
        }
      </div>
      <div
        class="mt-6 flex gap-[10px] overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        @for (tab of tabs; track tab.value) {
          <button
            type="button"
            (click)="selectTab(tab.value)"
            [attr.aria-pressed]="activeTab() === tab.value"
            [class]="
              activeTab() === tab.value
                ? 'shrink-0 rounded-[16px] bg-[#1A1A1A] px-4 py-[10px] text-[14px] font-medium leading-5 text-white'
                : 'shrink-0 rounded-[16px] bg-[#F4F4F4] px-4 py-[10px] text-[14px] font-medium leading-5 text-black'
            "
          >
            {{ tab.label }} ({{ countByStatus(tab.value) }})
          </button>
        }
      </div>

      @if (promotions().length > 0) {
        @if (visiblePromotions().length > 0) {
          <div class="mt-6 space-y-[17px]">
            @for (promotion of visiblePromotions(); track promotion.id) {
              <article
                class="w-full overflow-hidden rounded-[20.639px] border border-[#EAEAEA] bg-white p-[3.44px]"
              >
                <a [routerLink]="promotion.route ?? ['/promotions']" class="block">
                  <div class="relative h-[192.629px] overflow-hidden rounded-[20.639px]">
                    <img
                      [src]="promotion.mobileImageSrc ?? promotion.imageSrc"
                      alt=""
                      class="h-full w-full object-cover"
                    />

                    <div
                      class="absolute left-[6.62px] top-[6.45px] rounded-[8px] bg-[#F1FFAC] px-[6px] py-[2px] text-left text-[12px] font-medium leading-4 text-[#4E3E07]"
                    >
                      Active until: {{ promotion.expiresOn }}
                    </div>

                    @if (promotion.showMobileSponsor) {
                      <div [class]="mobileStatusBadgeClass(promotion)">
                        @if (statusBadgeIcon(promotion.status); as icon) {
                          <img
                            [ngSrc]="icon"
                            width="14"
                            height="14"
                            alt=""
                            class="h-[14px] w-[14px] shrink-0"
                          />
                        }
                        {{ statusBadgeLabel(promotion) }}
                      </div>
                    }
                  </div>

                  <div
                    class="flex items-center gap-[10px] px-4 pb-[14px] pt-[8.6px] text-[#959595]"
                  >
                    <span class="inline-flex items-center gap-[2px] text-[14px] leading-4">
                      <img
                        ngSrc="/assets/icons/banner-promotions-eye.svg"
                        width="14"
                        height="14"
                        alt=""
                        class="h-[14px] w-[14px]"
                      />
                      {{ promotion.views }}
                    </span>
                    <span class="inline-flex items-center gap-[2px] text-[14px] leading-4">
                      <img
                        ngSrc="/assets/icons/banner-promotions-click.svg"
                        width="14"
                        height="14"
                        alt=""
                        class="h-[14px] w-[14px]"
                      />
                      {{ promotion.clicks }}
                    </span>
                  </div>
                </a>
              </article>
            }
          </div>
        } @else {
          <div class="flex min-h-[320px] items-center justify-center px-6 text-center">
            <div>
              <div class="relative mx-auto mb-6 aspect-[4/3] w-full max-w-[180px]">
                <img
                  ngSrc="assets/images/empty_state.svg"
                  alt="No banner promotions"
                  fill
                  class="object-contain"
                />
              </div>
              <h2 class="text-[18px] font-semibold leading-tight tracking-[-0.03em] text-[#202335]">
                No {{ activeTab() }} banners yet
              </h2>
              <p class="mt-2 text-[13px] text-[#A1A5B0]">
                Switch tabs or promote a new banner to populate this section.
              </p>
            </div>
          </div>
        }
      } @else {
        <div class="flex flex-col items-center px-[22px] pt-[92px] text-center">
          <app-banner-promotions-empty-illustration
            variant="mobile"
          ></app-banner-promotions-empty-illustration>

          <div class="mt-[38px] flex w-full flex-col items-center">
            <h2 class="max-w-[342px] text-[24px] font-medium leading-[1.2] text-[#1A1B1D]">
              You don’t have any running banner promotions
            </h2>

            <p class="mt-2 text-[16px] leading-[1.2] text-[#6C6C6C]">
              Upgrade plan to post banners
            </p>

            <button
              type="button"
              (click)="isCreateModalOpen.set(true)"
              class="mt-8 inline-flex h-[52px] items-center justify-center gap-2 rounded-[64px] border border-white bg-[#6453D9] px-5 shadow-[0px_4px_12px_rgba(81,35,173,0.33),0px_0px_0px_1px_#6B5BD5]"
            >
              <img
                ngSrc="/assets/icons/banner-promotions-empty-add.svg"
                width="20"
                height="20"
                alt=""
                class="h-5 w-5"
              />
              <span class="text-[16px] font-medium leading-5 text-white">Promote banner</span>
            </button>
          </div>
        </div>
      }

      @if (promotions().length > 0) {
        <div class="mt-8 flex items-center justify-between text-[14px] text-[#1A1B1D]">
          <p>{{ totalResults() }} <span class="text-[#8A8F98]">results</span></p>
          <div class="flex items-center gap-3">
            <button
              type="button"
              (click)="previousPage()"
              [disabled]="!hasPreviousPage()"
              class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#EAEAEA] bg-white disabled:opacity-40"
              aria-label="Previous page"
            >
              <img
                ngSrc="/assets/icons/running-ads-arrow-left.svg"
                width="16"
                height="16"
                alt=""
                class="h-4 w-4"
              />
            </button>
            <span>Page {{ currentPage() }}</span>
            <button
              type="button"
              (click)="nextPage()"
              [disabled]="!hasNextPage()"
              class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#EAEAEA] bg-white disabled:opacity-40"
              aria-label="Next page"
            >
              <img
                ngSrc="/assets/icons/running-ads-arrow-right.svg"
                width="16"
                height="16"
                alt=""
                class="h-4 w-4"
              />
            </button>
          </div>
        </div>
      }
    </div>

    <div class="hidden h-full flex-col md:flex">
      <div class="mb-6 flex items-center justify-between gap-4 px-2">
        <h1 class="text-[24px] font-medium leading-none text-[#0D0D0D]">Banner promotions</h1>

        @if (promotions().length > 0) {
          <button
            type="button"
            (click)="isCreateModalOpen.set(true)"
            class="inline-flex h-10 items-center justify-center gap-2 rounded-[64px] border border-white bg-[#6453D9] px-5 shadow-[0px_4px_12px_rgba(81,35,173,0.33),0px_0px_0px_1px_#6B5BD5]"
          >
            <img
              ngSrc="/assets/icons/banner-promotions-empty-add.svg"
              width="18"
              height="18"
              alt=""
              class="h-[18px] w-[18px]"
            />
            <span class="text-[14px] font-medium leading-5 text-white">Promote banner</span>
          </button>
        }
      </div>

      <div
        class="flex h-full flex-1 flex-col rounded-[32px] border border-gray-100/60 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]"
      >
        <div class="mb-8 flex flex-wrap gap-[10px]">
          @for (tab of tabs; track tab.value) {
            <button
              type="button"
              (click)="selectTab(tab.value)"
              [attr.aria-pressed]="activeTab() === tab.value"
              [class]="
                activeTab() === tab.value
                  ? 'rounded-[16px] bg-[#1A1A1A] px-4 py-[10px] text-[14px] font-medium leading-5 text-white'
                  : 'rounded-[16px] bg-[#F4F4F4] px-4 py-[10px] text-[14px] font-medium leading-5 text-black'
              "
            >
              {{ tab.label }} ({{ countByStatus(tab.value) }})
            </button>
          }
        </div>
        @if (promotions().length > 0) {
          <div class="flex-1 px-4 py-5 sm:px-8 sm:py-6">
            @if (visiblePromotions().length > 0) {
              <div class="flex flex-wrap gap-5">
                @for (promotion of visiblePromotions(); track promotion.id) {
                  <article
                    class="overflow-hidden rounded-[24px] border border-[#EAEAEA] bg-white p-1"
                    [style.width.px]="promotion.desktopWidth"
                  >
                    <a [routerLink]="promotion.route ?? ['/promotions']" class="block">
                      <div class="relative h-[224px] overflow-hidden rounded-[24px]">
                        <img [src]="promotion.imageSrc" alt="" class="h-full w-full object-cover" />

                        <div
                          class="absolute left-[7.7px] top-[7.5px] rounded-[8px] bg-[#F1FFAC] px-[6px] py-[2px] text-[14px] font-medium leading-4 text-[#4E3E07]"
                        >
                          Active until: {{ promotion.expiresOn }}
                        </div>

                        @if (promotion.showDesktopSponsor !== false) {
                          <div [class]="desktopStatusBadgeClass(promotion)">
                            @if (statusBadgeIcon(promotion.status); as icon) {
                              <img
                                [ngSrc]="icon"
                                width="14"
                                height="14"
                                alt=""
                                class="h-[14px] w-[14px] shrink-0"
                              />
                            }
                            {{ statusBadgeLabel(promotion) }}
                          </div>
                        }
                      </div>

                      <div
                        class="flex items-center gap-[10px] px-4 pb-[11px] pt-[10px] text-[#959595]"
                      >
                        <span class="inline-flex items-center gap-[2px] text-[14px] leading-4">
                          <img
                            ngSrc="/assets/icons/banner-promotions-eye.svg"
                            width="14"
                            height="14"
                            alt=""
                            class="h-[14px] w-[14px]"
                          />
                          {{ promotion.views }}
                        </span>
                        <span class="inline-flex items-center gap-[2px] text-[14px] leading-4">
                          <img
                            ngSrc="/assets/icons/banner-promotions-click.svg"
                            width="14"
                            height="14"
                            alt=""
                            class="h-[14px] w-[14px]"
                          />
                          {{ promotion.clicks }}
                        </span>
                      </div>
                    </a>
                  </article>
                }
              </div>
            } @else {
              <div
                class="flex min-h-[320px] items-center justify-center rounded-[28px] border border-dashed border-[#E2E3E7] bg-[#FAFAFB] px-6 text-center"
              >
                <div>
                  <h2 class="text-[19px] font-bold text-[#1A1C21]">
                    No {{ activeTab() }} banners yet
                  </h2>
                  <p class="mt-2 text-[13px] font-medium text-[#8A8F98]">
                    Switch tabs or promote a new banner to populate this section.
                  </p>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="flex flex-1 items-center justify-center px-8 py-12">
            <div class="flex flex-col items-center text-center">
              <app-banner-promotions-empty-illustration></app-banner-promotions-empty-illustration>

              <div class="mt-8 flex flex-col items-center">
                <h2 class="text-[28px] font-medium leading-[1.2] text-[#1A1B1D]">
                  You don’t have any running banner promotions
                </h2>

                <p class="mt-2 text-[18px] leading-[1.2] text-[#6C6C6C]">
                  Upgrade plan to post banners
                </p>

                <button
                  type="button"
                  (click)="isCreateModalOpen.set(true)"
                  class="mt-8 inline-flex h-10 items-center justify-center gap-2 rounded-[64px] border border-white bg-[#6453D9] px-5 shadow-[0px_4px_12px_rgba(81,35,173,0.33),0px_0px_0px_1px_#6B5BD5]"
                >
                  <img
                    ngSrc="/assets/icons/banner-promotions-empty-add.svg"
                    width="18"
                    height="18"
                    alt=""
                    class="h-[18px] w-[18px]"
                  />
                  <span class="text-[14px] font-medium leading-5 text-white">Promote banner</span>
                </button>
              </div>
            </div>
          </div>
        }

        @if (promotions().length > 0) {
          <div
            class="mt-auto flex items-center justify-between px-4 pb-5 pt-8 text-[16px] leading-6 text-[#1A1B1D]"
          >
            <p>{{ totalResults() }} <span class="text-[rgba(26,27,29,0.5)]">results</span></p>
            <div class="flex items-center gap-3">
              <button
                type="button"
                (click)="previousPage()"
                [disabled]="!hasPreviousPage()"
                class="inline-flex h-8 w-8 items-center justify-center rounded-[80px] border border-[#EAEAEA] bg-white disabled:opacity-40"
                aria-label="Previous page"
              >
                <img
                  ngSrc="/assets/icons/running-ads-arrow-left.svg"
                  width="16"
                  height="16"
                  alt=""
                  class="h-4 w-4"
                />
              </button>
              <span>Page {{ currentPage() }}</span>
              <button
                type="button"
                (click)="nextPage()"
                [disabled]="!hasNextPage()"
                class="inline-flex h-8 w-8 items-center justify-center rounded-[80px] border border-[#EAEAEA] bg-white disabled:opacity-40"
                aria-label="Next page"
              >
                <img
                  ngSrc="/assets/icons/running-ads-arrow-right.svg"
                  width="16"
                  height="16"
                  alt=""
                  class="h-4 w-4"
                />
              </button>
            </div>
          </div>
        }
      </div>
    </div>

    @if (isCreateModalOpen()) {
      <app-create-banner-ad-modal
        (close)="isCreateModalOpen.set(false)"
        (submit)="onCreateBannerAd($event)"
      ></app-create-banner-ad-modal>
    }
  `,
  host: {
    class: 'block h-full',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BannerPromotionsPageComponent {
  private readonly sellerMonetizationService = inject(SellerMonetizationService);
  private readonly appToastService = inject(AppToastService);
  readonly pausedBadgeIcon = '/assets/icons/banner-status-paused.svg';
  readonly pendingApprovalBadgeIcon = '/assets/icons/banner-status-pending-approval.svg';
  readonly declinedBadgeIcon = '/assets/icons/banner-status-declined.svg';

  readonly tabs: PromotionTab[] = [
    { label: 'Active', value: 'active' },
    { label: 'Paused', value: 'paused' },
    { label: 'Pending approval', value: 'pending approval' },
    { label: 'Declined', value: 'declined' },
    { label: 'Expired', value: 'expired' },
  ];

  readonly promotions = signal<BannerPromotion[]>([]);

  readonly activeTab = signal<PromotionStatus>('active');
  readonly isCreateModalOpen = signal(false);
  // readonly mobileTabs = this.tabs.slice(0, 3);
  readonly currentPage = signal(1);
  readonly totalResults = signal(0);
  readonly hasNextPage = signal(false);
  readonly hasPreviousPage = signal(false);
  readonly statusCounts = signal<Record<PromotionStatus, number>>({
    active: 0,
    paused: 0,
    'pending approval': 0,
    declined: 0,
    expired: 0,
  });

  readonly visiblePromotions = computed(() =>
    this.promotions().filter((promotion) => promotion.status === this.activeTab()),
  );

  constructor() {
    effect(() => {
      this.activeTab();
      this.currentPage();
      this.loadBannerPromotions();
    });
  }

  countByStatus(status: PromotionStatus): number {
    return this.statusCounts()[status];
  }

  statusBadgeLabel(promotion: BannerPromotion): string {
    switch (promotion.status) {
      case 'paused':
        return 'Paused';
      case 'pending approval':
        return 'Pending approval';
      case 'declined':
        return 'Declined';
      default:
        return promotion.sponsorLabel;
    }
  }

  statusBadgeIcon(status: PromotionStatus): string | null {
    switch (status) {
      case 'paused':
        return this.pausedBadgeIcon;
      case 'pending approval':
        return this.pendingApprovalBadgeIcon;
      case 'declined':
        return this.declinedBadgeIcon;
      default:
        return null;
    }
  }

  onCreateBannerAd(payload: CreateBannerAdPayload): void {
    if (!payload.mediaFile) {
      this.appToastService.show({ message: 'Please choose a banner image or video first.' });
      return;
    }

    this.sellerMonetizationService
      .createBannerAd({
        title: payload.title,
        destinationUrl: payload.destinationUrl,
        bannerType: payload.bannerType,
        mediaFile: payload.mediaFile,
      })
      .subscribe({
        next: () => {
          this.isCreateModalOpen.set(false);
          this.activeTab.set('pending approval');
          this.currentPage.set(1);
          this.appToastService.show({ message: 'Banner ad submitted for review.' });
          this.loadBannerPromotions();
        },
        error: () => {
          this.appToastService.show({ message: 'We could not create that banner ad right now.' });
        },
      });
  }

  selectTab(tab: PromotionStatus): void {
    this.activeTab.set(tab);
    this.currentPage.set(1);
  }

  private loadBannerPromotions(): void {
    const status = this.mapApiStatus(this.activeTab());
    this.sellerMonetizationService
      .getMyAds({ page: this.currentPage(), adType: 'banner', status })
      .subscribe({
        next: (response) => {
          const promotions = response.results
            .filter((ad) => ad.ad_type === 'banner')
            .map((ad) => this.mapPromotion(ad));
          this.promotions.set(promotions);
          this.totalResults.set(
            typeof response.count === 'number' ? response.count : promotions.length,
          );
          this.hasNextPage.set(Boolean(response.next));
          this.hasPreviousPage.set(Boolean(response.previous));
          this.statusCounts.set({
            active: response.counts?.banner?.active ?? 0,
            paused: response.counts?.banner?.paused ?? 0,
            'pending approval': response.counts?.banner?.pending ?? 0,
            declined: response.counts?.banner?.rejected ?? 0,
            expired: response.counts?.banner?.expired ?? 0,
          });
        },
        error: () => {
          this.promotions.set([]);
          this.totalResults.set(0);
          this.hasNextPage.set(false);
          this.hasPreviousPage.set(false);
        },
      });
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

  private mapApiStatus(
    status: PromotionStatus,
  ): 'active' | 'paused' | 'pending' | 'rejected' | 'expired' {
    switch (status) {
      case 'pending approval':
        return 'pending';
      case 'declined':
        return 'rejected';
      default:
        return status;
    }
  }

  private mapPromotion(ad: SellerAdRecord): BannerPromotion {
    return {
      id: String(ad.id),
      status: this.mapPromotionStatus(ad.status),
      imageSrc: ad.image || '/assets/images/empty_state.svg',
      mobileImageSrc: ad.image || '/assets/images/empty_state.svg',
      expiresOn: this.formatDate(ad.end_date),
      sponsorLabel: 'Sponsored',
      views: this.formatCompactNumber(ad.total_views),
      clicks: this.formatCompactNumber(ad.total_clicks),
      desktopWidth: 407,
      route: ['/seller/ads/running', String(ad.id)],
      showDesktopSponsor: true,
      showMobileSponsor: true,
    };
  }

  private mapPromotionStatus(status: SellerAdRecord['status']): PromotionStatus {
    switch (status) {
      case 'paused':
        return 'paused';
      case 'pending':
        return 'pending approval';
      case 'rejected':
        return 'declined';
      case 'expired':
        return 'expired';
      default:
        return 'active';
    }
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

  private formatCompactNumber(value: number): string {
    return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(
      value,
    );
  }

  mobileStatusBadgeClass(promotion: BannerPromotion): string {
    switch (promotion.status) {
      case 'paused':
        return 'absolute bottom-[20px] left-[17.2px] inline-flex items-center gap-1 rounded-[8px] bg-[#F3FBF9] px-2 py-1 text-[12px] font-semibold leading-4 text-[#4787FE]';
      case 'pending approval':
        return 'absolute bottom-[20px] left-[17.2px] inline-flex items-center gap-1 rounded-[8px] bg-[#F9F9F9] px-2 py-1 text-[12px] font-semibold leading-4 text-[#EE9C2E]';
      case 'declined':
        return 'absolute bottom-[20px] left-[17.2px] inline-flex items-center gap-1 rounded-[8px] bg-[#FDF6FA] px-2 py-1 text-[12px] font-semibold leading-4 text-[#FF2524]';
      default:
        return 'absolute bottom-[20px] left-[17.2px] rounded-[859.951px] bg-black/50 px-[6.88px] py-[3.44px] text-left text-[12.039px] font-medium leading-[13.759px] text-white backdrop-blur-[1.72px]';
    }
  }

  desktopStatusBadgeClass(promotion: BannerPromotion): string {
    switch (promotion.status) {
      case 'paused':
        return 'absolute bottom-5 left-5 inline-flex items-center gap-1 rounded-[8px] bg-[#F3FBF9] px-2 py-1 text-[12px] font-semibold leading-4 text-[#4787FE]';
      case 'pending approval':
        return 'absolute bottom-5 left-5 inline-flex items-center gap-1 rounded-[8px] bg-[#F9F9F9] px-2 py-1 text-[12px] font-semibold leading-4 text-[#EE9C2E]';
      case 'declined':
        return 'absolute bottom-5 left-5 inline-flex items-center gap-1 rounded-[8px] bg-[#FDF6FA] px-2 py-1 text-[12px] font-semibold leading-4 text-[#FF2524]';
      default:
        return 'absolute bottom-5 left-5 rounded-[1000px] bg-black/50 px-2 py-1 text-[14px] font-medium leading-4 text-white backdrop-blur-[2px]';
    }
  }
}
