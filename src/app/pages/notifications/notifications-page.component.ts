import { Location, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  NotificationApiItem,
  NotificationsResponse,
  NotificationsService,
} from '../../services/notifications.service';

type NotificationFilter = 'all' | 'unread' | 'read';
type NotificationKind = 'warning' | 'message' | 'listing' | 'followers' | 'offer' | 'subscription';

interface AppNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  createdAt: string | null;
  notificationType: string | null;
  data: Record<string, unknown> | null;
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

        @if (isLoading()) {
          <div class="flex min-h-[598px] flex-col items-center px-5 pt-[112px] text-center">
            <div class="flex flex-col items-center">
              <h2 class="text-[20px] font-semibold leading-5 tracking-[0] text-[#1A1B1D]">
                Loading notifications...
              </h2>
            </div>
          </div>
        } @else if (errorMessage()) {
          <div class="flex min-h-[598px] flex-col items-center px-5 pt-[112px] text-center">
            <div class="flex flex-col items-center">
              <h2 class="text-[20px] font-semibold leading-5 tracking-[0] text-[#1A1B1D]">
                Couldn’t load notifications
              </h2>
              <p
                class="mt-[10px] max-w-[274px] text-[14px] font-medium leading-4 text-[rgba(26,27,29,0.6)]"
              >
                {{ errorMessage() }}
              </p>
            </div>
          </div>
        } @else if (visibleNotifications().length) {
          <div class="mt-[26px]">
            @for (item of visibleNotifications(); track item.id) {
              <button
                type="button"
                (click)="openNotification(item)"
                class="grid grid-cols-[10px_44px_minmax(0,1fr)] items-start gap-x-4 py-[22px] first:pt-0"
                aria-label="Open notification details"
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
              </button>
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
          <h1 class="text-[24px] font-medium leading-none text-[#0D0D0D] py-4">Notifications</h1>
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

          @if (isLoading()) {
            <div class="flex flex-1 items-center justify-center pb-[102px] text-center">
              <div class="flex flex-col items-center">
                <h2 class="text-[20px] font-semibold leading-5 tracking-[0] text-[#1A1B1D]">
                  Loading notifications...
                </h2>
              </div>
            </div>
          } @else if (errorMessage()) {
            <div class="flex flex-1 items-center justify-center pb-[102px] text-center">
              <div class="flex flex-col items-center">
                <h2 class="text-[20px] font-semibold leading-5 tracking-[0] text-[#1A1B1D]">
                  Couldn’t load notifications
                </h2>
                <p
                  class="mt-[10px] max-w-[274px] text-[14px] font-medium leading-4 text-[rgba(26,27,29,0.6)]"
                >
                  {{ errorMessage() }}
                </p>
              </div>
            </div>
          } @else if (visibleNotifications().length) {
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

                  <button
                    type="button"
                    (click)="openNotification(item)"
                    class="min-w-0 text-left"
                    aria-label="Open notification details"
                  >
                    <p class="text-[16px] font-medium leading-[1.35] text-[#1B1B1B]">
                      {{ item.title }}
                    </p>
                    <p class="mt-[4px] text-[14px] leading-5 text-[#9A9A9A]">{{ item.time }}</p>
                  </button>

                  <button
                    type="button"
                    (click)="dismissNotification(item.id); $event.stopPropagation()"
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

    @if (selectedNotification(); as notification) {
      <div class="md:hidden">
        <button
          type="button"
          class="fixed inset-0 z-40 bg-black/35"
          (click)="closeNotification()"
          aria-label="Close notification details"
        ></button>
        <section
          class="fixed inset-x-0 bottom-0 z-50 rounded-t-[28px] bg-white px-5 pb-8 pt-4 shadow-[0_-18px_40px_rgba(15,23,42,0.18)]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="notification-detail-title-mobile"
        >
          <div class="mx-auto mb-5 h-1.5 w-14 rounded-full bg-[#E7E7EE]"></div>

          <div class="flex items-start justify-between gap-4">
            <div class="flex items-start gap-3">
              <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#E6E6E6] bg-white">
                <img
                  [ngSrc]="notificationIconSrc(notification.kind)"
                  width="20"
                  height="20"
                  alt=""
                  aria-hidden="true"
                />
              </div>
              <div>
                <h2 id="notification-detail-title-mobile" class="text-[18px] font-semibold leading-6 text-[#1A1B1D]">
                  {{ notification.title }}
                </h2>
                <p class="mt-1 text-[13px] leading-5 text-[#9A9A9A]">{{ notification.time }}</p>
              </div>
            </div>

            <button
              type="button"
              (click)="closeNotification()"
              class="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F5F7] text-[#1A1B1D]"
              aria-label="Close notification details"
            >
              <svg class="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M4 4 12 12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
                <path d="M12 4 4 12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
              </svg>
            </button>
          </div>

          <div class="mt-5 rounded-[20px] bg-[#F8F8FB] px-4 py-4">
            <p class="text-[15px] leading-6 text-[#33363F]">{{ notification.body }}</p>
          </div>
        </section>
      </div>

      <div class="hidden md:block">
        <button
          type="button"
          class="fixed inset-0 z-40 bg-black/35"
          (click)="closeNotification()"
          aria-label="Close notification details"
        ></button>
        <section
          class="fixed left-1/2 top-1/2 z-50 w-full max-w-[540px] -translate-x-1/2 -translate-y-1/2 rounded-[28px] bg-white px-7 pb-7 pt-6 shadow-[0_20px_60px_rgba(15,23,42,0.2)]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="notification-detail-title-desktop"
        >
          <div class="flex items-start justify-between gap-6">
            <div class="flex items-start gap-4">
              <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#E6E6E6] bg-white">
                <img
                  [ngSrc]="notificationIconSrc(notification.kind)"
                  width="20"
                  height="20"
                  alt=""
                  aria-hidden="true"
                />
              </div>
              <div>
                <h2 id="notification-detail-title-desktop" class="text-[22px] font-semibold leading-7 text-[#1A1B1D]">
                  {{ notification.title }}
                </h2>
                <p class="mt-1 text-[14px] leading-5 text-[#9A9A9A]">{{ notification.time }}</p>
              </div>
            </div>

            <button
              type="button"
              (click)="closeNotification()"
              class="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F5F7] text-[#1A1B1D]"
              aria-label="Close notification details"
            >
              <svg class="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M4 4 12 12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
                <path d="M12 4 4 12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
              </svg>
            </button>
          </div>

          <div class="mt-6 rounded-[24px] bg-[#F8F8FB] px-5 py-5">
            <p class="text-[16px] leading-7 text-[#33363F]">{{ notification.body }}</p>
          </div>
        </section>
      </div>
    }
  `,
  host: { class: 'block h-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsPageComponent {
  private readonly location = inject(Location);
  private readonly notificationsService = inject(NotificationsService);

  readonly activeFilter = signal<NotificationFilter>('unread');
  readonly notifications = signal<AppNotification[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly selectedNotification = signal<AppNotification | null>(null);

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

  constructor() {
    void this.loadNotifications();
  }

  goBack(): void {
    this.location.back();
  }

  openNotification(notification: AppNotification): void {
    this.selectedNotification.set(notification);
  }

  closeNotification(): void {
    this.selectedNotification.set(null);
  }

  dismissNotification(id: string): void {
    this.notifications.update((items) => items.filter((item) => item.id !== id));
    if (this.selectedNotification()?.id === id) {
      this.closeNotification();
    }
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

  private async loadNotifications(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const response = await firstValueFrom(this.notificationsService.getNotifications());
      const items = this.extractItems(response);
      const notifications = items
        .map((item, index) => this.toNotification(item, index))
        .filter((item): item is AppNotification => item !== null);

      this.notifications.set(notifications);
    } catch {
      this.notifications.set([]);
      this.errorMessage.set('We could not load your notifications right now.');
    } finally {
      this.isLoading.set(false);
    }
  }

  private extractItems(response: NotificationsResponse): NotificationApiItem[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response.results)) {
      return response.results;
    }

    if (Array.isArray(response.notifications)) {
      return response.notifications;
    }

    if (Array.isArray(response.data)) {
      return response.data;
    }

    return [];
  }

  private toNotification(item: NotificationApiItem, index: number): AppNotification | null {
    const title = this.readString(item['title']) ?? this.readString(item['message']);
    const body =
      this.readString(item['body']) ??
      this.readString(item['text']) ??
      this.readString(item['description']) ??
      title;

    if (!title || !body) {
      return null;
    }

    const createdAt =
      this.readString(item['created_at']) ??
      this.readString(item['timestamp']) ??
      this.readString(item['date']);
    const data = this.readRecord(item['data']);
    const notificationType = this.readString(item['notification_type']);

    return {
      id: this.readString(item['id']) ?? `notification-${index + 1}`,
      title,
      body,
      time:
        this.relativeTimeFromDate(createdAt) ?? 'Recently',
      createdAt,
      notificationType,
      data,
      kind: this.resolveKind(item),
      read: this.readBoolean(item['read']) ?? this.readBoolean(item['is_read']) ?? false,
    };
  }

  private resolveKind(item: NotificationApiItem): NotificationKind {
    const rawType =
      (this.readString(item['notification_type']) ??
        this.readString(item['kind']) ??
        this.readString(item['type']) ??
        this.readString(item['category']) ??
        '').toLowerCase();

    if (rawType.includes('message') || rawType.includes('chat')) {
      return 'message';
    }

    if (rawType.includes('listing') || rawType.includes('product')) {
      return 'listing';
    }

    if (rawType.includes('follow')) {
      return 'followers';
    }

    if (rawType.includes('offer') || rawType.includes('bid')) {
      return 'offer';
    }

    if (rawType.includes('subscription') || rawType.includes('plan')) {
      return 'subscription';
    }

    return 'warning';
  }

  private readString(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
  }

  private readBoolean(value: unknown): boolean | null {
    return typeof value === 'boolean' ? value : null;
  }

  private readRecord(value: unknown): Record<string, unknown> | null {
    return value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null;
  }

  private relativeTimeFromDate(value: string | null): string | null {
    if (!value) {
      return null;
    }

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
      return null;
    }

    const diffMilliseconds = Date.now() - parsedDate.getTime();
    const diffMinutes = Math.max(1, Math.floor(diffMilliseconds / (1000 * 60)));

    if (diffMinutes < 60) {
      return `${diffMinutes} min${diffMinutes === 1 ? '' : 's'} ago`;
    }

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    }

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    }

    return parsedDate.toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
}
