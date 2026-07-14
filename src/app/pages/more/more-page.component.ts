import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';

type BuyerMoreItem = {
  readonly label: string;
  readonly route: string;
  readonly icon: string;
  readonly iconBg: string;
};

@Component({
  selector: 'app-more-page',
  imports: [NgOptimizedImage, RouterLink],
  template: `
    <div class="relative min-h-full bg-[#f4f4f4] pb-[120px] md:bg-transparent md:px-6 md:py-8">
      <div class="mx-auto w-full max-w-[390px] md:max-w-5xl md:rounded-[32px] md:border md:border-[#ECECF3] md:bg-white md:px-8 md:py-8 md:shadow-[0_12px_40px_-32px_rgba(23,29,38,0.35)]">
        <div class="px-5 pt-2 md:pt-0">
          <div class="flex items-center justify-between">
            <h1 class="text-[24px] font-semibold leading-8 text-[#1a1b1d]">More</h1>

            <a
              routerLink="/notifications"
              aria-label="Open notifications"
              class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white"
            >
              <img
                ngSrc="/assets/icons/more-mobile-figma/notification-bing.svg"
                alt=""
                width="20"
                height="20"
                class="h-5 w-5"
                aria-hidden="true"
              />
            </a>
          </div>

          <section class="mt-8 rounded-[24px] bg-white p-3">
            @for (item of items; track item.label) {
              <a [routerLink]="item.route" class="flex items-center justify-between py-[14px]">
                <span class="flex items-center gap-2">
                  <span class="inline-flex h-8 w-8 items-center justify-center rounded-[8px]" [style.background-color]="item.iconBg">
                    <img [ngSrc]="item.icon" alt="" width="20" height="20" class="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span class="text-[16px] font-medium leading-5 text-[#1f1f1f]">{{ item.label }}</span>
                </span>

                <img
                  ngSrc="/assets/icons/more-mobile-figma/arrow-right.svg"
                  alt=""
                  width="16"
                  height="16"
                  class="h-4 w-4"
                  aria-hidden="true"
                />
              </a>

              @if (!$last) {
                <div class="mx-10 h-px bg-[#e4e4e4]"></div>
              }
            }
          </section>

          <section class="mt-4 rounded-[24px] bg-white p-3">
            <a routerLink="/faq" class="flex items-center justify-between py-[14px]">
              <span class="flex items-center gap-2">
                <span class="inline-flex h-8 w-8 items-center justify-center rounded-[8px]">
                  <img ngSrc="/assets/icons/message-question-icon.svg" alt="" width="32" height="32" class="h-8 w-8" aria-hidden="true" />
                </span>
                <span class="text-[16px] font-medium leading-5 text-[#1f1f1f]">FAQs</span>
              </span>

              <img
                ngSrc="/assets/icons/more-mobile-figma/arrow-right.svg"
                alt=""
                width="16"
                height="16"
                class="h-4 w-4"
                aria-hidden="true"
              />
            </a>
          </section>
        </div>

        <div class="mt-10 flex justify-center px-5 md:mt-16 md:px-0">
          <a
            routerLink="/seller/listings"
            class="inline-flex h-[52px] w-full max-w-[277px] items-center justify-center gap-2 overflow-hidden rounded-[64px] border border-white bg-[#6453d9] px-5 text-[16px] font-medium leading-6 text-white shadow-[0_4px_8px_rgba(81,35,173,0.4),0_0_0_1px_#2a6ce8] transition hover:-translate-y-0.5 hover:bg-[#5c4ad0] active:translate-y-0 active:scale-[0.98]"
            aria-label="Sell an item"
          >
            <img
              ngSrc="/assets/icons/buyer-more/box-add.svg"
              alt=""
              width="20"
              height="20"
              class="h-5 w-5"
              aria-hidden="true"
            />
            Sell an item
          </a>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MorePageComponent {
  protected readonly items: readonly BuyerMoreItem[] = [
    {
      label: 'Followed stores',
      route: '/followed-stores',
      icon: '/assets/icons/more-mobile-figma/shop.svg',
      iconBg: '#e2b448',
    },
    {
      label: 'Recently viewed',
      route: '/recently-viewed',
      icon: '/assets/icons/more-mobile-figma/global-search.svg',
      iconBg: '#48a465',
    },
    {
      label: 'Account settings',
      route: '/settings',
      icon: '/assets/icons/more-mobile-figma/setting-2.svg',
      iconBg: '#1969fe',
    },
  ];
}
