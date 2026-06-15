import { DOCUMENT, NgOptimizedImage } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { OtpInputComponent } from '../../components/common/otp-input/otp-input.component';
import { AuthService } from '../../services/auth.service';
import { AuthSessionService } from '../../services/auth-session.service';

type SignUpStep = 1 | 2 | 3;

@Component({
  selector: 'app-sign-up-page',
  imports: [NgOptimizedImage, ReactiveFormsModule, OtpInputComponent],
  templateUrl: './sign-up-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block w-full max-w-[358px] lg:max-w-[455px]',
  },
})
export class SignUpPageComponent {
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);
  private readonly authSessionService = inject(AuthSessionService);

  protected readonly currentStep = signal<SignUpStep>(1);
  protected readonly submitted = signal(false);
  protected readonly isSendingOtp = signal(false);
  protected readonly isVerifyingOtp = signal(false);
  protected readonly isRegistering = signal(false);
  protected readonly isResendingOtp = signal(false);
  protected readonly resendCountdown = signal(60);
  protected readonly googleIconUrl = '/assets/icons/signin-google.svg';
  protected readonly appleIconUrl = '/assets/icons/signin-apple.svg';
  protected readonly inputEyeUrl = '/assets/icons/signup-password-eye.svg';
  protected readonly showPassword = signal(false);
  protected readonly showConfirmPassword = signal(false);
  protected readonly emailErrorMessage = signal<string | null>(null);
  protected readonly otpErrorMessage = signal<string | null>(null);
  protected readonly passwordErrorMessage = signal<string | null>(null);

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
  private readonly emailValue = toSignal(this.emailControl.valueChanges, {
    initialValue: this.emailControl.getRawValue(),
  });
  private readonly fullNameValue = toSignal(this.fullNameControl.valueChanges, {
    initialValue: this.fullNameControl.getRawValue(),
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

  protected readonly emailPreview = computed(() => this.emailValue().trim() || 'name@email.com');
  protected readonly isProcessing = computed(
    () =>
      this.isSendingOtp() ||
      this.isVerifyingOtp() ||
      this.isRegistering() ||
      this.isResendingOtp(),
  );
  protected readonly isStep1Processing = computed(
    () => this.currentStep() === 1 && this.isSendingOtp(),
  );
  protected readonly isConfirmPasswordMismatch = computed(
    () =>
      this.confirmPasswordValue().length > 0 &&
      this.confirmPasswordValue() !== this.passwordValue(),
  );
  protected readonly isEmailEmpty = computed(() => this.emailValue().trim().length === 0);
  protected readonly isStep1Valid = computed(() => {
    this.emailValue();
    return this.emailControl.valid;
  });
  protected readonly isStep2Valid = computed(() => {
    this.otpValue();
    return this.otpControl.valid;
  });
  protected readonly isStep3Valid = computed(() => {
    this.fullNameValue();
    this.passwordValue();
    this.confirmPasswordValue();

    return (
      this.fullNameControl.valid &&
      this.passwordControl.valid &&
      this.confirmPasswordValue() === this.passwordValue()
    );
  });
  protected readonly heading = computed(() => {
    switch (this.currentStep()) {
      case 1:
        return 'Sign up to join Duduzili';
      case 2:
        return 'We emailed you a code';
      default:
        return 'You’re almost done';
    }
  });
  protected readonly description = computed(() => {
    switch (this.currentStep()) {
      case 1:
        return null;
      case 2:
        return 'Enter the verification code we sent to';
      default:
        return 'Add your name and set a password to complete your sign up';
    }
  });
  protected readonly primaryActionLabel = computed(() => {
    switch (this.currentStep()) {
      case 1:
        return 'Send code';
      case 2:
        return 'Confirm and continue';
      default:
        return 'Create account';
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

  private resendTimerId: number | null = null;

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
      this.fullNameValue();
      this.passwordValue();
      this.confirmPasswordValue();
      this.passwordErrorMessage.set(null);
    });

    effect(() => {
      this.currentStep();
      this.emailErrorMessage();
      this.otpErrorMessage();
      this.passwordErrorMessage();
      this.resendCountdown();
      this.isResendingOtp();

      queueMicrotask(() => {
        this.syncEmailErrorMessage();
        this.syncOtpErrorMessage();
        this.syncPasswordErrorMessage();
        this.syncResendButton();
      });
    });

    this.destroyRef.onDestroy(() => {
      this.clearResendCountdown();
    });
  }

  protected async nextStep(): Promise<void> {
    this.submitted.set(true);
    this.clearStepErrors();

    const step = this.currentStep();

    if (step === 1) {
      if (!this.isStep1Valid()) {
        return;
      }

      this.isSendingOtp.set(true);

      try {
        await firstValueFrom(
          this.authService.sendOtp({
            email: this.emailControl.getRawValue().trim(),
          }),
        );
        this.otpControl.reset('');
        this.currentStep.set(2);
        this.submitted.set(false);
        this.startResendCountdown();
      } catch (error: unknown) {
        const message = this.resolveBackendMessage(error) ?? 'Email already registered';
        this.emailErrorMessage.set(message);
      } finally {
        this.isSendingOtp.set(false);
      }

      return;
    }

    if (step === 2) {
      if (!this.isStep2Valid()) {
        return;
      }

      this.isVerifyingOtp.set(true);

      try {
        await firstValueFrom(
          this.authService.verifyOtp({
            email: this.emailControl.getRawValue().trim(),
            code: this.otpControl.getRawValue(),
          }),
        );
        this.currentStep.set(3);
        this.submitted.set(false);
      } catch (error: unknown) {
        this.otpErrorMessage.set(this.resolveBackendMessage(error) ?? 'We couldn’t verify that code right now. Please try again.');
      } finally {
        this.isVerifyingOtp.set(false);
      }

      return;
    }

    if (!this.isStep3Valid()) {
      return;
    }

    this.isRegistering.set(true);

    try {
      const response = await firstValueFrom(
        this.authService.register({
          email: this.emailControl.getRawValue().trim(),
          full_name: this.fullNameControl.getRawValue().trim(),
          password: this.passwordControl.getRawValue(),
          confirm_password: this.confirmPasswordControl.getRawValue(),
        }),
      );
      this.authSessionService.saveLoginSession(response, null);
      await this.router.navigate(['/en']);
    } catch (error: unknown) {
      this.passwordErrorMessage.set(this.resolveBackendMessage(error) ?? 'We couldn’t create your account right now. Please try again.');
    } finally {
      this.isRegistering.set(false);
    }
  }

  protected togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  protected toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update((value) => !value);
  }

  private clearStepErrors(): void {
    this.emailErrorMessage.set(null);
    this.otpErrorMessage.set(null);
    this.passwordErrorMessage.set(null);
  }

  private startResendCountdown(): void {
    this.clearResendCountdown();
    this.resendCountdown.set(60);

    this.resendTimerId = window.setInterval(() => {
      const nextValue = this.resendCountdown() - 1;
      if (nextValue <= 0) {
        this.resendCountdown.set(0);
        this.clearResendCountdown();
        return;
      }

      this.resendCountdown.set(nextValue);
    }, 1000);
  }

  private clearResendCountdown(): void {
    if (this.resendTimerId !== null) {
      window.clearInterval(this.resendTimerId);
      this.resendTimerId = null;
    }
  }

  private syncResendButton(): void {
    if (this.currentStep() !== 2) {
      return;
    }

    const button = this.document.querySelector<HTMLButtonElement>(
      'form p button[type="button"]',
    );

    if (!button) {
      return;
    }

    if (this.isResendingOtp()) {
      button.textContent = 'Resending...';
    } else if (this.resendCountdown() > 0) {
      button.textContent = `Resend in ${this.resendCountdown()}s`;
    } else {
      button.textContent = 'Resend';
    }

    const disabled = this.resendCountdown() > 0 || this.isResendingOtp();
    button.disabled = disabled;
    button.classList.toggle('opacity-50', disabled);
    button.classList.toggle('cursor-not-allowed', disabled);
    button.onclick = (event) => {
      event.preventDefault();
      void this.handleResendClick();
    };
  }

  private async handleResendClick(): Promise<void> {
    if (this.resendCountdown() > 0 || this.isResendingOtp()) {
      return;
    }

    this.otpErrorMessage.set(null);
    this.isResendingOtp.set(true);

    try {
      await firstValueFrom(
        this.authService.resendOtp({
          email: this.emailControl.getRawValue().trim(),
        }),
      );
      this.startResendCountdown();
    } catch (error: unknown) {
      this.otpErrorMessage.set(this.resolveBackendMessage(error) ?? 'We couldn’t resend the code right now. Please try again.');
    } finally {
      this.isResendingOtp.set(false);
    }
  }

  private syncEmailErrorMessage(): void {
    this.syncFieldMessage({
      inputId: 'email-address',
      message: this.currentStep() === 1 ? this.emailErrorMessage() : null,
      key: 'signup-email',
    });
  }

  private syncOtpErrorMessage(): void {
    const otpHost = this.document.querySelector('app-otp-input');
    if (!otpHost) {
      this.removeInjectedMessage('signup-otp');
      return;
    }

    this.syncContainerMessage({
      container: otpHost.parentElement,
      message: this.currentStep() === 2 ? this.otpErrorMessage() : null,
      key: 'signup-otp',
      insertAfterSelector: 'app-otp-input',
    });
  }

  private syncPasswordErrorMessage(): void {
    this.syncFieldMessage({
      inputId: 'confirm-password',
      message: this.currentStep() === 3 ? this.passwordErrorMessage() : null,
      key: 'signup-password',
    });
  }

  private syncFieldMessage(options: {
    inputId: string;
    message: string | null;
    key: string;
  }): void {
    const input = this.document.getElementById(options.inputId) as HTMLInputElement | null;
    if (!input) {
      this.removeInjectedMessage(options.key);
      return;
    }

    if (options.message) {
      input.style.borderColor = '#d24b4b';
    } else if (!input.matches(':focus')) {
      input.style.removeProperty('border-color');
    }

    this.syncContainerMessage({
      container: input.parentElement,
      message: options.message,
      key: options.key,
    });
  }

  private syncContainerMessage(options: {
    container: Element | null;
    message: string | null;
    key: string;
    insertAfterSelector?: string;
  }): void {
    if (!options.container) {
      this.removeInjectedMessage(options.key);
      return;
    }

    const existing = this.document.querySelector<HTMLElement>(
      `[data-signup-message="${options.key}"]`,
    );

    if (!options.message) {
      existing?.remove();
      return;
    }

    const messageElement =
      existing ?? this.document.createElement('p');
    messageElement.dataset['signupMessage'] = options.key;
    messageElement.className = 'mt-2 text-[12px] leading-4 font-medium text-[#d24b4b]';
    messageElement.textContent = options.message;

    if (existing) {
      return;
    }

    if (options.insertAfterSelector) {
      const anchor = options.container.querySelector(options.insertAfterSelector);
      anchor?.insertAdjacentElement('afterend', messageElement);
      return;
    }

    options.container.appendChild(messageElement);
  }

  private removeInjectedMessage(key: string): void {
    this.document.querySelector(`[data-signup-message="${key}"]`)?.remove();
  }

  private resolveBackendMessage(error: unknown): string | null {
    if (error instanceof HttpErrorResponse) {
      return this.readBackendMessage(error.error);
    }

    if (error instanceof Error && error.message.trim().length > 0) {
      return error.message;
    }

    return null;
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
      record['code'],
      record['password'],
      record['confirm_password'],
      record['username'],
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
