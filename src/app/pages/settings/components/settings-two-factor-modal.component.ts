import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronLeft, heroXMark } from '@ng-icons/heroicons/outline';
import { OtpInputComponent } from '../../../components/common/otp-input/otp-input.component';

export type TwoFactorMethod = 'sms' | 'email' | 'app';

@Component({
  selector: 'app-settings-two-factor-modal',
  imports: [CommonModule, NgIcon, OtpInputComponent],
  providers: [provideIcons({ heroChevronLeft, heroXMark })],
  template: `
    <div class="fixed inset-0 z-[220] flex items-center justify-center bg-black/20 p-4 backdrop-blur-[2px]" (click)="close.emit()">
      <div class="w-full max-w-[600px] rounded-[28px] bg-white px-6 py-6 shadow-[0_30px_80px_-40px_rgba(19,27,45,0.45)] sm:px-10 sm:py-8" (click)="$event.stopPropagation()">
        <div class="flex items-start justify-between gap-4">
          @if (showBack()) {
            <button
              type="button"
              (click)="goBack()"
              class="inline-flex items-center gap-1 text-[13px] font-medium text-[#4C515A]"
            >
              <ng-icon name="heroChevronLeft" class="text-sm"></ng-icon>
              Back
            </button>
          } @else {
            <span></span>
          }

          <button
            type="button"
            (click)="close.emit()"
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F7F7F8] text-[#525762] shadow-sm transition hover:bg-[#EFEFF2]"
            aria-label="Close 2FA modal"
          >
            <ng-icon name="heroXMark" class="text-xl"></ng-icon>
          </button>
        </div>

        @if (isVerificationStep()) {
          <div class="mt-4">
            <h2 class="text-[22px] font-black tracking-tight text-[#1A1C21]">{{ verificationTitle() }}</h2>
            <p class="mt-3 max-w-[430px] text-[14px] font-medium leading-7 text-[#686D76]">
              {{ verificationDescriptionPrefix() }}
              <span class="font-semibold text-[#1A1C21]">{{ destination() }}</span>
            </p>
          </div>

          <div class="mt-6">
            <app-otp-input
              [length]="6"
              [submitted]="submitted()"
              (codeChange)="otpValue.set($event)"
              (codeFilled)="otpValue.set($event)"
            ></app-otp-input>
          </div>

          @if (method() !== 'app') {
            <p class="mt-5 text-[13px] font-medium text-[#6E737C]">
              Didn’t get a code?
              <button type="button" class="text-[#6B5CF0]">Resend</button>
            </p>
          }

          <button
            type="button"
            (click)="verifyAndComplete()"
            class="mt-10 w-full rounded-full bg-[#6653E4] px-4 py-3.5 text-[15px] font-semibold text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)] transition hover:bg-[#5945DB]"
          >
            Verify and set up
          </button>
        } @else {
          <div class="mt-4">
            <h2 class="text-[22px] font-black tracking-tight text-[#1A1C21]">Use an authenticator app</h2>
            <p class="mt-3 max-w-[470px] text-[14px] font-medium leading-7 text-[#686D76]">
              Use a free authenticator app such as Google Authenticator, Microsoft Authenticator) to set up your account
            </p>
          </div>

          @if (appStep() === 'qr') {
            <div class="mt-8 flex flex-col items-center">
              <div class="grid grid-cols-9 gap-1 rounded-[8px] bg-white p-2">
                @for (row of qrPattern; track $index; let rowIndex = $index) {
                  @for (cell of row.split(''); track $index; let colIndex = $index) {
                    <span
                      class="h-5 w-5"
                      [class.bg-black]="cell === '1'"
                      [class.bg-white]="cell !== '1'"
                    ></span>
                  }
                }
              </div>

              <button
                type="button"
                (click)="appStep.set('manual')"
                class="mt-6 text-[14px] font-medium text-[#6B5CF0]"
              >
                Can’t scan? Enter manually
              </button>
            </div>
          } @else {
            <div class="mt-8">
              <div class="rounded-[16px] border border-[#E8EAF0] bg-white px-6 py-4 text-[22px] tracking-[0.18em] text-[#2A2D34]">
                0xju-jkhy-pdor-jieu-lyrq
              </div>

              <div class="mt-6 text-center">
                <button
                  type="button"
                  (click)="appStep.set('qr')"
                  class="text-[14px] font-medium text-[#6B5CF0]"
                >
                  Scan QR code instead
                </button>
              </div>
            </div>
          }

          <button
            type="button"
            (click)="appStep.set('verify')"
            class="mt-12 w-full rounded-full bg-[#6653E4] px-4 py-3.5 text-[15px] font-semibold text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)] transition hover:bg-[#5945DB]"
          >
            Confirm
          </button>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsTwoFactorModalComponent {
  readonly method = input.required<TwoFactorMethod>();
  readonly destination = input.required<string>();

  readonly close = output<void>();
  readonly complete = output<void>();

  readonly appStep = signal<'qr' | 'manual' | 'verify'>('qr');
  readonly otpValue = signal('');
  readonly submitted = signal(false);

  readonly qrPattern = [
    '111000111',
    '101101101',
    '111010111',
    '000111000',
    '101011101',
    '110101011',
    '111010101',
    '101111001',
    '111001111',
  ];

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

    this.complete.emit();
  }
}
