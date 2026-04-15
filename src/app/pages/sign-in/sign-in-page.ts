import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { Router, RouterLink } from '@angular/router';
import { inject } from '@angular/core';
import { faBrandApple, faBrandGoogle } from '@ng-icons/font-awesome/brands';

@Component({
  selector: 'app-sign-in-page',
  imports: [NgOptimizedImage, ReactiveFormsModule, NgIcon, RouterLink],
  templateUrl: './sign-in-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ faBrandGoogle, faBrandApple })],
  host: {
    class: 'flex flex-col gap-5',
  },
})
export class SignInPageComponent {
  private readonly router = inject(Router);
  
  protected readonly inputChevronUrl = '/assets/icons/auth-input-chevron.svg';
  protected readonly inputEyeUrl = '/assets/icons/listing-details-eye.svg';

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
  protected readonly submitted = signal(false);
  protected readonly isEmailValidated = signal(false);
  protected readonly isCheckingEmail = signal(false);
  protected readonly showPassword = signal(false);
  protected readonly showPasswordField = computed(() => this.isEmailValidated());
  protected readonly primaryActionLabel = computed(() =>
    this.isEmailValidated() ? 'Sign in' : 'Continue with email',
  );
  protected readonly isPrimaryActionDisabled = computed(() =>
    this.isCheckingEmail() ||
    (!this.isEmailValidated() && this.emailControl.invalid) ||
    (this.isEmailValidated() && this.loginForm.invalid),
  );

  protected continueWithEmail(): void {
    if (this.isEmailValidated()) {
      // Final Sign In
      this.submitted.set(true);
      if (this.loginForm.valid) {
        console.log('Signing in...', this.loginForm.value);
        // Navigate or handle success
        this.router.navigate(['/listings']);
      }
      return;
    }

    // Step 1: Validate Email
    if (this.emailControl.valid) {
      this.isCheckingEmail.set(true);
      // Mock backend call
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
