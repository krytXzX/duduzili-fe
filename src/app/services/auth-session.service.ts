import { Injectable, computed, signal } from '@angular/core';
import type { CheckEmailResponse, LoginResponse } from './auth.service';

type TokenBundle = {
  accessToken: string;
  refreshToken: string | null;
};

type AuthSessionState = {
  accessToken: string;
  refreshToken: string | null;
  loginResponse: LoginResponse;
  profile: CheckEmailResponse | null;
};

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly session = signal<AuthSessionState | null>(null);

  readonly accessToken = computed(() => this.session()?.accessToken ?? null);
  readonly refreshToken = computed(() => this.session()?.refreshToken ?? null);
  readonly profile = computed(() => this.session()?.profile ?? null);
  readonly isAuthenticated = computed(() => this.accessToken() !== null);

  saveLoginSession(loginResponse: LoginResponse, profile: CheckEmailResponse | null): void {
    const tokens = this.extractTokens(loginResponse);
    if (tokens === null) {
      throw new Error('Authentication succeeded but no access token was returned.');
    }

    this.session.set({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      loginResponse,
      profile,
    });
  }

  clearSession(): void {
    this.session.set(null);
  }

  private extractTokens(response: LoginResponse): TokenBundle | null {
    const accessToken =
      this.readString(response['access']) ??
      this.readString(response['access_token']) ??
      this.readString(response['token']);

    if (!accessToken) {
      return null;
    }

    const refreshToken =
      this.readString(response['refresh']) ?? this.readString(response['refresh_token']) ?? null;

    return {
      accessToken,
      refreshToken,
    };
  }

  private readString(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value : null;
  }
}
