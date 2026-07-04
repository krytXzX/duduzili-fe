import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroXMark, heroArrowLeft, heroFlag } from '@ng-icons/heroicons/outline';
import { DOCUMENT } from '@angular/common';

export interface ReportStoreSubmitValue {
  reason: string;
  description: string;
}

@Component({
  selector: 'app-report-store-modal',
  imports: [NgIcon],
  providers: [
    provideIcons({
      heroXMark,
      heroArrowLeft,
      heroFlag,
    }),
  ],
  template: `
    <div
      class="fixed inset-0 z-[60] bg-black/45 backdrop-blur-[3px] flex items-end justify-center md:items-center md:p-4"
      (click)="close.emit()"
    >
      <div
        class="fixed inset-x-0 bottom-0 z-50 flex max-h-[90dvh] flex-col rounded-t-[32px] bg-white px-5 pb-[env(safe-area-inset-bottom,20px)] pt-4 shadow-2xl md:relative md:inset-auto md:max-h-none md:w-full md:max-w-[520px] md:rounded-[24px] md:p-8 md:shadow-xl"
        (click)="$event.stopPropagation()"
      >
        <!-- Drag handle / close marker for mobile -->
        <div class="mx-auto mb-3 h-1.5 w-12 rounded-full bg-[#ebebeb] md:hidden"></div>

        <!-- Desktop/Mobile Header Close button -->
        <button
          type="button"
          class="absolute right-4 top-4 hidden md:inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#f0f0f0] bg-white text-[#909090] transition hover:bg-gray-50 active:scale-95"
          aria-label="Close modal"
          (click)="close.emit()"
        >
          <ng-icon name="heroXMark" class="text-[18px]"></ng-icon>
        </button>

        <!-- STEP 1: Choose Reason -->
        @if (step() === 1) {
          <div class="flex flex-col gap-6 pt-2 md:pt-0">
            <div class="space-y-2">
              <h2 class="text-[22px] md:text-[24px] font-bold leading-tight text-[#111111]">
                Why are you reporting this store?
              </h2>
              <p class="text-[14px] leading-relaxed text-[#757575]">
                Your feedback helps us keep Duduzili safe. (This won't be shared with the store.)
              </p>
            </div>

            <div class="flex flex-col border border-[#efefef] rounded-[16px] overflow-hidden bg-[#fafafa]/50">
              @for (option of reasonOptions; track option.value; let last = $last) {
                <label
                  class="flex items-center justify-between gap-4 px-4 py-4 cursor-pointer transition hover:bg-[#f3f3f6] active:bg-[#ebebed]"
                  [class.border-b]="!last"
                  [class.border-[#f0f0f0]]="!last"
                  (click)="selectedReason.set(option.value)"
                >
                  <span class="text-[15px] font-medium text-[#2d2d2d]">{{ option.label }}</span>
                  <div
                    class="h-5 w-5 shrink-0 rounded-full border flex items-center justify-center transition-all duration-200"
                    [class.border-[#6453d9]]="selectedReason() === option.value"
                    [class.border-[#cccccc]]="selectedReason() !== option.value"
                    [class.bg-[#6453d9]]="selectedReason() === option.value"
                  >
                    @if (selectedReason() === option.value) {
                      <div class="h-2 w-2 rounded-full bg-white"></div>
                    }
                  </div>
                </label>
              }
            </div>

            <div class="flex h-12 items-center gap-3 mt-2">
              <button
                type="button"
                class="flex-1 inline-flex h-full items-center justify-center rounded-[82px] bg-[#f5f5f5] text-[15px] font-medium text-[#05061a] transition hover:bg-[#ebebeb] active:scale-95"
                (click)="close.emit()"
              >
                Cancel
              </button>

              <button
                type="button"
                [disabled]="!selectedReason()"
                class="flex-1 inline-flex h-full items-center justify-center rounded-[64px] bg-[#6453d9] text-[15px] font-medium text-white shadow-[0_4px_12px_rgba(81,35,173,0.33)] disabled:opacity-40 disabled:pointer-events-none transition hover:bg-[#5342c6] active:scale-95"
                (click)="step.set(2)"
              >
                Next
              </button>
            </div>
          </div>
        }

        <!-- STEP 2: Description Info -->
        @else if (step() === 2) {
          <div class="flex flex-col gap-6 pt-2 md:pt-0">
            <div class="space-y-2">
              <h2 class="text-[22px] md:text-[24px] font-bold leading-tight text-[#111111]">
                Please add more information to help us review this report
              </h2>
            </div>

            <div class="space-y-2">
              <label for="report-desc" class="block text-[13px] font-semibold text-[#5a5a5a]">
                What happened?
              </label>
              <textarea
                id="report-desc"
                [value]="description()"
                (input)="onDescriptionInput($event)"
                rows="5"
                placeholder="Please describe in detail what happened..."
                class="w-full resize-none rounded-[16px] border border-[#e2e2e2] bg-[#fbfbfb] px-4 py-3 text-[14px] text-[#2d2d2d] outline-none transition focus:border-[#6453d9] focus:bg-white placeholder:text-[#ababab] shadow-inner"
              ></textarea>
            </div>

            <div class="flex h-12 items-center gap-3 mt-2">
              <button
                type="button"
                class="flex-1 inline-flex h-full items-center justify-center rounded-[82px] bg-[#f5f5f5] text-[15px] font-medium text-[#05061a] transition hover:bg-[#ebebeb] active:scale-95"
                (click)="step.set(1)"
              >
                Back
              </button>

              <button
                type="button"
                [disabled]="!description().trim()"
                class="flex-1 inline-flex h-full items-center justify-center rounded-[64px] bg-[#6453d9] text-[15px] font-medium text-white shadow-[0_4px_12px_rgba(81,35,173,0.33)] disabled:opacity-40 disabled:pointer-events-none transition hover:bg-[#5342c6] active:scale-95"
                (click)="onSubmit()"
              >
                Submit
              </button>
            </div>
          </div>
        }

        <!-- STEP 3: Success Screen -->
        @else if (step() === 3) {
          <div class="flex flex-col items-center gap-6 py-6 text-center">
            <!-- Handshake illustration -->
            <div class="relative flex h-[100px] w-[140px] items-center justify-center overflow-hidden">
              <img
                src="/assets/images/product-modal/seller-report-success-hero.png"
                alt="Success"
                class="h-full w-full object-contain"
              />
            </div>

            <div class="space-y-2 max-w-[340px]">
              <h2 class="text-[22px] md:text-[24px] font-bold leading-tight text-[#111111]">
                Thank you for keeping Duduzili safe
              </h2>
              <p class="text-[14px] leading-relaxed text-[#757575]">
                Our team will review this report and take the necessary steps.
              </p>
            </div>

            <button
              type="button"
              class="w-full max-w-[200px] inline-flex h-11 items-center justify-center rounded-[64px] bg-[#6453d9] text-[14px] font-semibold text-white shadow-[0_4px_12px_rgba(81,35,173,0.33)] transition hover:bg-[#5342c6] active:scale-95"
              (click)="close.emit()"
            >
              Done
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      @keyframes slide-up {
        from {
          transform: translateY(100%);
        }
        to {
          transform: translateY(0);
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportStoreModalComponent {
  readonly close = output<void>();
  readonly submitReport = output<ReportStoreSubmitValue>();

  protected readonly step = signal<1 | 2 | 3>(1);
  protected readonly selectedReason = signal<string>('');
  protected readonly description = signal<string>('');

  protected readonly reasonOptions = [
    { value: 'scam', label: 'Suspected scam or fraud' },
    { value: 'unresponsive', label: 'Seller is unresponsive after payment' },
    { value: 'prohibited', label: 'Selling prohibited or illegal items' },
    { value: 'spam', label: 'Repeatedly listing sold/unavailable items' },
    { value: 'other', label: 'Other reason' },
  ];

  private readonly document = inject(DOCUMENT);

  isMobile(): boolean {
    const defaultView = this.document.defaultView;
    return defaultView ? defaultView.innerWidth < 768 : false;
  }

  onDescriptionInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.description.set(textarea.value);
  }

  onSubmit(): void {
    const reason = this.selectedReason();
    const description = this.description().trim();

    if (!reason || !description) {
      return;
    }

    this.submitReport.emit({
      reason,
      description,
    });
    this.step.set(3);
  }
}
