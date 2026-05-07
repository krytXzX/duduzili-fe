import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroChevronDown,
  heroPhoto,
  heroPlus,
  heroXMark,
} from '@ng-icons/heroicons/outline';

export interface NewTeamUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
}

export interface TeamRoleOption {
  id: string;
  label: string;
  description: string;
}

@Component({
  selector: 'app-admin-add-team-user-modal',
  imports: [ReactiveFormsModule, NgIcon],
  providers: [provideIcons({ heroChevronDown, heroPhoto, heroPlus, heroXMark })],
  template: `
    <div
      class="fixed inset-0 z-[220] flex items-center justify-center bg-black/20 p-4 backdrop-blur-[2px]"
      (click)="closeRoleDropdown(); close.emit()"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-team-user-modal-title"
        class="max-h-[calc(100vh-2rem)] w-full max-w-[760px] overflow-y-auto rounded-[26px] bg-white p-6 shadow-[0_30px_80px_-40px_rgba(19,27,45,0.45)] sm:p-8"
        (click)="$event.stopPropagation()"
      >
        <div class="flex items-start justify-between gap-4">
          <h2 id="new-team-user-modal-title" class="text-[28px] font-semibold tracking-[-0.04em] text-[#202020]">
            New user
          </h2>

          <button
            type="button"
            (click)="close.emit()"
            class="flex h-11 w-11 items-center justify-center rounded-full border border-[#e8e8e8] bg-white text-[#626262] shadow-[0_8px_18px_-14px_rgba(0,0,0,0.35)] transition hover:bg-[#fafafa]"
            aria-label="Close new user modal"
          >
            <ng-icon name="heroXMark" class="text-xl"></ng-icon>
          </button>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="mt-8">
          <section>
            <h3 class="text-[16px] font-semibold text-[#202020]">General information</h3>
            <p class="mt-1 max-w-[440px] text-[15px] leading-7 text-[#8d8d8d]">
              Add accurate details about this user. A link with login info will be sent to the email
            </p>

            <div class="mt-6">
              <div class="relative inline-flex">
                <div class="flex h-24 w-24 items-center justify-center rounded-full border border-[#ececec] bg-[#fafafa] text-[#9f9f9f]">
                  <ng-icon name="heroPhoto" class="text-[44px]"></ng-icon>
                </div>

                <button
                  type="button"
                  class="absolute bottom-1 right-[-2px] flex h-10 w-10 items-center justify-center rounded-full border border-[#ececec] bg-white text-[#6b6b6b] shadow-[0_12px_24px_-18px_rgba(0,0,0,0.45)] transition hover:bg-[#fafafa]"
                  aria-label="Add profile image"
                >
                  <ng-icon name="heroPlus" class="text-[18px]"></ng-icon>
                </button>
              </div>
            </div>

            <div class="mt-8 grid gap-5">
              <label class="block">
                <span class="mb-2 block text-[15px] text-[#505050]">First name</span>
                <input
                  type="text"
                  formControlName="firstName"
                  class="h-11 w-full rounded-[12px] border border-[#e7e7e7] px-4 text-[15px] text-[#202020] outline-none transition focus:border-[#6653e4] focus:ring-4 focus:ring-[#6653e4]/10"
                >
              </label>

              <label class="block">
                <span class="mb-2 block text-[15px] text-[#505050]">Last name</span>
                <input
                  type="text"
                  formControlName="lastName"
                  class="h-11 w-full rounded-[12px] border border-[#e7e7e7] px-4 text-[15px] text-[#202020] outline-none transition focus:border-[#6653e4] focus:ring-4 focus:ring-[#6653e4]/10"
                >
              </label>

              <label class="block">
                <span class="mb-2 block text-[15px] text-[#505050]">Email</span>
                <input
                  type="email"
                  formControlName="email"
                  class="h-11 w-full rounded-[12px] border border-[#e7e7e7] px-4 text-[15px] text-[#202020] outline-none transition focus:border-[#6653e4] focus:ring-4 focus:ring-[#6653e4]/10"
                >
              </label>

              <label class="block">
                <span class="mb-2 block text-[15px] text-[#505050]">Phone number</span>
                <input
                  type="tel"
                  formControlName="phoneNumber"
                  placeholder="+234"
                  class="h-11 w-full rounded-[12px] border border-[#e7e7e7] px-4 text-[15px] text-[#202020] outline-none transition placeholder:text-[#a3a3a3] focus:border-[#6653e4] focus:ring-4 focus:ring-[#6653e4]/10"
                >
              </label>
            </div>
          </section>

          <section class="mt-8">
            <h3 class="text-[16px] font-semibold text-[#202020]">Role</h3>
            <p class="mt-1 text-[15px] leading-7 text-[#8d8d8d]">Select a role to be assigned to this user</p>

            <label class="mt-5 block">
              <span class="mb-2 block text-[15px] text-[#505050]">Role</span>
              <div class="relative" (click)="$event.stopPropagation()">
                <button
                  type="button"
                  (click)="toggleRoleDropdown()"
                  class="flex h-11 w-full items-center justify-between rounded-[12px] border border-[#e7e7e7] bg-white px-4 text-[15px] text-[#202020] outline-none transition hover:border-[#d7d7d7] focus:border-[#6653e4] focus:ring-4 focus:ring-[#6653e4]/10"
                  aria-haspopup="listbox"
                  [attr.aria-expanded]="isRoleDropdownOpen()"
                  aria-label="Select role"
                >
                  <span [class.text-[#a3a3a3]]="!selectedRoleLabel()">{{ selectedRoleLabel() || 'Select role' }}</span>
                  <ng-icon name="heroChevronDown" class="text-[18px] text-[#5f5f5f]"></ng-icon>
                </button>

                @if (isRoleDropdownOpen()) {
                  <div
                    role="listbox"
                    class="absolute left-0 right-0 top-[calc(100%+8px)] z-10 overflow-hidden rounded-[14px] border border-[#ececec] bg-white shadow-[0_24px_48px_-28px_rgba(0,0,0,0.45)]"
                  >
                    @for (role of roles(); track role.id) {
                      <button
                        type="button"
                        (click)="selectRole(role.id)"
                        class="block w-full px-4 py-3 text-left transition hover:bg-[#fafafa]"
                        [class.bg-[#f9f7ff]]="form.controls.role.value === role.id"
                      >
                        <p class="text-[15px] font-medium text-[#202020]">{{ role.label }}</p>
                        <p class="mt-1 text-[14px] leading-6 text-[#8d8d8d]">{{ role.description }}</p>
                      </button>
                    }
                  </div>
                }
              </div>
            </label>
          </section>

          <div class="mt-16 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              (click)="close.emit()"
              class="min-w-[126px] rounded-full border border-[#ececec] bg-white px-6 py-3 text-[15px] font-medium text-[#1f1f1f] transition hover:bg-[#fafafa]"
            >
              Cancel
            </button>

            <button
              type="submit"
              [disabled]="form.invalid"
              class="min-w-[126px] rounded-full bg-[#6653e4] px-6 py-3 text-[15px] font-medium text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)] transition hover:bg-[#5945db] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Add user
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAddTeamUserModalComponent {
  private readonly formBuilder = inject(FormBuilder);

  readonly roles = input.required<ReadonlyArray<TeamRoleOption>>();

  readonly close = output<void>();
  readonly submitUser = output<NewTeamUserPayload>();
  readonly isRoleDropdownOpen = signal(false);

  readonly form = this.formBuilder.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['+234', Validators.required],
    role: ['', Validators.required],
  });

  readonly selectedRoleLabel = computed(
    () => this.roles().find((role) => role.id === this.form.controls.role.value)?.label ?? '',
  );

  toggleRoleDropdown(): void {
    this.isRoleDropdownOpen.update((open) => !open);
  }

  closeRoleDropdown(): void {
    this.isRoleDropdownOpen.set(false);
  }

  selectRole(roleId: string): void {
    this.form.controls.role.setValue(roleId);
    this.closeRoleDropdown();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.submitUser.emit({
      firstName: value.firstName.trim(),
      lastName: value.lastName.trim(),
      email: value.email.trim(),
      phoneNumber: value.phoneNumber.trim(),
      role: value.role,
    });
  }
}
