import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { inject } from '@angular/core';

@Component({
  selector: 'app-sign-in-page',
  imports: [NgOptimizedImage, ReactiveFormsModule, RouterLink],
  templateUrl: './sign-in-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block w-full max-w-[358px] lg:max-w-[455px]',
  },
})
export class SignInPageComponent {
  private readonly router = inject(Router);

  protected readonly googleIconUrl = '/assets/icons/signin-google.svg';
  protected readonly appleIconUrl = '/assets/icons/signin-apple.svg';
  protected readonly inputChevronUrl = '/assets/icons/auth-input-chevron.svg';
  protected readonly inputEyeUrl = '/assets/icons/signin-password-eye.svg';
  protected readonly verifiedEmailIconUrl = '/assets/icons/signin-email-verified.svg';

  protected readonly loginForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
  });

  protected readonly emailControl = this.loginForm.controls.email;
  protected readonly passwordControl = this.loginForm.controls.password;
  private readonly emailValue = toSignal(this.emailControl.valueChanges, {
    initialValue: this.emailControl.getRawValue(),
  });
  private readonly passwordValue = toSignal(this.passwordControl.valueChanges, {
    initialValue: this.passwordControl.getRawValue(),
  });
  protected readonly submitted = signal(false);
  protected readonly isEmailValidated = signal(false);
  protected readonly isCheckingEmail = signal(false);
  protected readonly showPassword = signal(false);
  protected readonly showPasswordField = computed(() => this.isEmailValidated());
  protected readonly primaryActionLabel = computed(() => 'Continue with email');
  protected readonly isEmailEmpty = computed(() => this.emailValue().trim().length === 0);
  protected readonly isPasswordEmpty = computed(() => this.passwordValue().trim().length === 0);
  protected readonly isPrimaryActionDisabled = computed(
    () =>
      this.isCheckingEmail() ||
      (!this.isEmailValidated() && (this.isEmailEmpty() || this.emailControl.invalid)) ||
      (this.isEmailValidated() && this.isPasswordEmpty()),
  );

  protected continueWithEmail(): void {
    if (this.isEmailValidated()) {
      this.submitted.set(true);
      if (this.loginForm.valid) {
        this.router.navigate(['/home']);
      }
      return;
    }

    if (this.emailControl.valid) {
      this.submitted.set(false);
      this.isCheckingEmail.set(true);
      setTimeout(() => {
        this.isCheckingEmail.set(false);
        this.isEmailValidated.set(true);
      }, 1500);
    } else {
      this.submitted.set(true);
      this.emailControl.markAsTouched();
    }
  }

  protected togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }
}
