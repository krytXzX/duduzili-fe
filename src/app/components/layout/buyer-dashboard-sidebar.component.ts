import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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
import { NgOptimizedImage } from '@angular/common';
import { faBrandApple, faBrandAndroid } from '@ng-icons/font-awesome/brands';
import { NotificationsService } from '../../services/notifications.service';

@Component({
  selector: 'app-buyer-dashboard-sidebar',
  imports: [RouterLink, RouterLinkActive, NgIcon, NgOptimizedImage],
  providers: [
    provideIcons({
      heroBell,
      heroChatBubbleLeftRight,
      heroClock,
      heroCog6Tooth,
      heroHeart,
      heroQrCode,
      heroShoppingBag,
      faBrandApple,
      faBrandAndroid,
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
          routerLink="/followed-stores"
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
          @if (notificationBadge()) {
            <span class="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">{{ notificationBadge() }}</span>
          }
        </a>
      </nav>

      <div class="mt-auto pt-6">
        <div class="overflow-hidden rounded-[20px] bg-white px-6 pb-6 pt-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div class="relative mx-auto flex w-[120px] flex-col items-center gap-3">
            <div class="relative flex h-[120px] w-[120px] items-center justify-center">
              <div
                class="absolute inset-[6px] rotate-[-5deg] rounded-[10px] border border-[#F0F0F0] bg-white shadow-[0_4.737px_12.631px_rgba(199,199,199,0.25)]"
              ></div>
              <img
                ngSrc="/assets/images/seller-sidebar-qr-code.png"
                alt="QR code to download the Duduzili mobile app"
                width="109"
                height="109"
                class="relative z-10 h-[109px] w-[109px] rounded-[10px] object-cover"
              />
            </div>
            <div class="flex items-center justify-center gap-4 text-[#6C6C6C]">
              <ng-icon name="faBrandAndroid" class="text-[24px] leading-none"></ng-icon>
              <span class="h-4 w-px bg-[#D8D8D8]"></span>
              <ng-icon name="faBrandApple" class="text-[20px] leading-none"></ng-icon>
            </div>
          </div>
          <p class="mt-5 text-center text-[14px] font-medium leading-[1.2] text-[#99A2B1]">
            Scan QR code to
            <br />
            download mobile app
          </p>
        </div>
      </div>
    </aside>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuyerDashboardSidebarComponent {
  private readonly notificationsService = inject(NotificationsService);

  readonly notificationBadge = this.notificationsService.unreadBadge;

  constructor() {
    this.notificationsService.refreshUnreadCount();
  }
}
