import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faEnvelopeOpen, faCircleCheck } from '@ng-icons/font-awesome/regular';

import { OtpInputComponent } from '../../components/common/otp-input/otp-input.component';

@Component({
  selector: 'app-forgot-password-page',
  imports: [ReactiveFormsModule, NgIcon, RouterLink, OtpInputComponent],
  templateUrl: './forgot-password-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ faEnvelopeOpen, faCircleCheck })],
  host: {
    class: 'flex flex-col gap-6',
  },
})
export class ForgotPasswordPageComponent {
  // Multi-step management: 1=Email, 2=Check Email, 3=Verify OTP, 4=New Password, 5=Success
  protected readonly currentStep = signal(1);
  protected readonly totalSteps = 5;
  protected readonly isProcessing = signal(false);
  protected readonly submitted = signal(false);

  // Forms
  protected readonly forgotPasswordForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    otp: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(4), Validators.maxLength(4)],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
    confirmPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  // Easy access to controls
  protected readonly emailControl = this.forgotPasswordForm.controls.email;
  protected readonly otpControl = this.forgotPasswordForm.controls.otp;
  protected readonly passwordControl = this.forgotPasswordForm.controls.password;
  protected readonly confirmPasswordControl = this.forgotPasswordForm.controls.confirmPassword;

  // Validation state
  protected readonly isStep1Valid = computed(() => this.emailControl.valid);
  protected readonly isStep3Valid = computed(() => this.otpControl.valid);
  protected readonly isStep4Valid = computed(() => 
    this.passwordControl.valid && 
    this.confirmPasswordControl.value === this.passwordControl.value
  );

  protected sendOtp(): void {
    this.submitted.set(true);
    if (!this.isStep1Valid()) return;

    this.isProcessing.set(true);
    // Mock API call to send OTP
    setTimeout(() => {
      this.isProcessing.set(false);
      this.currentStep.set(2);
      this.submitted.set(false);
    }, 1200);
  }

  protected verifyOtp(): void {
    this.submitted.set(true);
    if (!this.isStep3Valid()) return;

    this.isProcessing.set(true);
    // Mock API call to verify OTP
    setTimeout(() => {
      this.isProcessing.set(false);
      this.currentStep.set(4);
      this.submitted.set(false);
    }, 1000);
  }

  protected resetPassword(): void {
    this.submitted.set(true);
    if (!this.isStep4Valid()) return;

    this.isProcessing.set(true);
    // Mock API call to reset password
    setTimeout(() => {
      this.isProcessing.set(false);
      this.currentStep.set(5);
      this.submitted.set(false);
    }, 1500);
  }

  protected goToVerifyStep(): void {
    this.currentStep.set(3);
  }

  protected prevStep(): void {
    const prevMap: Record<number, number> = {
      2: 1,
      3: 1, // Step 3 back goes to Step 1 (or 2)
      4: 3,
    };
    const prev = prevMap[this.currentStep()];
    if (prev) {
      this.currentStep.set(prev);
    }
  }
}
