import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

type SellerReportStep = 1 | 2;
type SellerReportFormGroup = FormGroup<{ details: FormControl<string> }>;

@Component({
  selector: 'app-seller-report-modal',
  imports: [NgOptimizedImage, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <div
        class="fixed inset-0 z-[80] flex items-end justify-center bg-black/40 p-0 backdrop-blur-[2px] md:items-center md:p-4"
        (click)="closed.emit()"
      >
        <div
          class="relative w-full rounded-t-[36px] bg-white px-4 pb-8 pt-3 shadow-[0_30px_80px_-40px_rgba(19,27,45,0.45)] md:max-w-[550px] md:rounded-[32px] md:px-4 md:pb-8 md:pt-4"
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="step() === 1 ? 'report-seller-step1-title' : 'report-seller-step2-title'"
          (click)="$event.stopPropagation()"
        >
          <div class="relative h-6 md:hidden">
            <div class="absolute left-1/2 top-2.5 h-1 w-[50px] -translate-x-1/2 rounded-full bg-[#EBEBEB]"></div>
          </div>

          @if (step() === 2) {
            <button
              type="button"
              (click)="back.emit()"
              class="absolute left-4 top-[26px] flex h-8 w-10 items-center justify-center rounded-[10px] text-[#434455] transition hover:bg-[#F7F7F8] md:left-4 md:top-[26px]"
              aria-label="Go back"
            >
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M11.5 5 6.5 10l5 5" />
              </svg>
            </button>
          }

          <button
            type="button"
            (click)="closed.emit()"
            class="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-[#EAEAEA] bg-white text-[#434455] shadow-[0_4px_8px_rgba(202,202,202,0.25)] transition hover:bg-[#FAFAFA] md:right-5 md:top-5"
            aria-label="Close report modal"
          >
            <img
              ngSrc="/assets/icons/product-modal/seller-report-close.svg"
              alt=""
              width="24"
              height="24"
              class="h-6 w-6"
            />
          </button>

          @if (step() === 1) {
            <div class="mx-auto mt-10 flex w-full max-w-[334px] flex-col gap-[44px] md:mt-[65px]">
              <div class="space-y-3 text-center">
                <h2
                  id="report-seller-step1-title"
                  class="text-[24px] font-semibold leading-[1.05] text-[#15162B] md:text-[28px]"
                >
                  Why are you reporting this seller?
                </h2>
                <p class="text-[14px] leading-[1.5] tracking-[-0.5px] text-[#48484A]">
                  Your feedback helps us keep Duduzili safe. (This won’t be shared with the seller.)
                </p>
              </div>

              <div class="space-y-0.5">
                @for (reason of reasons(); track reason) {
                  <button
                    type="button"
                    (click)="reasonSelected.emit(reason)"
                    class="flex min-h-[44px] w-full items-center justify-between gap-4 border-b border-[#ECECEC] py-[10px] text-left transition hover:bg-[#FCFCFD]"
                    [attr.aria-pressed]="selectedReason() === reason"
                  >
                    <span
                      class="text-[14px] leading-5 text-[#5A5A5A]"
                      [class.max-w-[279px]]="reason === 'Repeatedly listing sold/unavailable items'"
                    >
                      {{ reason }}
                    </span>
                    <span
                      class="flex h-6 w-6 items-center justify-center rounded-full border transition"
                      [class.border-[#D7D7DC]]="selectedReason() !== reason"
                      [class.border-[#6453D9]]="selectedReason() === reason"
                      [class.bg-[#6453D9]]="selectedReason() === reason"
                      aria-hidden="true"
                    >
                      @if (selectedReason() === reason) {
                        <span class="h-2.5 w-2.5 rounded-full bg-white"></span>
                      }
                    </span>
                  </button>
                }
              </div>

              <button
                type="button"
                (click)="advanced.emit()"
                class="flex h-[52px] w-full items-center justify-center rounded-[64px] border border-white bg-[#6453D9] px-5 text-[16px] font-medium leading-6 text-white shadow-[0_4px_8px_rgba(81,35,173,0.4),0_0_0_1px_#2A6CE8] transition hover:bg-[#5645cb] disabled:cursor-not-allowed disabled:opacity-50"
                [disabled]="!selectedReason()"
              >
                Next
              </button>
            </div>
          } @else {
            <form
              class="mx-auto mt-10 flex w-full max-w-[334px] flex-col gap-9 md:mt-[85px]"
              [formGroup]="form()"
              (ngSubmit)="submitted.emit()"
            >
              <div class="space-y-8">
                <h2
                  id="report-seller-step2-title"
                  class="text-[24px] font-semibold leading-[1.2] text-[#15162B]"
                >
                  Please add more information to help us review this report
                </h2>

                <div>
                  <label for="report-details-seller" class="mb-1.5 block text-[14px] font-medium leading-5 text-[#5A5A5A]">
                    What happened?
                  </label>
                  <textarea
                    id="report-details-seller"
                    rows="4"
                    formControlName="details"
                    class="h-[124px] w-full rounded-[10px] border border-[#E6E6E8] px-3 py-2 text-[16px] leading-6 text-[#252628] outline-none transition focus:border-[#6453D9]"
                    [attr.aria-invalid]="form().controls.details.invalid && form().controls.details.touched"
                  ></textarea>
                </div>
              </div>

              <button
                type="submit"
                class="flex h-[52px] w-full items-center justify-center rounded-[64px] border border-white bg-[#6453D9] px-5 text-[16px] font-medium leading-6 text-white shadow-[0_4px_8px_rgba(81,35,173,0.4),0_0_0_1px_#2A6CE8] transition hover:bg-[#5645cb]"
              >
                Submit
              </button>
            </form>
          }
        </div>
      </div>
    }
  `,
})
export class SellerReportModalComponent {
  readonly open = input.required<boolean>();
  readonly step = input.required<SellerReportStep>();
  readonly selectedReason = input<string | null>(null);
  readonly reasons = input.required<readonly string[]>();
  readonly form = input.required<SellerReportFormGroup>();

  readonly closed = output<void>();
  readonly back = output<void>();
  readonly reasonSelected = output<string>();
  readonly advanced = output<void>();
  readonly submitted = output<void>();
}
