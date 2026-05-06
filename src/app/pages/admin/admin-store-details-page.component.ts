import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroArrowTopRightOnSquare,
  heroCheckBadge,
  heroChevronLeft,
  heroCube,
  heroEllipsisHorizontal,
  heroMapPin,
  heroNoSymbol,
  heroStar,
} from '@ng-icons/heroicons/outline';
import { heroStarSolid } from '@ng-icons/heroicons/solid';

type StoreDetailsTab = 'products' | 'reviews';

@Component({
  selector: 'app-admin-store-details-page',
  imports: [RouterLink, NgIcon, NgOptimizedImage],
  providers: [
    provideIcons({
      heroArrowTopRightOnSquare,
      heroCheckBadge,
      heroChevronLeft,
      heroCube,
      heroEllipsisHorizontal,
      heroMapPin,
      heroNoSymbol,
      heroStar,
      heroStarSolid,
    }),
  ],
  template: `
    <section class="h-full overflow-y-auto bg-white md:rounded-[24px] md:border md:border-[#EAEAEA]">
      <div class="hidden border-b border-[#EAEAEA] px-6 py-5 md:block">
        <nav class="flex items-center gap-2 text-[16px]">
          <a routerLink="/admin/stores" class="text-[#959595]">Stores</a>
          <span class="text-[#959595]">/</span>
          <span class="text-[#1F1F1F]">Store information</span>
        </nav>
      </div>

      <div class="md:hidden">
        <div class="flex items-center gap-2 px-5 py-3">
          <button
            type="button"
            routerLink="/admin/stores"
            class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F3F3] text-[#141414]"
            aria-label="Go back"
          >
            <ng-icon name="heroChevronLeft" class="text-[18px]"></ng-icon>
          </button>
          <h1 class="text-[20px] font-semibold leading-[1.2] text-[#141414]">Store information</h1>
        </div>
      </div>

      <div class="px-5 pb-10 md:px-6 md:pb-14 md:pt-6">
        <div class="relative h-[91px] overflow-hidden rounded-t-[12px] md:h-[197px] md:rounded-t-[20px]">
          <img
            ngSrc="/assets/images/admin-store-details-empty/store-banner-bg.png"
            alt=""
            fill
            class="object-cover"
          />
          <div class="absolute inset-x-0 bottom-0 h-14 bg-linear-to-t from-white to-transparent md:h-24"></div>
        </div>

        <div class="relative -mt-8 md:-mt-16">
          <div class="flex items-start justify-between gap-3">
            <div class="flex flex-col">
              <div class="mb-2 h-[74px] w-[74px] overflow-hidden rounded-full border-4 border-white bg-[#3D785F] md:h-[97px] md:w-[97px]">
                <img
                  ngSrc="/assets/images/admin-store-details-empty/store-logo-mark.svg"
                  alt=""
                  width="97"
                  height="97"
                />
              </div>

              <div class="flex items-center gap-1.5">
                <h2 class="text-[18px] font-medium leading-[1.2] text-[#1F1F1F] md:text-[24px]">
                  The Vine Collections
                </h2>
                <ng-icon name="heroCheckBadge" class="text-[14px] text-[#6453D9] md:text-[16px]"></ng-icon>
              </div>

              <div class="mt-1 flex items-center gap-1 text-[#777777]">
                <ng-icon name="heroMapPin" class="text-[14px] md:text-[16px]"></ng-icon>
                <span class="text-[14px] leading-5 md:text-[16px] md:leading-6">Ikeja, Lagos</span>
              </div>
            </div>

            <div class="mt-2 flex items-center gap-3 md:mt-10">
              <button
                type="button"
                class="hidden items-center gap-2 rounded-full border border-[#EAEAEA] px-5 py-2.5 text-[14px] text-[#141414] md:inline-flex"
              >
                <ng-icon name="heroNoSymbol" class="text-[16px]"></ng-icon>
                Suspend store
              </button>
              <button
                type="button"
                class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#EAEAEA] bg-white text-[#141414] md:h-10 md:w-10"
                aria-label="More actions"
              >
                <ng-icon name="heroEllipsisHorizontal" class="text-[16px]"></ng-icon>
              </button>
            </div>
          </div>

          <div class="mt-6 overflow-x-auto pb-2">
            <div class="flex min-w-max items-stretch gap-4 md:gap-5">
              @for (metric of metrics; track metric.label) {
                <div class="pr-4 md:pr-5" [class.border-r]="metric.label !== 'Linked user'" [class.border-[#EAEAEA]]="metric.label !== 'Linked user'">
                  <p class="text-[12px] leading-4 text-[#777777] md:text-[14px] md:leading-5">{{ metric.label }}</p>
                  @if (metric.label === 'Rating') {
                    <div class="mt-1 flex items-center gap-1">
                      <span class="text-[14px] font-medium leading-5 text-[#1F1F1F] md:text-[16px] md:leading-6">
                        {{ metric.value }}
                      </span>
                      <ng-icon name="heroStarSolid" class="text-[14px] text-[#C4CE2A]"></ng-icon>
                    </div>
                  } @else if (metric.label === 'Linked user') {
                    <div class="mt-1 flex items-center gap-2">
                      <img
                        ngSrc="/assets/images/admin-stores/user-ifeanyi.png"
                        alt=""
                        width="24"
                        height="24"
                        class="rounded-full"
                      />
                      <span class="text-[14px] font-medium leading-5 text-[#1F1F1F] md:text-[16px] md:leading-6">{{ metric.value }}</span>
                      <ng-icon name="heroArrowTopRightOnSquare" class="text-[14px] text-[#1F1F1F]"></ng-icon>
                    </div>
                  } @else {
                    <p class="mt-1 text-[14px] font-medium leading-5 text-[#1F1F1F] md:text-[16px] md:leading-6">{{ metric.value }}</p>
                  }
                </div>
              }
            </div>
          </div>

          <div class="mt-4 flex items-center gap-6 border-b border-[#EAEAEA]">
            <button
              type="button"
              (click)="activeTab.set('products')"
              class="flex items-center gap-1 border-b-2 pb-3 text-[16px] leading-6"
              [class.border-[#6453D9]]="activeTab() === 'products'"
              [class.text-[#6453D9]]="activeTab() === 'products'"
              [class.border-transparent]="activeTab() !== 'products'"
              [class.text-[#959595]]="activeTab() !== 'products'"
            >
              <ng-icon name="heroCube" class="text-[16px]"></ng-icon>
              Products
            </button>
            <button
              type="button"
              (click)="activeTab.set('reviews')"
              class="flex items-center gap-1 border-b-2 pb-3 text-[16px] leading-6"
              [class.border-[#6453D9]]="activeTab() === 'reviews'"
              [class.text-[#6453D9]]="activeTab() === 'reviews'"
              [class.border-transparent]="activeTab() !== 'reviews'"
              [class.text-[#959595]]="activeTab() !== 'reviews'"
            >
              <ng-icon name="heroStar" class="text-[16px]"></ng-icon>
              Reviews
            </button>
          </div>
        </div>

        <div class="flex min-h-[370px] flex-col items-center justify-center px-4 text-center md:min-h-[430px]">
          <img
            ngSrc="/assets/images/empty_state.svg"
            alt=""
            width="188"
            height="159"
            class="opacity-30 md:h-[159px] md:w-[188px]"
          />
          <h3 class="mt-6 text-[24px] font-medium leading-[1.2] tracking-[-0.02em] text-[#1A1B1D] md:text-[28px]">
            Looks a little empty here 👀
          </h3>
          <p class="mt-2 max-w-[420px] text-[16px] leading-[1.2] text-[#6C6C6C] md:text-[18px]">
            When they add some listings, they’ll appear here
          </p>
        </div>
      </div>
    </section>
  `,
  host: {
    class: 'block h-full',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminStoreDetailsPageComponent {
  readonly activeTab = signal<StoreDetailsTab>('products');
  readonly metrics = [
    { label: 'Followers', value: '2.5k' },
    { label: 'Products', value: '1,456' },
    { label: 'Rating', value: '4.8' },
    { label: 'Date joined', value: '16 Feb, 2024' },
    { label: 'Linked user', value: 'Ifeanyi Austin' },
  ];
}
