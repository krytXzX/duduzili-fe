import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { OtpInputComponent } from '../../components/common/otp-input/otp-input.component';

@Component({
  selector: 'app-two-factor-page',
  imports: [ReactiveFormsModule, OtpInputComponent],
  templateUrl: './two-factor-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col items-center gap-8 w-full max-w-[440px]',
  },
})
export class TwoFactorPageComponent {
  // OTP logic now handled by OtpInputComponent
  protected readonly submitted = signal(false);
  protected readonly isProcessing = signal(false);
  protected readonly fullCode = signal('');

  // Computed state for overall code validity
  protected readonly isCodeComplete = computed(() => this.fullCode().length === 6);

  protected onCodeChange(code: string): void {
    this.fullCode.set(code);
  }

  protected onSubmit(): void {
    this.submitted.set(true);
    if (this.isCodeComplete()) {
      this.isProcessing.set(true);
      console.log('Verifying code:', this.fullCode());
      // Mock success
      setTimeout(() => {
        this.isProcessing.set(false);
        // Handle post-verification
      }, 1500);
    }
  }
}
