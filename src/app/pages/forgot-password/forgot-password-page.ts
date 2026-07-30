import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal, inject, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';

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
  private readonly authService = inject(AuthService);

  protected readonly currentStep = signal<ForgotPasswordStep>('email');
  protected readonly submitted = signal(false);
  protected readonly isProcessing = signal(false);
  protected readonly showPassword = signal(false);
  protected readonly showConfirmPassword = signal(false);
  protected readonly emailErrorMessage = signal<string | null>(null);
  protected readonly otpErrorMessage = signal<string | null>(null);
  protected readonly passwordErrorMessage = signal<string | null>(null);

  constructor() {
    effect(() => {
      this.emailValue();
      this.emailErrorMessage.set(null);
    });
    effect(() => {
      this.otpValue();
      this.otpErrorMessage.set(null);
    });
    effect(() => {
      this.passwordValue();
      this.passwordErrorMessage.set(null);
    });
  }

  protected readonly inputEyeUrl = '/assets/icons/forgot-password-password-eye.svg';
  protected readonly successIllustrationUrl =
    '/assets/images/forgot-password-success-illustration.webp';

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
        return environment.disableOtp ? 'Continue' : 'Send code';
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

  protected async submitCurrentStep(): Promise<void> {
    this.submitted.set(true);

    switch (this.currentStep()) {
      case 'email':
        if (!this.isEmailValid()) {
          this.emailControl.markAsTouched();
          return;
        }

        this.isProcessing.set(true);
        this.emailErrorMessage.set(null);
        try {
          await firstValueFrom(this.authService.forgotPassword(this.emailValue().trim()));
          if (environment.disableOtp) {
            this.currentStep.set('password');
          } else {
            this.currentStep.set('code');
          }
          this.submitted.set(false);
        } catch (error: unknown) {
          this.emailErrorMessage.set(this.resolveErrorMessage(error));
        } finally {
          this.isProcessing.set(false);
        }
        return;

      case 'code':
        if (!this.isOtpValid()) {
          this.otpControl.markAsTouched();
          return;
        }

        this.isProcessing.set(true);
        this.otpErrorMessage.set(null);
        try {
          await firstValueFrom(this.authService.verifyResetCode(this.emailValue().trim(), this.otpValue()));
          this.currentStep.set('password');
          this.submitted.set(false);
        } catch (error: unknown) {
          this.otpErrorMessage.set(this.resolveErrorMessage(error));
        } finally {
          this.isProcessing.set(false);
        }
        return;

      case 'password':
        if (!this.isPasswordStepValid()) {
          this.passwordControl.markAsTouched();
          this.confirmPasswordControl.markAsTouched();
          return;
        }

        this.isProcessing.set(true);
        this.passwordErrorMessage.set(null);
        try {
          await firstValueFrom(
            this.authService.resetPassword({
              email: this.emailValue().trim(),
              code: environment.disableOtp ? '000000' : this.otpValue(),
              password: this.passwordValue(),
              confirm_password: this.confirmPasswordValue(),
            })
          );
          this.currentStep.set('success');
          this.submitted.set(false);
        } catch (error: unknown) {
          this.passwordErrorMessage.set(this.resolveErrorMessage(error));
        } finally {
          this.isProcessing.set(false);
        }
        return;

      default:
        return;
    }
  }

  protected async resendCode(): Promise<void> {
    if (this.isProcessing()) {
      return;
    }

    this.submitted.set(false);
    this.isProcessing.set(true);
    this.otpErrorMessage.set(null);
    try {
      await firstValueFrom(this.authService.forgotPassword(this.emailValue().trim()));
    } catch (error: unknown) {
      this.otpErrorMessage.set(this.resolveErrorMessage(error));
    } finally {
      this.isProcessing.set(false);
    }
  }

  protected togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  protected toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update((value) => !value);
  }

  private resolveErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return "Something went wrong, please try again later.";
      }
      return this.readBackendMessage(error.error) ?? 'Something went wrong. Please try again.';
    }
    return 'Something went wrong. Please try again.';
  }

  private readBackendMessage(payload: unknown): string | null {
    if (typeof payload === 'string' && payload.trim().length > 0) {
      return payload;
    }
    if (!payload || typeof payload !== 'object') {
      return null;
    }
    const record = payload as Record<string, unknown>;
    const candidates = [
      record['detail'],
      record['message'],
      record['error'],
      record['non_field_errors'],
      record['email'],
      record['password'],
      record['code'],
      record['otp'],
    ];
    for (const candidate of candidates) {
      if (typeof candidate === 'string' && candidate.trim().length > 0) {
        return candidate;
      }
      if (Array.isArray(candidate) && candidate.length > 0 && typeof candidate[0] === 'string') {
        return candidate[0];
      }
    }
    for (const value of Object.values(record)) {
      if (typeof value === 'string' && value.trim().length > 0) {
        return value;
      }
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
        return value[0];
      }
    }
    return null;
  }
}
