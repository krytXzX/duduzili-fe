import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

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
    <section class="min-h-full bg-[#F4F4F4] px-5 pb-[190px] lg:bg-white lg:px-8 lg:pt-8">
      <div class="flex h-[54px] items-center justify-between lg:hidden">
        <h1 class="text-[24px] font-semibold leading-8 text-[#1A1B1D]">More</h1>

        <a
          routerLink="/seller/notifications"
          class="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-[0_4px_12px_rgba(212,212,212,0.25)] transition hover:scale-105 active:scale-95"
          aria-label="Notifications"
        >
          <span
            class="inline-block h-5 w-5 bg-[#1F1F1F]"
            style="-webkit-mask: url('/assets/icons/more-mobile-figma/notification-bing.svg') center / contain no-repeat; mask: url('/assets/icons/more-mobile-figma/notification-bing.svg') center / contain no-repeat;"
            aria-hidden="true"
          ></span>
        </a>
      </div>

      <div class="mt-3 flex flex-col gap-6 lg:hidden">
        @for (group of menuGroups; track $index) {
          <div class="rounded-[24px] bg-white p-3">
            <div class="flex flex-col">
              @for (item of group; track item.label) {
                <a
                  [routerLink]="item.route"
                  class="group flex min-h-8 items-center justify-between rounded-[14px] transition hover:bg-[#F7F7F7] active:scale-[0.99]"
                >
                  <span class="flex items-center gap-2">
                    <span
                      class="flex h-[30.67px] w-[30.67px] items-center justify-center rounded-lg transition group-hover:scale-105"
                      [style.background-color]="item.iconBackground"
                    >
                      <span
                        class="inline-block h-5 w-5 bg-white"
                        [style.webkitMaskImage]="'url(' + item.icon + ')'"
                        [style.maskImage]="'url(' + item.icon + ')'"
                        [style.webkitMaskRepeat]="'no-repeat'"
                        [style.maskRepeat]="'no-repeat'"
                        [style.webkitMaskPosition]="'center'"
                        [style.maskPosition]="'center'"
                        [style.webkitMaskSize]="'contain'"
                        [style.maskSize]="'contain'"
                        aria-hidden="true"
                      ></span>
                    </span>
                    <span class="text-[16px] font-medium leading-5 text-[#1F1F1F]">
                      {{ item.label }}
                    </span>
                  </span>

                  <span
                    class="mr-1 inline-block h-4 w-4 bg-[#8D93A0] transition group-hover:translate-x-0.5"
                    style="-webkit-mask: url('/assets/icons/more-mobile-figma/arrow-right.svg') center / contain no-repeat; mask: url('/assets/icons/more-mobile-figma/arrow-right.svg') center / contain no-repeat;"
                    aria-hidden="true"
                  ></span>
                </a>

                @if (!$last) {
                  <div class="my-3 ml-[42.67px] h-px bg-[#EAEAEA]"></div>
                }
              }
            </div>
          </div>
        }

        <!-- FAQs Card -->
        <div class="rounded-[24px] bg-white p-3">
          <div class="flex flex-col">
            <a
              routerLink="/faq"
              class="group flex min-h-8 items-center justify-between rounded-[14px] transition hover:bg-[#F7F7F7] active:scale-[0.99]"
            >
              <span class="flex items-center gap-2">
                <span
                  class="flex h-[30.67px] w-[30.67px] items-center justify-center rounded-lg transition group-hover:scale-105"
                >
                  <img
                    ngSrc="/assets/icons/message-question-icon.svg"
                    alt=""
                    width="32"
                    height="32"
                    class="h-[30.67px] w-[30.67px]"
                    aria-hidden="true"
                  />
                </span>
                <span class="text-[16px] font-medium leading-5 text-[#1F1F1F]">
                  FAQs
                </span>
              </span>

              <span
                class="mr-1 inline-block h-4 w-4 bg-[#8D93A0] transition group-hover:translate-x-0.5"
                style="-webkit-mask: url('/assets/icons/more-mobile-figma/arrow-right.svg') center / contain no-repeat; mask: url('/assets/icons/more-mobile-figma/arrow-right.svg') center / contain no-repeat;"
                aria-hidden="true"
              ></span>
            </a>
          </div>
        </div>

        <button
          type="button"
          (click)="switchToBuyerMode()"
          class="fixed bottom-[119px] left-1/2 z-30 inline-flex h-[52px] w-[277px] -translate-x-1/2 items-center justify-center gap-2 rounded-[64px] border border-white bg-[#6453D9] px-5 text-[16px] font-medium text-white shadow-[0_4px_8px_rgba(81,35,173,0.4),0_0_0_1px_#2A6CE8] transition hover:-translate-y-0.5 hover:bg-[#5C4AD0] active:translate-y-0 active:scale-[0.98]"
        >
          <img
            ngSrc="/assets/icons/more-mobile-figma/repeat.svg"
            alt=""
            width="16"
            height="16"
            class="h-4 w-4"
            aria-hidden="true"
          />
          Switch to buyer mode
        </button>
      </div>

      <div class="hidden lg:block">
        <h1 class="text-2xl font-semibold text-[#1A1B1D]">More</h1>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SellerMorePageComponent {
  private readonly router = inject(Router);

  protected readonly menuGroups: ReadonlyArray<ReadonlyArray<SellerMoreItem>> = [
    [
      {
        label: 'Requests',
        route: '/seller/requests',
        icon: '/assets/icons/seller-sidebar-requests.svg',
        iconBackground: '#48A465',
      },
    ],
    [
      {
        label: 'Banner promotions',
        route: '/seller/promotions',
        icon: '/assets/icons/seller-sidebar-promotions.svg',
        iconBackground: '#784EC5',
      },
      {
        label: 'Ads',
        route: '/seller/ads',
        icon: '/assets/icons/seller-sidebar-ads.svg',
        iconBackground: '#25AD31',
      },
      {
        label: 'Analytics',
        route: '/seller/analytics',
        icon: '/assets/icons/seller-sidebar-analytics.svg',
        iconBackground: '#E2B448',
      },
      {
        label: 'Wallet',
        route: '/seller/wallet',
        icon: '/assets/icons/seller-sidebar-wallet.svg',
        iconBackground: '#F54489',
      },
    ],
    [
      {
        label: 'Account settings',
        route: '/seller/settings',
        icon: '/assets/icons/seller-sidebar-settings.svg',
        iconBackground: '#1969FE',
      },
    ],
  ];

  switchToBuyerMode(): void {
    void this.router.navigateByUrl('/en');
  }
}
