import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroEye } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-admin-home-page',
  imports: [ReactiveFormsModule, NgIcon],
  providers: [provideIcons({ heroEye })],
  template: `
    <h1
      id="admin-invite-title"
      class="m-0 w-full max-w-[520px] text-center text-[24px] font-medium leading-tight text-[#15162B]"
    >
      Welcome Joseph, create your password to continue
    </h1>

    <form
      class="flex w-full max-w-[456px] flex-col gap-5"
      [formGroup]="inviteForm"
      (ngSubmit)="createAccount()"
      novalidate
    >
      <div>
        <label class="mb-1 block text-[14px] font-medium tracking-[-0.5px] text-[#777777]" for="admin-email">
          Email
        </label>
        <input
          id="admin-email"
          type="email"
          formControlName="email"
          readonly
          class="h-11 w-full rounded-[16px] border border-[#EFEFEF] bg-white px-4 text-[14px] text-[#36394A] outline-none lg:h-10"
        >
      </div>

      <div class="relative">
        <label class="mb-1 block text-[14px] font-medium tracking-[-0.5px] text-[#777777]" for="admin-password">
          New password
        </label>
        <input
          id="admin-password"
          [type]="showPassword() ? 'text' : 'password'"
          formControlName="password"
          class="h-11 w-full rounded-[16px] border border-[#EFEFEF] bg-white px-4 pr-12 text-[14px] text-[#36394A] outline-none transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6453D9] lg:h-10"
        >
        <button
          type="button"
          (click)="showPassword.update((value) => !value)"
          class="absolute right-4 top-[35px] text-[#8F96A3] transition hover:text-[#6453D9]"
          aria-label="Toggle password visibility"
        >
          <ng-icon name="heroEye" class="text-[18px]"></ng-icon>
        </button>
      </div>

      <div class="relative">
        <label class="mb-1 block text-[14px] font-medium tracking-[-0.5px] text-[#777777]" for="admin-confirm-password">
          Confirm new password
        </label>
        <input
          id="admin-confirm-password"
          [type]="showConfirmPassword() ? 'text' : 'password'"
          formControlName="confirmPassword"
          class="h-11 w-full rounded-[16px] border border-[#EFEFEF] bg-white px-4 pr-12 text-[14px] text-[#36394A] outline-none transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6453D9] lg:h-10"
        >
        <button
          type="button"
          (click)="showConfirmPassword.update((value) => !value)"
          class="absolute right-4 top-[35px] text-[#8F96A3] transition hover:text-[#6453D9]"
          aria-label="Toggle confirm password visibility"
        >
          <ng-icon name="heroEye" class="text-[18px]"></ng-icon>
        </button>
      </div>

      <button
        type="submit"
        class="mt-5 min-h-11 w-full rounded-[100px] border-0 bg-[#6453D9] px-4 text-[14px] font-medium text-white shadow-[0_4px_12px_rgba(81,35,173,0.33)] transition-all duration-180 hover:-translate-y-px hover:brightness-[1.04] disabled:pointer-events-none disabled:opacity-70 lg:h-10 lg:min-h-0"
        [disabled]="!canSubmit()"
      >
        Create account
      </button>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col gap-5',
  },
})
export class AdminHomePageComponent {
  private readonly router = inject(Router);

  protected readonly inviteForm = new FormGroup({
    email: new FormControl('Joseph@email.com', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
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

  protected readonly showPassword = signal(false);
  protected readonly showConfirmPassword = signal(false);

  protected readonly canSubmit = computed(() => {
    const { password, confirmPassword } = this.inviteForm.getRawValue();
    return this.inviteForm.valid && password === confirmPassword;
  });

  protected createAccount(): void {
    if (!this.canSubmit()) {
      this.inviteForm.markAllAsTouched();
      return;
    }

    void this.router.navigate(['/sign-in']);
  }
}
