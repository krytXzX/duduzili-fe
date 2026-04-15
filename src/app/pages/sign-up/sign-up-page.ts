import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { faBrandApple, faBrandGoogle } from '@ng-icons/font-awesome/brands';

import { OtpInputComponent } from '../../components/common/otp-input/otp-input.component';

@Component({
  selector: 'app-sign-up-page',
  imports: [NgOptimizedImage, ReactiveFormsModule, NgIcon, OtpInputComponent],
  templateUrl: './sign-up-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ faBrandGoogle, faBrandApple })],
  host: {
    class: 'flex flex-col gap-5',
  },
})
export class SignUpPageComponent {
  private readonly router = inject(Router);
  
  protected readonly currentStep = signal(1);
  protected readonly submitted = signal(false);
  protected readonly isProcessing = signal(false);
  protected readonly inputEyeUrl = '/assets/icons/listing-details-eye.svg';
  protected readonly showPassword = signal(false);
  protected readonly showConfirmPassword = signal(false);

  protected readonly signupForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    fullName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    otp: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6), Validators.maxLength(6)],
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

  protected readonly emailControl = this.signupForm.controls.email;
  protected readonly fullNameControl = this.signupForm.controls.fullName;
  protected readonly otpControl = this.signupForm.controls.otp;
  protected readonly passwordControl = this.signupForm.controls.password;
  protected readonly confirmPasswordControl = this.signupForm.controls.confirmPassword;

  protected readonly isStep1Valid = computed(() => this.emailControl.valid);
  protected readonly isStep2Valid = computed(() => this.otpControl.valid);
  protected readonly isStep3Valid = computed(() =>
    this.fullNameControl.valid &&
    this.passwordControl.valid &&
    this.confirmPasswordControl.value === this.passwordControl.value
  );
  protected readonly heading = computed(() => {
    switch (this.currentStep()) {
      case 1:
        return 'Create your Duduzili account';
      case 2:
        return 'Verify your email address';
      default:
        return 'Create a secure password';
    }
  });
  protected readonly description = computed(() => {
    switch (this.currentStep()) {
      case 1:
        return 'Sign up to buy, sell, and manage your Duduzili account across desktop and mobile.';
      case 2:
        return `Enter the verification code we sent to ${this.emailControl.value || 'your email address'}.`;
      default:
        return 'Set a strong password you can use to access your Duduzili account securely.';
    }
  });
  protected readonly primaryActionLabel = computed(() => {
    switch (this.currentStep()) {
      case 1:
        return 'Continue with email';
      case 2:
        return 'Verify and continue';
      default:
        return 'Complete sign up';
    }
  });
  protected readonly isPrimaryActionDisabled = computed(() => {
    if (this.isProcessing()) {
      return true;
    }

    switch (this.currentStep()) {
      case 1:
        return !this.isStep1Valid();
      case 2:
        return !this.isStep2Valid();
      default:
        return !this.isStep3Valid();
    }
  });

  protected nextStep(): void {
    const step = this.currentStep();
    this.submitted.set(true);

    if (step === 1 && this.isStep1Valid()) {
      this.isProcessing.set(true);
      // Mock validation
      setTimeout(() => {
        this.isProcessing.set(false);
        this.currentStep.set(2);
        this.submitted.set(false);
      }, 800);
    } else if (step === 2 && this.isStep2Valid()) {
      this.isProcessing.set(true);
      // Mock OTP verify
      setTimeout(() => {
        this.isProcessing.set(false);
        this.currentStep.set(3);
        this.submitted.set(false);
      }, 800);
    } else if (step === 3 && this.isStep3Valid()) {
      this.finishSignup();
    }
  }

  protected prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update((value) => value - 1);
      this.submitted.set(false);
    }
  }

  protected togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  protected toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update((value) => !value);
  }

  private finishSignup(): void {
    this.isProcessing.set(true);
    console.log('User Registered:', this.signupForm.value);
    // Mock success
    setTimeout(() => {
      this.isProcessing.set(false);
      // Navigate to success or login
      this.router.navigate(['/listings']);
    }, 1500);
  }
}
