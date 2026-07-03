import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthSessionService } from '../../services/auth-session.service';
import { NotificationsService } from '../../services/notifications.service';
import { SellerMonetizationService } from '../../services/seller-monetization.service';
import { AppToastService } from '../../services/app-toast.service';

type SidebarLink = {
  readonly label: string;
  readonly route: string;
  readonly icon: string;
};

@Component({
  selector: 'app-dashboard-sidebar',
  imports: [NgOptimizedImage, RouterLink, RouterLinkActive],
  template: `
    <aside class="flex h-full w-full flex-col overflow-y-auto bg-inherit px-4 pb-4 pt-6">
      <div class="space-y-7">
        <section>
          <p class="px-[10px] text-[12px] font-medium uppercase tracking-[0.08em] text-[#959595]">
            Selling
          </p>
          <nav class="mt-2 space-y-2">
            @for (item of sellingLinks; track item.label) {
              <a
                [routerLink]="item.route"
                routerLinkActive="bg-white text-[#1F1F1F]"
                class="group flex h-10 items-center justify-between rounded-full px-2 py-1 text-[#777777] transition hover:bg-white/70"
              >
                <span class="flex items-center gap-2 px-1">
                  <img [ngSrc]="item.icon" alt="" width="16" height="16" class="h-4 w-4 shrink-0" />
                  <span class="text-[14px] font-medium">{{ item.label }}</span>
                </span>
              </a>
            }

            <div class="space-y-2">
              <button
                type="button"
                (click)="isRequestsExpanded.set(!isRequestsExpanded())"
                class="flex h-10 w-full items-center justify-between rounded-full px-2 py-1 text-[#777777] transition hover:bg-white/70"
              >
                <span class="flex items-center gap-2 px-1">
                  <img
                    ngSrc="/assets/icons/seller-sidebar-requests.svg"
                    alt=""
                    width="16"
                    height="16"
                    class="h-4 w-4 shrink-0"
                  />
                  <span class="text-[14px] font-medium">Requests</span>
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 text-[#777777]"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  @if (isRequestsExpanded()) {
                    <path
                      fill-rule="evenodd"
                      d="M5.22 12.28a.75.75 0 001.06 0L10 8.56l3.72 3.72a.75.75 0 001.06-1.06l-4.25-4.25a.75.75 0 00-1.06 0L5.22 11.22a.75.75 0 000 1.06z"
                      clip-rule="evenodd"
                    />
                  } @else {
                    <path
                      fill-rule="evenodd"
                      d="M14.78 7.72a.75.75 0 00-1.06 0L10 11.44 6.28 7.72a.75.75 0 10-1.06 1.06l4.25 4.25a.75.75 0 001.06 0l4.25-4.25a.75.75 0 000-1.06z"
                      clip-rule="evenodd"
                    />
                  }
                </svg>
              </button>

              @if (isRequestsExpanded()) {
                <div class="ml-[19px] space-y-2 border-l border-[#E5E5E5] pl-0">
                  <a
                    routerLink="/seller/requests/offers"
                    routerLinkActive="text-[#1F1F1F] bg-white"
                    class="relative flex h-10 items-center rounded-full pl-[27px] pr-3 text-[14px] font-medium text-[#777777] transition hover:bg-white/70"
                  >
                    <span
                      class="absolute left-0 top-1/2 h-5 w-[1px] -translate-y-1/2 bg-[#E5E5E5]"
                    ></span>
                    Offers
                  </a>
                  <a
                    routerLink="/seller/requests/callbacks"
                    routerLinkActive="text-[#1F1F1F] bg-white"
                    class="relative flex h-10 items-center rounded-full pl-[27px] pr-3 text-[14px] font-medium text-[#777777] transition hover:bg-white/70"
                  >
                    <span
                      class="absolute left-0 top-1/2 h-5 w-[1px] -translate-y-1/2 bg-[#E5E5E5]"
                    ></span>
                    Call back requests
                  </a>
                </div>
              }
            </div>
          </nav>
        </section>

        <section>
          <p class="px-[10px] text-[12px] font-medium uppercase tracking-[0.08em] text-[#959595]">
            Performance
          </p>
          <nav class="mt-2 space-y-2">
            @if (subscriptionsEnabled()) {
              <a
                [routerLink]="sellerMonetization.hasBannerPromotionsAccess() ? '/seller/promotions' : null"
                [routerLinkActive]="sellerMonetization.hasBannerPromotionsAccess() ? 'bg-white text-[#1F1F1F]' : ''"
                (click)="handlePromotionsClick($event)"
                [attr.title]="!sellerMonetization.hasBannerPromotionsAccess() ? 'Upgrade your plan to access this feature.' : null"
                [class.opacity-50]="!sellerMonetization.hasBannerPromotionsAccess()"
                class="group flex h-10 items-center justify-between rounded-full px-2 py-1 text-[#777777] transition hover:bg-white/70"
              >
                <span class="flex items-center gap-2 px-1">
                  <img
                    ngSrc="/assets/icons/seller-sidebar-promotions.svg"
                    alt=""
                    width="16"
                    height="16"
                    class="h-4 w-4 shrink-0"
                  />
                  <span class="text-[14px] font-medium">Banner promotions</span>
                </span>
              </a>

              <div class="space-y-2">
                <button
                  type="button"
                  (click)="isAdsExpanded.set(!isAdsExpanded())"
                  class="flex h-10 w-full items-center justify-between rounded-full px-2 py-1 text-[#777777] transition hover:bg-white/70"
                  [class.bg-white]="isAdsRouteActive()"
                  [class.text-[#1F1F1F]]="isAdsRouteActive()"
                >
                  <span class="flex items-center gap-2 px-1">
                    <img
                      ngSrc="/assets/icons/seller-sidebar-ads.svg"
                      alt=""
                      width="16"
                      height="16"
                      class="h-4 w-4 shrink-0"
                    />
                    <span class="text-[14px] font-medium">Ads</span>
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4 text-[#777777]"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    @if (isAdsExpanded()) {
                      <path
                        fill-rule="evenodd"
                        d="M5.22 12.28a.75.75 0 001.06 0L10 8.56l3.72 3.72a.75.75 0 001.06-1.06l-4.25-4.25a.75.75 0 00-1.06 0L5.22 11.22a.75.75 0 000 1.06z"
                        clip-rule="evenodd"
                      />
                    } @else {
                      <path
                        fill-rule="evenodd"
                        d="M14.78 7.72a.75.75 0 00-1.06 0L10 11.44 6.28 7.72a.75.75 0 10-1.06 1.06l4.25 4.25a.75.75 0 001.06 0l4.25-4.25a.75.75 0 000-1.06z"
                        clip-rule="evenodd"
                      />
                    }
                  </svg>
                </button>

                @if (isAdsExpanded()) {
                  <div class="ml-[19px] space-y-2 border-l border-[#E5E5E5] pl-0">
                    <a
                      routerLink="/seller/ads/plans"
                      routerLinkActive="text-[#1F1F1F] bg-white"
                      class="relative flex h-10 items-center rounded-full pl-[27px] pr-3 text-[14px] font-medium text-[#777777] transition hover:bg-white/70"
                    >
                      <span
                        class="absolute left-0 top-1/2 h-5 w-[1px] -translate-y-1/2 bg-[#E5E5E5]"
                      ></span>
                      Plans
                    </a>
                    <a
                      routerLink="/seller/ads/running"
                      routerLinkActive="text-[#1F1F1F] bg-white"
                      class="relative flex h-10 items-center rounded-full pl-[27px] pr-3 text-[14px] font-medium text-[#777777] transition hover:bg-white/70"
                    >
                      <span
                        class="absolute left-0 top-1/2 h-5 w-[1px] -translate-y-1/2 bg-[#E5E5E5]"
                      ></span>
                      Running Ads
                    </a>
                    <a
                      routerLink="/seller/ads/billing-history"
                      routerLinkActive="text-[#1F1F1F] bg-white"
                      class="relative flex h-10 items-center rounded-full pl-[27px] pr-3 text-[14px] font-medium text-[#777777] transition hover:bg-white/70"
                    >
                      <span
                        class="absolute left-0 top-1/2 h-5 w-[1px] -translate-y-1/2 bg-[#E5E5E5]"
                      ></span>
                      Billing history
                    </a>
                  </div>
                }
              </div>
            }

            @for (item of performanceLinks(); track item.label) {
              <a
                [routerLink]="item.route"
                routerLinkActive="bg-white text-[#1F1F1F]"
                class="group flex h-10 items-center justify-between rounded-full px-2 py-1 text-[#777777] transition hover:bg-white/70"
              >
                <span class="flex items-center gap-2 px-1">
                  <img [ngSrc]="item.icon" alt="" width="16" height="16" class="h-4 w-4 shrink-0" />
                  <span class="text-[14px] font-medium">{{ item.label }}</span>
                </span>
              </a>
            }
          </nav>
        </section>

        <section>
          <p class="px-[10px] text-[12px] font-medium uppercase tracking-[0.08em] text-[#959595]">
            Account
          </p>
          <nav class="mt-2 space-y-2">
            @for (item of accountLinks; track item.label) {
              <a
                [routerLink]="item.route"
                routerLinkActive="bg-white text-[#1F1F1F]"
                class="group flex h-10 items-center justify-between rounded-full px-2 py-1 text-[#777777] transition hover:bg-white/70"
              >
                <span class="flex items-center gap-2 px-1">
                  <img [ngSrc]="item.icon" alt="" width="16" height="16" class="h-4 w-4 shrink-0" />
                  <span class="text-[14px] font-medium">{{ item.label }}</span>
                </span>
                @if (item.label === 'Notifications' && notificationBadge()) {
                  <span
                    class="inline-flex min-w-5 items-center justify-center rounded-full bg-[#EE0D0D] px-1 text-[8px] font-semibold leading-[14px] text-white"
                  >
                    {{ notificationBadge() }}
                  </span>
                }
              </a>
            }
          </nav>
        </section>
      </div>

      <div class="mt-auto pt-6">
        <div class="overflow-hidden rounded-[20px] bg-white px-6 pb-6 pt-5">
          <div class="relative mx-auto flex w-[120px] flex-col items-center gap-3">
            <div class="relative flex h-[120px] w-[120px] items-center justify-center">
              <div
                class="absolute inset-[6px] rotate-[-5deg] rounded-[10px] border border-[#F0F0F0] bg-white shadow-[0_4.737px_12.631px_rgba(199,199,199,0.25)]"
              ></div>
              <img
                ngSrc="/assets/images/seller-sidebar-qr-code.png"
                alt="QR code to download the Duduzili mobile app"
                width="109"
                height="109"
                class="relative z-10 h-[109px] w-[109px] rounded-[10px] object-cover"
              />
            </div>
            <div class="flex items-center justify-center gap-4">
              <span class="text-[24px] leading-none text-[#6C6C6C]">🤖</span>
              <span class="h-4 w-px bg-[#D8D8D8]"></span>
              <span class="text-[20px] leading-none text-[#6C6C6C]"></span>
            </div>
          </div>
          <p class="mt-5 text-center text-[14px] font-medium leading-[1.2] text-[#99A2B1]">
            Scan QR code to
            <br />
            download mobile app
          </p>
        </div>
      </div>
    </aside>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardSidebarComponent {
  private readonly authSession = inject(AuthSessionService);
  private readonly router = inject(Router);
  private readonly notificationsService = inject(NotificationsService);
  private readonly appToastService = inject(AppToastService);
  protected readonly sellerMonetization = inject(SellerMonetizationService);

  handlePromotionsClick(event: MouseEvent): void {
    if (!this.sellerMonetization.hasBannerPromotionsAccess()) {
      event.preventDefault();
      event.stopPropagation();
      this.appToastService.show({
        message: 'Upgrade your plan to access this feature.',
      });
    }
  }

  readonly isRequestsExpanded = signal(false);
  readonly isAdsExpanded = signal(this.router.url.startsWith('/seller/ads'));
  readonly subscriptionsEnabled = computed(() => this.authSession.subscriptionsEnabled());

  readonly sellingLinks: readonly SidebarLink[] = [
    { label: 'Listings', route: '/seller/listings', icon: '/assets/icons/seller-sidebar-listings.svg' },
    { label: 'My Stores', route: '/seller/my-stores', icon: '/assets/icons/seller-sidebar-stores.svg' },
    { label: 'Chats', route: '/seller/messages', icon: '/assets/icons/seller-sidebar-messages.svg' },
  ];

  readonly performanceLinks = computed(() => {
    const list: SidebarLink[] = [
      { label: 'Analytics', route: '/seller/analytics', icon: '/assets/icons/seller-sidebar-analytics.svg' },
    ];
    if (this.subscriptionsEnabled()) {
      list.push({ label: 'Wallet', route: '/seller/wallet', icon: '/assets/icons/seller-sidebar-wallet.svg' });
    }
    return list;
  });

  readonly notificationBadge = this.notificationsService.unreadBadge;

  readonly accountLinks: readonly SidebarLink[] = [
    {
      label: 'Account settings',
      route: '/seller/settings',
      icon: '/assets/icons/seller-sidebar-settings.svg',
    },
    {
      label: 'Notifications',
      route: '/seller/notifications',
      icon: '/assets/icons/seller-sidebar-notifications.svg',
    },
  ];

  constructor() {
    this.notificationsService.refreshUnreadCount();
  }

  isAdsRouteActive(): boolean {
    return this.router.url.startsWith('/seller/ads');
  }
}
