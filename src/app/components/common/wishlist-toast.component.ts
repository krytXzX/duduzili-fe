import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WishlistToastService } from '../../services/wishlist-toast.service';

@Component({
  selector: 'app-wishlist-toast',
  imports: [CommonModule],
  template: `
    @if (toast(); as activeToast) {
      <div
        class="pointer-events-none fixed inset-x-0 bottom-6 z-[120] flex justify-center px-4"
        aria-live="polite"
        aria-atomic="true"
      >
        <div
          class="pointer-events-auto flex w-full max-w-[360px] items-center gap-4 rounded-[22px] bg-black px-4 py-3 text-white shadow-[0_20px_45px_-24px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-bottom-4 duration-300"
          role="status"
        >
          <div class="h-16 w-16 shrink-0 overflow-hidden rounded-[14px] bg-white/10">
            <img [src]="toastImage()" [alt]="activeToast.listing.title" class="h-full w-full object-cover" />
          </div>

          <div class="min-w-0 flex-1">
            <p class="truncate text-[14px] font-medium text-white/95">{{ toastMessage() }}</p>
          </div>

          @if (canUndo()) {
            <button
              type="button"
              (click)="undo()"
              class="shrink-0 text-[14px] font-medium text-white underline underline-offset-4 transition hover:text-white/80"
            >
              Undo
            </button>
          }
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WishlistToastComponent {
  private readonly wishlistToastService = inject(WishlistToastService);

  readonly toast = this.wishlistToastService.activeToast;
  readonly toastImage = computed(
    () => this.toast()?.listing.images[0] ?? '/assets/images/product_watch_luxury.png',
  );
  readonly toastMessage = computed(() =>
    this.toast()?.message
      ?? (this.toast()?.action === 'removed'
        ? 'Removed from Wishlist'
        : this.toast()?.action === 'auth_required'
          ? 'Please sign in to continue'
          : 'Added to Wishlist'),
  );
  readonly canUndo = computed(() => this.toast()?.action !== 'auth_required');

  undo(): void {
    this.wishlistToastService.undoLastAction();
  }
}
