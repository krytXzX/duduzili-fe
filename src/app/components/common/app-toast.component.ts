import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { AppToastService } from '../../services/app-toast.service';

@Component({
  selector: 'app-toast',
  imports: [CommonModule, NgOptimizedImage],
  template: `
    @if (toast(); as activeToast) {
      <div
        class="pointer-events-none fixed inset-x-0 bottom-6 z-[300] flex justify-center px-4"
        aria-live="polite"
        aria-atomic="true"
      >
        <div
          class="pointer-events-auto flex w-full max-w-[360px] items-center gap-4 rounded-[22px] bg-black px-4 py-3 text-white shadow-[0_20px_45px_-24px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-bottom-4 duration-300"
          role="status"
        >
          @if (toastImage()) {
            <div class="h-16 w-16 shrink-0 overflow-hidden rounded-[14px] bg-white/10">
              <img
                [ngSrc]="toastImage()!"
                [alt]="toastImageAlt()"
                width="64"
                height="64"
                loading="eager"
                class="h-full w-full object-cover"
              />
            </div>
          }

          <div class="min-w-0 flex-1">
            <p class="truncate text-[14px] font-medium text-white/95">{{ activeToast.message }}</p>
          </div>

          @if (canAct()) {
            <button
              type="button"
              (click)="triggerAction()"
              class="shrink-0 text-[14px] font-medium text-white underline underline-offset-4 transition hover:text-white/80"
            >
              {{ actionLabel() }}
            </button>
          }
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppToastComponent {
  private readonly appToastService = inject(AppToastService);

  readonly toast = this.appToastService.activeToast;
  readonly toastImage = computed(() => this.toast()?.imageSrc ?? null);
  readonly toastImageAlt = computed(() => this.toast()?.imageAlt ?? '');
  readonly actionLabel = computed(() => this.toast()?.actionLabel ?? '');
  readonly canAct = computed(() => !!this.toast()?.action && !!this.toast()?.actionLabel);

  triggerAction(): void {
    this.appToastService.triggerAction();
  }
}
