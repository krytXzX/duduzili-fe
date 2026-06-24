import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  AuthService,
  CheckEmailResponse,
  LoginTwoFactorChallengeResponse,
} from '../../services/auth.service';
import { AuthSessionService } from '../../services/auth-session.service';
import { environment } from '../../../environments/environment';

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
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly authSessionService = inject(AuthSessionService);

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
      validators: [Validators.required],
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
  protected readonly isSigningIn = signal(false);
  protected readonly showPassword = signal(false);
  protected readonly checkedEmailProfile = signal<CheckEmailResponse | null>(null);
  protected readonly emailErrorMessage = signal<string | null>(null);
  protected readonly passwordErrorMessage = signal<string | null>(null);
  protected readonly showPasswordField = computed(() => this.isEmailValidated());
  protected readonly primaryActionLabel = computed(() =>
    this.isEmailValidated() ? 'Sign in' : 'Continue with email',
  );
  protected readonly isEmailEmpty = computed(() => this.emailValue().trim().length === 0);
  protected readonly isPasswordEmpty = computed(() => this.passwordValue().trim().length === 0);
  protected readonly isPrimaryActionDisabled = computed(
    () => this.isCheckingEmail() || this.isSigningIn(),
  );

  constructor() {
    effect(() => {
      this.emailValue();
      this.emailErrorMessage.set(null);
    });

    effect(() => {
      this.passwordValue();
      this.passwordErrorMessage.set(null);
    });

    const code = this.route.snapshot.queryParams['code'];
    if (code) {
      void this.handleGoogleCallback(code);
    }
  }

  protected async continueWithEmail(): Promise<void> {
    if (this.isEmailValidated()) {
      this.submitted.set(true);
      this.passwordErrorMessage.set(null);
      this.emailErrorMessage.set(null);

      if (this.passwordControl.invalid) {
        this.passwordControl.markAsTouched();
        return;
      }

      this.isSigningIn.set(true);

      try {
        const loginResponse = await firstValueFrom(
          this.authService.login({
            email: this.emailControl.getRawValue().trim(),
            password: this.passwordControl.getRawValue(),
          }),
        );

        if (this.isTwoFactorChallenge(loginResponse)) {
          await this.router.navigate(['/two-factor'], {
            queryParams: {
              user_id: loginResponse.user_id,
              method: loginResponse.method,
              masked_phone: loginResponse.masked_phone ?? undefined,
              email: this.emailControl.getRawValue().trim(),
            },
          });
          return;
        }

        this.authSessionService.saveLoginSession(loginResponse, this.checkedEmailProfile());
        this.passwordErrorMessage.set(null);
        await this.router.navigate(this.resolvePostLoginRoute(loginResponse));
      } catch (error: unknown) {
        this.passwordErrorMessage.set(this.resolveLoginErrorMessage(error));
      } finally {
        this.isSigningIn.set(false);
      }
      return;
    }

    if (this.emailControl.invalid) {
      this.submitted.set(true);
      this.emailControl.markAsTouched();
      return;
    }

    this.submitted.set(false);
    this.emailErrorMessage.set(null);
    this.passwordErrorMessage.set(null);

    this.isCheckingEmail.set(true);

    try {
      const profile = await firstValueFrom(
        this.authService.checkEmail({
          email: this.emailControl.getRawValue().trim(),
        }),
      );
      this.checkedEmailProfile.set(profile);
      this.passwordControl.reset('');
      this.showPassword.set(false);
      this.isEmailValidated.set(true);
    } catch (error: unknown) {
      this.checkedEmailProfile.set(null);
      this.isEmailValidated.set(false);
      this.emailErrorMessage.set(this.resolveCheckEmailErrorMessage(error));
    } finally {
      this.isCheckingEmail.set(false);
    }
  }

  private getGoogleRedirectUri(): string {
    return environment.googleOAuthRedirectUri;
  }

  protected loginWithGoogle(): void {
    const clientId = environment.googleOAuthClientId;
    const redirectUri = encodeURIComponent(this.getGoogleRedirectUri());
    const scope = encodeURIComponent('profile email');
    const responseType = 'code';
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}`;
    window.location.href = authUrl;
  }

  private async handleGoogleCallback(code: string): Promise<void> {
    this.isSigningIn.set(true);
    this.emailErrorMessage.set(null);
    this.passwordErrorMessage.set(null);

    try {
      const loginResponse = await firstValueFrom(
        this.authService.loginWithGoogle(code, this.getGoogleRedirectUri())
      );

      this.authSessionService.saveLoginSession(loginResponse, null);
      
      await this.router.navigate([], {
        queryParams: { code: null, state: null, scope: null, authuser: null, prompt: null },
        queryParamsHandling: 'merge',
        replaceUrl: true
      });

      await this.router.navigate(this.resolvePostLoginRoute(loginResponse));
    } catch (error: unknown) {
      console.error('Google login error:', error);
      this.emailErrorMessage.set(
        this.resolveLoginErrorMessage(error) ?? 'Google authentication failed. Please try again.'
      );
    } finally {
      this.isSigningIn.set(false);
    }
  }

  protected resetEmailStep(): void {
    this.isEmailValidated.set(false);
    this.checkedEmailProfile.set(null);
    this.passwordControl.reset('');
    this.showPassword.set(false);
    this.passwordErrorMessage.set(null);
    this.emailErrorMessage.set(null);
  }

  protected togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  private resolveCheckEmailErrorMessage(error: unknown): string {
    // console.log(error)
    // console.log(this.readBackendMessage((error as any).error));
    if (error instanceof HttpErrorResponse) {
      if(error.status === 0) {
        return "Something went wrong, please try again later.";
      }
      return this.readBackendMessage(error.error) ?? 'We couldn’t check that email right now. Please try again.';
    }
    return 'We couldn’t check that email right now. Please try again.';
  }

  private resolveLoginErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      return this.readBackendMessage(error.error) ?? 'We couldn’t sign you in right now. Please try again.';
    }
    return 'We couldn’t sign you in right now. Please try again.';
  }

  private resolvePostLoginRoute(loginResponse: { user?: { role?: string } }): string[] {
    return loginResponse.user?.role === 'admin' ? ['/admin'] : ['/en'];
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

  private isTwoFactorChallenge(value: unknown): value is LoginTwoFactorChallengeResponse {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const candidate = value as Partial<LoginTwoFactorChallengeResponse>;
    return (
      candidate.requires_2fa === true &&
      typeof candidate.user_id === 'string' &&
      (candidate.method === 'sms' || candidate.method === 'email' || candidate.method === 'authenticator')
    );
  }
}
