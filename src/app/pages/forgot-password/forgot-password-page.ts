import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { OtpInputComponent } from '../../components/common/otp-input/otp-input.component';

type ForgotPasswordStep = 'email' | 'code' | 'password' | 'success';

@Component({
  selector: 'app-forgot-password-page',
  imports: [NgOptimizedImage, ReactiveFormsModule, RouterLink, OtpInputComponent],
  templateUrl: './forgot-password-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block w-full',
  },
})
export class ForgotPasswordPageComponent {
  protected readonly currentStep = signal<ForgotPasswordStep>('email');
  protected readonly submitted = signal(false);
  protected readonly isProcessing = signal(false);
  protected readonly showPassword = signal(false);
  protected readonly showConfirmPassword = signal(false);

  protected readonly inputEyeUrl = '/assets/icons/forgot-password-password-eye.svg';
  protected readonly successIllustrationUrl =
    '/assets/images/forgot-password-success-illustration.png';

  protected readonly forgotPasswordForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
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

  protected readonly emailControl = this.forgotPasswordForm.controls.email;
  protected readonly otpControl = this.forgotPasswordForm.controls.otp;
  protected readonly passwordControl = this.forgotPasswordForm.controls.password;
  protected readonly confirmPasswordControl = this.forgotPasswordForm.controls.confirmPassword;

  private readonly emailValue = toSignal(this.emailControl.valueChanges, {
    initialValue: this.emailControl.getRawValue(),
  });
  private readonly otpValue = toSignal(this.otpControl.valueChanges, {
    initialValue: this.otpControl.getRawValue(),
  });
  private readonly passwordValue = toSignal(this.passwordControl.valueChanges, {
    initialValue: this.passwordControl.getRawValue(),
  });
  private readonly confirmPasswordValue = toSignal(this.confirmPasswordControl.valueChanges, {
    initialValue: this.confirmPasswordControl.getRawValue(),
  });

  protected readonly emailPreview = computed(
    () => this.emailValue().trim() || 'name@email.com',
  );
  protected readonly isEmailStep = computed(() => this.currentStep() === 'email');
  protected readonly isCodeStep = computed(() => this.currentStep() === 'code');
  protected readonly isPasswordStep = computed(() => this.currentStep() === 'password');
  protected readonly isSuccessStep = computed(() => this.currentStep() === 'success');
  protected readonly isEmailEmpty = computed(() => this.emailValue().trim().length === 0);
  protected readonly isPasswordEmpty = computed(() => this.passwordValue().trim().length === 0);
  protected readonly isConfirmPasswordEmpty = computed(
    () => this.confirmPasswordValue().trim().length === 0,
  );
  protected readonly isConfirmPasswordMismatch = computed(
    () =>
      this.confirmPasswordValue().length > 0 &&
      this.confirmPasswordValue() !== this.passwordValue(),
  );
  protected readonly isEmailValid = computed(() => {
    this.emailValue();
    return this.emailControl.valid;
  });
  protected readonly isOtpValid = computed(() => {
    this.otpValue();
    return this.otpControl.valid;
  });
  protected readonly isPasswordStepValid = computed(() => {
    this.passwordValue();
    this.confirmPasswordValue();

    return (
      this.passwordControl.valid &&
      this.confirmPasswordControl.valid &&
      !this.isConfirmPasswordMismatch()
    );
  });
  protected readonly heading = computed(() => {
    switch (this.currentStep()) {
      case 'code':
        return 'We emailed you a code';
      case 'password':
        return 'Reset your password';
      default:
        return 'Reset your password';
    }
  });
  protected readonly description = computed(() => {
    switch (this.currentStep()) {
      case 'email':
        return "Enter the email address associated with your account and we'll send you a code to reset your password.";
      case 'code':
        return 'Enter the verification code we sent to';
      case 'password':
        return 'You are almost done. Enter your new password and you are good to go';
      default:
        return null;
    }
  });
  protected readonly primaryActionLabel = computed(() => {
    switch (this.currentStep()) {
      case 'code':
        return 'Confirm and continue';
      case 'password':
        return 'Reset password';
      default:
        return 'Send code';
    }
  });
  protected readonly isPrimaryActionDisabled = computed(() => {
    if (this.isProcessing()) {
      return true;
    }

    switch (this.currentStep()) {
      case 'email':
        return this.isEmailEmpty() || !this.isEmailValid();
      case 'code':
        return !this.isOtpValid();
      case 'password':
        return !this.isPasswordStepValid();
      default:
        return false;
    }
  });

  protected submitCurrentStep(): void {
    this.submitted.set(true);

    switch (this.currentStep()) {
      case 'email':
        if (!this.isEmailValid()) {
          this.emailControl.markAsTouched();
          return;
        }

        this.isProcessing.set(true);
        setTimeout(() => {
          this.isProcessing.set(false);
          this.currentStep.set('code');
          this.submitted.set(false);
        }, 1000);
        return;

      case 'code':
        if (!this.isOtpValid()) {
          this.otpControl.markAsTouched();
          return;
        }

        this.isProcessing.set(true);
        setTimeout(() => {
          this.isProcessing.set(false);
          this.currentStep.set('password');
          this.submitted.set(false);
        }, 700);
        return;

      case 'password':
        if (!this.isPasswordStepValid()) {
          this.passwordControl.markAsTouched();
          this.confirmPasswordControl.markAsTouched();
          return;
        }

        this.isProcessing.set(true);
        setTimeout(() => {
          this.isProcessing.set(false);
          this.currentStep.set('success');
          this.submitted.set(false);
        }, 900);
        return;

      default:
        return;
    }
  }

  protected resendCode(): void {
    if (this.isProcessing()) {
      return;
    }

    this.submitted.set(false);
    this.isProcessing.set(true);
    setTimeout(() => {
      this.isProcessing.set(false);
    }, 900);
  }

  protected togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  protected toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update((value) => !value);
  }
}
