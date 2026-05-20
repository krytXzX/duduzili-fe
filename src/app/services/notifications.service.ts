import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type NotificationApiItem = Record<string, unknown>;

export type NotificationsResponse =
  | NotificationApiItem[]
  | {
      results?: NotificationApiItem[];
      notifications?: NotificationApiItem[];
      data?: NotificationApiItem[];
    };

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getNotifications(): Observable<NotificationsResponse> {
    return this.http.get<NotificationsResponse>(`${this.apiUrl}/notifications`);
  }

  getNotificationDetails(id: string): Observable<NotificationApiItem> {
    return this.http.get<NotificationApiItem>(`${this.apiUrl}/notifications/${id}/`);
  }

  deleteNotification(id: string): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/notifications/${id}/delete`);
  }
}
