import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { AuthSessionService } from './auth-session.service';

@Injectable({ providedIn: 'root' })
export class AuthBootstrapService {
  private readonly authService = inject(AuthService);
  private readonly authSession = inject(AuthSessionService);

  async initialize(): Promise<void> {
    try {
      const profileResponse = await firstValueFrom(this.authService.getProfile());
      this.authSession.initializeFromProfile(profileResponse);
    } catch (error: unknown) {
      if (error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403)) {
        this.authSession.clearSession();
        return;
      }

      this.authSession.clearSession();
    } finally {
      this.authSession.markBootstrapComplete();
    }
  }
}
