import { Injectable, computed, signal } from '@angular/core';
import type {
  AuthResponse,
  AuthUser,
  CheckEmailResponse,
  LoginResponse,
  ProfileResponse,
} from './auth.service';

type TokenBundle = {
  accessToken: string;
  refreshToken: string | null;
};

type AuthSessionState = {
  accessToken: string | null;
  refreshToken: string | null;
  csrfToken: string | null;
  loginResponse: LoginResponse;
  profile: CheckEmailResponse | null;
};

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly session = signal<AuthSessionState | null>(null);
  private readonly bootstrapCompleteState = signal(false);
  private bootstrapResolver: (() => void) | null = null;
  private readonly bootstrapReady = new Promise<void>((resolve) => {
    this.bootstrapResolver = resolve;
  });

  readonly user = computed(() => this.session()?.loginResponse.user ?? null);
  readonly accessToken = computed(() => this.session()?.accessToken ?? null);
  readonly refreshToken = computed(() => this.session()?.refreshToken ?? null);
  readonly csrfToken = computed(() => this.session()?.csrfToken ?? null);
  readonly profile = computed(() => this.session()?.profile ?? null);
  readonly isBootstrapComplete = computed(() => this.bootstrapCompleteState());
  readonly isAuthenticated = computed(() => this.session() !== null);
  readonly role = computed(() => this.user()?.role?.toLowerCase() ?? null);
  readonly isSuperuser = computed(() => {
    const role = this.role();
    return role === 'admin' || role === 'superuser';
  });
  readonly isSeller = computed(() => {
    const role = this.role();
    return this.user()?.is_vendor === true || role === 'seller' || role === 'vendor';
  });
  readonly isBuyer = computed(
    () => this.isAuthenticated() && !this.isSuperuser() && !this.isSeller(),
  );

  saveLoginSession(loginResponse: LoginResponse, profile: CheckEmailResponse | null): void {
    const tokens = this.extractTokens(loginResponse);
    const resolvedUser = this.resolveUser(loginResponse);
    const resolvedProfile = profile ?? this.toCheckEmailProfile(resolvedUser);

    this.session.set({
      accessToken: tokens?.accessToken ?? null,
      refreshToken: tokens?.refreshToken ?? null,
      csrfToken: this.extractCsrfToken(loginResponse),
      loginResponse: resolvedUser ? { ...loginResponse, user: resolvedUser } : loginResponse,
      profile: resolvedProfile,
    });
  }

  initializeFromProfile(profileResponse: ProfileResponse): void {
    const user = this.resolveUser(profileResponse);
    if (!user) {
      this.clearSession();
      return;
    }

    this.session.set({
      accessToken: this.session()?.accessToken ?? null,
      refreshToken: this.session()?.refreshToken ?? null,
      csrfToken: this.extractCsrfToken(profileResponse) ?? this.session()?.csrfToken ?? null,
      loginResponse: { user },
      profile: this.toCheckEmailProfile(user),
    });
  }

  updateTokens(response: AuthResponse): string | null {
    const currentSession = this.session();
    if (!currentSession) {
      return null;
    }

    const tokens = this.extractTokens(response);
    if (!tokens?.accessToken) {
      return null;
    }

    this.session.set({
      ...currentSession,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken ?? null,
      csrfToken: this.extractCsrfToken(response) ?? currentSession.csrfToken,
    });

    return tokens.accessToken;
  }

  clearSession(): void {
    this.session.set(null);
  }

  markBootstrapComplete(): void {
    if (this.bootstrapCompleteState()) {
      return;
    }

    this.bootstrapCompleteState.set(true);
    this.bootstrapResolver?.();
    this.bootstrapResolver = null;
  }

  waitForBootstrap(): Promise<void> {
    return this.bootstrapCompleteState() ? Promise.resolve() : this.bootstrapReady;
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

  private extractCsrfToken(response: AuthResponse): string | null {
    return this.readString(response['csrfToken']) ?? this.readString(response['csrf_token']);
  }

  private resolveUser(payload: ProfileResponse | LoginResponse): AuthUser | null {
    const directUser = this.isAuthUser(payload) ? payload : null;
    if (directUser) {
      return directUser;
    }

    const nestedUser =
      payload && typeof payload === 'object' && 'user' in payload
        ? (payload as { user?: unknown }).user
        : undefined;

    return this.isAuthUser(nestedUser) ? nestedUser : null;
  }

  private toCheckEmailProfile(user: AuthUser | null): CheckEmailResponse | null {
    if (!user) {
      return null;
    }

    return {
      username: user.username,
      avatar: user.avatar,
    };
  }

  private isAuthUser(value: unknown): value is AuthUser {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const candidate = value as Partial<AuthUser>;
    return (
      typeof candidate.id === 'number' &&
      typeof candidate.username === 'string' &&
      typeof candidate.email === 'string'
    );
  }
}
