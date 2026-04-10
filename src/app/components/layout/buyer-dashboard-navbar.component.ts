import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroArrowRightOnRectangle,
  heroBars3,
  heroChatBubbleLeftRight,
  heroChevronDown,
  heroClock,
  heroHeart,
  heroMagnifyingGlass,
  heroMapPin,
  heroShoppingBag,
  heroUserCircle,
  heroWallet,
} from '@ng-icons/heroicons/outline';
import { heroChevronRightMini } from '@ng-icons/heroicons/mini';

@Component({
  selector: 'app-buyer-dashboard-navbar',
  imports: [CommonModule, RouterLink, NgOptimizedImage, NgIcon],
  providers: [
    provideIcons({
      heroBars3,
      heroChatBubbleLeftRight,
      heroChevronDown,
      heroClock,
      heroHeart,
      heroMagnifyingGlass,
      heroMapPin,
      heroShoppingBag,
      heroUserCircle,
      heroWallet,
      heroArrowRightOnRectangle,
      heroChevronRightMini,
    }),
  ],
  template: `
    <header class="flex h-16 items-center justify-between rounded-full bg-black px-6 text-white shadow-lg">
      <div class="flex min-w-0 items-center gap-6">
        <a routerLink="/" class="flex items-center gap-2 transition-opacity hover:opacity-90">
          <div class="flex h-8 w-8 items-center justify-center">
            <img
              ngSrc="assets/images/logo-light-fill.svg"
              alt="Duduzili"
              width="24"
              height="24"
              priority
              class="brightness-0 invert object-contain"
            />
          </div>
          <span class="text-lg font-bold tracking-tight">Duduzili</span>
        </a>

        <button
          type="button"
          class="hidden items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 transition hover:bg-white/15 md:inline-flex"
        >
          <ng-icon name="heroMapPin" class="text-[16px] text-[#FF3B30]"></ng-icon>
          <span>All of Nigeria</span>
          <ng-icon name="heroChevronDown" class="text-[14px] text-white/60"></ng-icon>
        </button>
      </div>

      <div class="mx-6 flex-1 max-w-lg group">
        <div class="relative">
          <div class="pointer-events-none absolute inset-y-0 left-4 flex items-center">
            <ng-icon
              name="heroMagnifyingGlass"
              class="text-white/40 transition-colors group-focus-within:text-white"
            ></ng-icon>
          </div>

          <input
            type="text"
            placeholder="What are you looking for?"
            [value]="searchQuery()"
            #dashboardSearchInput
            (input)="updateSearchQuery(dashboardSearchInput.value)"
            (keydown.enter)="runSearch()"
            class="w-full rounded-full border-none bg-white/10 py-2 pl-12 pr-20 text-sm text-white outline-none transition-all placeholder:text-white/40 focus:bg-white/20 focus:ring-0"
          />

          @if (searchQuery()) {
            <button
              type="button"
              (click)="clearSearch()"
              class="absolute inset-y-0 right-10 flex items-center text-white/30 transition hover:text-white/60"
              aria-label="Clear search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          }

          <button
            type="button"
            (click)="runSearch()"
            class="absolute inset-y-0 right-3 flex items-center"
            aria-label="Search"
          >
            <div
              class="flex h-6 w-6 items-center justify-center rounded-lg border border-white/5 bg-white/10 text-white/75 transition hover:bg-white/15"
            >
              <ng-icon name="heroChevronRightMini" class="text-[14px]"></ng-icon>
            </div>
          </button>
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
            class="relative z-50 flex items-center gap-2 rounded-full border border-white/10 bg-white/10 p-1 pr-3 text-white transition hover:bg-white/20"
            aria-haspopup="menu"
            [attr.aria-expanded]="isAccountMenuOpen()"
            aria-label="Open buyer account menu"
          >
            <span class="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-purple-600 text-white ring-2 ring-white/10">
              <ng-icon name="heroUserCircle" class="text-lg"></ng-icon>
            </span>
            <ng-icon name="heroBars3" class="text-lg text-white/60"></ng-icon>
          </button>

          @if (isAccountMenuOpen()) {
            <div
              class="absolute right-0 top-[calc(100%+12px)] z-50 w-[320px] rounded-[28px] border border-[#EEF0F4] bg-white p-5 text-[#1A1C21] shadow-[0_24px_60px_rgba(26,28,33,0.16)]"
              role="menu"
              aria-label="Buyer account menu"
            >
              <div class="mb-5 flex items-start gap-3">
                <span class="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[#6F57E8] text-white">
                  <ng-icon name="heroUserCircle" class="text-[28px]"></ng-icon>
                </span>
                <div class="min-w-0">
                  <p class="truncate text-[17px] font-semibold tracking-[-0.02em] text-[#1A1C21]">Bryan Odjede</p>
                  <p class="truncate text-sm text-[#8E9199]">bryan@email.com</p>
                </div>
              </div>

              <div class="space-y-1">
                <button type="button" (click)="goToBuyerRoute('/buyer/chats')" class="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-[15px] font-medium text-[#1A1C21] transition hover:bg-[#F7F8FA]" role="menuitem">
                  <ng-icon name="heroChatBubbleLeftRight" class="text-[18px] text-[#6A6D75]"></ng-icon>
                  Messages
                </button>
                <button type="button" (click)="goToBuyerRoute('/buyer/wishlist')" class="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-[15px] font-medium text-[#1A1C21] transition hover:bg-[#F7F8FA]" role="menuitem">
                  <ng-icon name="heroHeart" class="text-[18px] text-[#6A6D75]"></ng-icon>
                  Wishlist
                </button>
                <button type="button" (click)="goToBuyerRoute('/buyer/followed-stores')" class="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-[15px] font-medium text-[#1A1C21] transition hover:bg-[#F7F8FA]" role="menuitem">
                  <ng-icon name="heroShoppingBag" class="text-[18px] text-[#6A6D75]"></ng-icon>
                  Followed vendors
                </button>
                <button type="button" (click)="goToBuyerRoute('/buyer/wishlist')" class="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-[15px] font-medium text-[#1A1C21] transition hover:bg-[#F7F8FA]" role="menuitem">
                  <ng-icon name="heroWallet" class="text-[18px] text-[#6A6D75]"></ng-icon>
                  Wallet
                </button>
                <button type="button" (click)="goToBuyerRoute('/category')" class="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-[15px] font-medium text-[#1A1C21] transition hover:bg-[#F7F8FA]" role="menuitem">
                  <ng-icon name="heroClock" class="text-[18px] text-[#6A6D75]"></ng-icon>
                  Recent searches
                </button>
              </div>

              <div class="my-3 h-px bg-[#EEF0F4]"></div>

              <button type="button" (click)="switchToSellerMode()" class="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-[15px] font-medium text-[#1A1C21] transition hover:bg-[#F7F8FA]" role="menuitem">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-[18px] w-[18px] text-[#6A6D75]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M3 4.75A.75.75 0 013.75 4h8.19l-1.22-1.22a.75.75 0 111.06-1.06l2.5 2.5a.75.75 0 010 1.06l-2.5 2.5a.75.75 0 11-1.06-1.06L11.94 5.5H3.75A.75.75 0 013 4.75zm14 10.5a.75.75 0 01-.75.75H8.06l1.22 1.22a.75.75 0 11-1.06 1.06l-2.5-2.5a.75.75 0 010-1.06l2.5-2.5a.75.75 0 011.06 1.06L8.06 14.5h8.19a.75.75 0 01.75.75z"/>
                </svg>
                Switch to seller mode
              </button>

              <button type="button" (click)="logOut()" class="mt-1 flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-[15px] font-medium text-[#FF3B30] transition hover:bg-[#FFF5F5]" role="menuitem">
                <ng-icon name="heroArrowRightOnRectangle" class="text-[18px] text-[#FF3B30]"></ng-icon>
                Log out
              </button>
            </div>
          }
        </div>
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuyerDashboardNavbarComponent {
  private readonly router = inject(Router);

  readonly searchQuery = signal('');
  readonly isAccountMenuOpen = signal(false);

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
    void this.router.navigate(['/category'], { queryParams: { q: query } });
  }

  goToBuyerRoute(path: string): void {
    this.closeAccountMenu();
    void this.router.navigateByUrl(path);
  }

  switchToSellerMode(): void {
    this.closeAccountMenu();
    void this.router.navigate(['/listings']);
  }

  logOut(): void {
    this.closeAccountMenu();
    void this.router.navigate(['/sign-in']);
  }
}
