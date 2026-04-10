import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroBell,
  heroChartBar,
  heroChatBubbleLeft,
  heroCog6Tooth,
  heroMegaphone,
  heroQueueList,
  heroRectangleStack,
  heroShoppingBag,
  heroWallet,
  heroQrCode,
  heroClipboardDocumentList,
  heroChevronUp,
  heroChevronDown
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-dashboard-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIcon],
  providers: [
    provideIcons({
      heroQueueList,
      heroShoppingBag,
      heroChatBubbleLeft,
      heroClipboardDocumentList,
      heroMegaphone,
      heroRectangleStack,
      heroChartBar,
      heroWallet,
      heroCog6Tooth,
      heroBell,
      heroQrCode,
      heroChevronUp,
      heroChevronDown
    })
  ],
  template: `
    <aside class="w-64 h-full bg-inherit flex flex-col p-8 overflow-y-auto">
      <!-- Selling Section -->
      <div class="mb-10">
        <h3 class="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-5 px-3">Selling</h3>
        <nav class="space-y-1">
          <a routerLink="/listings" routerLinkActive="bg-white rounded-xl shadow-sm" 
             class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all group">
            <ng-icon name="heroQueueList" class="text-lg text-gray-400 group-hover:text-purple-600 group-[.bg-purple-50]:text-purple-600 transition-colors"></ng-icon>
            Listings
          </a>
          <a routerLink="/my-stores" routerLinkActive="bg-white rounded-xl shadow-sm"
             class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all group">
            <ng-icon name="heroShoppingBag" class="text-lg text-gray-400 group-hover:text-purple-600 transition-colors"></ng-icon>
            My Stores
          </a>
          <a routerLink="/messages" routerLinkActive="bg-white rounded-xl shadow-sm"
             class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all group">
            <ng-icon name="heroChatBubbleLeft" class="text-lg text-gray-400 group-hover:text-purple-600 transition-colors"></ng-icon>
            Messages
          </a>
          
          <!-- Requests Dropdown -->
          <div class="flex flex-col">
            <button 
              (click)="isRequestsExpanded.set(!isRequestsExpanded())"
              class="flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all group"
            >
              <div class="flex items-center gap-3">
                <ng-icon name="heroClipboardDocumentList" class="text-lg text-gray-400 group-hover:text-purple-600 transition-colors"></ng-icon>
                Requests
              </div>
              <ng-icon [name]="isRequestsExpanded() ? 'heroChevronUp' : 'heroChevronDown'" class="text-sm text-gray-400"></ng-icon>
            </button>
            
            @if (isRequestsExpanded()) {
              <div class="mt-1 ml-[22px] flex flex-col border-l border-gray-100/60 transition-all animate-in slide-in-from-top-2 duration-300">
                <a routerLink="/requests/offers" routerLinkActive="active-sublink"
                   class="relative pl-5 py-3 text-[14px] font-medium text-gray-400 hover:text-gray-900 transition-colors group flex items-center">
                  <div class="absolute inset-y-2 -left-px w-[2px] bg-black hidden group-[.active-sublink]:block"></div>
                  <span class="group-[.active-sublink]:text-[#1A1C21]">Offers</span>
                </a>
                <a routerLink="/requests/callbacks" routerLinkActive="active-sublink"
                   class="relative pl-5 py-3 text-[14px] font-medium text-gray-400 hover:text-gray-900 transition-colors group flex items-center">
                  <div class="absolute inset-y-2 -left-px w-[2px] bg-black hidden group-[.active-sublink]:block"></div>
                  <span class="group-[.active-sublink]:text-[#1A1C21]">Call back requests</span>
                </a>
              </div>
            }
          </div>
        </nav>
      </div>

      <!-- Performance Section -->
      <div class="mb-10">
        <h3 class="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-5 px-3">Performance</h3>
        <nav class="space-y-1">
          <a routerLink="/promotions" routerLinkActive="bg-white rounded-xl shadow-sm"
             class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all group">
            <ng-icon name="heroMegaphone" class="text-lg text-gray-400 group-hover:text-purple-600 transition-colors"></ng-icon>
            Banner promotions
          </a>

          <div class="flex flex-col">
            <button
              type="button"
              (click)="isAdsExpanded.set(!isAdsExpanded())"
              class="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 transition-all hover:bg-gray-50 group"
              [class.bg-white]="isAdsRouteActive()"
              [class.shadow-sm]="isAdsRouteActive()"
            >
              <div class="flex items-center gap-3">
                <ng-icon name="heroRectangleStack" class="text-lg text-gray-400 transition-colors group-hover:text-purple-600"></ng-icon>
                Ads
              </div>
              <ng-icon [name]="isAdsExpanded() ? 'heroChevronUp' : 'heroChevronDown'" class="text-sm text-gray-400"></ng-icon>
            </button>

            @if (isAdsExpanded()) {
              <div class="mt-1 ml-[22px] flex flex-col border-l border-gray-100/60 transition-all animate-in slide-in-from-top-2 duration-300">
                <a
                  routerLink="/ads/plans"
                  routerLinkActive="active-sublink"
                  class="relative flex items-center py-3 pl-5 text-[14px] font-medium text-gray-400 transition-colors hover:text-gray-900 group"
                >
                  <div class="absolute inset-y-2 -left-px hidden w-[2px] bg-black group-[.active-sublink]:block"></div>
                  <span class="group-[.active-sublink]:text-[#1A1C21]">Plans</span>
                </a>
                <a
                  routerLink="/ads/running"
                  routerLinkActive="active-sublink"
                  class="relative flex items-center py-3 pl-5 text-[14px] font-medium text-gray-400 transition-colors hover:text-gray-900 group"
                >
                  <div class="absolute inset-y-2 -left-px hidden w-[2px] bg-black group-[.active-sublink]:block"></div>
                  <span class="group-[.active-sublink]:text-[#1A1C21]">Running Ads</span>
                </a>
                <a
                  routerLink="/ads/billing-history"
                  routerLinkActive="active-sublink"
                  class="relative flex items-center py-3 pl-5 text-[14px] font-medium text-gray-400 transition-colors hover:text-gray-900 group"
                >
                  <div class="absolute inset-y-2 -left-px hidden w-[2px] bg-black group-[.active-sublink]:block"></div>
                  <span class="group-[.active-sublink]:text-[#1A1C21]">Billing history</span>
                </a>
              </div>
            }
          </div>

          <a routerLink="/analytics" routerLinkActive="bg-white rounded-xl shadow-sm"
             class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all group">
            <ng-icon name="heroChartBar" class="text-lg text-gray-400 group-hover:text-purple-600 transition-colors"></ng-icon>
            Analytics
          </a>
          <a routerLink="/wallet" routerLinkActive="bg-white rounded-xl shadow-sm"
             class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all group">
            <ng-icon name="heroWallet" class="text-lg text-gray-400 group-hover:text-purple-600 transition-colors"></ng-icon>
            Wallet
          </a>
        </nav>
      </div>

      <!-- Account Section -->
      <div>
        <h3 class="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-5 px-3">Account</h3>
        <nav class="space-y-1">
          <a routerLink="/settings" routerLinkActive="bg-white rounded-xl shadow-sm"
             class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all group">
            <ng-icon name="heroCog6Tooth" class="text-lg text-gray-400 group-hover:text-purple-600 transition-colors"></ng-icon>
            Account settings
          </a>
          <a routerLink="/notifications" routerLinkActive="bg-white rounded-xl shadow-sm"
             class="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all group">
            <div class="flex items-center gap-3">
              <ng-icon name="heroBell" class="text-lg text-gray-400 group-hover:text-purple-600 transition-colors"></ng-icon>
              Notifications
            </div>
            <span class="w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full ring-2 ring-white">9+</span>
          </a>
        </nav>
      </div>

      <!-- Spacer -->
      <div class="grow"></div>

      <!-- QR Download Card -->
      <div class="mt-8 p-6 bg-gray-50 rounded-3xl border border-gray-100 flex flex-col items-center text-center">
        <div class="w-16 h-16 bg-white p-3 rounded-2xl shadow-sm mb-4">
          <ng-icon name="heroQrCode" class="text-3xl text-gray-900"></ng-icon>
        </div>
        <p class="text-[11px] text-gray-400 font-bold leading-relaxed tracking-wide">
          Scan QR code to<br>download mobile app
        </p>
      </div>
    </aside>
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardSidebarComponent {
  private readonly router = inject(Router);

  readonly isRequestsExpanded = signal(true);
  readonly isAdsExpanded = signal(this.router.url.startsWith('/ads'));

  isAdsRouteActive(): boolean {
    return this.router.url.startsWith('/ads');
  }
}
