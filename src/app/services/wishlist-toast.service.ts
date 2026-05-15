import { Injectable, signal } from '@angular/core';
import type { Listing } from '../components/listings/listing-card.component';

type WishlistToastState = {
  action: 'added' | 'removed' | 'auth_required';
  listing: Listing;
  message?: string;
};

@Injectable({ providedIn: 'root' })
export class WishlistToastService {
  readonly favoritedIds = signal<string[]>([]);
  readonly activeToast = signal<WishlistToastState | null>(null);

  private hideToastTimer: ReturnType<typeof setTimeout> | null = null;

  addToWishlist(listing: Listing): void {
    this.favoritedIds.update((current) =>
      current.includes(listing.id) ? current : [...current, listing.id],
    );
    this.showToast({ action: 'added', listing });
  }

  removeFromWishlist(listing: Listing): void {
    this.favoritedIds.update((current) => current.filter((currentId) => currentId !== listing.id));

    if (this.activeToast()?.listing.id === listing.id) {
      this.dismissToast();
    }

    this.showToast({ action: 'removed', listing });
  }

  isInWishlist(id: string): boolean {
    return this.favoritedIds().includes(id);
  }

  showAuthRequiredToast(listing: Listing, message = 'Please sign in to continue'): void {
    this.showToast({ action: 'auth_required', listing, message });
  }

  undoLastAction(): void {
    const toast = this.activeToast();
    if (!toast) {
      return;
    }

    if (toast.action === 'auth_required') {
      this.dismissToast();
      return;
    }

    if (toast.action === 'added') {
      this.favoritedIds.update((current) =>
        current.filter((currentId) => currentId !== toast.listing.id),
      );
    } else {
      this.favoritedIds.update((current) =>
        current.includes(toast.listing.id) ? current : [...current, toast.listing.id],
      );
    }

    this.dismissToast();
  }

  dismissToast(): void {
    if (this.hideToastTimer) {
      clearTimeout(this.hideToastTimer);
      this.hideToastTimer = null;
    }

    this.activeToast.set(null);
  }

  private showToast(toast: WishlistToastState): void {
    this.dismissToast();
    this.activeToast.set(toast);

    this.hideToastTimer = setTimeout(() => {
      this.activeToast.set(null);
      this.hideToastTimer = null;
    }, 4000);
  }
}
