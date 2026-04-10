import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroArrowRightOnRectangle,
  heroBell,
  heroMagnifyingGlass,
  heroUserCircle,
  heroBars3,
  heroChevronRight,
  heroChatBubbleLeftRight,
  heroChartBar,
  heroCog6Tooth,
  heroMegaphone,
  heroQueueList,
  heroRectangleStack,
  heroSquares2x2,
  heroWallet,
} from '@ng-icons/heroicons/outline';
import { CommonModule, NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-dashboard-navbar',
  imports: [CommonModule, RouterLink, NgIcon, NgOptimizedImage],
  providers: [
    provideIcons({
      heroMagnifyingGlass,
      heroUserCircle,
      heroBars3,
      heroChevronRight,
      heroArrowRightOnRectangle,
      heroBell,
      heroChatBubbleLeftRight,
      heroChartBar,
      heroCog6Tooth,
      heroMegaphone,
      heroQueueList,
      heroRectangleStack,
      heroSquares2x2,
      heroWallet,
    })
  ],
  template: `
    <header class="h-16 bg-black text-white rounded-full flex items-center justify-between px-6 shadow-lg">
      <!-- Left: Logo -->
      <a routerLink="/" class="flex items-center gap-2 group cursor-pointer transition-opacity hover:opacity-90">
        <div class="w-8 h-8 flex items-center justify-center">
          <img ngSrc="assets/images/logo-light-fill.svg" alt="Duduzili" width="24" height="24" class="brightness-0 invert object-contain" />
        </div>
        <span class="text-lg font-bold tracking-tight">Duduzili</span>
      </a>

      <!-- Center: Search -->
      <div class="flex-1 max-w-lg mx-6 group">
        <div class="relative">
          <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <ng-icon name="heroMagnifyingGlass" class="text-white/40 group-focus-within:text-white transition-colors"></ng-icon>
          </div>
          <input 
            type="text" 
            [value]="searchQuery()"
            #dashboardSearchInput
            (input)="updateSearchQuery(dashboardSearchInput.value)"
            (keydown.enter)="runSearch()"
            placeholder="Search..." 
            class="w-full bg-white/10 border-none rounded-full py-2 pl-12 pr-20 text-sm text-white placeholder:text-white/40 focus:ring-0 focus:bg-white/20 transition-all outline-none"
          >
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
            <div class="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center border border-white/5 transition hover:bg-white/15">
               <ng-icon name="heroChevronRight" class="text-white/60 text-xs"></ng-icon>
            </div>
          </button>
        </div>
      </div>

      <!-- Right: Actions -->
      <div class="flex items-center gap-6">
        <button
          type="button"
          (click)="switchToBuyerMode()"
          class="text-xs font-semibold text-white/80 hover:text-white transition-colors tracking-wide hidden sm:block"
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
            class="relative z-50 flex items-center gap-2 rounded-full border border-white/10 bg-white/10 p-1 pr-3 transition-all hover:bg-white/20"
            aria-haspopup="menu"
            [attr.aria-expanded]="isAccountMenuOpen()"
            aria-label="Open seller account menu"
          >
            <div class="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-white ring-2 ring-white/10">
              <ng-icon name="heroUserCircle" class="text-lg"></ng-icon>
            </div>
            <ng-icon name="heroBars3" class="text-white/60 text-lg"></ng-icon>
          </button>

          @if (isAccountMenuOpen()) {
            <div
              class="absolute right-0 top-[calc(100%+12px)] z-50 w-[320px] rounded-[28px] border border-[#EEF0F4] bg-white p-5 text-[#1A1C21] shadow-[0_24px_60px_rgba(26,28,33,0.16)]"
              role="menu"
              aria-label="Seller account menu"
            >
              <div class="mb-5 flex items-start gap-3">
                <span class="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[#6F57E8] text-white">
                  <ng-icon name="heroUserCircle" class="text-[28px]"></ng-icon>
                </span>
                <div class="min-w-0">
                  <p class="truncate text-[17px] font-semibold tracking-[-0.02em] text-[#1A1C21]">Bryan Odjede</p>
                  <p class="truncate text-sm text-[#8E9199]">Seller mode</p>
                </div>
              </div>

              <div class="space-y-1">
                <button type="button" (click)="goToSellerRoute('/listings')" class="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-[15px] font-medium text-[#1A1C21] transition hover:bg-[#F7F8FA]" role="menuitem">
                  <ng-icon name="heroQueueList" class="text-[18px] text-[#6A6D75]"></ng-icon>
                  Listings
                </button>
                <button type="button" (click)="goToSellerRoute('/my-stores')" class="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-[15px] font-medium text-[#1A1C21] transition hover:bg-[#F7F8FA]" role="menuitem">
                  <ng-icon name="heroSquares2x2" class="text-[18px] text-[#6A6D75]"></ng-icon>
                  My Stores
                </button>
                <button type="button" (click)="goToSellerRoute('/messages')" class="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-[15px] font-medium text-[#1A1C21] transition hover:bg-[#F7F8FA]" role="menuitem">
                  <ng-icon name="heroChatBubbleLeftRight" class="text-[18px] text-[#6A6D75]"></ng-icon>
                  Messages
                </button>
                <button type="button" (click)="goToSellerRoute('/requests/offers')" class="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-[15px] font-medium text-[#1A1C21] transition hover:bg-[#F7F8FA]" role="menuitem">
                  <ng-icon name="heroRectangleStack" class="text-[18px] text-[#6A6D75]"></ng-icon>
                  Requests
                </button>
                <button type="button" (click)="goToSellerRoute('/promotions')" class="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-[15px] font-medium text-[#1A1C21] transition hover:bg-[#F7F8FA]" role="menuitem">
                  <ng-icon name="heroMegaphone" class="text-[18px] text-[#6A6D75]"></ng-icon>
                  Banner promotions
                </button>
                <button type="button" (click)="goToSellerRoute('/ads/plans')" class="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-[15px] font-medium text-[#1A1C21] transition hover:bg-[#F7F8FA]" role="menuitem">
                  <ng-icon name="heroRectangleStack" class="text-[18px] text-[#6A6D75]"></ng-icon>
                  Ads
                </button>
                <button type="button" (click)="goToSellerRoute('/analytics')" class="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-[15px] font-medium text-[#1A1C21] transition hover:bg-[#F7F8FA]" role="menuitem">
                  <ng-icon name="heroChartBar" class="text-[18px] text-[#6A6D75]"></ng-icon>
                  Analytics
                </button>
                <button type="button" (click)="goToSellerRoute('/wallet')" class="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-[15px] font-medium text-[#1A1C21] transition hover:bg-[#F7F8FA]" role="menuitem">
                  <ng-icon name="heroWallet" class="text-[18px] text-[#6A6D75]"></ng-icon>
                  Wallet
                </button>
                <button type="button" (click)="goToSellerRoute('/settings')" class="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-[15px] font-medium text-[#1A1C21] transition hover:bg-[#F7F8FA]" role="menuitem">
                  <ng-icon name="heroCog6Tooth" class="text-[18px] text-[#6A6D75]"></ng-icon>
                  Account settings
                </button>
                <button type="button" (click)="goToSellerRoute('/notifications')" class="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-[15px] font-medium text-[#1A1C21] transition hover:bg-[#F7F8FA]" role="menuitem">
                  <ng-icon name="heroBell" class="text-[18px] text-[#6A6D75]"></ng-icon>
                  Notifications
                </button>
              </div>

              <div class="my-3 h-px bg-[#EEF0F4]"></div>

              <button type="button" (click)="switchToBuyerMode()" class="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-[15px] font-medium text-[#1A1C21] transition hover:bg-[#F7F8FA]" role="menuitem">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-[18px] w-[18px] text-[#6A6D75]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M3 4.75A.75.75 0 013.75 4h8.19l-1.22-1.22a.75.75 0 111.06-1.06l2.5 2.5a.75.75 0 010 1.06l-2.5 2.5a.75.75 0 11-1.06-1.06L11.94 5.5H3.75A.75.75 0 013 4.75zm14 10.5a.75.75 0 01-.75.75H8.06l1.22 1.22a.75.75 0 11-1.06 1.06l-2.5-2.5a.75.75 0 010-1.06l2.5-2.5a.75.75 0 011.06 1.06L8.06 14.5h8.19a.75.75 0 01.75.75z"/>
                </svg>
                Switch to buyer mode
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
  styles: [`
    :host {
      display: block;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardNavbarComponent {
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

  goToSellerRoute(path: string): void {
    this.closeAccountMenu();
    void this.router.navigateByUrl(path);
  }

  switchToBuyerMode(): void {
    this.closeAccountMenu();
    void this.router.navigate(['/buyer']);
  }

  logOut(): void {
    this.closeAccountMenu();
    void this.router.navigate(['/sign-in']);
  }
}
