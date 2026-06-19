import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroBars3, heroChevronRight, heroMagnifyingGlass } from '@ng-icons/heroicons/outline';
import { AppModeService } from '../../services/app-mode.service';
import { AuthService, type ProfileResponse } from '../../services/auth.service';
import { AuthFlowService } from '../../services/auth-flow.service';
import { AuthSessionService } from '../../services/auth-session.service';
import { LocationService } from '../../services/location.service';

type BuyerMenuEntry = {
  readonly label: string;
  readonly iconSrc: string;
  readonly route: string;
};

@Component({
  selector: 'app-buyer-dashboard-navbar',
  imports: [CommonModule, RouterLink, NgOptimizedImage, NgIcon],
  providers: [
    provideIcons({
      heroBars3,
      heroChevronRight,
      heroMagnifyingGlass,
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
            aria-label="Duduzili home"
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
                  aria-label="Close buyer account menu"
                ></button>
              }

              <button
                type="button"
                (click)="toggleAccountMenu()"
                class="relative z-50 flex h-9 w-9 items-center justify-center overflow-hidden rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6453D9]"
                aria-haspopup="menu"
                [attr.aria-expanded]="isAccountMenuOpen()"
                aria-label="Open buyer account menu"
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
                  aria-label="Buyer account menu"
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
                        <p class="truncate text-[10px] font-normal text-[#72737F]">Buyer mode</p>
                      </div>
                    </div>

                    <div class="flex flex-col gap-3">
                      <div class="flex flex-col gap-2">
                        @for (item of buyerMenuEntries; track item.label) {
                          <button
                            type="button"
                            (click)="goToBuyerRoute(item.route)"
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
                          (click)="switchToSellerMode()"
                          class="flex h-7 w-full items-center gap-2 rounded-lg bg-white px-3 py-2 text-left transition hover:bg-[#F7F8FA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#15162B]"
                          role="menuitem"
                        >
                          <img
                            ngSrc="assets/icons/buyer-menu/arrow-swap-horizontal.svg"
                            alt=""
                            width="16"
                            height="16"
                            class="h-4 w-4 shrink-0"
                          />
                          <span
                            class="text-sm font-medium leading-none tracking-[-0.08px] text-[#15162B]"
                          >
                            Switch to seller mode
                          </span>
                        </button>

                        <button
                          type="button"
                          (click)="logOut()"
                          class="flex h-7 w-full items-center gap-2 rounded-lg bg-white px-3 py-2 text-left transition hover:bg-[#FFF5F5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF2524]"
                          role="menuitem"
                        >
                          <img
                            ngSrc="assets/icons/buyer-menu/logout.svg"
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
            aria-label="Duduzili home"
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
                #buyerSearchInput
                (input)="updateSearchQuery(buyerSearchInput.value)"
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
              (click)="switchToSellerMode()"
              class="hidden text-xs font-semibold tracking-wide text-white/80 transition-colors hover:text-white sm:block"
            >
              Switch to seller mode
            </button>

            <div class="relative">
              @if (isAccountMenuOpen()) {
                <button
                  type="button"
                  class="fixed inset-0 z-40 cursor-default bg-transparent"
                  (click)="closeAccountMenu()"
                  aria-label="Close buyer account menu"
                ></button>
              }

              <button
                type="button"
                (click)="toggleAccountMenu()"
                class="relative z-50 flex items-center gap-2 rounded-full border border-white/10 bg-white p-1 pr-3 text-[#15162B] transition-all hover:bg-white/90"
                aria-haspopup="menu"
                [attr.aria-expanded]="isAccountMenuOpen()"
                aria-label="Open buyer account menu"
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
                  aria-label="Buyer account menu"
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
                        <p class="truncate text-[10px] font-normal text-[#72737F]">Buyer mode</p>
                      </div>
                    </div>

                    <div class="flex flex-col gap-3">
                      <div class="flex flex-col gap-2">
                        @for (item of buyerMenuEntries; track item.label) {
                          <button
                            type="button"
                            (click)="goToBuyerRoute(item.route)"
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
                          (click)="switchToSellerMode()"
                          class="flex h-7 w-full items-center gap-2 rounded-lg bg-white px-3 py-2 text-left transition hover:bg-[#F7F8FA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#15162B]"
                          role="menuitem"
                        >
                          <img
                            ngSrc="assets/icons/buyer-menu/arrow-swap-horizontal.svg"
                            alt=""
                            width="16"
                            height="16"
                            class="h-4 w-4 shrink-0"
                          />
                          <span
                            class="text-sm font-medium leading-none tracking-[-0.08px] text-[#15162B]"
                          >
                            Switch to seller mode
                          </span>
                        </button>

                        <button
                          type="button"
                          (click)="logOut()"
                          class="flex h-7 w-full items-center gap-2 rounded-lg bg-white px-3 py-2 text-left transition hover:bg-[#FFF5F5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF2524]"
                          role="menuitem"
                        >
                          <img
                            ngSrc="assets/icons/buyer-menu/logout.svg"
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
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuyerDashboardNavbarComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly appMode = inject(AppModeService);
  private readonly authService = inject(AuthService);
  private readonly authSession = inject(AuthSessionService);
  private readonly authFlow = inject(AuthFlowService);
  protected readonly locationService = inject(LocationService);

  readonly homeRoute = computed(() => {
    if (!this.authSession.isAuthenticated()) {
      return '/';
    }
    return this.authSession.isSuperuser() ? '/admin' : '/en';
  });
  private hasRequestedBuyerMode = false;

  readonly searchQuery = signal('');
  readonly isAccountMenuOpen = signal(false);
  protected readonly fallbackAvatarSrc = '/assets/images/auth-avatar-fallback.svg';
  protected readonly currentUser = this.authSession.user;
  protected readonly accountAvatarSrc = computed(
    () => this.currentUser()?.avatar?.trim() || this.fallbackAvatarSrc,
  );
  protected readonly accountDisplayName = computed(() => {
    const user = this.currentUser();
    return user?.full_name?.trim() || user?.username?.trim() || 'Buyer';
  });

  protected readonly buyerRoutes = {
    chats: '/chats',
    wishlist: '/wishlist',
    followedStores: '/followed-stores',
    recentlyViewed: '/recently-viewed',
    settings: '/settings',
    notifications: '/notifications',
    sellerHome: '/seller/listings',
    signIn: '/sign-in',
  } as const;

  protected readonly buyerMenuEntries: readonly BuyerMenuEntry[] = [
    {
      label: 'Chats',
      iconSrc: '/assets/icons/buyer-menu/messages.svg',
      route: this.buyerRoutes.chats,
    },
    {
      label: 'Wishlist',
      iconSrc: '/assets/icons/buyer-menu/heart.svg',
      route: this.buyerRoutes.wishlist,
    },
    {
      label: 'Followed stores',
      iconSrc: '/assets/icons/buyer-menu/shop.svg',
      route: this.buyerRoutes.followedStores,
    },
    {
      label: 'Recently viewed',
      iconSrc: '/assets/icons/buyer-menu/global-search.svg',
      route: this.buyerRoutes.recentlyViewed,
    },
    {
      label: 'Account settings',
      iconSrc: '/assets/icons/buyer-menu/setting-2.svg',
      route: this.buyerRoutes.settings,
    },
    {
      label: 'Notifications',
      iconSrc: '/assets/icons/buyer-menu/notification-bing.svg',
      route: this.buyerRoutes.notifications,
    },
  ];

  async ngOnInit(): Promise<void> {
    if (this.hasRequestedBuyerMode || !this.appMode.isBackendEnabled()) {
      return;
    }

    this.hasRequestedBuyerMode = true;

    try {
      const response = await firstValueFrom(this.authService.switchMode({ is_vendor: false }));
      if (this.isProfileLikeResponse(response)) {
        this.authSession.initializeFromProfile(response);
      }
    } catch {
      // Keep buyer navigation usable even if the mode switch request fails.
    }
  }

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

  goToBuyerRoute(path: string): void {
    this.closeAccountMenu();
    void this.router.navigateByUrl(path);
  }

  switchToSellerMode(): void {
    this.closeAccountMenu();
    void this.router.navigateByUrl(this.buyerRoutes.sellerHome);
  }

  async logOut(): Promise<void> {
    this.closeAccountMenu();
    await this.authFlow.logout();
  }

  private isProfileLikeResponse(value: unknown): value is ProfileResponse {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const candidate = value as {
      user?: unknown;
      id?: unknown;
      username?: unknown;
      email?: unknown;
    };
    if (
      typeof candidate.id === 'number' &&
      typeof candidate.username === 'string' &&
      typeof candidate.email === 'string'
    ) {
      return true;
    }

    if (!candidate.user || typeof candidate.user !== 'object') {
      return false;
    }

    const nestedUser = candidate.user as { id?: unknown; username?: unknown; email?: unknown };
    return (
      typeof nestedUser.id === 'number' &&
      typeof nestedUser.username === 'string' &&
      typeof nestedUser.email === 'string'
    );
  }
}
