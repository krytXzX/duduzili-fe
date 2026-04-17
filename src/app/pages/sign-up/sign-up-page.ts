import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { inject } from '@angular/core';

import { OtpInputComponent } from '../../components/common/otp-input/otp-input.component';

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

  protected readonly currentStep = signal<SignUpStep>(1);
  protected readonly submitted = signal(false);
  protected readonly isProcessing = signal(false);
  protected readonly googleIconUrl = '/assets/icons/signin-google.svg';
  protected readonly appleIconUrl = '/assets/icons/signin-apple.svg';
  protected readonly inputEyeUrl = '/assets/icons/signup-password-eye.svg';
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

  protected readonly emailPreview = computed(
    () => this.emailValue().trim() || 'name@email.com',
  );
  protected readonly isStep1Processing = computed(
    () => this.currentStep() === 1 && this.isProcessing(),
  );
  protected readonly isConfirmPasswordMismatch = computed(
    () => this.confirmPasswordValue().length > 0 && this.confirmPasswordValue() !== this.passwordValue(),
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

  protected nextStep(): void {
    const step = this.currentStep();
    this.submitted.set(true);

    if (step === 1 && this.isStep1Valid()) {
      this.isProcessing.set(true);
      setTimeout(() => {
        this.isProcessing.set(false);
        this.currentStep.set(2);
        this.submitted.set(false);
      }, 800);
    } else if (step === 2 && this.isStep2Valid()) {
      this.isProcessing.set(true);
      setTimeout(() => {
        this.isProcessing.set(false);
        this.currentStep.set(3);
        this.submitted.set(false);
      }, 800);
    } else if (step === 3 && this.isStep3Valid()) {
      this.finishSignup();
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
    setTimeout(() => {
      this.isProcessing.set(false);
      this.router.navigate(['/listings']);
    }, 1500);
  }
}
