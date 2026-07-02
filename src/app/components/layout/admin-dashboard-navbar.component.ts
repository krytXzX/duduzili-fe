import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroArrowRightOnRectangle,
  heroBell,
  heroBars3,
  heroCog6Tooth,
} from '@ng-icons/heroicons/outline';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { AuthSessionService } from '../../services/auth-session.service';
import { AuthFlowService } from '../../services/auth-flow.service';

interface AdminSearchablePage {
  label: string;
  route: string;
  keywords: string[];
}

@Component({
  selector: 'app-admin-dashboard-navbar',
  imports: [CommonModule, RouterLink, NgIcon, NgOptimizedImage],
  providers: [
    provideIcons({
      heroArrowRightOnRectangle,
      heroBell,
      heroBars3,
      heroCog6Tooth,
    }),
  ],
  template: `
    <header class="relative flex flex-wrap items-center gap-3 rounded-[28px] bg-black px-4 py-3 text-white shadow-lg sm:px-6 sm:py-2.5">
      <div class="flex min-w-0 items-center gap-3">
        <button
          type="button"
          (click)="menuRequested.emit()"
          class="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white transition hover:bg-white/20 lg:hidden"
          aria-label="Open admin sidebar"
        >
          <ng-icon name="heroBars3" class="text-lg"></ng-icon>
        </button>

        <a [routerLink]="homeRoute()" class="flex min-w-0 items-center gap-2 transition-opacity hover:opacity-90">
          <div class="flex h-8 w-8 items-center justify-center">
            <img
              ngSrc="assets/images/logo-light-fill.svg"
              alt="Duduzili"
              width="24"
              height="24"
              class="brightness-0 invert object-contain"
            />
          </div>
          <span class="truncate text-base font-bold tracking-tight sm:text-lg">Duduzili</span>
        </a>
      </div>

      <div
        class="order-3 flex w-full group sm:order-2 sm:mx-2 sm:flex-1 sm:max-w-lg lg:absolute lg:left-1/2 lg:top-1/2 lg:z-10 lg:mx-0 lg:w-[min(32rem,calc(100%-28rem))] lg:max-w-none lg:-translate-x-1/2 lg:-translate-y-1/2"
      >
        @if (isDropdownOpen() && searchResults().length > 0 && searchQuery().trim()) {
          <button
            type="button"
            class="fixed inset-0 z-40 cursor-default bg-transparent"
            (click)="isDropdownOpen.set(false)"
            aria-label="Close search dropdown"
          ></button>
        }

        <div class="relative z-50 w-full rounded-[100px] bg-[#2F2F2F] px-3 py-1">
          <div class="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <img
              ngSrc="/assets/icons/admin-navbar/search-normal.svg"
              width="18"
              height="18"
              alt=""
              class="h-[18px] w-[18px]"
              aria-hidden="true"
            />
          </div>

          <input
            type="text"
            placeholder="Search pages, settings..."
            [value]="searchQuery()"
            #adminSearchInput
            (focus)="isDropdownOpen.set(true)"
            (input)="updateSearchQuery(adminSearchInput.value)"
            (keydown.enter)="runSearch()"
            class="h-8 w-full border-none bg-transparent pl-[22px] pr-20 text-[14px] font-normal tracking-[0.01em] text-white/90 outline-none placeholder:text-white/60 focus:ring-0"
            style="font-family: 'Mona Sans', sans-serif"
          />

          <button
            type="button"
            (click)="runSearch()"
            class="absolute inset-y-1 right-1 flex items-center rounded-[1000px] bg-[#515151] px-2"
            aria-label="Search"
          >
            <img
              ngSrc="/assets/icons/admin-navbar/arrow-right.svg"
              width="16"
              height="16"
              alt=""
              class="h-4 w-4"
              aria-hidden="true"
            />
          </button>

          @if (isDropdownOpen() && searchResults().length > 0 && searchQuery().trim()) {
            <div class="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-[20px] border border-white/10 bg-[#2F2F2F] p-2 shadow-2xl">
              @for (page of searchResults(); track page.route) {
                <button
                  type="button"
                  (click)="selectPage(page)"
                  class="flex w-full items-center gap-3 rounded-[12px] px-4 py-2.5 text-left text-[14px] font-medium text-white/90 hover:bg-white/10"
                >
                  <img
                    ngSrc="/assets/icons/admin-navbar/search-normal.svg"
                    width="14"
                    height="14"
                    alt=""
                    class="h-3.5 w-3.5 opacity-60"
                    aria-hidden="true"
                  />
                  <span>{{ page.label }}</span>
                </button>
              }
            </div>
          }
        </div>
      </div>

      <div class="relative ml-auto order-2 sm:order-3">
        @if (isAccountMenuOpen()) {
          <button
            type="button"
            class="fixed inset-0 z-40 cursor-default bg-transparent"
            (click)="closeAccountMenu()"
            aria-label="Close admin account menu"
          ></button>
        }

        <button
          type="button"
          (click)="toggleAccountMenu()"
          class="relative z-50 flex items-center gap-2 rounded-full border border-white/10 bg-white p-1 pr-3 text-[#1A1C21] transition hover:bg-white/95"
          aria-haspopup="menu"
          [attr.aria-expanded]="isAccountMenuOpen()"
          aria-label="Open admin account menu"
        >
          <span class="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-[#EEEEEE] ring-2 ring-white/10">
            <img
              [ngSrc]="accountAvatarSrc()"
              [alt]="accountDisplayName()"
              width="28"
              height="28"
              class="h-7 w-7 object-cover"
            />
          </span>
          <ng-icon name="heroBars3" class="text-lg text-[#6883B2]"></ng-icon>
        </button>

        @if (isAccountMenuOpen()) {
          <div
            class="absolute right-0 top-[calc(100%+12px)] z-50 w-[min(320px,calc(100vw-1rem))] rounded-[28px] border border-[#EEF0F4] bg-white p-5 text-[#1A1C21] shadow-[0_24px_60px_rgba(26,28,33,0.16)]"
            role="menu"
            aria-label="Admin account menu"
          >
            <div class="mb-5 flex items-start gap-3">
              <span class="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[#EEEEEE]">
                <img
                  [ngSrc]="accountAvatarSrc()"
                  [alt]="accountDisplayName()"
                  width="48"
                  height="48"
                  class="h-12 w-12 object-cover"
                />
              </span>
              <div class="min-w-0">
                <p class="truncate text-[17px] font-semibold tracking-[-0.02em] text-[#1A1C21]">{{ accountDisplayName() }}</p>
                <p class="truncate text-sm text-[#8E9199]">{{ accountRoleLabel() }}</p>
              </div>
            </div>

            <div class="space-y-1">
              <button type="button" (click)="goToAdminRoute('/admin/settings')" class="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-[15px] font-medium text-[#1A1C21] transition hover:bg-[#F7F8FA]" role="menuitem">
                <ng-icon name="heroCog6Tooth" class="text-[18px] text-[#6A6D75]"></ng-icon>
                Account settings
              </button>
              <button type="button" (click)="goToAdminRoute('/admin/notifications')" class="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-[15px] font-medium text-[#1A1C21] transition hover:bg-[#F7F8FA]" role="menuitem">
                <ng-icon name="heroBell" class="text-[18px] text-[#6A6D75]"></ng-icon>
                Notifications
              </button>
            </div>

            <div class="my-3 h-px bg-[#EEF0F4]"></div>

            <button type="button" (click)="logOut()" class="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-[15px] font-medium text-[#FF3B30] transition hover:bg-[#FFF5F5]" role="menuitem">
              <ng-icon name="heroArrowRightOnRectangle" class="text-[18px] text-[#FF3B30]"></ng-icon>
              Log out
            </button>
          </div>
        }
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardNavbarComponent {
  private readonly router = inject(Router);
  private readonly authSession = inject(AuthSessionService);
  private readonly authFlow = inject(AuthFlowService);

  readonly homeRoute = computed(() => {
    if (!this.authSession.isAuthenticated()) {
      return '/';
    }
    return this.authSession.isSuperuser() ? '/admin' : '/en';
  });

  readonly menuRequested = output<void>();
  readonly searchQuery = signal('');
  readonly isAccountMenuOpen = signal(false);
  readonly isDropdownOpen = signal(false);

  protected readonly fallbackAvatarSrc = '/assets/images/auth-avatar-fallback.svg';
  protected readonly currentUser = this.authSession.user;

  protected readonly accountAvatarSrc = computed(
    () => this.currentUser()?.avatar?.trim() || this.fallbackAvatarSrc,
  );

  protected readonly accountDisplayName = computed(() => {
    const user = this.currentUser();
    return user?.full_name?.trim() || user?.username?.trim() || 'Admin';
  });

  protected readonly accountRoleLabel = computed(() => {
    const role = this.currentUser()?.role?.trim().toLowerCase();
    if (!role) {
      return 'Admin';
    }

    if (role === 'superuser') {
      return 'Super Admin';
    }

    return role
      .split(/[_\s-]+/)
      .filter((segment) => segment.length > 0)
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' ');
  });

  readonly adminPages: AdminSearchablePage[] = [
    { label: 'Home / Dashboard', route: '/admin', keywords: ['home', 'dashboard', 'main', 'index'] },
    { label: 'Users Management', route: '/admin/users', keywords: ['users', 'members', 'accounts', 'sellers', 'buyers'] },
    { label: 'Listings Management', route: '/admin/listings', keywords: ['listings', 'products', 'ads', 'items'] },
    { label: 'Stores Management', route: '/admin/stores', keywords: ['stores', 'shops', 'vendors', 'sellers'] },
    { label: 'Categories Management', route: '/admin/categories', keywords: ['categories', 'taxonomy', 'sections'] },
    { label: 'Ads Plans', route: '/admin/ads/plans', keywords: ['ads plans', 'pricing', 'subscriptions', 'monetization'] },
    { label: 'Running Ads', route: '/admin/ads/running', keywords: ['running ads', 'active promotions', 'campaigns'] },
    { label: 'Ads Approvals', route: '/admin/ads/approvals', keywords: ['ads approvals', 'pending ads', 'campaign approval'] },
    { label: 'Ads Transactions', route: '/admin/ads/transactions', keywords: ['ads transactions', 'billing', 'payments', 'revenue'] },
    { label: 'KYC Requests', route: '/admin/kyc-requests', keywords: ['kyc requests', 'identity verification', 'compliance'] },
    { label: 'Reports', route: '/admin/reports', keywords: ['reports', 'flags', 'moderation', 'complaints'] },
    { label: 'Analytics', route: '/admin/analytics', keywords: ['analytics', 'metrics', 'insights', 'statistics'] },
    { label: 'Audit Log', route: '/admin/audit-log', keywords: ['audit log', 'logs', 'history', 'activities', 'events'] },
    { label: 'Team Management', route: '/admin/team-management', keywords: ['team management', 'staff', 'admins', 'moderators', 'roles'] },
    { label: 'Locations', route: '/admin/locations', keywords: ['locations', 'places', 'cities', 'states', 'regions'] },
    { label: 'Account Settings', route: '/admin/settings', keywords: ['account settings', 'profile', 'security', 'preferences'] },
    { label: 'Notifications', route: '/admin/notifications', keywords: ['notifications', 'alerts', 'messages', 'unread'] },
  ];

  readonly searchResults = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) {
      return [];
    }
    return this.adminPages.filter((page) =>
      page.label.toLowerCase().includes(query) ||
      page.keywords.some((keyword) => keyword.toLowerCase().includes(query))
    );
  });

  updateSearchQuery(value: string): void {
    this.searchQuery.set(value);
    this.isDropdownOpen.set(true);
  }

  toggleAccountMenu(): void {
    this.isAccountMenuOpen.update((value) => !value);
  }

  closeAccountMenu(): void {
    this.isAccountMenuOpen.set(false);
  }

  runSearch(): void {
    const results = this.searchResults();
    if (results.length > 0) {
      this.selectPage(results[0]);
    }
  }

  selectPage(page: AdminSearchablePage): void {
    this.isDropdownOpen.set(false);
    this.searchQuery.set('');
    void this.router.navigateByUrl(page.route);
  }

  goToAdminRoute(path: string): void {
    this.closeAccountMenu();
    void this.router.navigateByUrl(path);
  }

  async logOut(): Promise<void> {
    this.closeAccountMenu();
    await this.authFlow.logout();
  }
}
