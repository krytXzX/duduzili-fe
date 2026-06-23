import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export type NotificationApiItem = Record<string, unknown>;

export type NotificationsResponse =
  | NotificationApiItem[]
  | {
      results?: NotificationApiItem[];
      notifications?: NotificationApiItem[];
      data?: NotificationApiItem[];
    };

interface UnreadCountResponse {
  unread_count: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private readonly _unreadCount = signal<number>(0);

  /** Reactive unread notification count for use in badges across the app. */
  readonly unreadCount = this._unreadCount.asReadonly();

  /** Formatted badge label: shows count, '99+' for large numbers, or empty string when zero. */
  readonly unreadBadge = computed(() => {
    const count = this._unreadCount();
    if (count <= 0) return '';
    if (count > 99) return '99+';
    return String(count);
  });

  getNotifications(): Observable<NotificationsResponse> {
    return this.http.get<NotificationsResponse>(`${this.apiUrl}/notifications`);
  }

  getNotificationDetails(id: string): Observable<NotificationApiItem> {
    return this.http.get<NotificationApiItem>(`${this.apiUrl}/notifications/${id}/`);
  }

  deleteNotification(id: string): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/notifications/${id}/delete/`);
  }

  markNotificationsRead(ids: readonly string[]): Observable<{ marked_read?: number }> {
    return this.http
      .post<{ marked_read?: number }>(`${this.apiUrl}/notifications/read/`, { ids })
      .pipe(tap((response) => this.decrementUnreadCountBy(response.marked_read ?? ids.length)));
  }

  markAllNotificationsRead(): Observable<{ marked_read?: number }> {
    return this.http
      .post<{ marked_read?: number }>(`${this.apiUrl}/notifications/read-all/`, {})
      .pipe(tap(() => this.clearUnreadCount()));
  }

  clearAllNotifications(): Observable<unknown> {
    return this.http
      .delete(`${this.apiUrl}/notifications/clear-all/`)
      .pipe(tap(() => this.clearUnreadCount()));
  }

  /** Fetches the unread count from the backend and updates the reactive signal. */
  refreshUnreadCount(): void {
    this.http
      .get<UnreadCountResponse>(`${this.apiUrl}/notifications/unread-count/`)
      .subscribe({
        next: (response) => this._unreadCount.set(response.unread_count ?? 0),
        error: () => { /* silently ignore – badge will just stay at current value */ },
      });
  }

  setUnreadCount(count: number): void {
    this._unreadCount.set(Math.max(0, count));
  }

  incrementUnreadCount(amount = 1): void {
    this._unreadCount.update((current) => Math.max(0, current + amount));
  }

  /** Decrements the unread count by one (e.g. after reading a notification). */
  decrementUnreadCount(): void {
    this.decrementUnreadCountBy(1);
  }

  decrementUnreadCountBy(amount: number): void {
    this._unreadCount.update((current) => Math.max(0, current - Math.max(0, amount)));
  }

  /** Resets the unread count to zero (e.g. after "mark all as read"). */
  clearUnreadCount(): void {
    this._unreadCount.set(0);
  }
}
