import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroBell,
  heroChatBubbleLeftRight,
  heroClock,
  heroCog6Tooth,
  heroHeart,
  heroQrCode,
  heroShoppingBag,
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-buyer-dashboard-sidebar',
  imports: [RouterLink, RouterLinkActive, NgIcon],
  providers: [
    provideIcons({
      heroBell,
      heroChatBubbleLeftRight,
      heroClock,
      heroCog6Tooth,
      heroHeart,
      heroQrCode,
      heroShoppingBag,
    }),
  ],
  template: `
    <aside class="flex h-full flex-col overflow-y-auto bg-inherit p-8">
      <nav class="space-y-1">
        <a
          routerLink="/chats"
          routerLinkActive="bg-white rounded-xl text-[#1A1C21] shadow-sm"
          class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 transition-all hover:bg-gray-50"
        >
          <ng-icon name="heroChatBubbleLeftRight" class="text-lg text-gray-400"></ng-icon>
          Chats
        </a>
        <a
          routerLink="/wishlist"
          routerLinkActive="bg-white rounded-xl text-[#1A1C21] shadow-sm"
          class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 transition-all hover:bg-gray-50"
        >
          <ng-icon name="heroHeart" class="text-lg text-gray-400"></ng-icon>
          Wishlist
        </a>
        <a
          routerLink="/stores"
          routerLinkActive="bg-white rounded-xl text-[#1A1C21] shadow-sm"
          class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 transition-all hover:bg-gray-50"
        >
          <ng-icon name="heroShoppingBag" class="text-lg text-gray-400"></ng-icon>
          Followed stores
        </a>
        <a
          routerLink="/recently-viewed"
          routerLinkActive="bg-white rounded-xl text-[#1A1C21] shadow-sm"
          class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 transition-all hover:bg-gray-50"
        >
          <ng-icon name="heroClock" class="text-lg text-gray-400"></ng-icon>
          Recently viewed
        </a>
        <a
          routerLink="/settings"
          routerLinkActive="bg-white rounded-xl text-[#1A1C21] shadow-sm"
          class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 transition-all hover:bg-gray-50"
        >
          <ng-icon name="heroCog6Tooth" class="text-lg text-gray-400"></ng-icon>
          Account settings
        </a>
        <a
          routerLink="/notifications"
          routerLinkActive="bg-white rounded-xl text-[#1A1C21] shadow-sm"
          class="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 transition-all hover:bg-gray-50"
        >
          <span class="flex items-center gap-3">
            <ng-icon name="heroBell" class="text-lg text-gray-400"></ng-icon>
            Notifications
          </span>
          <span class="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">20+</span>
        </a>
      </nav>

      <div class="mt-8 rounded-3xl border border-gray-100 bg-gray-50 p-6 text-center">
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-3 shadow-sm">
          <ng-icon name="heroQrCode" class="text-3xl text-gray-900"></ng-icon>
        </div>
        <div class="mx-auto hidden h-28 w-28 items-center justify-center rounded-[24px] border border-[#EEF0F4] bg-[#FAFAFB]">
          <div class="grid grid-cols-5 gap-1">
            @for (_ of [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25]; track $index) {
              <span
                [class]="$index % 2 === 0 ? 'h-3 w-3 rounded-[2px] bg-[#1A1C21]' : 'h-3 w-3 rounded-[2px] bg-white'"
              ></span>
            }
          </div>
        </div>
        <p class="text-[11px] font-bold leading-relaxed tracking-wide text-gray-400">
          Scan QR code to<br>download mobile app
        </p>
      </div>
    </aside>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuyerDashboardSidebarComponent {}
