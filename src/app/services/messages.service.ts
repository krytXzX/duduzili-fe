import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type MessageConversationApiItem = Record<string, unknown>;

export type MessagesResponse =
  | MessageConversationApiItem[]
  | {
      results?: MessageConversationApiItem[];
      messages?: MessageConversationApiItem[];
      conversations?: MessageConversationApiItem[];
      data?: MessageConversationApiItem[];
    };

@Injectable({ providedIn: 'root' })
export class MessagesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getMessages(): Observable<MessagesResponse> {
    return this.http.get<MessagesResponse>(`${this.apiUrl}/messages/`);
  }
}
