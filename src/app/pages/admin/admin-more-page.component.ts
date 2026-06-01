import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';

type AdminMoreItem = {
  label: string;
  route: string;
  icon: string;
  iconBackground: string;
};

@Component({
  selector: 'app-admin-more-page',
  imports: [NgOptimizedImage, RouterLink],
  template: `
    <section class="min-h-full bg-[#F4F4F4] px-5 pb-8 pt-2 lg:bg-white lg:px-8 lg:pt-8">
      <div class="flex h-[54px] items-center justify-between lg:hidden">
        <h1 class="text-[24px] font-semibold leading-8 text-[#1A1B1D]">More</h1>

        <a
          routerLink="/admin/notifications"
          class="flex h-9 w-9 items-center justify-center rounded-full bg-white"
          aria-label="Notifications"
        >
          <img
            ngSrc="/assets/icons/admin-more/notification-bing.svg"
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

                  <img
                    ngSrc="/assets/icons/admin-more/arrow-right.svg"
                    width="16"
                    height="16"
                    alt=""
                    class="h-4 w-4"
                    aria-hidden="true"
                  />
                </a>

                @if (!$last) {
                  <div class="ml-[52px] h-px bg-[#EAEAEA]"></div>
                }
              }
            </div>
          </div>
        }
      </div>

      <div class="hidden lg:block">
        <h1 class="text-2xl font-semibold text-[#1A1B1D]">More</h1>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminMorePageComponent {
  protected readonly menuGroups: ReadonlyArray<ReadonlyArray<AdminMoreItem>> = [
    [
      {
        label: 'Ads management',
        route: '/admin/ads',
        icon: '/assets/icons/admin-more/award.svg',
        iconBackground: '#48A465',
      },
      {
        label: 'Categories',
        route: '/admin/categories',
        icon: '/assets/icons/admin-more/shop.svg',
        iconBackground: '#8E6CFF',
      },
      {
        label: 'Stores',
        route: '/admin/stores',
        icon: '/assets/icons/admin-more/shop.svg',
        iconBackground: '#E2B448',
      },
    ],
    [
      {
        label: 'KYC requests',
        route: '/admin/kyc-requests',
        icon: '/assets/icons/admin-more/card-tick.svg',
        iconBackground: '#F7458A',
      },
      {
        label: 'Reports',
        route: '/admin/reports',
        icon: '/assets/icons/admin-more/flag.svg',
        iconBackground: '#25AD31',
      },
    ],
    [
      {
        label: 'Audit log',
        route: '/admin/audit-log',
        icon: '/assets/icons/admin-more/document.svg',
        iconBackground: '#E2B448',
      },
    ],
    [
      {
        label: 'Team management',
        route: '/admin/team-management',
        icon: '/assets/icons/admin-more/security-user.svg',
        iconBackground: '#1969FE',
      },
      {
        label: 'Account settings',
        route: '/admin/settings',
        icon: '/assets/icons/admin-more/setting-2.svg',
        iconBackground: '#FF641E',
      },
    ],
  ];
}
