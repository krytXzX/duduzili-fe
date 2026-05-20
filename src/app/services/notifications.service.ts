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
}
