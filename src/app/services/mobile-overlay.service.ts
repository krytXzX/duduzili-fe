import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MobileOverlayService {
  readonly isAddListingOpen = signal(false);
  readonly shouldOpenAddListing = signal(false);
  private readonly mobileModalCount = signal(0);
  readonly isAnyMobileOverlayOpen = computed(
    () => this.isAddListingOpen() || this.mobileModalCount() > 0,
  );

  setAddListingOpen(isOpen: boolean): void {
    this.isAddListingOpen.set(isOpen);
  }

  openMobileModal(): void {
    this.mobileModalCount.update((count) => count + 1);
  }

  closeMobileModal(): void {
    this.mobileModalCount.update((count) => Math.max(0, count - 1));
  }

  requestOpenAddListing(): void {
    this.shouldOpenAddListing.set(true);
  }

  consumeOpenAddListingRequest(): void {
    this.shouldOpenAddListing.set(false);
  }
}
