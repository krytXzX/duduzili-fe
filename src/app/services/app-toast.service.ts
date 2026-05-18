import { Injectable, signal } from '@angular/core';

export type AppToastState = {
  message: string;
  imageSrc?: string;
  imageAlt?: string;
  actionLabel?: string;
  action?: () => void;
  durationMs?: number;
};

@Injectable({ providedIn: 'root' })
export class AppToastService {
  readonly activeToast = signal<AppToastState | null>(null);

  private hideToastTimer: ReturnType<typeof setTimeout> | null = null;

  show(toast: AppToastState): void {
    this.dismiss();
    this.activeToast.set(toast);

    const durationMs = toast.durationMs ?? 4000;
    this.hideToastTimer = setTimeout(() => {
      this.activeToast.set(null);
      this.hideToastTimer = null;
    }, durationMs);
  }

  triggerAction(): void {
    const toast = this.activeToast();
    if (!toast?.action) {
      return;
    }

    toast.action();
    this.dismiss();
  }

  dismiss(): void {
    if (this.hideToastTimer) {
      clearTimeout(this.hideToastTimer);
      this.hideToastTimer = null;
    }

    this.activeToast.set(null);
  }
}
