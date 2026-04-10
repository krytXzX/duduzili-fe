import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
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
  
  protected readonly inputChevronUrl =
    'https://www.figma.com/api/mcp/asset/b16d236c-c311-401c-9e76-ac341eb58109';

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
}
