import { Injectable, inject } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthSessionService } from './auth-session.service';
import { AuthRefreshService } from './auth-refresh.service';

export interface ChatWebsocketConnection {
  messages$: Observable<any>;
  typing(): void;
  read(): void;
  close(): void;
}

export interface NotificationsWebsocketConnection {
  messages$: Observable<any>;
  markRead(notificationId: string): void;
  markAllRead(): void;
  close(): void;
}

@Injectable({ providedIn: 'root' })
export class WebsocketService {
  private readonly authSession = inject(AuthSessionService);
  private readonly authRefresh = inject(AuthRefreshService);

  connectChat(conversationId: string): ChatWebsocketConnection {
    const messagesSubject = new Subject<any>();
    let socket: WebSocket | null = null;
    let isClosed = false;

    const connect = async () => {
      if (isClosed) return;

      // Wait for auth bootstrap to complete before attempting connection.
      // This prevents a race condition where the component mounts before
      // the background auth initialization has finished.
      await this.authSession.waitForBootstrap();

      if (isClosed) return;

      const token = this.authSession.accessToken();
      if (!token) {
        messagesSubject.complete();
        return;
      }

      const wsUrl = environment.wsUrl;
      socket = new WebSocket(`${wsUrl}/ws/chat/${conversationId}/?token=${token}`);

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          messagesSubject.next(data);
        } catch (e) {
          console.error('Failed to parse WebSocket message', e);
        }
      };

      socket.onclose = async (event) => {
        if (isClosed) return;
        if (event.code === 4001) {
          console.log('WebSocket authentication expired, attempting token refresh...');
          try {
            const refreshed = await this.authRefresh.refreshAccessToken();
            if (refreshed) {
              console.log('Token refreshed successfully, reconnecting chat WebSocket...');
              connect();
            } else {
              messagesSubject.error(new Error('Authentication failed and token refresh was unsuccessful.'));
            }
          } catch (e) {
            messagesSubject.error(e);
          }
        } else {
          console.log('WebSocket closed. Reconnecting in 3 seconds...', event);
          setTimeout(() => connect(), 3000);
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    };

    connect();

    return {
      messages$: messagesSubject.asObservable(),
      typing: () => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: 'typing' }));
        }
      },
      read: () => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: 'read' }));
        }
      },
      close: () => {
        isClosed = true;
        if (socket) {
          socket.close();
        }
        messagesSubject.complete();
      }
    };
  }

  connectNotifications(): NotificationsWebsocketConnection {
    const messagesSubject = new Subject<any>();
    let socket: WebSocket | null = null;
    let isClosed = false;

    const connect = async () => {
      if (isClosed) return;

      // Wait for auth bootstrap to complete before attempting connection.
      await this.authSession.waitForBootstrap();

      if (isClosed) return;

      const token = this.authSession.accessToken();
      if (!token) {
        messagesSubject.complete();
        return;
      }

      const wsUrl = environment.wsUrl;
      socket = new WebSocket(`${wsUrl}/ws/notifications/?token=${token}`);

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          messagesSubject.next(data);
        } catch (e) {
          console.error('Failed to parse Notification WebSocket message', e);
        }
      };

      socket.onclose = async (event) => {
        if (isClosed) return;
        if (event.code === 4001) {
          console.log('Notification WebSocket authentication expired, attempting token refresh...');
          try {
            const refreshed = await this.authRefresh.refreshAccessToken();
            if (refreshed) {
              console.log('Token refreshed successfully, reconnecting notification WebSocket...');
              connect();
            } else {
              messagesSubject.error(new Error('Authentication failed and token refresh was unsuccessful.'));
            }
          } catch (e) {
            messagesSubject.error(e);
          }
        } else {
          console.log('Notification WebSocket closed. Reconnecting in 3 seconds...', event);
          setTimeout(() => connect(), 3000);
        }
      };

      socket.onerror = (error) => {
        console.error('Notification WebSocket error:', error);
      };
    };

    connect();

    return {
      messages$: messagesSubject.asObservable(),
      markRead: (notificationId: string) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: 'mark_read', id: notificationId }));
        }
      },
      markAllRead: () => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: 'mark_all_read' }));
        }
      },
      close: () => {
        isClosed = true;
        if (socket) {
          socket.close();
        }
        messagesSubject.complete();
      }
    };
  }
}
