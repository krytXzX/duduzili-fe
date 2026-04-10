import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroBell,
  heroChartBar,
  heroChevronDown,
  heroCog6Tooth,
  heroFlag,
  heroHome,
  heroMegaphone,
  heroQueueList,
  heroRectangleStack,
  heroShieldCheck,
  heroSquares2x2,
  heroUserCircle,
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-admin-dashboard-sidebar',
  imports: [RouterLink, RouterLinkActive, NgIcon],
  providers: [
    provideIcons({
      heroBell,
      heroChartBar,
      heroChevronDown,
      heroCog6Tooth,
      heroFlag,
      heroHome,
      heroMegaphone,
      heroQueueList,
      heroRectangleStack,
      heroShieldCheck,
      heroSquares2x2,
      heroUserCircle,
    }),
  ],
  template: `
    <aside class="flex h-full flex-col overflow-y-auto bg-inherit p-8">
      <div class="mb-10">
        <h3 class="mb-5 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">Main</h3>
        <nav class="space-y-1">
          <a
            routerLink="/admin/home"
            routerLinkActive="bg-white text-[#1A1C21] shadow-sm"
            class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 transition-all hover:bg-gray-50"
          >
            <ng-icon name="heroHome" class="text-lg text-gray-400"></ng-icon>
            Home
          </a>
          <a
            routerLink="/admin/users"
            routerLinkActive="bg-white text-[#1A1C21] shadow-sm"
            class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 transition-all hover:bg-gray-50"
          >
            <ng-icon name="heroUserCircle" class="text-lg text-gray-400"></ng-icon>
            Users
          </a>
          <a
            routerLink="/admin/listings"
            routerLinkActive="bg-white text-[#1A1C21] shadow-sm"
            class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 transition-all hover:bg-gray-50"
          >
            <ng-icon name="heroQueueList" class="text-lg text-gray-400"></ng-icon>
            Listings
          </a>
          <a
            routerLink="/admin/stores"
            routerLinkActive="bg-white text-[#1A1C21] shadow-sm"
            class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 transition-all hover:bg-gray-50"
          >
            <ng-icon name="heroSquares2x2" class="text-lg text-gray-400"></ng-icon>
            Stores
          </a>
          <button
            type="button"
            (click)="isAdsExpanded.set(!isAdsExpanded())"
            class="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 transition-all hover:bg-gray-50"
          >
            <span class="flex items-center gap-3">
              <ng-icon name="heroMegaphone" class="text-lg text-gray-400"></ng-icon>
              Ads management
            </span>
            <ng-icon name="heroChevronDown" class="text-base text-gray-400"></ng-icon>
          </button>
          @if (isAdsExpanded()) {
            <div class="ml-7 flex flex-col gap-2 border-l border-gray-200 pl-5">
              <a routerLink="/admin/ads/banner-promotions" class="py-1.5 text-sm font-medium text-gray-400 transition hover:text-gray-700">
                Banner promotions
              </a>
              <a routerLink="/admin/ads/plans" class="py-1.5 text-sm font-medium text-gray-400 transition hover:text-gray-700">
                Plans
              </a>
            </div>
          }
        </nav>
      </div>

      <div class="mb-10">
        <h3 class="mb-5 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">Moderation</h3>
        <nav class="space-y-1">
          <a
            routerLink="/admin/kyc-requests"
            routerLinkActive="bg-white text-[#1A1C21] shadow-sm"
            class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 transition-all hover:bg-gray-50"
          >
            <ng-icon name="heroShieldCheck" class="text-lg text-gray-400"></ng-icon>
            KYC requests
          </a>
          <a
            routerLink="/admin/reports"
            routerLinkActive="bg-white text-[#1A1C21] shadow-sm"
            class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 transition-all hover:bg-gray-50"
          >
            <ng-icon name="heroFlag" class="text-lg text-gray-400"></ng-icon>
            Reports
          </a>
        </nav>
      </div>

      <div class="mb-10">
        <h3 class="mb-5 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">Insights</h3>
        <nav class="space-y-1">
          <a
            routerLink="/admin/analytics"
            routerLinkActive="bg-white text-[#1A1C21] shadow-sm"
            class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 transition-all hover:bg-gray-50"
          >
            <ng-icon name="heroChartBar" class="text-lg text-gray-400"></ng-icon>
            Analytics
          </a>
          <a
            routerLink="/admin/audit-log"
            routerLinkActive="bg-white text-[#1A1C21] shadow-sm"
            class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 transition-all hover:bg-gray-50"
          >
            <ng-icon name="heroRectangleStack" class="text-lg text-gray-400"></ng-icon>
            Audit log
          </a>
        </nav>
      </div>

      <div>
        <h3 class="mb-5 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">Administration</h3>
        <nav class="space-y-1">
          <a
            routerLink="/admin/team-management"
            routerLinkActive="bg-white text-[#1A1C21] shadow-sm"
            class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 transition-all hover:bg-gray-50"
          >
            <ng-icon name="heroUserCircle" class="text-lg text-gray-400"></ng-icon>
            Team management
          </a>
          <a
            routerLink="/admin/settings"
            routerLinkActive="bg-white text-[#1A1C21] shadow-sm"
            class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 transition-all hover:bg-gray-50"
          >
            <ng-icon name="heroCog6Tooth" class="text-lg text-gray-400"></ng-icon>
            Account settings
          </a>
          <a
            routerLink="/admin/notifications"
            routerLinkActive="bg-white text-[#1A1C21] shadow-sm"
            class="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 transition-all hover:bg-gray-50"
          >
            <span class="flex items-center gap-3">
              <ng-icon name="heroBell" class="text-lg text-gray-400"></ng-icon>
              Notifications
            </span>
            <span class="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
              20+
            </span>
          </a>
        </nav>
      </div>
    </aside>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardSidebarComponent {
  readonly isAdsExpanded = signal(true);
}
