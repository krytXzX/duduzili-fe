import { Location, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

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
  imports: [NgOptimizedImage],
  template: `
    <div class="min-h-full bg-white md:h-full md:min-h-0 md:rounded-[32px] md:bg-white">
      <div class="mx-auto max-w-[390px] pb-24 md:hidden">
        <div class="flex items-center gap-3 px-5 pt-[14px]">
          <button
            type="button"
            (click)="goBack()"
            class="inline-flex h-8 w-10 items-center justify-center rounded-full bg-[#F3F3F3] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1B1D]"
            aria-label="Go back"
          >
            <img
              ngSrc="/assets/icons/settings/security-back.svg"
              width="20"
              height="20"
              alt=""
              aria-hidden="true"
            />
          </button>
          <h1 class="text-[20px] font-semibold leading-[1.2] text-[#1A1B1D]">Notifications</h1>
        </div>

        <div class="mt-8 flex gap-[10px] px-5">
          @for (item of filterTabs; track item.id) {
            <button
              type="button"
              (click)="activeFilter.set(item.id)"
              [attr.aria-pressed]="activeFilter() === item.id"
              class="inline-flex h-10 items-center justify-center rounded-[16px] px-4 text-[14px] font-medium leading-5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1B1D]"
              [class.bg-[#1A1A1A]]="activeFilter() === item.id"
              [class.text-white]="activeFilter() === item.id"
              [class.bg-[#F4F4F4]]="activeFilter() !== item.id"
              [class.text-black]="activeFilter() !== item.id"
            >
              {{ item.label }}
            </button>
          }
        </div>

        @if (visibleNotifications().length) {
          <div class="mt-[26px]">
            @for (item of visibleNotifications(); track item.id) {
              <div
                class="grid grid-cols-[10px_44px_minmax(0,1fr)] items-start gap-x-4 py-[22px] first:pt-0"
              >
                <div class="flex h-11 items-center justify-center">
                  @if (!item.read) {
                    <span class="h-2.5 w-2.5 rounded-full bg-[#6B5CF0]"></span>
                  }
                </div>

                <div
                  class="flex h-[44px] w-[44px] items-center justify-center rounded-full border border-[#E6E6E6] bg-white"
                >
                  <img
                    [ngSrc]="notificationIconSrc(item.kind)"
                    width="20"
                    height="20"
                    alt=""
                    aria-hidden="true"
                  />
                </div>

                <div class="border-b border-[#ECECEC] pb-[18px]">
                  <p class="max-w-[230px] text-[16px] font-medium leading-[1.35] text-[#1B1B1B]">
                    {{ item.title }}
                  </p>
                  <p class="mt-[8px] text-[14px] leading-5 text-[#9A9A9A]">{{ item.time }}</p>
                </div>
              </div>
            }
          </div>
        } @else if (activeFilter() === 'unread') {
          <div class="flex min-h-[598px] flex-col items-center px-5 pt-[112px] text-center">
            <div class="flex flex-col items-center">
              <img
                ngSrc="/assets/images/notifications-unread-empty-state.svg"
                width="127"
                height="110"
                alt=""
                aria-hidden="true"
                class="h-auto w-[127px]"
              />
              <h2 class="mt-4 text-[20px] font-semibold leading-5 tracking-[0] text-[#1A1B1D]">
                You’re all up to date
              </h2>
              <p
                class="mt-[10px] max-w-[274px] text-[14px] font-medium leading-4 text-[rgba(26,27,29,0.6)]"
              >
                There are no new notifications for now
              </p>
            </div>
          </div>
        } @else {
          <div class="flex min-h-[598px] flex-col items-center px-5 pt-[112px] text-center">
            <div class="flex flex-col items-center">
              <img
                ngSrc="/assets/images/empty-notifs.png"
                width="110"
                height="112"
                alt=""
                aria-hidden="true"
                class="h-auto w-[110px]"
              />
              <h2 class="mt-8 text-[20px] font-semibold leading-5 tracking-[0] text-[#1A1B1D]">
                Notifications will appear here
              </h2>
              <p
                class="mt-[10px] max-w-[222px] text-[14px] font-medium leading-4 text-[rgba(26,27,29,0.6)]"
              >
                You have’t received any notification yet
              </p>
            </div>
          </div>
        }
      </div>

      <div class="hidden h-full flex-col rounded-[32px] bg-white md:flex">
        <div class="flex h-16 items-center border-b border-[#EEEEEE] px-4">
          <h1 class="text-[24px] font-medium leading-none text-[#0D0D0D] pb-4">Notifications</h1>
        </div>

        <div class="flex min-h-full flex-1 flex-col overflow-y-auto px-4 pb-10 pt-6">
          <div class="flex gap-[10px]">
            @for (item of filterTabs; track item.id) {
              <button
                type="button"
                (click)="activeFilter.set(item.id)"
                [attr.aria-pressed]="activeFilter() === item.id"
                class="inline-flex h-10 items-center justify-center rounded-[16px] px-4 text-[14px] font-medium leading-5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1B1D]"
                [class.bg-[#1A1A1A]]="activeFilter() === item.id"
                [class.text-white]="activeFilter() === item.id"
                [class.bg-[#F4F4F4]]="activeFilter() !== item.id"
                [class.text-black]="activeFilter() !== item.id"
              >
                {{ item.label }}
              </button>
            }
          </div>

          @if (visibleNotifications().length) {
            <div class="mt-[30px]">
              @for (item of visibleNotifications(); track item.id) {
                <div
                  class="grid grid-cols-[10px_48px_minmax(0,1fr)_28px] items-center gap-x-4 border-b border-[#ECECEC] py-[18px] first:pt-0"
                >
                  <div class="flex items-center justify-center">
                    @if (!item.read) {
                      <span class="h-2.5 w-2.5 rounded-full bg-[#6B5CF0]"></span>
                    }
                  </div>

                  <div
                    class="flex h-[44px] w-[44px] items-center justify-center rounded-full border border-[#E6E6E6] bg-white"
                  >
                    <img
                      [ngSrc]="notificationIconSrc(item.kind)"
                      width="20"
                      height="20"
                      alt=""
                      aria-hidden="true"
                    />
                  </div>

                  <div class="min-w-0">
                    <p class="text-[16px] font-medium leading-[1.35] text-[#1B1B1B]">
                      {{ item.title }}
                    </p>
                    <p class="mt-[4px] text-[14px] leading-5 text-[#9A9A9A]">{{ item.time }}</p>
                  </div>

                  <button
                    type="button"
                    (click)="dismissNotification(item.id)"
                    class="flex h-7 w-7 items-center justify-center rounded-full text-[#1A1A1A] transition hover:bg-[#F7F7F7] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1B1D]"
                    [attr.aria-label]="'Dismiss ' + item.title"
                  >
                    <svg class="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path
                        d="M4 4 12 12"
                        stroke="currentColor"
                        stroke-width="1.4"
                        stroke-linecap="round"
                      />
                      <path
                        d="M12 4 4 12"
                        stroke="currentColor"
                        stroke-width="1.4"
                        stroke-linecap="round"
                      />
                    </svg>
                  </button>
                </div>
              }
            </div>
          } @else if (activeFilter() === 'unread') {
            <div class="flex flex-1 items-center justify-center pb-[102px] text-center">
              <div class="flex flex-col items-center">
                <img
                  ngSrc="/assets/images/notifications-unread-empty-state.svg"
                  width="176"
                  height="152"
                  alt=""
                  aria-hidden="true"
                  class="h-auto w-[176px]"
                />
                <h2 class="mt-4 text-[20px] font-semibold leading-5 tracking-[0] text-[#1A1B1D]">
                  You’re all up to date
                </h2>
                <p
                  class="mt-[10px] max-w-[274px] text-[14px] font-medium leading-4 text-[rgba(26,27,29,0.6)]"
                >
                  There are no new notifications for now
                </p>
              </div>
            </div>
          } @else {
            <div class="flex flex-1 items-center justify-center pb-[102px] text-center">
              <div class="flex flex-col items-center">
                <img
                  ngSrc="/assets/images/empty-notifs.png"
                  width="152"
                  height="154"
                  alt=""
                  aria-hidden="true"
                  class="h-auto w-[152px]"
                />
                <h2 class="mt-8 text-[20px] font-semibold leading-5 tracking-[0] text-[#1A1B1D]">
                  Notifications will appear here
                </h2>
                <p
                  class="mt-[10px] max-w-[222px] text-[14px] font-medium leading-4 text-[rgba(26,27,29,0.6)]"
                >
                  You have’t received any notification yet
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
  private readonly location = inject(Location);

  readonly activeFilter = signal<NotificationFilter>('unread');
  readonly notifications = signal<AppNotification[]>([]);

  readonly filterTabs = [
    { id: 'all' as const, label: 'All notifications' },
    { id: 'unread' as const, label: 'Unread' },
    { id: 'read' as const, label: 'Read' },
  ];

  readonly visibleNotifications = computed(() => {
    const filter = this.activeFilter();
    const notifications = this.notifications();

    if (filter === 'unread') {
      return notifications.filter((item) => !item.read);
    }

    if (filter === 'read') {
      return notifications.filter((item) => item.read);
    }

    return notifications;
  });

  goBack(): void {
    this.location.back();
  }

  dismissNotification(id: string): void {
    this.notifications.update((items) => items.filter((item) => item.id !== id));
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
