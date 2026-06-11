import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { OtpInputComponent } from '../../../components/common/otp-input/otp-input.component';

export type TwoFactorMethod = 'sms' | 'email' | 'app';

@Component({
  selector: 'app-settings-two-factor-modal',
  imports: [CommonModule, NgOptimizedImage, OtpInputComponent],
  template: `
    <div class="fixed inset-0 z-[220] flex items-end justify-center bg-black/20 md:items-center" (click)="close.emit()">
        @if (isVerificationStep()) {
          <div
            [class]="verificationDialogClass()"
            role="dialog"
            aria-modal="true"
            aria-labelledby="two-factor-verification-title"
            (click)="$event.stopPropagation()"
          >
            <div class="absolute left-1/2 top-[10px] h-1 w-[50px] -translate-x-1/2 rounded-full bg-[#EBEBEB] md:hidden"></div>

            <button
              type="button"
              (click)="close.emit()"
              [disabled]="isSubmitting()"
              class="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-[#EAEAEA] bg-white shadow-[0_4px_8px_rgba(202,202,202,0.25)] transition hover:bg-[#F8F8F8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6453D9] md:right-6 md:top-6 disabled:opacity-50 disabled:pointer-events-none"
              aria-label="Close 2FA modal"
            >
              <img
                ngSrc="/assets/icons/settings/two-factor-modal-close.svg"
                width="24"
                height="24"
                alt=""
                aria-hidden="true"
              >
            </button>

            @if (showBack()) {
              <button
                type="button"
                (click)="goBack()"
                [disabled]="isSubmitting()"
                class="absolute left-4 top-[26px] z-10 flex h-8 w-10 items-center justify-center rounded-full bg-[#F4F4F4] text-[#1F1F1F] transition hover:bg-[#ECECEC] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6453D9] md:left-8 md:w-auto md:gap-1 md:bg-transparent md:px-0 md:text-[14px] md:font-medium md:leading-5 disabled:opacity-50 disabled:pointer-events-none"
                aria-label="Back to authenticator setup"
              >
                <img
                  ngSrc="/assets/icons/settings/two-factor-modal-back.svg"
                  width="14"
                  height="14"
                  alt=""
                  aria-hidden="true"
                  class="h-5 w-5 md:h-[14px] md:w-[14px]"
                >
                <span class="hidden md:inline">Back</span>
              </button>
            }

            <div class="flex-1 px-4 pt-[85px] md:px-[43px] md:pt-20">
              <div class="max-w-[325px] md:max-w-[515px]">
                <div class="space-y-1.5 md:space-y-3">
                  <h2
                    id="two-factor-verification-title"
                    class="text-[24px] font-semibold leading-8 text-[#1A1B1D]"
                  >
                    {{ verificationTitle() }}
                  </h2>
                  @if (method() === 'app') {
                    <p class="text-[16px] leading-6 text-[#5A5A5A] md:text-[14px] md:leading-5">
                      {{ verificationDescriptionPrefix() }}
                    </p>
                  } @else {
                    <p class="text-[16px] leading-6 text-[#5A5A5A] md:text-[14px] md:leading-5">
                      <span>{{ verificationDescriptionPrefix() }}</span>
                      <strong
                        class="font-semibold text-[#1F1F1F]"
                        [class.block]="method() !== 'email'"
                        [class.inline]="method() === 'email'"
                      >
                        {{ destination() }}
                      </strong>
                    </p>
                  }
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

                @if (method() !== 'app') {
                  <div class="mt-[18px] text-[14.525px] font-medium leading-normal tracking-[-0.218px] md:mt-5 md:text-[16px] md:tracking-[-0.24px]">
                    <p>
                      <span class="text-[rgba(26,27,29,0.5)]">Didn’t get a code? </span>
                      <button type="button" class="text-[#7F5EFF] transition hover:text-[#6548DF]">Resend</button>
                    </p>
                  </div>
                }
              </div>
            </div>

            <div class="border-t border-[#F5F5F5] bg-white px-4 pb-[26px] pt-2.5 md:border-t-0 md:px-[43px] md:pb-8 md:pt-0">
              <button
                type="button"
                (click)="verifyAndComplete()"
                [disabled]="isSubmitting()"
                class="mx-auto flex h-[52px] w-full items-center justify-center rounded-full border border-white bg-[#6453D9] px-5 text-[16px] font-medium leading-6 text-white shadow-[0_4px_12px_rgba(81,35,173,0.33),0_0_0_1px_#6B5BD5] transition hover:bg-[#5848CF] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2A6CE8] focus-visible:ring-offset-2 md:h-10 md:w-[440px] md:text-[14px] md:leading-5 disabled:opacity-50 disabled:pointer-events-none gap-2"
              >
                @if (isSubmitting()) {
                  <svg class="animate-spin h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                }
                {{ isSubmitting() ? 'Verifying...' : 'Verify and set up' }}
              </button>
            </div>
          </div>
        } @else {
          <div
            class="relative flex h-[617px] w-full max-w-[390px] flex-col overflow-hidden rounded-t-[36px] bg-white shadow-[0_-24px_70px_-42px_rgba(19,27,45,0.45)] md:h-[617px] md:max-w-[600px] md:rounded-[16px] md:shadow-[0_30px_80px_-40px_rgba(19,27,45,0.45)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="two-factor-app-title"
            (click)="$event.stopPropagation()"
          >
            <div class="absolute left-1/2 top-[10px] h-1 w-[50px] -translate-x-1/2 rounded-full bg-[#EBEBEB] md:hidden"></div>

            <button
              type="button"
              (click)="close.emit()"
              class="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-[#EAEAEA] bg-white shadow-[0_4px_8px_rgba(202,202,202,0.25)] transition hover:bg-[#F8F8F8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6453D9] md:right-6 md:top-6"
              aria-label="Close 2FA modal"
            >
              <img
                ngSrc="/assets/icons/settings/two-factor-modal-close.svg"
                width="24"
                height="24"
                alt=""
                aria-hidden="true"
              >
            </button>

            <div class="flex-1 px-4 pt-[85px] md:px-[43px] md:pt-20">
              <div class="mx-auto flex max-w-[325px] flex-col items-center gap-9 md:max-w-[515px]">
                <div class="w-full space-y-3">
                  <h2
                    id="two-factor-app-title"
                    class="text-[24px] font-semibold leading-8 text-[#1A1B1D]"
                  >
                    Use an authenticator app
                  </h2>
                  <p class="text-[14px] leading-5 text-[#5A5A5A]">
                    Use a free authenticator app such as Google Authenticator, Microsoft Authenticator) to scan this QR code to set up your account
                  </p>
                </div>

                @if (appStep() === 'qr') {
                  <div class="flex w-[256px] flex-col items-center gap-[9px]">
                    <img
                      [src]="qrCode() || '/assets/images/settings/two-factor-qr.svg'"
                      width="256"
                      height="256"
                      alt="Authenticator setup QR code"
                    >
                    <button
                      type="button"
                      (click)="appStep.set('manual')"
                      class="w-full text-center text-[14px] font-medium leading-normal text-[#6453D9] transition hover:text-[#5848CF] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6453D9]"
                    >
                      Can’t scan? Enter manually
                    </button>
                  </div>
                } @else {
                  <div class="flex w-full flex-col items-center gap-4">
                    <div class="flex h-[50px] w-full items-center justify-center overflow-hidden rounded-[15px] border border-[#F0F0F0] px-4">
                      <p class="text-center text-[24px] leading-[1.3] tracking-[4.8px] text-[#0D0D0D]">
                        {{ manualSecret() || '0xju-jkhy-pdor-jieu-lyrq' }}
                      </p>
                    </div>
                    <button
                      type="button"
                      (click)="appStep.set('qr')"
                      class="w-full text-center text-[14px] font-medium leading-normal text-[#6453D9] transition hover:text-[#5848CF] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6453D9]"
                    >
                      Scan QR code instead
                    </button>
                  </div>
                }
              </div>
            </div>

            <div class="border-t border-[#F5F5F5] bg-white px-4 pb-[26px] pt-2.5 md:border-t-0 md:px-[43px] md:pb-8 md:pt-0">
              <button
                type="button"
                (click)="appStep.set('verify')"
                class="mx-auto flex h-[52px] w-full items-center justify-center rounded-full border border-white bg-[#6453D9] px-5 text-[16px] font-medium leading-6 text-white shadow-[0_4px_12px_rgba(81,35,173,0.33),0_0_0_1px_#6B5BD5] transition hover:bg-[#5848CF] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2A6CE8] focus-visible:ring-offset-2 md:h-10 md:w-[440px] md:text-[14px] md:leading-5"
              >
                Confirm
              </button>
            </div>
          </div>
        }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsTwoFactorModalComponent {
  readonly method = input.required<TwoFactorMethod>();
  readonly destination = input.required<string>();
  readonly qrCode = input<string | null>(null);
  readonly manualSecret = input<string | null>(null);
  readonly isSubmitting = input(false);

  readonly close = output<void>();
  readonly complete = output<string>();

  readonly appStep = signal<'qr' | 'manual' | 'verify'>('qr');
  readonly otpValue = signal('');
  readonly submitted = signal(false);

  readonly isVerificationStep = computed(
    () => this.method() === 'sms' || this.method() === 'email' || this.appStep() === 'verify',
  );

  readonly showBack = computed(() => this.method() === 'app' && this.appStep() === 'verify');

  readonly verificationTitle = computed(() =>
    this.method() === 'app' ? 'Use an authenticator app' : 'We sent you a code',
  );

  readonly verificationDescriptionPrefix = computed(() =>
    this.method() === 'app'
      ? 'Please enter your 6-digit authentication code from your authenticator app'
      : 'To set up 2FA, you are required to enter the 6 digit code we sent to ',
  );

  protected verificationDialogClass(): string {
    const base = 'relative flex w-full max-w-[390px] flex-col overflow-hidden rounded-t-[36px] bg-white shadow-[0_-24px_70px_-42px_rgba(19,27,45,0.45)] md:max-w-[600px] md:rounded-[16px] md:shadow-[0_30px_80px_-40px_rgba(19,27,45,0.45)]';

    return this.method() === 'app'
      ? `${base} h-[451px] md:h-[395px]`
      : `${base} h-[451px] md:h-[450px]`;
  }

  goBack(): void {
    this.appStep.set('qr');
    this.submitted.set(false);
    this.otpValue.set('');
  }

  verifyAndComplete(): void {
    this.submitted.set(true);

    if (this.otpValue().length !== 6) {
      return;
    }

    this.complete.emit(this.otpValue());
  }
}
