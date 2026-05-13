import { Injectable, computed, signal } from '@angular/core';
import type { CheckEmailResponse, LoginResponse } from './auth.service';

type TokenBundle = {
  accessToken: string;
  refreshToken: string | null;
};

type AuthSessionState = {
  accessToken: string | null;
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
  readonly isAuthenticated = computed(() => this.session() !== null);

  saveLoginSession(loginResponse: LoginResponse, profile: CheckEmailResponse | null): void {
    const tokens = this.extractTokens(loginResponse);
    const resolvedProfile =
      profile ??
      (loginResponse.user
        ? {
            username: loginResponse.user.username,
            avatar: loginResponse.user.avatar,
          }
        : null);

    this.session.set({
      accessToken: tokens?.accessToken ?? null,
      refreshToken: tokens?.refreshToken ?? null,
      loginResponse,
      profile: resolvedProfile,
    });
  }

  clearSession(): void {
    this.session.set(null);
  }

  private extractTokens(response: LoginResponse): TokenBundle | null {
    const accessToken =
      this.readString(response['access']) ??
      this.readString(response['access_token']) ??
      this.readString(response['token']) ??
      this.readNestedString(response['tokens'], 'access') ??
      this.readNestedString(response['tokens'], 'access_token') ??
      this.readNestedString(response['data'], 'access') ??
      this.readNestedString(response['data'], 'access_token') ??
      this.readNestedString(response['data'], 'token');

    if (!accessToken) {
      return null;
    }

    const refreshToken =
      this.readString(response['refresh']) ??
      this.readString(response['refresh_token']) ??
      this.readNestedString(response['tokens'], 'refresh') ??
      this.readNestedString(response['tokens'], 'refresh_token') ??
      this.readNestedString(response['data'], 'refresh') ??
      this.readNestedString(response['data'], 'refresh_token') ??
      null;

    return {
      accessToken,
      refreshToken,
    };
  }

  private readString(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value : null;
  }

  private readNestedString(container: unknown, key: string): string | null {
    if (!container || typeof container !== 'object') {
      return null;
    }

    const value = (container as Record<string, unknown>)[key];
    return this.readString(value);
  }
}
