import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroMagnifyingGlass, heroBars3, heroChevronRight } from '@ng-icons/heroicons/outline';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { AuthSessionService } from '../../services/auth-session.service';
import { AuthFlowService } from '../../services/auth-flow.service';
import { LocationService } from '../../services/location.service';
import { SellerMonetizationService } from '../../services/seller-monetization.service';

type SellerMenuEntry = {
  readonly label: string;
  readonly iconSrc: string;
  readonly route: string;
};

@Component({
  selector: 'app-dashboard-navbar',
  imports: [CommonModule, RouterLink, NgIcon, NgOptimizedImage],
  providers: [
    provideIcons({
      heroMagnifyingGlass,
      heroBars3,
      heroChevronRight,
    }),
  ],
  template: `
    <div class="lg:fixed lg:inset-x-0 lg:top-0 lg:z-[30]">
      <header
        class="bg-white text-[#15162B] lg:mx-4 lg:my-1 lg:rounded-full lg:bg-black lg:px-6 lg:text-white lg:shadow-lg"
      >
        <div class="flex h-[72px] items-center justify-between gap-3 px-5 lg:hidden">
          <a
            [routerLink]="homeRoute()"
            class="flex shrink-0 items-center transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6453D9]"
            aria-label="Duduzili seller home"
          >
            <img
              ngSrc="/assets/icons/buyer-header/logo-mobile.svg"
              alt="Duduzili"
              width="111"
              height="24"
              priority
              class="h-6 w-auto object-contain"
            />
          </a>

          <div class="ml-auto flex items-center gap-2">
            <button
              type="button"
              class="flex h-9 items-center justify-between gap-2 rounded-full border border-white bg-[#F3F3F3] py-1 pl-3 pr-1 shadow-[0_0_0_1px_rgba(255,255,255,0.65)]"
              aria-label="Select location"
              aria-haspopup="dialog"
              [attr.aria-expanded]="locationService.isLocationPickerOpen()"
              (click)="locationService.openLocationPicker()"
            >
              <div class="flex items-center gap-1">
                <img
                  ngSrc="/assets/icons/buyer-header/location.svg"
                  alt=""
                  width="16"
                  height="16"
                  class="h-4 w-4 shrink-0"
                />
                <span
                  class="font-['Mona_Sans'] text-[14px] font-medium leading-[1.2] tracking-[0.14px] text-[#373737]"
                >
                  {{ locationService.selectedLocationDisplay().mobile }}
                </span>
              </div>

              <span
                class="flex h-7 w-7 items-center justify-center rounded-full bg-white"
              >
                <img
                  ngSrc="/assets/icons/buyer-header/arrow-down.svg"
                  alt=""
                  width="14"
                  height="14"
                  class="h-[14px] w-[14px]"
                />
              </span>
            </button>

            <div class="relative">
              @if (isAccountMenuOpen()) {
                <button
                  type="button"
                  class="fixed inset-0 z-40 cursor-default bg-transparent"
                  (click)="closeAccountMenu()"
                  aria-label="Close seller account menu"
                ></button>
              }

              <button
                type="button"
                (click)="toggleAccountMenu()"
                class="relative z-50 flex h-9 w-9 items-center justify-center overflow-hidden rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6453D9]"
                aria-haspopup="menu"
                [attr.aria-expanded]="isAccountMenuOpen()"
                aria-label="Open seller account menu"
              >
                <img
                  [ngSrc]="accountAvatarSrc()"
                  [alt]="accountDisplayName()"
                  width="36"
                  height="36"
                  class="h-9 w-9 object-cover"
                />
              </button>

              @if (isAccountMenuOpen()) {
                <div
                  class="absolute right-0 top-[calc(100%+12px)] z-50 w-[304px] overflow-hidden rounded-[24px] border border-black/[0.03] bg-white py-4 text-[#15162B] shadow-[0_6.65px_5.32px_rgba(0,0,0,0.03),0_2.767px_2.214px_rgba(0,0,0,0.02)]"
                  role="menu"
                  aria-label="Seller account menu"
                >
                  <div class="flex flex-col gap-6">
                    <div class="flex items-center gap-1.5 px-3">
                      <div
                        class="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full"
                      >
                        <img
                          [ngSrc]="accountAvatarSrc()"
                          [alt]="accountDisplayName()"
                          width="36"
                          height="36"
                          class="h-9 w-9 object-cover"
                        />
                      </div>
                      <div class="min-w-0">
                        <p class="truncate text-sm font-medium tracking-[-0.07px] text-[#15162B]">
                          {{ accountDisplayName() }}
                        </p>
                        <p class="truncate text-[10px] font-normal text-[#72737F]">Seller mode</p>
                      </div>
                    </div>

                    <div class="flex flex-col gap-3">
                      <div class="flex flex-col gap-2">
                        @for (item of sellerMenuEntries(); track item.label) {
                          <button
                            type="button"
                            (click)="goToSellerRoute(item.route)"
                            class="flex h-7 w-full items-center gap-2 rounded-lg bg-white px-3 py-2 text-left transition hover:bg-[#F7F8FA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#15162B]"
                            role="menuitem"
                          >
                            <img
                              [ngSrc]="item.iconSrc"
                              alt=""
                              width="16"
                              height="16"
                              class="h-4 w-4 shrink-0"
                            />
                            <span
                              class="text-sm font-medium leading-none tracking-[-0.08px] text-[#15162B]"
                            >
                              {{ item.label }}
                            </span>
                          </button>
                        }
                      </div>

                      <div class="flex flex-col gap-3">
                        <div class="h-px w-full bg-[#E8E8EB]"></div>

                        <button
                          type="button"
                          (click)="switchToBuyerMode()"
                          class="flex h-7 w-full items-center gap-2 rounded-lg bg-white px-3 py-2 text-left transition hover:bg-[#F7F8FA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#15162B]"
                          role="menuitem"
                        >
                          <img
                            ngSrc="assets/icons/seller-menu-switch.svg"
                            alt=""
                            width="16"
                            height="16"
                            class="h-4 w-4 shrink-0"
                          />
                          <span
                            class="text-sm font-medium leading-none tracking-[-0.08px] text-[#15162B]"
                          >
                            Switch to buyer mode
                          </span>
                        </button>

                        <button
                          type="button"
                          (click)="logOut()"
                          class="flex h-7 w-full items-center gap-2 rounded-lg bg-white px-3 py-2 text-left transition hover:bg-[#FFF5F5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF2524]"
                          role="menuitem"
                        >
                          <img
                            ngSrc="assets/icons/seller-menu-logout.svg"
                            alt=""
                            width="16"
                            height="16"
                            class="h-4 w-4 shrink-0"
                          />
                          <span
                            class="text-sm font-medium leading-none tracking-[-0.08px] text-[#FF2524]"
                          >
                            Log out
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>

        <div class="hidden h-16 items-center justify-between lg:flex">
          <a
            [routerLink]="homeRoute()"
            class="group flex items-center transition-opacity hover:opacity-90"
            aria-label="Duduzili seller home"
          >
            <img
              ngSrc="assets/icons/seller-shell-logo.svg"
              alt="Duduzili"
              width="112"
              height="26"
              class="h-[26px] w-auto object-contain"
            />
          </a>

          <div class="group mx-6 hidden max-w-lg flex-1 md:block">
            <div class="relative">
              <div class="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                <ng-icon
                  name="heroMagnifyingGlass"
                  class="text-white/40 transition-colors group-focus-within:text-white"
                ></ng-icon>
              </div>

              <input
                type="text"
                [value]="searchQuery()"
                #dashboardSearchInput
                (input)="updateSearchQuery(dashboardSearchInput.value)"
                (keydown.enter)="runSearch()"
                placeholder="Search products, stores, or categories"
                class="w-full rounded-full border-none bg-white/10 py-2 pl-12 pr-12 text-sm text-white outline-none transition-all placeholder:text-white/40 focus:bg-white/20 focus:ring-0"
              />

              @if (searchQuery()) {
                <button
                  type="button"
                  (click)="clearSearch()"
                  class="absolute inset-y-0 right-4 flex items-center text-white/30 transition hover:text-white/60"
                  aria-label="Clear search"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
              }
            </div>
          </div>

          <div class="flex items-center gap-6">
            <button
              type="button"
              (click)="switchToBuyerMode()"
              class="hidden text-xs font-semibold tracking-wide text-white/80 transition-colors hover:text-white sm:block"
            >
              Switch to buyer mode
            </button>

            <div class="relative">
              @if (isAccountMenuOpen()) {
                <button
                  type="button"
                  class="fixed inset-0 z-40 cursor-default bg-transparent"
                  (click)="closeAccountMenu()"
                  aria-label="Close seller account menu"
                ></button>
              }

              <button
                type="button"
                (click)="toggleAccountMenu()"
                class="relative z-50 flex items-center gap-2 rounded-full border border-white/10 bg-white p-1 pr-3 text-[#15162B] transition-all hover:bg-white/90"
                aria-haspopup="menu"
                [attr.aria-expanded]="isAccountMenuOpen()"
                aria-label="Open seller account menu"
              >
                <div
                  class="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full ring-2 ring-white/10"
                >
                  <img
                    [ngSrc]="accountAvatarSrc()"
                    [alt]="accountDisplayName()"
                    width="28"
                    height="28"
                    class="h-7 w-7 object-cover"
                  />
                </div>
                <ng-icon name="heroBars3" class="text-lg text-[#15162B]"></ng-icon>
              </button>

              @if (isAccountMenuOpen()) {
                <div
                  class="absolute right-0 top-[calc(100%+12px)] z-50 w-[304px] overflow-hidden rounded-[24px] border border-black/[0.03] bg-white py-4 text-[#15162B] shadow-[0_6.65px_5.32px_rgba(0,0,0,0.03),0_2.767px_2.214px_rgba(0,0,0,0.02)]"
                  role="menu"
                  aria-label="Seller account menu"
                >
                  <div class="flex flex-col gap-6">
                    <div class="flex items-center gap-1.5 px-3">
                      <div
                        class="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full"
                      >
                        <img
                          [ngSrc]="accountAvatarSrc()"
                          [alt]="accountDisplayName()"
                          width="36"
                          height="36"
                          class="h-9 w-9 object-cover"
                        />
                      </div>
                      <div class="min-w-0">
                        <p class="truncate text-sm font-medium tracking-[-0.07px] text-[#15162B]">
                          {{ accountDisplayName() }}
                        </p>
                        <p class="truncate text-[10px] font-normal text-[#72737F]">Seller mode</p>
                      </div>
                    </div>

                    <div class="flex flex-col gap-3">
                      <div class="flex flex-col gap-2">
                        @for (item of sellerMenuEntries(); track item.label) {
                          <button
                            type="button"
                            (click)="goToSellerRoute(item.route)"
                            class="flex h-7 w-full items-center gap-2 rounded-lg bg-white px-3 py-2 text-left transition hover:bg-[#F7F8FA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#15162B]"
                            role="menuitem"
                          >
                            <img
                              [ngSrc]="item.iconSrc"
                              alt=""
                              width="16"
                              height="16"
                              class="h-4 w-4 shrink-0"
                            />
                            <span
                              class="text-sm font-medium leading-none tracking-[-0.08px] text-[#15162B]"
                            >
                              {{ item.label }}
                            </span>
                          </button>
                        }
                      </div>

                      <div class="flex flex-col gap-3">
                        <div class="h-px w-full bg-[#E8E8EB]"></div>

                        <button
                          type="button"
                          (click)="switchToBuyerMode()"
                          class="flex h-7 w-full items-center gap-2 rounded-lg bg-white px-3 py-2 text-left transition hover:bg-[#F7F8FA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#15162B]"
                          role="menuitem"
                        >
                          <img
                            ngSrc="assets/icons/seller-menu-switch.svg"
                            alt=""
                            width="16"
                            height="16"
                            class="h-4 w-4 shrink-0"
                          />
                          <span
                            class="text-sm font-medium leading-none tracking-[-0.08px] text-[#15162B]"
                          >
                            Switch to buyer mode
                          </span>
                        </button>

                        <button
                          type="button"
                          (click)="logOut()"
                          class="flex h-7 w-full items-center gap-2 rounded-lg bg-white px-3 py-2 text-left transition hover:bg-[#FFF5F5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF2524]"
                          role="menuitem"
                        >
                          <img
                            ngSrc="assets/icons/seller-menu-logout.svg"
                            alt=""
                            width="16"
                            height="16"
                            class="h-4 w-4 shrink-0"
                          />
                          <span
                            class="text-sm font-medium leading-none tracking-[-0.08px] text-[#FF2524]"
                          >
                            Log out
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </header>
    </div>
    <div class="hidden h-[72px] lg:block" aria-hidden="true"></div>

    @if (isLogoutConfirmOpen()) {
      <div
        class="fixed inset-0 z-[220] bg-black/40 p-4 lg:hidden"
        (click)="isLogoutConfirmOpen.set(false)"
      >
        <div
          class="fixed inset-x-0 bottom-0 w-full overflow-hidden rounded-t-[28px] rounded-b-[28px] bg-white px-5 pb-6 pt-4 shadow-[0_-20px_50px_-30px_rgba(19,27,45,0.45)]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="seller-logout-confirm-title-mobile"
          (click)="$event.stopPropagation()"
        >
          <div class="mx-auto h-1.5 w-14 rounded-full bg-[#E6E7EC]"></div>

          <div class="mt-5 flex flex-col items-center text-center">
            <div class="relative h-[108px] w-[108px]">
              <div class="absolute inset-0 rounded-full bg-[#FFF1F1]"></div>
              <div
                class="absolute left-1/2 top-[14px] h-[80px] w-[80px] -translate-x-1/2 rounded-full bg-[#FFD9D9]"
              ></div>
              <div
                class="absolute left-1/2 top-[31px] flex h-[46px] w-[46px] -translate-x-1/2 items-center justify-center rounded-[16px] bg-[#FF3131] shadow-[0_10px_24px_rgba(255,49,49,0.18)]"
              >
                <svg class="h-6 w-6" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                  <path
                    d="M14 9.15v5.95"
                    stroke="white"
                    stroke-width="2.2"
                    stroke-linecap="round"
                  />
                  <circle cx="14" cy="18.25" r="1.4" fill="white" />
                </svg>
              </div>
            </div>

            <h3
              id="seller-logout-confirm-title-mobile"
              class="mt-4 text-[22px] font-semibold leading-7 text-[#1F2230]"
            >
              Are you sure?
            </h3>
            <p class="mt-3 max-w-[320px] text-[15px] leading-[1.35] text-[#5E5E5E]">
              Logging out will temporarily hide all your personal data, including matches and dates.
              To see again, simply log back in to your account.
            </p>
          </div>

          <div class="mt-8 space-y-3">
            <button
              type="button"
              (click)="confirmLogout()"
              class="flex h-[52px] w-full items-center justify-center rounded-full border border-[#FF7B7B] bg-[linear-gradient(180deg,#FF6B73_0%,#FF5E67_100%)] px-5 text-[16px] font-semibold leading-6 text-white shadow-[0_6px_16px_rgba(255,95,103,0.32)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5E67] focus-visible:ring-offset-2"
            >
              Log out
            </button>
            <button
              type="button"
              (click)="isLogoutConfirmOpen.set(false)"
              class="flex h-[52px] w-full items-center justify-center rounded-full bg-[#F5F5F5] px-5 text-[16px] font-semibold leading-6 text-[#171717] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1B1D]"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <div
        class="fixed inset-0 z-[220] hidden items-center justify-center bg-black/40 p-4 lg:flex"
        (click)="isLogoutConfirmOpen.set(false)"
      >
        <div
          class="relative w-full max-w-[430px] overflow-hidden rounded-[24px] bg-white px-6 pb-10 pt-8 shadow-[0_30px_80px_-40px_rgba(19,27,45,0.45)]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="seller-logout-confirm-title"
          (click)="$event.stopPropagation()"
        >
          <div class="flex flex-col items-center text-center">
            <div class="relative h-[121px] w-[121px]">
              <div class="absolute inset-0 rounded-full bg-[#FFF1F1]"></div>
              <div
                class="absolute left-1/2 top-[15px] h-[91px] w-[91px] -translate-x-1/2 rounded-full bg-[#FFD9D9]"
              ></div>
              <div
                class="absolute left-1/2 top-[35px] flex h-[52px] w-[52px] -translate-x-1/2 items-center justify-center rounded-[18px] bg-[#FF3131] shadow-[0_10px_24px_rgba(255,49,49,0.18)]"
              >
                <svg class="h-7 w-7" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                  <path
                    d="M14 9.15v5.95"
                    stroke="white"
                    stroke-width="2.2"
                    stroke-linecap="round"
                  />
                  <circle cx="14" cy="18.25" r="1.4" fill="white" />
                </svg>
              </div>
            </div>

            <h3
              id="seller-logout-confirm-title"
              class="mt-[14px] text-[24px] font-semibold leading-8 text-[#1F2230]"
            >
              Are you sure?
            </h3>
            <p class="mt-3 max-w-[332px] text-[16px] leading-[1.2] text-[#5E5E5E]">
              Logging out will temporarily hide all your personal data, including matches and dates.
              To see again, simply log back in to your account.
            </p>
          </div>

          <div class="mt-9 space-y-3">
            <button
              type="button"
              (click)="confirmLogout()"
              class="flex h-[52px] w-full items-center justify-center rounded-full border border-[#FF7B7B] bg-[linear-gradient(180deg,#FF6B73_0%,#FF5E67_100%)] px-5 text-[16px] font-semibold leading-6 text-white shadow-[0_6px_16px_rgba(255,95,103,0.32)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5E67] focus-visible:ring-offset-2"
            >
              Log out
            </button>
            <button
              type="button"
              (click)="isLogoutConfirmOpen.set(false)"
              class="flex h-[52px] w-full items-center justify-center rounded-full bg-[#F5F5F5] px-5 text-[16px] font-semibold leading-6 text-[#171717] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1B1D]"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardNavbarComponent {
  private readonly router = inject(Router);
  private readonly authSession = inject(AuthSessionService);
  private readonly authFlow = inject(AuthFlowService);
  protected readonly locationService = inject(LocationService);

  readonly homeRoute = computed(() => {
    if (!this.authSession.isAuthenticated()) {
      return '/';
    }
    return this.authSession.isSuperuser() ? '/admin' : '/en';
  });

  private readonly sellerMonetization = inject(SellerMonetizationService);

  readonly subscriptionsEnabled = computed(() => this.authSession.subscriptionsEnabled());

  readonly sellerMenuEntries = computed<SellerMenuEntry[]>(() => {
    const list: SellerMenuEntry[] = [
      {
        label: 'Listings',
        iconSrc: 'assets/icons/seller-menu-listings.svg',
        route: '/seller/listings',
      },
      {
        label: 'My Stores',
        iconSrc: 'assets/icons/seller-menu-stores.svg',
        route: '/seller/my-stores',
      },
      {
        label: 'Messages',
        iconSrc: 'assets/icons/seller-menu-messages.svg',
        route: '/seller/messages',
      },
      {
        label: 'Requests',
        iconSrc: 'assets/icons/seller-menu-requests.svg',
        route: '/seller/requests/offers',
      },
    ];

    if (this.subscriptionsEnabled()) {
      if (this.sellerMonetization.hasBannerPromotionsAccess()) {
        list.push({
          label: 'Banner promotions',
          iconSrc: 'assets/icons/seller-menu-promotions.svg',
          route: '/seller/promotions',
        });
      }
      list.push(
        { label: 'Ads', iconSrc: 'assets/icons/seller-menu-ads.svg', route: '/seller/ads/plans' }
      );
    }

    list.push({
      label: 'Analytics',
      iconSrc: 'assets/icons/seller-menu-analytics.svg',
      route: '/seller/analytics',
    });

    if (this.subscriptionsEnabled()) {
      list.push({ label: 'Wallet', iconSrc: 'assets/icons/seller-menu-wallet.svg', route: '/seller/wallet' });
    }

    list.push(
      {
        label: 'Account settings',
        iconSrc: 'assets/icons/seller-menu-settings.svg',
        route: '/seller/settings',
      },
      {
        label: 'Notifications',
        iconSrc: 'assets/icons/seller-menu-notifications.svg',
        route: '/seller/notifications',
      }
    );

    return list;
  });

  readonly searchQuery = signal('');
  readonly isAccountMenuOpen = signal(false);
  readonly isLogoutConfirmOpen = signal(false);
  protected readonly fallbackAvatarSrc = '/assets/images/auth-avatar-fallback.svg';
  protected readonly currentUser = this.authSession.user;
  protected readonly accountAvatarSrc = computed(
    () => this.currentUser()?.avatar?.trim() || this.fallbackAvatarSrc,
  );
  protected readonly accountDisplayName = computed(() => {
    const user = this.currentUser();
    return user?.full_name?.trim() || user?.username?.trim() || 'Seller';
  });

  updateSearchQuery(value: string): void {
    this.searchQuery.set(value);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  toggleAccountMenu(): void {
    this.isAccountMenuOpen.update((value) => !value);
  }

  closeAccountMenu(): void {
    this.isAccountMenuOpen.set(false);
  }

  runSearch(): void {
    const query = this.searchQuery().trim() || 'iPhone';
    void this.router.navigate(['/search'], { queryParams: { q: query } });
  }

  goToSellerRoute(path: string): void {
    this.closeAccountMenu();
    void this.router.navigateByUrl(path);
  }

  switchToBuyerMode(): void {
    this.closeAccountMenu();
    void this.router.navigate(['/en']);
  }

  logOut(): void {
    this.closeAccountMenu();
    this.isLogoutConfirmOpen.set(true);
  }

  async confirmLogout(): Promise<void> {
    this.isLogoutConfirmOpen.set(false);
    await this.authFlow.logout();
  }
}
