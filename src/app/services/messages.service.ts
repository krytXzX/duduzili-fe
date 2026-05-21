import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type MessageConversationApiItem = Record<string, unknown>;
export type SellerStoreApiItem = Record<string, unknown>;

export type MessagesResponse =
  | MessageConversationApiItem[]
  | {
      results?: MessageConversationApiItem[];
      messages?: MessageConversationApiItem[];
      conversations?: MessageConversationApiItem[];
      data?: MessageConversationApiItem[];
    };

export interface SendMessageRequest {
  body: string;
}

export interface BulkMessageActionRequest {
  action: 'delete';
  message_ids: readonly string[];
}

export type StartConversationResponse = Record<string, unknown>;

@Injectable({ providedIn: 'root' })
export class MessagesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getMessages(): Observable<MessagesResponse> {
    return this.http.get<MessagesResponse>(`${this.apiUrl}/messages/`);
  }

  getSellerStores(): Observable<SellerStoreApiItem[]> {
    return this.http.get<SellerStoreApiItem[]>(`${this.apiUrl}/seller-stores/`);
  }

  getSellerStoreConversations(id: string): Observable<MessagesResponse> {
    return this.http.get<MessagesResponse>(`${this.apiUrl}/seller-stores/${id}/conversations/`);
  }

  getMessageDetails(id: string): Observable<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>(`${this.apiUrl}/messages/${id}/`);
  }

  sendMessage(id: string, payload: SendMessageRequest): Observable<Record<string, unknown>> {
    return this.http.post<Record<string, unknown>>(`${this.apiUrl}/messages/${id}/send/`, payload);
  }

  bulkAction(payload: BulkMessageActionRequest): Observable<Record<string, unknown>> {
    return this.http.post<Record<string, unknown>>(`${this.apiUrl}/messages/bulk-action/`, payload);
  }

  startConversation(id: string): Observable<StartConversationResponse> {
    return this.http.post<StartConversationResponse>(`${this.apiUrl}/messages/start/${id}/`, {});
  }
}
