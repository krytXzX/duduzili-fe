import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { OtpInputComponent } from '../../../components/common/otp-input/otp-input.component';

@Component({
  selector: 'app-settings-verification-modal',
  imports: [CommonModule, NgOptimizedImage, OtpInputComponent],
  template: `
    <div
      class="fixed inset-0 z-[220] flex items-end justify-center bg-black/20 md:items-center"
      (click)="close.emit()"
    >
      <div
        class="relative flex h-[451px] w-full max-w-[390px] flex-col overflow-hidden rounded-t-[36px] bg-white shadow-[0_-24px_70px_-42px_rgba(19,27,45,0.45)] md:h-[450px] md:max-w-[600px] md:rounded-[16px] md:shadow-[0_30px_80px_-40px_rgba(19,27,45,0.45)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-verification-title"
        (click)="$event.stopPropagation()"
      >
        <div class="absolute left-1/2 top-[10px] h-1 w-[50px] -translate-x-1/2 rounded-full bg-[#EBEBEB] md:hidden"></div>

        <button
          type="button"
          (click)="close.emit()"
          [disabled]="isLoading()"
          class="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-[#EAEAEA] bg-white shadow-[0_4px_8px_rgba(202,202,202,0.25)] transition hover:bg-[#F8F8F8] active:scale-95 duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6453D9] md:right-6 md:top-6 disabled:opacity-50 disabled:pointer-events-none"
          aria-label="Close verification"
        >
          <img
            ngSrc="/assets/icons/settings/verification-modal-close.svg"
            width="24"
            height="24"
            alt=""
            aria-hidden="true"
          >
        </button>

        <button
          type="button"
          (click)="back.emit()"
          [disabled]="isLoading()"
          class="absolute left-4 top-[26px] z-10 flex h-8 w-10 items-center justify-center rounded-full bg-[#F4F4F4] text-[#1F1F1F] transition hover:bg-[#ECECEC] active:scale-95 duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6453D9] md:left-8 md:w-auto md:gap-1 md:bg-transparent md:px-0 md:text-[14px] md:font-medium md:leading-5 disabled:opacity-50 disabled:pointer-events-none"
          aria-label="Back to phone number"
        >
          <img
            ngSrc="/assets/icons/settings/verification-back.svg"
            width="14"
            height="14"
            alt=""
            aria-hidden="true"
            class="h-5 w-5 md:h-[14px] md:w-[14px]"
          >
          <span class="hidden md:inline">Back</span>
        </button>

        <div class="flex-1 px-4 pt-[85px] md:px-[43px] md:pt-20">
          <div class="max-w-[325px] md:max-w-[515px]">
            <div class="space-y-1.5 md:space-y-3">
              <h3
                id="settings-verification-title"
                class="text-[24px] font-semibold leading-8 text-[#1A1B1D]"
              >
                We sent you a code
              </h3>
              <p class="text-[16px] leading-6 text-[#5A5A5A] md:text-[14px] md:leading-5">
                <span>Enter verification code we sent to </span>
                <strong class="font-semibold text-[#1F1F1F] md:inline">{{ destination() }}</strong>
              </p>
            </div>

            <div class="mt-10 md:mt-9">
              <app-otp-input
                [length]="6"
                variant="settingsVerification"
                [submitted]="submitted()"
                (codeChange)="otpValue.set($event)"
                (codeFilled)="otpValue.set($event)"
              ></app-otp-input>
            </div>

            <div class="mt-[18px] text-[14.525px] font-medium leading-normal tracking-[-0.218px] md:mt-5 md:text-[16px] md:tracking-[-0.24px]">
              <p class="md:hidden">
                <span class="text-[rgba(26,27,29,0.5)]">Resend code in </span>
                <span class="text-[#1A1B1D]">00:28</span>
              </p>
              <p class="hidden md:block">
                <span class="text-[rgba(26,27,29,0.5)]">Didn’t get a code? </span>
                <button type="button" class="text-[#7F5EFF] transition hover:text-[#6548DF] active:scale-95 duration-200">Resend</button>
              </p>
            </div>
          </div>
        </div>

        <div class="border-t border-[#F5F5F5] bg-white px-4 pb-[26px] pt-2.5 md:border-t-0 md:px-[43px] md:pb-[50px] md:pt-0">
          <div class="grid gap-3 md:grid-cols-2">
            <button
              type="button"
              (click)="close.emit()"
              [disabled]="isLoading()"
              class="hidden h-10 items-center justify-center rounded-full border border-[#EAEAEA] bg-white px-5 text-[14px] font-medium leading-5 text-black transition hover:bg-[#FAFAFA] active:scale-95 duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6453D9] md:flex disabled:opacity-50 disabled:pointer-events-none"
            >
              Cancel
            </button>
            <button
              type="button"
              (click)="confirmCode()"
              [disabled]="isLoading()"
              class="flex h-[52px] items-center justify-center rounded-full border border-white bg-[#6453D9] px-5 text-[16px] font-medium leading-6 text-white shadow-[0_4px_8px_rgba(81,35,173,0.4),0_0_0_1px_#2A6CE8] transition hover:bg-[#5848CF] active:scale-95 duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2A6CE8] focus-visible:ring-offset-2 md:h-10 md:text-[14px] md:leading-5 disabled:opacity-50 disabled:pointer-events-none gap-2"
            >
              @if (isLoading()) {
                <svg class="animate-spin h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              }
              <span class="md:hidden">Update</span>
              <span class="hidden md:inline">Confirm and update</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsVerificationModalComponent {
  readonly destination = input.required<string>();
  readonly isLoading = input(false);

  readonly close = output<void>();
  readonly back = output<void>();
  readonly confirm = output<string>();

  protected readonly otpValue = signal('');
  protected readonly submitted = signal(false);

  protected confirmCode(): void {
    this.submitted.set(true);

    if (this.otpValue().length !== 6) {
      return;
    }

    this.confirm.emit(this.otpValue());
  }
}
