import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { AuthSessionService } from './auth-session.service';

@Injectable({ providedIn: 'root' })
export class AuthRefreshService {
  private readonly authService = inject(AuthService);
  private readonly authSession = inject(AuthSessionService);
  private refreshPromise: Promise<string | null> | null = null;

  refreshAccessToken(): Promise<string | null> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.runRefresh();
    return this.refreshPromise.finally(() => {
      this.refreshPromise = null;
    });
  }

  private async runRefresh(): Promise<string | null> {
    const response = await firstValueFrom(this.authService.refreshTokens());
    const accessToken = this.authSession.updateTokens(response);
    return accessToken;
  }
}
