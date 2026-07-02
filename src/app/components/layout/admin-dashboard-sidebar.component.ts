import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroBell,
  heroChartBar,
  heroChevronDown,
  heroChevronUp,
  heroCog6Tooth,
  heroFlag,
  heroHome,
  heroMapPin,
  heroMegaphone,
  heroQueueList,
  heroRectangleStack,
  heroShieldCheck,
  heroSquares2x2,
  heroUserCircle,
} from '@ng-icons/heroicons/outline';
import { AuthSessionService } from '../../services/auth-session.service';
import { NotificationsService } from '../../services/notifications.service';

@Component({
  selector: 'app-admin-dashboard-sidebar',
  imports: [RouterLink, RouterLinkActive, NgIcon],
  providers: [
    provideIcons({
      heroBell,
      heroChartBar,
      heroChevronDown,
      heroChevronUp,
      heroCog6Tooth,
      heroFlag,
      heroHome,
      heroMapPin,
      heroMegaphone,
      heroQueueList,
      heroRectangleStack,
      heroShieldCheck,
      heroSquares2x2,
      heroUserCircle,
    }),
  ],
  template: `
    <aside class="flex h-full flex-col overflow-y-auto bg-inherit p-5 sm:p-8">
      <div class="mb-10">
        <h3 class="mb-5 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">Main</h3>
        <nav class="space-y-1">
          <a
            routerLink="/admin"
            routerLinkActive="bg-white text-[#1A1C21] shadow-sm"
            [routerLinkActiveOptions]="{ exact: true }"
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
          @if (canManageCategories()) {
            <a
              routerLink="/admin/categories"
              routerLinkActive="bg-white text-[#1A1C21] shadow-sm"
              class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 transition-all hover:bg-gray-50"
            >
              <ng-icon name="heroSquares2x2" class="text-lg text-gray-400"></ng-icon>
              Categories
            </a>
          }
          <div class="flex flex-col">
            <button
              type="button"
              (click)="isAdsExpanded.set(!isAdsExpanded())"
              [attr.aria-expanded]="isAdsExpanded()"
              aria-controls="admin-ads-management-menu"
              class="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 transition-all hover:bg-gray-50"
            >
              <span class="flex items-center gap-3">
                <ng-icon name="heroMegaphone" class="text-lg text-gray-400"></ng-icon>
                Ads management
              </span>
              <ng-icon [name]="isAdsExpanded() ? 'heroChevronUp' : 'heroChevronDown'" class="text-base text-gray-400"></ng-icon>
            </button>
            @if (isAdsExpanded()) {
              <div
                id="admin-ads-management-menu"
                class="mt-1 ml-[11px] flex flex-col border-l border-[#f0f0f0] pl-2"
              >
                <a
                  routerLink="/admin/ads/plans"
                  class="flex min-h-12 items-center rounded-full px-4 text-left text-[15px] font-medium transition-colors"
                  [class.bg-[#f8f8f8]]="isAdsItemActive('plans')"
                  [class.text-[#1A1C21]]="isAdsItemActive('plans')"
                  [class.text-[#5e5e5e]]="!isAdsItemActive('plans')"
                  [class.hover:text-[#1A1C21]]="!isAdsItemActive('plans')"
                >
                  Plans
                </a>
                <a
                  routerLink="/admin/ads/running"
                  class="flex min-h-12 items-center rounded-full px-4 text-left text-[15px] font-medium transition-colors"
                  [class.bg-[#f8f8f8]]="isAdsItemActive('running-ads')"
                  [class.text-[#1A1C21]]="isAdsItemActive('running-ads')"
                  [class.text-[#5e5e5e]]="!isAdsItemActive('running-ads')"
                  [class.hover:text-[#1A1C21]]="!isAdsItemActive('running-ads')"
                >
                  Running Ads
                </a>
                <a
                  routerLink="/admin/ads/approvals"
                  class="flex min-h-12 items-center rounded-full px-4 text-left text-[15px] font-medium transition-colors"
                  [class.bg-[#f8f8f8]]="isAdsItemActive('approvals')"
                  [class.text-[#1A1C21]]="isAdsItemActive('approvals')"
                  [class.text-[#5e5e5e]]="!isAdsItemActive('approvals')"
                  [class.hover:text-[#1A1C21]]="!isAdsItemActive('approvals')"
                >
                  Approvals
                </a>
                <a
                  routerLink="/admin/ads/transactions"
                  class="flex min-h-12 items-center rounded-full px-4 text-left text-[15px] font-medium transition-colors"
                  [class.bg-[#f8f8f8]]="isAdsItemActive('transactions')"
                  [class.text-[#1A1C21]]="isAdsItemActive('transactions')"
                  [class.text-[#5e5e5e]]="!isAdsItemActive('transactions')"
                  [class.hover:text-[#1A1C21]]="!isAdsItemActive('transactions')"
                >
                  Transactions
                </a>
                @for (item of adsManagementItems.slice(4); track item.id) {
                  <button
                    type="button"
                    class="flex min-h-12 items-center rounded-full px-4 text-left text-[15px] font-medium transition-colors"
                    [class.bg-[#f8f8f8]]="isAdsItemActive(item.id)"
                    [class.text-[#1A1C21]]="isAdsItemActive(item.id)"
                    [class.text-[#5e5e5e]]="!isAdsItemActive(item.id)"
                    [class.hover:text-[#1A1C21]]="!isAdsItemActive(item.id)"
                    (click)="activeAdsItem.set(item.id)"
                  >
                    {{ item.label }}
                  </button>
                }
              </div>
            }
          </div>
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
            routerLink="/admin/locations"
            routerLinkActive="bg-white text-[#1A1C21] shadow-sm"
            class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 transition-all hover:bg-gray-50"
          >
            <ng-icon name="heroMapPin" class="text-lg text-gray-400"></ng-icon>
            Locations
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
            @if (notificationBadge()) {
              <span class="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                {{ notificationBadge() }}
              </span>
            }
          </a>
        </nav>
      </div>
    </aside>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardSidebarComponent {
  private readonly router = inject(Router);
  private readonly authSession = inject(AuthSessionService);
  private readonly notificationsService = inject(NotificationsService);

  readonly notificationBadge = this.notificationsService.unreadBadge;

  readonly isAdsExpanded = signal(false);
  readonly canManageCategories = computed(() => this.authSession.canManageCategories());
  readonly activeAdsItem = signal<AdminAdsManagementItemId>('plans');
  readonly adsManagementItems: ReadonlyArray<{ id: AdminAdsManagementItemId; label: string }> = [
    { id: 'plans', label: 'Plans' },
    { id: 'running-ads', label: 'Running Ads' },
    { id: 'approvals', label: 'Approvals' },
    { id: 'transactions', label: 'Transactions' },
  ];

  isAdsItemActive(itemId: AdminAdsManagementItemId): boolean {
    if (itemId === 'plans' && this.router.url.startsWith('/admin/ads/plans')) {
      return true;
    }

    if (itemId === 'running-ads' && this.router.url.startsWith('/admin/ads/running')) {
      return true;
    }

    if (itemId === 'approvals' && this.router.url.startsWith('/admin/ads/approvals')) {
      return true;
    }

    if (itemId === 'transactions' && this.router.url.startsWith('/admin/ads/transactions')) {
      return true;
    }

    return this.activeAdsItem() === itemId;
  }

  constructor() {
    this.notificationsService.refreshUnreadCount();
  }
}

type AdminAdsManagementItemId =
  | 'plans'
  | 'running-ads'
  | 'approvals'
  | 'transactions';
