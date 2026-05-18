import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { AuthSessionService } from './auth-session.service';
import { AppModeService } from './app-mode.service';

@Injectable({ providedIn: 'root' })
export class AuthRefreshService {
  private readonly authService = inject(AuthService);
  private readonly authSession = inject(AuthSessionService);
  private readonly appMode = inject(AppModeService);
  private refreshPromise: Promise<boolean> | null = null;

  refreshAccessToken(): Promise<boolean> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.runRefresh();
    return this.refreshPromise.finally(() => {
      this.refreshPromise = null;
    });
  }

  private async runRefresh(): Promise<boolean> {
    if (!this.appMode.isBackendEnabled()) {
      return false;
    }

    const response = await firstValueFrom(this.authService.refreshTokens());
    this.authSession.updateTokens(response);
    return true;
  }
}
