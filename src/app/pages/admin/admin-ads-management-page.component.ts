import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronLeft, heroChevronRight } from '@ng-icons/heroicons/outline';

type AdminAdsMenuItem = {
  label: string;
  route: string;
  icon: string;
};

@Component({
  selector: 'app-admin-ads-management-page',
  imports: [RouterLink, NgOptimizedImage, NgIcon],
  providers: [provideIcons({ heroChevronLeft, heroChevronRight })],
  template: `
    <section class="min-h-full w-full bg-white">
      <div class="flex h-[54px] items-center px-5 lg:hidden">
        <a routerLink="/admin/more" class="flex items-center gap-2">
          <span class="inline-flex h-8 w-11 items-center justify-center rounded-full bg-[#F3F3F3]">
            <ng-icon name="heroChevronLeft" class="text-[20px] text-black"></ng-icon>
          </span>
          <span class="text-[20px] font-semibold leading-[1.2] text-black">Ads management</span>
        </a>
      </div>

      <div class="px-5 pb-8 pt-5 lg:hidden">
        <div class="flex w-full max-w-[350px] flex-col gap-5">
          @for (item of items; track item.label) {
            <a [routerLink]="item.route" class="flex items-center justify-between">
              <span class="flex items-center gap-3">
                <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#313131]">
                  <img [ngSrc]="item.icon" alt="" width="14" height="14" class="h-[14px] w-[14px]" />
                </span>
                <span class="text-[16px] font-medium leading-5 text-[rgba(13,13,13,0.8)]">
                  {{ item.label }}
                </span>
              </span>

              <ng-icon name="heroChevronRight" class="text-[16px] text-[rgba(13,13,13,0.8)]"></ng-icon>
            </a>
          }
        </div>
      </div>

      <div class="hidden p-8 lg:block">
        <h1 class="text-[18px] font-medium tracking-[-0.04em] text-[#B3B3B3]">
          Ads management
        </h1>
        <div class="mt-5 grid max-w-[680px] grid-cols-2 gap-4">
          @for (item of items; track item.label) {
            <a
              [routerLink]="item.route"
              class="flex items-center justify-between rounded-[16px] border border-[#EAEAEA] bg-white px-4 py-3 transition hover:bg-[#FAFAFA]"
            >
              <span class="flex items-center gap-3">
                <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#313131]">
                  <img [ngSrc]="item.icon" alt="" width="14" height="14" class="h-[14px] w-[14px]" />
                </span>
                <span class="text-[16px] font-medium text-[#1F1F1F]">{{ item.label }}</span>
              </span>
              <ng-icon name="heroChevronRight" class="text-[16px] text-[rgba(13,13,13,0.8)]"></ng-icon>
            </a>
          }
        </div>
      </div>
    </section>
  `,
  host: {
    class: 'block h-full',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAdsManagementPageComponent {
  readonly items: readonly AdminAdsMenuItem[] = [
    { label: 'Plans', route: '/admin/ads/plans', icon: '/assets/icons/admin-ads-management/plans.svg' },
    { label: 'Running Ads', route: '/admin/ads/running', icon: '/assets/icons/admin-ads-management/running.svg' },
    { label: 'Approvals', route: '/admin/ads/approvals', icon: '/assets/icons/admin-ads-management/approvals.svg' },
    { label: 'Transactions', route: '/admin/ads/transactions', icon: '/assets/icons/admin-ads-management/transactions.svg' },
  ];
}
