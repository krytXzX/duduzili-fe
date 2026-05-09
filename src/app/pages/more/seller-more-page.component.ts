import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';

type SellerMoreItem = {
  readonly label: string;
  readonly route: string;
  readonly icon: string;
  readonly iconBackground: string;
};

@Component({
  selector: 'app-seller-more-page',
  imports: [NgOptimizedImage, RouterLink],
  template: `
    <section class="min-h-full bg-[#F4F4F4] px-5 pb-8 pt-2 lg:bg-white lg:px-8 lg:pt-8">
      <div class="flex h-[54px] items-center justify-between lg:hidden">
        <h1 class="text-[24px] font-semibold leading-8 text-[#1A1B1D]">More</h1>

        <a
          routerLink="/seller/notifications"
          class="flex h-9 w-9 items-center justify-center rounded-full bg-white"
          aria-label="Notifications"
        >
          <img
            ngSrc="/assets/icons/seller-sidebar-notifications.svg"
            width="20"
            height="20"
            alt=""
            class="h-5 w-5"
            aria-hidden="true"
          />
        </a>
      </div>

      <div class="mt-3 flex flex-col gap-6 lg:hidden">
        @for (group of menuGroups; track $index) {
          <div class="rounded-[24px] bg-white p-3">
            <div class="flex flex-col">
              @for (item of group; track item.label) {
                <a
                  [routerLink]="item.route"
                  class="flex min-h-10 items-center justify-between"
                >
                  <span class="flex items-center gap-2">
                    <span
                      class="flex h-[30.67px] w-[30.67px] items-center justify-center rounded-lg"
                      [style.background-color]="item.iconBackground"
                    >
                      <img
                        [ngSrc]="item.icon"
                        width="20"
                        height="20"
                        alt=""
                        class="h-5 w-5"
                        aria-hidden="true"
                      />
                    </span>
                    <span class="text-[16px] font-medium leading-5 text-[#1F1F1F]">
                      {{ item.label }}
                    </span>
                  </span>

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    class="h-4 w-4 text-[#8D93A0]"
                    aria-hidden="true"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M7.22 4.22a.75.75 0 011.06 0l5.25 5.25a.75.75 0 010 1.06l-5.25 5.25a.75.75 0 11-1.06-1.06L11.94 10 7.22 5.28a.75.75 0 010-1.06z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </a>

                @if (!$last) {
                  <div class="ml-[52px] h-px bg-[#EAEAEA]"></div>
                }
              }
            </div>
          </div>
        }

        <a
          routerLink="/home"
          class="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-[64px] border border-white bg-[#6453D9] px-5 text-[16px] font-medium text-white shadow-[0_4px_8px_rgba(81,35,173,0.4),0_0_0_1px_#2A6CE8]"
        >
          <img
            ngSrc="/assets/icons/more-mobile-figma/repeat.svg"
            alt=""
            width="16"
            height="16"
            class="h-4 w-4"
            aria-hidden="true"
          />
          Switch to buyer profile
        </a>
      </div>

      <div class="hidden lg:block">
        <h1 class="text-2xl font-semibold text-[#1A1B1D]">More</h1>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SellerMorePageComponent {
  protected readonly menuGroups: ReadonlyArray<ReadonlyArray<SellerMoreItem>> = [
    [
      {
        label: 'Requests',
        route: '/seller/requests',
        icon: '/assets/icons/seller-sidebar-requests.svg',
        iconBackground: '#E2B448',
      },
      {
        label: 'Banner promotions',
        route: '/seller/promotions',
        icon: '/assets/icons/seller-sidebar-promotions.svg',
        iconBackground: '#48A465',
      },
    ],
    [
      {
        label: 'Ads',
        route: '/seller/ads',
        icon: '/assets/icons/seller-sidebar-ads.svg',
        iconBackground: '#F7458A',
      },
      {
        label: 'Analytics',
        route: '/seller/analytics',
        icon: '/assets/icons/seller-sidebar-analytics.svg',
        iconBackground: '#1969FE',
      },
      {
        label: 'Wallet',
        route: '/seller/wallet',
        icon: '/assets/icons/seller-sidebar-wallet.svg',
        iconBackground: '#25AD31',
      },
    ],
    [
      {
        label: 'Account settings',
        route: '/seller/settings',
        icon: '/assets/icons/seller-sidebar-settings.svg',
        iconBackground: '#FF641E',
      },
    ],
  ];
}
