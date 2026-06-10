import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { AuthRefreshService } from './auth-refresh.service';
import { AuthSessionService } from './auth-session.service';

@Injectable({ providedIn: 'root' })
export class AuthBootstrapService {
  private readonly authService = inject(AuthService);
  private readonly authRefreshService = inject(AuthRefreshService);
  private readonly authSession = inject(AuthSessionService);

  async initialize(): Promise<void> {
    try {
      const profileResponse = await firstValueFrom(this.authService.getProfile());
      this.authSession.initializeFromProfile(profileResponse);
    } catch (error: unknown) {
      if (error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403)) {
        const didRefreshSucceed = await this.tryRefreshAndRestoreSession();
        if (didRefreshSucceed) {
          return;
        }

        this.authSession.clearSession();
        return;
      }

      this.authSession.clearSession();
    } finally {
      this.authSession.markBootstrapComplete();
    }
  }

  private async tryRefreshAndRestoreSession(): Promise<boolean> {
    try {
      const didRefreshSucceed = await this.authRefreshService.refreshAccessToken();
      if (!didRefreshSucceed) {
        return false;
      }

      const profileResponse = await firstValueFrom(this.authService.getProfile());
      this.authSession.initializeFromProfile(profileResponse);
      return true;
    } catch {
      return false;
    }
  }
}
