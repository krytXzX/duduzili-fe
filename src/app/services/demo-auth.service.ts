import { PLATFORM_ID, Injectable, computed, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

type DemoUser = {
  email: string;
  fullName: string;
};

@Injectable({ providedIn: 'root' })
export class DemoAuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly storageKey = 'duduzili.demo-auth.user';

  readonly user = signal<DemoUser | null>(null);
  readonly isAuthenticated = computed(() => this.user() !== null);

  constructor() {
    this.restoreUser();

    effect(() => {
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }

      const currentUser = this.user();
      if (currentUser) {
        globalThis.sessionStorage?.setItem(this.storageKey, JSON.stringify(currentUser));
        return;
      }

      globalThis.sessionStorage?.removeItem(this.storageKey);
    });
  }

  signIn(email: string): void {
    this.user.set({
      email,
      fullName: this.deriveNameFromEmail(email),
    });
  }

  signUp(email: string, fullName: string): void {
    this.user.set({
      email,
      fullName: fullName.trim() || this.deriveNameFromEmail(email),
    });
  }

  signOut(): void {
    this.user.set(null);
  }

  private restoreUser(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const rawUser = globalThis.sessionStorage?.getItem(this.storageKey);
    if (!rawUser) {
      return;
    }

    try {
      const parsedUser = JSON.parse(rawUser) as Partial<DemoUser>;
      if (typeof parsedUser.email !== 'string' || parsedUser.email.trim().length === 0) {
        globalThis.sessionStorage?.removeItem(this.storageKey);
        return;
      }

      this.user.set({
        email: parsedUser.email.trim(),
        fullName:
          typeof parsedUser.fullName === 'string' && parsedUser.fullName.trim().length > 0
            ? parsedUser.fullName.trim()
            : this.deriveNameFromEmail(parsedUser.email),
      });
    } catch {
      globalThis.sessionStorage?.removeItem(this.storageKey);
    }
  }

  private deriveNameFromEmail(email: string): string {
    const localPart = email.split('@')[0]?.trim() || 'Demo User';
    return localPart
      .replace(/[._-]+/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
}
