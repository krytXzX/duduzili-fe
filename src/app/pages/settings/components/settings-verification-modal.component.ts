import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronLeft, heroXMark } from '@ng-icons/heroicons/outline';
import { OtpInputComponent } from '../../../components/common/otp-input/otp-input.component';

@Component({
  selector: 'app-settings-verification-modal',
  imports: [CommonModule, NgIcon, OtpInputComponent],
  providers: [provideIcons({ heroChevronLeft, heroXMark })],
  template: `
    <div class="fixed inset-0 z-[220] flex items-center justify-center bg-black/20 p-4 backdrop-blur-[2px]" (click)="close.emit()">
      <div class="w-full max-w-[390px] rounded-[20px] bg-white p-4 shadow-[0_30px_80px_-40px_rgba(19,27,45,0.45)]" (click)="$event.stopPropagation()">
        <div class="flex items-start justify-between gap-4">
          <button
            type="button"
            (click)="back.emit()"
            class="inline-flex items-center gap-1 text-[11px] font-medium text-[#7C818A]"
          >
            <ng-icon name="heroChevronLeft" class="text-sm"></ng-icon>
            Back
          </button>

          <button
            type="button"
            (click)="close.emit()"
            class="flex h-8 w-8 items-center justify-center rounded-full bg-[#F7F7F8] text-[#6B7079] transition hover:bg-[#EFEFF2]"
            aria-label="Close modal"
          >
            <ng-icon name="heroXMark" class="text-sm"></ng-icon>
          </button>
        </div>

        <div class="mt-4">
          <h3 class="text-[16px] font-black tracking-tight text-[#1A1C21]">We sent you a code</h3>
          <p class="mt-2 text-[11px] font-medium leading-5 text-[#98A0AA]">
            Enter verification code we sent to {{ destination() }}
          </p>
        </div>

        <div class="mt-4">
          <app-otp-input
            [length]="6"
            [submitted]="submitted()"
            (codeChange)="otpValue.set($event)"
            (codeFilled)="otpValue.set($event)"
          ></app-otp-input>
        </div>

        <p class="mt-5 text-[10px] font-medium text-[#A3A8B1]">
          Didn’t get your code? <button type="button" class="text-[#6B5CF0]">Resend</button>
        </p>

        <div class="mt-8 grid grid-cols-2 gap-3">
          <button
            type="button"
            (click)="close.emit()"
            class="rounded-full border border-[#E7EAF0] bg-white px-4 py-2.5 text-[11px] font-semibold text-[#2F333B] transition hover:bg-[#FAFAFC]"
          >
            Cancel
          </button>
          <button
            type="button"
            (click)="confirmCode()"
            class="rounded-full bg-[#6653E4] px-4 py-2.5 text-[11px] font-semibold text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)] transition hover:bg-[#5945DB]"
          >
            Confirm and update
          </button>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsVerificationModalComponent {
  readonly destination = input.required<string>();

  readonly close = output<void>();
  readonly back = output<void>();
  readonly confirm = output<void>();

  protected readonly otpValue = signal('');
  protected readonly submitted = signal(false);

  confirmCode(): void {
    this.submitted.set(true);

    if (this.otpValue().length !== 6) {
      return;
    }

    this.confirm.emit();
  }
}
