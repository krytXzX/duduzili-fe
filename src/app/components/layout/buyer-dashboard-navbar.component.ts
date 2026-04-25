import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronDown, heroMapPin } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-buyer-dashboard-navbar',
  imports: [CommonModule, RouterLink, NgOptimizedImage, NgIcon],
  providers: [
    provideIcons({
      heroChevronDown,
      heroMapPin,
    }),
  ],
  template: `
    <header class="flex h-12 items-center justify-between overflow-hidden rounded-[100px] bg-[#1A1A1A] py-[9px] pl-6 pr-2 text-white">
      <div class="flex min-w-0 items-center gap-6">
        <a routerLink="/" class="block transition-opacity hover:opacity-90" aria-label="Duduzili home">
          <img
            ngSrc="/assets/icons/home-logo-light.svg"
            alt="Duduzili"
            width="112"
            height="26"
            priority
            class="h-[26px] w-auto object-contain"
          />
        </a>

        <button
          type="button"
          class="hidden h-10 w-[176px] items-center justify-between rounded-full bg-[#2F2F2F] py-1 pl-3 pr-1 text-white md:inline-flex"
          aria-label="Select location"
        >
          <span class="flex items-center gap-1 text-[14px] font-semibold tracking-[0.14px]">
            <ng-icon name="heroMapPin" class="text-[16px] text-[#FF3B30]"></ng-icon>
            All of Nigeria
          </span>
          <span class="flex h-8 w-10 items-center justify-center rounded-full bg-[#515151]">
            <ng-icon name="heroChevronDown" class="text-[16px] text-white"></ng-icon>
          </span>
        </button>
      </div>

      <div class="flex items-center gap-0.5">
        <button
          type="button"
          (click)="switchToSellerMode()"
          class="hidden h-10 items-center justify-center rounded-[64px] px-[14px] text-[14px] font-medium leading-5 text-white transition hover:bg-white/5 sm:inline-flex"
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
            class="relative z-50 flex h-10 w-[78px] items-center rounded-[24px] bg-white p-1 text-[#1C274C] transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            aria-haspopup="menu"
            [attr.aria-expanded]="isAccountMenuOpen()"
            aria-label="Open buyer account menu"
          >
            <img
              ngSrc="/assets/images/seller-menu-avatar.png"
              width="32"
              height="32"
              alt=""
              aria-hidden="true"
              class="h-8 w-8 rounded-full object-cover"
            />
            <img
              ngSrc="/assets/images/Outline/Essentional, UI/Hamburger Menu.svg"
              width="20"
              height="20"
              alt=""
              aria-hidden="true"
              class="ml-4 h-5 w-5"
            />
          </button>

          @if (isAccountMenuOpen()) {
            <div
              class="absolute right-0 top-[calc(100%+12px)] z-50 flex w-[305px] flex-col gap-[10px] overflow-hidden rounded-[24px] bg-white py-4 text-[#15162B] shadow-[0_6.65px_5.32px_rgba(0,0,0,0.03),0_2.767px_2.214px_rgba(0,0,0,0.02)]"
              role="menu"
              aria-label="Buyer account menu"
            >
              <div class="flex flex-col gap-6">
                <div class="flex items-center gap-1.5 px-3">
                  <img
                    ngSrc="/assets/images/seller-menu-avatar.png"
                    width="36"
                    height="36"
                    alt=""
                    aria-hidden="true"
                    class="h-9 w-9 rounded-full object-cover"
                  />
                  <div class="min-w-0 leading-none">
                    <p class="truncate text-[14px] font-medium tracking-[-0.07px] text-[#15162B]">Bryan Odjede</p>
                    <p class="mt-0.5 truncate text-[10px] font-normal text-[#72737F]">Buyer mode</p>
                  </div>
                </div>

                <div class="flex flex-col gap-3">
                  <div class="flex flex-col gap-2">
                    <button type="button" (click)="goToBuyerRoute('/buyer/chats')" class="flex h-7 w-full items-center gap-2 rounded-[8px] bg-white px-3 py-2.5 text-left text-[14px] font-medium text-[#15162B] transition hover:bg-[#F7F8FA]" role="menuitem">
                      <img ngSrc="/assets/icons/buyer-menu/messages.svg" width="16" height="16" alt="" aria-hidden="true" class="h-4 w-4 shrink-0" />
                      <span>Chats</span>
                    </button>
                    <button type="button" (click)="goToBuyerRoute('/buyer/wishlist')" class="flex h-7 w-full items-center gap-2 rounded-[8px] bg-white px-3 py-2.5 text-left text-[14px] font-medium text-[#15162B] transition hover:bg-[#F7F8FA]" role="menuitem">
                      <img ngSrc="/assets/icons/buyer-menu/heart.svg" width="16" height="16" alt="" aria-hidden="true" class="h-4 w-4 shrink-0" />
                      <span>Wishlist</span>
                    </button>
                    <button type="button" (click)="goToBuyerRoute('/buyer/followed-stores')" class="flex h-7 w-full items-center gap-2 rounded-[8px] bg-white px-3 py-2.5 text-left text-[14px] font-medium text-[#15162B] transition hover:bg-[#F7F8FA]" role="menuitem">
                      <img ngSrc="/assets/icons/buyer-menu/shop.svg" width="16" height="16" alt="" aria-hidden="true" class="h-4 w-4 shrink-0" />
                      <span>Followed stores</span>
                    </button>
                    <button type="button" (click)="goToBuyerRoute('/buyer/recently-viewed')" class="flex h-7 w-full items-center gap-2 rounded-[8px] bg-white px-3 py-2.5 text-left text-[14px] font-medium text-[#15162B] transition hover:bg-[#F7F8FA]" role="menuitem">
                      <img ngSrc="/assets/icons/buyer-menu/global-search.svg" width="16" height="16" alt="" aria-hidden="true" class="h-4 w-4 shrink-0" />
                      <span>Recently viewed</span>
                    </button>
                    <button type="button" (click)="goToBuyerRoute('/buyer/settings')" class="flex h-7 w-full items-center gap-2 rounded-[8px] bg-white px-3 py-2.5 text-left text-[14px] font-medium text-[#15162B] transition hover:bg-[#F7F8FA]" role="menuitem">
                      <img ngSrc="/assets/icons/buyer-menu/setting-2.svg" width="16" height="16" alt="" aria-hidden="true" class="h-4 w-4 shrink-0" />
                      <span>Account settings</span>
                    </button>
                    <button type="button" (click)="goToBuyerRoute('/buyer/notifications')" class="flex h-7 w-full items-center gap-2 rounded-[8px] bg-white px-3 py-2.5 text-left text-[14px] font-medium text-[#15162B] transition hover:bg-[#F7F8FA]" role="menuitem">
                      <img ngSrc="/assets/icons/buyer-menu/notification-bing.svg" width="16" height="16" alt="" aria-hidden="true" class="h-4 w-4 shrink-0" />
                      <span>Notifications</span>
                    </button>
                  </div>

                  <div class="flex flex-col gap-3">
                    <div class="h-px w-full bg-[#E9EAF0]"></div>

                    <button type="button" (click)="switchToSellerMode()" class="flex h-7 w-full items-center gap-2 rounded-[8px] bg-white px-3 py-2.5 text-left text-[14px] font-medium text-[#15162B] transition hover:bg-[#F7F8FA]" role="menuitem">
                      <img ngSrc="/assets/icons/buyer-menu/arrow-swap-horizontal.svg" width="16" height="16" alt="" aria-hidden="true" class="h-4 w-4 shrink-0" />
                      <span>Switch to seller mode</span>
                    </button>

                    <button type="button" (click)="logOut()" class="flex h-7 w-full items-center gap-2 rounded-[8px] bg-white px-3 py-2.5 text-left text-[14px] font-medium text-[#FF2524] transition hover:bg-[#FFF5F5]" role="menuitem">
                      <img ngSrc="/assets/icons/buyer-menu/logout.svg" width="16" height="16" alt="" aria-hidden="true" class="h-4 w-4 shrink-0" />
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              </div>
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
  readonly isAccountMenuOpen = signal(false);

  toggleAccountMenu(): void {
    this.isAccountMenuOpen.update((value) => !value);
  }

  closeAccountMenu(): void {
    this.isAccountMenuOpen.set(false);
  }

  goToBuyerRoute(path: string): void {
    this.closeAccountMenu();
    void this.router.navigateByUrl(path);
  }

  switchToSellerMode(): void {
    this.closeAccountMenu();
    void this.router.navigate(['/home']);
  }

  logOut(): void {
    this.closeAccountMenu();
    void this.router.navigate(['/sign-in']);
  }
}
