import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroExclamationTriangle, heroXMark } from '@ng-icons/heroicons/outline';

export interface DeclinePromotionPayload {
  requestId: string;
  reason: string;
}

@Component({
  selector: 'app-admin-decline-promotion-modal',
  imports: [NgIcon],
  providers: [provideIcons({ heroExclamationTriangle, heroXMark })],
  template: `
    <div
      class="fixed inset-0 z-[230] flex items-end justify-center bg-black/20 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      (click)="close.emit()"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="decline-promotion-modal-title"
        class="w-full max-w-[620px] rounded-t-[26px] bg-white p-6 shadow-[0_30px_80px_-40px_rgba(19,27,45,0.45)] sm:rounded-[26px] sm:p-8"
        (click)="$event.stopPropagation()"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex h-24 w-24 items-center justify-center rounded-full bg-[#faf7ec]">
            <div class="flex h-16 w-16 items-center justify-center rounded-full bg-[#f9efc8] text-[#d8b600]">
              <ng-icon name="heroExclamationTriangle" class="text-[34px]"></ng-icon>
            </div>
          </div>

          <button
            type="button"
            (click)="close.emit()"
            class="flex h-10 w-10 items-center justify-center rounded-full bg-[#fafafa] text-[#626262] transition hover:bg-[#f2f2f2]"
            aria-label="Close decline modal"
          >
            <ng-icon name="heroXMark" class="text-[20px]"></ng-icon>
          </button>
        </div>

        <div class="mt-4">
          <h2 id="decline-promotion-modal-title" class="text-[18px] font-semibold text-[#202020] sm:text-[20px]">
            Decline banner Ad?
          </h2>

          <p class="mt-3 max-w-[520px] text-[15px] leading-7 text-[#575757]">
            Provide a reason for rejection to notify the seller and allow them to make corrections.
          </p>
        </div>

        <div class="mt-7">
          <label for="decline-reason" class="mb-3 block text-[15px] font-medium text-[#4a4a4a]">
            Why are you declining?
          </label>

          <textarea
            id="decline-reason"
            [value]="reason()"
            (input)="updateReason($event)"
            class="min-h-[110px] w-full rounded-[14px] border border-[#e6e6e6] px-4 py-3 text-[15px] text-[#202020] outline-none transition placeholder:text-[#b0b0b0] focus:border-[#ff3b30] focus:ring-4 focus:ring-[#ff3b30]/10"
          ></textarea>
        </div>

        <div class="mt-14 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            (click)="close.emit()"
            class="min-w-[126px] rounded-full border border-[#ececec] bg-white px-6 py-3 text-[15px] font-medium text-[#1f1f1f] transition hover:bg-[#fafafa]"
          >
            Cancel
          </button>

          <button
            type="button"
            (click)="submit()"
            class="min-w-[154px] rounded-full bg-[#ff3b30] px-6 py-3 text-[15px] font-medium text-white shadow-[0_16px_32px_-18px_rgba(255,59,48,0.9)] transition hover:bg-[#ef2f25]"
          >
            Yes, decline
          </button>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDeclinePromotionModalComponent {
  readonly requestId = input.required<string>();

  readonly close = output<void>();
  readonly confirm = output<DeclinePromotionPayload>();

  readonly reason = signal('');

  updateReason(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.reason.set(textarea.value);
  }

  submit(): void {
    this.confirm.emit({
      requestId: this.requestId(),
      reason: this.reason().trim(),
    });
  }
}
