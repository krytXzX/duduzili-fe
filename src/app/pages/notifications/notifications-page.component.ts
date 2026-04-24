import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

type NotificationFilter = 'all' | 'unread' | 'read';
type NotificationKind = 'warning' | 'message' | 'listing' | 'followers' | 'offer' | 'subscription';

interface AppNotification {
  id: string;
  title: string;
  time: string;
  kind: NotificationKind;
  read: boolean;
}

@Component({
  selector: 'app-notifications-page',
  imports: [CommonModule, NgOptimizedImage, RouterLink],
  template: `
    <div class="min-h-full bg-white md:h-full md:min-h-0 md:rounded-[32px] md:bg-white">
      <div class="mx-auto max-w-[390px] px-5 pb-24 pt-3 md:hidden">
        <div class="flex items-start justify-between gap-4">
          <img
            ngSrc="/assets/images/logo-light-fill.svg"
            width="144"
            height="52"
            alt="Duduzili"
            class="h-[52px] w-auto brightness-0 saturate-100"
            priority
          >
          <img
            ngSrc="/assets/images/settings/profile-avatar.png"
            width="44"
            height="44"
            alt="Profile avatar"
            class="mt-1 h-11 w-11 rounded-full object-cover"
          >
        </div>

        <div class="mt-[18px] flex items-center gap-4">
          <a
            routerLink="/buyer/more"
            class="inline-flex h-8 w-10 items-center justify-center rounded-full bg-[#F4F4F4] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1B1D]"
            aria-label="Back"
          >
            <img ngSrc="/assets/icons/settings/security-back.svg" width="20" height="20" alt="" aria-hidden="true">
          </a>
          <h1 class="text-[20px] font-semibold leading-[1.2] text-[#171717]">Notifications</h1>
        </div>

        <div class="mt-8 flex gap-[11px]">
          @for (item of filterTabs; track item.id) {
            <button
              type="button"
              (click)="activeFilter.set(item.id)"
              class="inline-flex h-10 items-center justify-center rounded-[16px] px-4 text-[13px] font-medium leading-5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1B1D]"
              [class.bg-[#1F1F1F]]="activeFilter() === item.id"
              [class.text-white]="activeFilter() === item.id"
              [class.bg-[#F3F3F3]]="activeFilter() !== item.id"
              [class.text-[#1B1B1B]]="activeFilter() !== item.id"
            >
              {{ item.label }}
            </button>
          }
        </div>

        @if (visibleNotifications().length) {
          <div class="mt-[26px]">
            @for (item of visibleNotifications(); track item.id) {
              <div class="grid grid-cols-[10px_44px_minmax(0,1fr)] items-start gap-x-4 py-[22px] first:pt-0">
                <div class="flex h-11 items-center justify-center">
                  @if (!item.read) {
                    <span class="h-2.5 w-2.5 rounded-full bg-[#6B5CF0]"></span>
                  }
                </div>

                <div class="flex h-[44px] w-[44px] items-center justify-center rounded-full border border-[#E6E6E6] bg-white">
                  <img [ngSrc]="notificationIconSrc(item.kind)" width="20" height="20" alt="" aria-hidden="true">
                </div>

                <div class="border-b border-[#ECECEC] pb-[18px]">
                  <p class="max-w-[230px] text-[16px] font-medium leading-[1.35] text-[#1B1B1B]">{{ item.title }}</p>
                  <p class="mt-[8px] text-[14px] leading-5 text-[#9A9A9A]">{{ item.time }}</p>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="flex min-h-[420px] items-center justify-center text-center">
            <div class="flex flex-col items-center">
              <img
                ngSrc="/assets/images/empty-notifs.png"
                width="152"
                height="154"
                alt="No notifications"
                class="h-auto w-[152px]"
              >
              <h2 class="mt-8 text-[18px] font-black tracking-tight text-[#1A1C21]">
                Notifications will appear here
              </h2>
              <p class="mt-2 max-w-[220px] text-[13px] font-medium leading-5 text-[#8A8F98]">
                You haven’t received any notification yet
              </p>
            </div>
          </div>
        }
      </div>

      <div class="hidden h-full flex-col rounded-[32px] bg-white md:flex">
        <div class="flex-1 overflow-y-auto px-[22px] py-[54px]">
          <h1 class="text-[20px] font-semibold leading-[1.2] text-[#1B1B1B]">Notifications</h1>

          <div class="mt-8 flex gap-2.5">
            @for (item of filterTabs; track item.id) {
              <button
                type="button"
                (click)="activeFilter.set(item.id)"
                class="inline-flex h-[38px] items-center justify-center rounded-[14px] px-[16px] text-[13px] font-medium leading-5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1B1D]"
                [class.bg-[#1F1F1F]]="activeFilter() === item.id"
                [class.text-white]="activeFilter() === item.id"
                [class.bg-[#F3F3F3]]="activeFilter() !== item.id"
                [class.text-[#1B1B1B]]="activeFilter() !== item.id"
              >
                {{ item.label }}
              </button>
            }
          </div>

          @if (visibleNotifications().length) {
            <div class="mt-[30px]">
              @for (item of visibleNotifications(); track item.id) {
                <div class="grid grid-cols-[10px_48px_minmax(0,1fr)_28px] items-center gap-x-4 border-b border-[#ECECEC] py-[18px] first:pt-0">
                  <div class="flex items-center justify-center">
                    @if (!item.read) {
                      <span class="h-2.5 w-2.5 rounded-full bg-[#6B5CF0]"></span>
                    }
                  </div>

                  <div class="flex h-[44px] w-[44px] items-center justify-center rounded-full border border-[#E6E6E6] bg-white">
                    <img [ngSrc]="notificationIconSrc(item.kind)" width="20" height="20" alt="" aria-hidden="true">
                  </div>

                  <div class="min-w-0">
                    <p class="text-[16px] font-medium leading-[1.35] text-[#1B1B1B]">{{ item.title }}</p>
                    <p class="mt-[4px] text-[14px] leading-5 text-[#9A9A9A]">{{ item.time }}</p>
                  </div>

                  <button
                    type="button"
                    (click)="dismissNotification(item.id)"
                    class="flex h-7 w-7 items-center justify-center rounded-full text-[#1A1A1A] transition hover:bg-[#F7F7F7] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1B1D]"
                    [attr.aria-label]="'Dismiss ' + item.title"
                  >
                    <svg class="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M4 4 12 12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                      <path d="M12 4 4 12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                    </svg>
                  </button>
                </div>
              }
            </div>
          } @else {
            <div class="flex min-h-[620px] items-center justify-center text-center">
              <div class="flex flex-col items-center">
                <img
                  ngSrc="/assets/images/empty-notifs.png"
                  width="152"
                  height="154"
                  alt="No notifications"
                  class="h-auto w-[152px]"
                >
                <h2 class="mt-8 text-[18px] font-black tracking-tight text-[#1A1C21]">
                  Notifications will appear here
                </h2>
                <p class="mt-2 max-w-[220px] text-[13px] font-medium leading-5 text-[#8A8F98]">
                  You haven’t received any notification yet
                </p>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  host: { class: 'block h-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsPageComponent {
  readonly activeFilter = signal<NotificationFilter>('all');
  readonly notifications = signal<AppNotification[]>([
    {
      id: 'notification-1',
      title: 'A buyer reported your listing as unavailable',
      time: 'Today, 7:50 pm',
      kind: 'warning',
      read: false,
    },
    {
      id: 'notification-2',
      title: 'John sent you a message about “iPhone 17”',
      time: 'Yesterday, 7:50 pm',
      kind: 'message',
      read: false,
    },
    {
      id: 'notification-3',
      title: 'Your listing is now live',
      time: 'June 7, 7:50 pm',
      kind: 'listing',
      read: true,
    },
    {
      id: 'notification-4',
      title: 'Your store “The Vine Collections” gained 3 new followers',
      time: 'June 7, 7:50 pm',
      kind: 'followers',
      read: true,
    },
    {
      id: 'notification-5',
      title: 'A buyer is sent an offer on your listing',
      time: 'June 7, 7:50 pm',
      kind: 'offer',
      read: true,
    },
    {
      id: 'notification-6',
      title: 'Your store subscription expires in 3 days',
      time: 'June 7, 7:50 pm',
      kind: 'subscription',
      read: true,
    },
  ]);

  readonly filterTabs = [
    { id: 'all' as const, label: 'All notifications' },
    { id: 'unread' as const, label: 'Unread' },
    { id: 'read' as const, label: 'Read' },
  ];

  readonly visibleNotifications = computed(() => {
    const filter = this.activeFilter();
    const notifications = this.notifications();

    if (filter === 'unread') {
      return notifications.filter(item => !item.read);
    }

    if (filter === 'read') {
      return notifications.filter(item => item.read);
    }

    return notifications;
  });

  dismissNotification(id: string): void {
    this.notifications.update(items => items.filter(item => item.id !== id));
  }

  notificationIconSrc(kind: NotificationKind): string {
    switch (kind) {
      case 'warning':
        return '/assets/icons/notifications/notification-warning.svg';
      case 'message':
        return '/assets/icons/notifications/notification-message.svg';
      case 'listing':
        return '/assets/icons/notifications/notification-listing.svg';
      case 'followers':
        return '/assets/icons/notifications/notification-followers.svg';
      case 'offer':
        return '/assets/icons/notifications/notification-offer.svg';
      case 'subscription':
        return '/assets/icons/notifications/notification-subscription.svg';
    }
  }
}
