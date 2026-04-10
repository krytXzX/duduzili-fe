import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroChatBubbleLeftEllipsis,
  heroExclamationTriangle,
  heroTag,
  heroTicket,
  heroUser,
  heroXMark,
  heroCube,
} from '@ng-icons/heroicons/outline';

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
  imports: [CommonModule, NgIcon, NgOptimizedImage],
  providers: [
    provideIcons({
      heroChatBubbleLeftEllipsis,
      heroExclamationTriangle,
      heroTag,
      heroTicket,
      heroUser,
      heroXMark,
      heroCube,
    }),
  ],
  template: `
    <div class="flex h-full flex-col rounded-[32px] border border-gray-100/60 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
      <div class="border-b border-[#F0F0F2] px-8 py-6">
        <h1 class="text-[20px] font-black tracking-tight text-[#1A1C21]">Notifications</h1>
      </div>

      <div class="flex-1 overflow-y-auto px-4 py-5 sm:px-8 sm:py-6">
        <div class="flex flex-wrap gap-3">
          @for (item of filterTabs; track item.id) {
            <button
              type="button"
              (click)="activeFilter.set(item.id)"
              class="rounded-[16px] px-4 py-2.5 text-[13px] font-medium transition"
              [class.bg-[#1D1D1F]]="activeFilter() === item.id"
              [class.text-white]="activeFilter() === item.id"
              [class.bg-[#F2F2F4]]="activeFilter() !== item.id"
              [class.text-[#1A1C21]]="activeFilter() !== item.id"
            >
              {{ item.label }}
            </button>
          }
        </div>

        <div class="mt-6">
          @for (item of visibleNotifications(); track item.id) {
            <div class="grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-4 border-b border-[#ECEEF3] py-5">
              <div class="flex items-center justify-center">
                @if (!item.read) {
                  <span class="h-2.5 w-2.5 rounded-full bg-[#6B5CF0]"></span>
                } @else {
                  <span class="h-2.5 w-2.5"></span>
                }
              </div>

              <div class="flex h-12 w-12 items-center justify-center rounded-full border border-[#E7EAF0] bg-white text-[#22252B]">
                <ng-icon [name]="iconName(item.kind)" class="text-[20px]"></ng-icon>
              </div>

              <div class="min-w-0">
                <p class="text-[14px] font-medium text-[#1A1C21]">{{ item.title }}</p>
                <p class="mt-1 text-[13px] font-medium text-[#8B9099]">{{ item.time }}</p>
              </div>

              <button
                type="button"
                (click)="dismissNotification(item.id)"
                class="flex h-8 w-8 items-center justify-center rounded-full text-[#272B31] transition hover:bg-[#F7F7F9]"
                [attr.aria-label]="'Dismiss ' + item.title"
              >
                <ng-icon name="heroXMark" class="text-base"></ng-icon>
              </button>
            </div>
          }

          @if (!visibleNotifications().length) {
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
      time: 'Jun 7, 7:50 pm',
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
      time: 'Jun 7, 7:50 pm',
      kind: 'offer',
      read: true,
    },
    {
      id: 'notification-6',
      title: 'Your store subscription expires in 3 days',
      time: 'Jun 7, 7:50 pm',
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

  iconName(kind: NotificationKind): string {
    switch (kind) {
      case 'warning':
        return 'heroExclamationTriangle';
      case 'message':
        return 'heroChatBubbleLeftEllipsis';
      case 'listing':
        return 'heroCube';
      case 'followers':
        return 'heroUser';
      case 'offer':
        return 'heroTag';
      case 'subscription':
        return 'heroTicket';
    }
  }
}
