import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { AuthSessionService } from './auth-session.service';

@Injectable({ providedIn: 'root' })
export class AuthFlowService {
  private readonly authService = inject(AuthService);
  private readonly authSession = inject(AuthSessionService);
  private readonly router = inject(Router);

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.authService.logout());
    } catch (error: unknown) {
      if (!(error instanceof HttpErrorResponse) || (error.status !== 401 && error.status !== 403)) {
        // We still clear the local session and continue to sign-in even if the backend logout
        // request fails, so the user is not trapped in a broken local state.
      }
    } finally {
      this.authSession.clearSession();
      await this.router.navigate(['/sign-in']);
    }
  }
}
