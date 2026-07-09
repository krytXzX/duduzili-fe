import { ChangeDetectionStrategy, Component, inject, input, output, signal, PLATFORM_ID } from '@angular/core';
import { NgOptimizedImage, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MobileOverlayService } from '../../services/mobile-overlay.service';

type NavItem = {
  readonly label: string;
  readonly iconSrc: string;
  readonly route: string;
  readonly activePaths: readonly string[];
};

@Component({
  selector: 'app-mobile-bottom-nav',
  imports: [NgOptimizedImage, RouterLink],
  template: `
    @if (enableActionSheet() && isActionSheetOpen()) {
      <div
        class="fixed inset-0 z-[70] bg-black/25 md:hidden"
        (click)="closeActionSheet()"
        aria-hidden="true"
      ></div>

      <section
        class="fixed inset-x-0 bottom-0 z-[80] rounded-t-[34px] bg-white px-6 pb-9 pt-4 shadow-[0_-20px_50px_-30px_rgba(18,24,35,0.4)] md:hidden"
        aria-label="Create options"
        role="dialog"
        aria-modal="true"
      >
        <div class="mx-auto h-[5px] w-12 rounded-full bg-[#E6E7EC]"></div>

        <div class="mt-4 flex items-center justify-between">
          <h2 class="text-[22px] font-semibold tracking-tight text-[#0D1F3C]">
            What would you like to do?
          </h2>

          <button
            type="button"
            (click)="closeActionSheet()"
            class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#ECEEF4] bg-white text-[#4D5260] shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition active:scale-95"
            aria-label="Close action sheet"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.8"
              stroke="currentColor"
              class="h-5 w-5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div class="mt-6 space-y-5">
          <button
            type="button"
            (click)="openAddListingFlow()"
            class="flex w-full items-center gap-4 text-left text-[#0D1F3C] transition active:scale-[0.995]"
          >
            <span
              class="inline-flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-[#F6F7FA]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.8"
                stroke="currentColor"
                class="h-6 w-6 text-[#1E293B]"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
                />
              </svg>
            </span>
            <span class="text-[17px] font-medium">Sell an item</span>
          </button>

          <button
            type="button"
            (click)="openAddStoreFlow()"
            class="flex w-full items-center gap-4 text-left text-[#0D1F3C] transition active:scale-[0.995]"
          >
            <span
              class="inline-flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-[#F6F7FA]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.8"
                stroke="currentColor"
                class="h-6 w-6 text-[#1E293B]"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3 10V20a1 1 0 001 1h16a1 1 0 001-1V10M3 10L4.5 5h15L21 10M3 10h18"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3 10c0 1 1 1.8 2 1.8s2-.8 2-1.8m0 0c0 1 1 1.8 2 1.8s2-.8 2-1.8m0 0c0 1 1 1.8 2 1.8s2-.8 2-1.8m0 0c0 1 1 1.8 2 1.8s2-.8 2-1.8m0 0c0 1 1 1.8 2 1.8s2-.8 2-1.8"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M10 21v-4a1 1 0 011-1h2a1 1 0 011 1v4"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M5.5 17h3M7 15.5v3"
                />
              </svg>
            </span>
            <span class="text-[17px] font-medium">Create a new store</span>
          </button>

          <button
            type="button"
            (click)="navigateTo(variant() === 'seller' ? '/seller/ads/plans' : '/ads/plans')"
            class="flex w-full items-center gap-4 text-left text-[#0D1F3C] transition active:scale-[0.995]"
          >
            <span
              class="inline-flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-[#F6F7FA]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.8"
                stroke="currentColor"
                class="h-6 w-6 text-[#1E293B]"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 15a5 5 0 100-10 5 5 0 000 10z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M8.25 13.5L5.25 21l3.75-1.5L12.75 21l-3-7.5"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15.75 13.5L18.75 21l-3.75-1.5L11.25 21l3-7.5"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 7.5l.8 1.6 1.8.3-1.3 1.3.3 1.8-1.6-.8-1.6.8.3-1.8-1.3-1.3 1.8-.3.8-1.6z"
                />
              </svg>
            </span>
            <span class="text-[17px] font-medium">Create an Ad</span>
          </button>
        </div>
      </section>
    }

    <nav
      class="fixed inset-x-0 bottom-0 z-40 h-[101px] bg-gradient-to-b from-transparent to-white lg:hidden"
      aria-label="Mobile bottom navigation"
    >
      <div class="mx-auto flex h-full w-[350px] items-end pb-[19px]">
        <div
          class="flex min-w-0 flex-1 items-center rounded-full border border-[#f4f4f4] bg-white p-1 shadow-[0_4px_12px_rgba(212,212,212,0.25)]"
        >
          @for (item of navItems; track item.label) {
            <a
              [routerLink]="item.route"
              class="flex min-w-0 flex-1 flex-col items-center gap-0.5 py-1.5 text-[#5c5c5c]"
              [class.rounded-[32px]]="isRouteActive(item.activePaths)"
              [class.bg-[#f5f3ff]]="isRouteActive(item.activePaths)"
              [class.text-[#6453d9]]="isRouteActive(item.activePaths)"
              [attr.aria-current]="isRouteActive(item.activePaths) ? 'page' : null"
            >
              <span
                class="inline-block h-[22px] w-[22px] shrink-0 bg-current"
                [style.webkitMaskImage]="'url(' + item.iconSrc + ')'"
                [style.maskImage]="'url(' + item.iconSrc + ')'"
                [style.webkitMaskRepeat]="'no-repeat'"
                [style.maskRepeat]="'no-repeat'"
                [style.webkitMaskPosition]="'center'"
                [style.maskPosition]="'center'"
                [style.webkitMaskSize]="'contain'"
                [style.maskSize]="'contain'"
                aria-hidden="true"
              ></span>
              <span class="text-[11px] font-medium">{{ item.label }}</span>
            </a>
          }
        </div>

        @if (variant() === 'buyer') {
          <button
            type="button"
            (click)="handleSearchAction()"
            [attr.aria-label]="searchButtonAriaLabel()"
            class="ml-1 inline-flex h-[63px] w-[63px] items-center justify-center rounded-full border border-[#f4f4f4] bg-white shadow-[0_4px_12px_rgba(212,212,212,0.25)]"
          >
            <img
              ngSrc="/assets/icons/buyer-bottom-nav/search.svg"
              alt=""
              width="24"
              height="24"
              class="h-6 w-6"
              aria-hidden="true"
            />
          </button>
        } @else {
          <button
            type="button"
            (click)="handlePrimaryAction()"
            [attr.aria-label]="createButtonAriaLabel()"
            class="ml-1 flex h-[63px] w-[63px] items-center justify-center rounded-full border border-[#f4f4f4] bg-[#6453d9] shadow-[0_4px_12px_rgba(158,147,255,0.25)] transition hover:bg-[#5c4ad0]"
          >
            <img
              ngSrc="/assets/icons/home-nav-add.svg"
              alt=""
              width="24"
              height="24"
              class="h-6 w-6"
              aria-hidden="true"
            />
          </button>
        }
      </div>
    </nav>

    @if (isSearchOverlayOpen()) {
    <section class="fixed inset-0 z-[300] bg-white lg:hidden" aria-label="Search" role="dialog" aria-modal="true">
      <button type="button" (click)="closeMobileSearchOverlay()" class="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-[#EAEAEA] bg-white shadow-[0_4px_8px_rgba(202,202,202,0.25)]" aria-label="Close search">
        <img [ngSrc]="closeIconUrl" alt="" width="24" height="24" class="h-6 w-6" aria-hidden="true" />
      </button>

      <div class="h-full overflow-y-auto px-5 pb-[220px] pt-[76px]">
        <div class="space-y-8 text-left">
          @if (recentSearches().length) {
          <section>
            <div class="mb-3 flex items-center justify-between">
              <h2 class="text-[20px] font-medium leading-[1.2] text-[#1A1B1D]">Recent searches</h2>
              <button type="button" (click)="clearRecentSearchHistory()" class="text-[14px] font-medium leading-5 text-[#01A204] underline">
                Clear history
              </button>
            </div>
            <div class="flex flex-wrap gap-2">
              @for (term of recentSearches(); track term) {
              <button type="button" (click)="applySearchTerm(term)" class="inline-flex h-11 items-center gap-[10px] rounded-full bg-[#F9F9F9] px-4 text-[14px] font-medium text-[#1A1B1D]">
                {{ term }}
                <span (click)="removeRecentSearch(term); $event.stopPropagation()" class="inline-flex h-3 w-[11.7px] items-center justify-center">
                  <img [ngSrc]="chipRemoveIconUrl" alt="" width="12" height="12" class="h-3 w-[11.7px]" aria-hidden="true" />
                </span>
              </button>
              }
            </div>
          </section>
          }

          @if (popularSearches.length) {
          <section>
            <h2 class="mb-3 text-[18px] font-medium leading-[1.2] text-[#1A1B1D]">Popular right now</h2>
            <div class="flex flex-wrap gap-2">
              @for (term of popularSearches; track term) {
              <button type="button" (click)="applySearchTerm(term)" class="inline-flex h-11 items-center rounded-full bg-[#F9F9F9] px-4 text-[14px] font-medium text-[#1A1B1D]">
                {{ term }}
              </button>
              }
            </div>
          </section>
          }
        </div>
      </div>

      <div class="pointer-events-auto fixed inset-x-5 bottom-[max(41px,env(safe-area-inset-bottom))] z-[301]">
        <div class="h-[126px] rounded-[28px] border border-[#EDEDED] bg-white px-[15px] pt-[13px] shadow-[0_12px_30px_rgba(151,150,196,0.25)]">
          <form class="relative h-full w-full" (submit)="submitHomeSearch($event)" autocomplete="off">
            <input type="text" [value]="mobileSearchQuery()" (input)="updateMobileSearchQuery($event)" class="h-full w-full bg-transparent pr-[74px] text-[24px] leading-[1.3] text-[#1F1F1F] outline-none" placeholder=" " autofocus autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" />
            <button type="submit" class="absolute bottom-[15px] right-0 flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border border-white bg-[#6453D9] shadow-[0_4px_12px_rgba(81,35,173,0.33),0_0_0_1px_#6B5BD5]" aria-label="Search">
              <img [ngSrc]="searchIconUrl" alt="" width="20" height="20" class="h-5 w-5" aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>
    </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileBottomNavComponent {
  private readonly router = inject(Router);
  private readonly mobileOverlayService = inject(MobileOverlayService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly variant = input<'buyer' | 'seller'>('buyer');
  readonly exploreRoute = input('/en');
  readonly exploreActivePaths = input<readonly string[]>(['/en', '/']);
  readonly wishlistRoute = input('/wishlist');
  readonly wishlistActivePaths = input<readonly string[]>(['/wishlist']);
  readonly chatsRoute = input('/chats');
  readonly chatsActivePaths = input<readonly string[]>(['/chats', '/messages']);
  readonly searchRoute = input('/search');
  readonly searchButtonAriaLabel = input('Search');
  readonly searchOpensOverlay = input(false);
  readonly searchPressed = output<void>();

  readonly listingsRoute = input('/listings');
  readonly listingsActivePaths = input<readonly string[]>(['/listings']);
  readonly messagesRoute = input('/seller/messages');
  readonly messagesActivePaths = input<readonly string[]>(['/seller/messages']);
  readonly storesRoute = input('/my-stores');
  readonly storesActivePaths = input<readonly string[]>(['/my-stores']);
  readonly moreRoute = input('/more');
  readonly moreActivePaths = input<readonly string[]>(['/more']);
  readonly enableActionSheet = input(true);
  readonly createButtonRoute = input('/listings');
  readonly createButtonAriaLabel = input('Create new listing');

  readonly isActionSheetOpen = signal(false);

  get navItems(): readonly NavItem[] {
    if (this.variant() === 'buyer') {
      return [
        {
          label: 'Explore',
          iconSrc: '/assets/icons/buyer-bottom-nav/home.svg',
          route: this.exploreRoute(),
          activePaths: this.exploreActivePaths(),
        },
        {
          label: 'Wishlist',
          iconSrc: '/assets/icons/buyer-bottom-nav/heart.svg',
          route: this.wishlistRoute(),
          activePaths: this.wishlistActivePaths(),
        },
        {
          label: 'Chats',
          iconSrc: '/assets/icons/buyer-bottom-nav/messages.svg',
          route: this.chatsRoute(),
          activePaths: this.chatsActivePaths(),
        },
        {
          label: 'More',
          iconSrc: '/assets/icons/buyer-bottom-nav/more.svg',
          route: this.moreRoute(),
          activePaths: this.moreActivePaths(),
        },
      ];
    }

    return [
      {
        label: 'Listings',
        iconSrc: '/assets/icons/home-nav-listings.svg',
        route: this.listingsRoute(),
        activePaths: this.listingsActivePaths(),
      },
      {
        label: 'Chats',
        iconSrc: '/assets/icons/home-nav-chats.svg',
        route: this.messagesRoute(),
        activePaths: this.messagesActivePaths(),
      },
      {
        label: 'Stores',
        iconSrc: '/assets/icons/home-nav-stores.svg',
        route: this.storesRoute(),
        activePaths: this.storesActivePaths(),
      },
      {
        label: 'More',
        iconSrc: '/assets/icons/home-nav-more.svg',
        route: this.moreRoute(),
        activePaths: this.moreActivePaths(),
      },
    ];
  }

  openActionSheet(): void {
    this.isActionSheetOpen.set(true);
  }

  closeActionSheet(): void {
    this.isActionSheetOpen.set(false);
  }

  isRouteActive(paths: readonly string[]): boolean {
    const currentUrl = this.router.url.split('?')[0] ?? this.router.url;
    return paths.some((path) => currentUrl === path || currentUrl.startsWith(`${path}/`));
  }

  handlePrimaryAction(): void {
    if (this.enableActionSheet()) {
      this.openActionSheet();
      return;
    }

    this.navigateTo(this.createButtonRoute());
  }

  navigateTo(path: string): void {
    this.closeActionSheet();
    void this.router.navigateByUrl(path);
  }

  openAddListingFlow(): void {
    this.closeActionSheet();
    this.mobileOverlayService.requestOpenAddListing();
    void this.router.navigateByUrl(this.variant() === 'seller' ? '/seller/listings' : '/listings');
  }

  openAddStoreFlow(): void {
    this.closeActionSheet();
    this.mobileOverlayService.requestOpenAddStore();
    void this.router.navigateByUrl(this.variant() === 'seller' ? '/seller/my-stores' : '/my-stores');
  }

  readonly isSearchOverlayOpen = signal(false);
  readonly recentSearches = signal<string[]>([]);
  readonly mobileSearchQuery = signal('');

  protected readonly closeIconUrl = '/assets/icons/home-search-overlay/close.svg';
  protected readonly chipRemoveIconUrl = '/assets/icons/home-search-overlay/chip-remove.svg';
  protected readonly searchIconUrl = '/assets/icons/home-search-overlay/search.svg';

  protected readonly popularSearches = [
    'bags for men',
    'watch for men',
    'male accessories',
    'necklaces for men',
    'Toyota camry 2016 model',
    'Miniflat in Lagos',
    'shirt for men',
  ];

  private readonly HOME_RECENT_SEARCHES_KEY = 'duduzili.home.recent-searches';
  private readonly HOME_RECENT_SEARCHES_LIMIT = 8;

  openMobileSearchOverlay(): void {
    this.restoreRecentSearches();
    this.isSearchOverlayOpen.set(true);
  }

  closeMobileSearchOverlay(): void {
    this.isSearchOverlayOpen.set(false);
  }

  updateMobileSearchQuery(event: Event): void {
    const input = event.target;
    if (input instanceof HTMLInputElement) {
      this.mobileSearchQuery.set(input.value);
    }
  }

  applySearchTerm(term: string): void {
    this.mobileSearchQuery.set(term);
    this.runSearchQuery(term);
  }

  submitHomeSearch(event: Event): void {
    event.preventDefault();
    const query = this.mobileSearchQuery().trim() || 'iPhone';
    this.runSearchQuery(query);
  }

  private runSearchQuery(query: string): void {
    this.pushRecentSearch(query);
    this.closeMobileSearchOverlay();
    void this.router.navigate(['/search'], { queryParams: { q: query } });
  }

  private restoreRecentSearches(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      const rawValue = localStorage.getItem(this.HOME_RECENT_SEARCHES_KEY);
      if (!rawValue) {
        return;
      }

      const parsedValue: unknown = JSON.parse(rawValue);
      if (!Array.isArray(parsedValue)) {
        localStorage.removeItem(this.HOME_RECENT_SEARCHES_KEY);
        return;
      }

      const searches = parsedValue
        .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
        .filter((entry) => entry.length > 0)
        .slice(0, this.HOME_RECENT_SEARCHES_LIMIT);

      this.recentSearches.set(searches);
    } catch {
      localStorage.removeItem(this.HOME_RECENT_SEARCHES_KEY);
    }
  }

  private pushRecentSearch(term: string): void {
    const normalizedTerm = term.trim();
    if (!normalizedTerm) {
      return;
    }

    this.recentSearches.update((current) => {
      const next = [
        normalizedTerm,
        ...current.filter((item) => item.toLowerCase() !== normalizedTerm.toLowerCase()),
      ].slice(0, this.HOME_RECENT_SEARCHES_LIMIT);

      this.persistRecentSearches(next);
      return next;
    });
  }

  private persistRecentSearches(searches: readonly string[]): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      localStorage.setItem(this.HOME_RECENT_SEARCHES_KEY, JSON.stringify(searches));
    } catch {
      // Ignore
    }
  }

  removeRecentSearch(term: string): void {
    this.recentSearches.update((current) => {
      const next = current.filter((item) => item !== term);
      this.persistRecentSearches(next);
      return next;
    });
  }

  clearRecentSearchHistory(): void {
    this.recentSearches.set([]);
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.removeItem(this.HOME_RECENT_SEARCHES_KEY);
      } catch {
        // Ignore
      }
    }
  }

  handleSearchAction(): void {
    if (this.searchOpensOverlay()) {
      this.searchPressed.emit();
    } else {
      this.openMobileSearchOverlay();
    }
  }
}
