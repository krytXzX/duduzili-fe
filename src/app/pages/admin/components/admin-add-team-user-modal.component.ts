import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroChevronLeft,
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
  providers: [provideIcons({ heroChevronLeft, heroChevronDown, heroPhoto, heroPlus, heroXMark })],
  template: `
    <div
      class="fixed inset-0 z-[220] flex items-end justify-center bg-black/20 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      (click)="closeRoleDropdown(); close.emit()"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-team-user-modal-title"
        class="relative flex max-h-[85vh] w-full flex-col overflow-hidden rounded-t-[32px] rounded-b-[32px] bg-white shadow-[0_30px_80px_-40px_rgba(19,27,45,0.45)] sm:max-h-[calc(100vh-2rem)] sm:max-w-[760px] sm:rounded-[26px]"
        (click)="$event.stopPropagation()"
      >
        <div class="sm:hidden">
          <div class="relative px-4 pb-2 pt-3">
            <div class="mx-auto h-1 w-[50px] rounded-full bg-[#D9D9D9]"></div>
            <button
              type="button"
              (click)="close.emit()"
              class="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full text-[#141414]"
              aria-label="Close new user sheet"
            >
              <ng-icon name="heroXMark" class="text-[22px]"></ng-icon>
            </button>
          </div>

          <div class="px-4 pb-6">
            <h2 id="new-team-user-modal-title" class="text-[20px] font-semibold leading-8 text-[#0D0D0D]">
              New user
            </h2>
          </div>
        </div>

        <div class="hidden items-start justify-between gap-4 p-6 sm:flex sm:p-8 sm:pb-0">
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

        <form [formGroup]="form" (ngSubmit)="submit()" class="flex min-h-0 flex-1 flex-col">
          <div class="min-h-0 flex-1 overflow-y-auto px-4 pb-6 sm:px-8">
          <section>
            <h3 class="text-[16px] font-semibold text-[#202020]">General information</h3>
            <p class="mt-1 max-w-[440px] text-[14px] leading-5 text-[#8d8d8d] sm:text-[15px] sm:leading-7">
              Add accurate details about this user. A link with login info will be sent to the email
            </p>

            <div class="mt-6">
              <div class="relative inline-flex">
                <div class="flex h-[100px] w-[100px] items-center justify-center rounded-full border border-[#ececec] bg-[#fafafa] text-[#9f9f9f] sm:h-24 sm:w-24">
                  <ng-icon name="heroPhoto" class="text-[50px] sm:text-[44px]"></ng-icon>
                </div>

                <button
                  type="button"
                  class="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border border-[#ececec] bg-white text-[#6b6b6b] shadow-[0_12px_24px_-18px_rgba(0,0,0,0.45)] transition hover:bg-[#fafafa] sm:bottom-1 sm:right-[-2px] sm:h-10 sm:w-10"
                  aria-label="Add profile image"
                >
                  <ng-icon name="heroPlus" class="text-[18px] sm:text-[18px]"></ng-icon>
                </button>
              </div>
            </div>

            <div class="mt-8 grid gap-5">
              <label class="block">
                <span class="mb-2 block text-[14px] text-[#505050]">First name</span>
                <input
                  type="text"
                  formControlName="firstName"
                  class="h-12 w-full rounded-[12px] border border-[#e7e7e7] px-3 text-[14px] text-[#202020] outline-none transition focus:border-[#6653e4] focus:ring-4 focus:ring-[#6653e4]/10 sm:h-11 sm:px-4 sm:text-[15px]"
                >
              </label>

              <label class="block">
                <span class="mb-2 block text-[14px] text-[#505050]">Last name</span>
                <input
                  type="text"
                  formControlName="lastName"
                  class="h-12 w-full rounded-[12px] border border-[#e7e7e7] px-3 text-[14px] text-[#202020] outline-none transition focus:border-[#6653e4] focus:ring-4 focus:ring-[#6653e4]/10 sm:h-11 sm:px-4 sm:text-[15px]"
                >
              </label>

              <label class="block">
                <span class="mb-2 block text-[14px] text-[#505050]">Email</span>
                <input
                  type="email"
                  formControlName="email"
                  class="h-12 w-full rounded-[12px] border border-[#e7e7e7] px-3 text-[14px] text-[#202020] outline-none transition focus:border-[#6653e4] focus:ring-4 focus:ring-[#6653e4]/10 sm:h-11 sm:px-4 sm:text-[15px]"
                >
              </label>

              <label class="block">
                <span class="mb-2 block text-[14px] text-[#505050]">Phone number</span>
                <input
                  type="tel"
                  formControlName="phoneNumber"
                  placeholder="+234"
                  class="h-12 w-full rounded-[12px] border border-[#e7e7e7] px-3 text-[14px] text-[#202020] outline-none transition placeholder:text-[#a3a3a3] focus:border-[#6653e4] focus:ring-4 focus:ring-[#6653e4]/10 sm:h-11 sm:px-4 sm:text-[15px]"
                >
              </label>
            </div>
          </section>

          <section class="mt-8">
            <h3 class="text-[16px] font-semibold text-[#202020]">Role</h3>
            <p class="mt-1 text-[14px] leading-5 text-[#8d8d8d] sm:text-[15px] sm:leading-7">Select a role to be assigned to this user</p>

            <label class="mt-5 block">
              <span class="mb-2 block text-[14px] text-[#505050]">Role</span>
              <div class="relative" (click)="$event.stopPropagation()">
                <button
                  type="button"
                  (click)="openRolePicker()"
                  class="flex h-12 w-full items-center justify-between rounded-[12px] border border-[#e7e7e7] bg-white px-3 text-[14px] text-[#202020] outline-none transition hover:border-[#d7d7d7] focus:border-[#6653e4] focus:ring-4 focus:ring-[#6653e4]/10 sm:h-11 sm:px-4 sm:text-[15px]"
                  aria-haspopup="listbox"
                  [attr.aria-expanded]="isRolePickerOpen() || isRoleDropdownOpen()"
                  aria-label="Select role"
                >
                  <span [class.text-[#a3a3a3]]="!selectedRoleLabel()">{{ selectedRoleLabel() || 'Select role' }}</span>
                  <ng-icon name="heroChevronDown" class="text-[18px] text-[#5f5f5f]"></ng-icon>
                </button>

                @if (isRoleDropdownOpen()) {
                  <div
                    role="listbox"
                    class="absolute left-0 right-0 top-[calc(100%+8px)] z-10 hidden overflow-hidden rounded-[14px] border border-[#ececec] bg-white shadow-[0_24px_48px_-28px_rgba(0,0,0,0.45)] sm:block"
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
          </div>

          <div class="hidden flex-wrap justify-end gap-3 px-8 pb-8 pt-6 sm:flex">
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

          <div class="border-t border-[#F0F0F0] px-4 pb-6 pt-4 sm:hidden">
            <button
              type="submit"
              [disabled]="form.invalid"
              class="flex h-[52px] w-full items-center justify-center rounded-full bg-[#6453D9] px-6 text-[16px] font-medium text-white shadow-[0_4px_12px_rgba(81,35,173,0.33)] transition hover:bg-[#5945db] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Add user
            </button>
          </div>
        </form>

        @if (isRolePickerOpen()) {
          <div
            class="fixed inset-0 z-[230] flex items-end justify-center bg-black/20 p-0 backdrop-blur-[2px] sm:hidden"
            (click)="closeRolePicker()"
          >
            <div
              class="relative w-full rounded-t-[32px] rounded-b-[32px] bg-white"
              (click)="$event.stopPropagation()"
              role="dialog"
              aria-modal="true"
              aria-label="Select role"
            >
              <div class="relative px-4 pb-2 pt-3">
                <div class="mx-auto h-1 w-[50px] rounded-full bg-[#D9D9D9]"></div>
              </div>

              <div class="px-4 pb-6">
                <div class="mb-4 inline-flex h-8 w-10 items-center justify-center rounded-full bg-[#F3F3F3]">
                  <button
                    type="button"
                    (click)="closeRolePicker()"
                    class="inline-flex h-8 w-10 items-center justify-center text-[#141414]"
                    aria-label="Back"
                  >
                    <ng-icon name="heroChevronLeft" class="text-[20px]"></ng-icon>
                  </button>
                </div>

                <div class="space-y-6">
                  @for (role of roles(); track role.id) {
                    <button
                      type="button"
                      (click)="selectRole(role.id); closeRolePicker()"
                      class="block w-full text-left"
                    >
                      <p class="text-[16px] font-medium leading-5 text-[#0D0D0D]">{{ role.label }}</p>
                      <p class="mt-1 text-[14px] leading-6 text-[#0D0D0D]/50">{{ role.description }}</p>
                    </button>
                  }
                </div>
              </div>
            </div>
          </div>
        }
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
  readonly isRolePickerOpen = signal(false);

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

  openRolePicker(): void {
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      this.isRolePickerOpen.set(true);
      return;
    }

    this.toggleRoleDropdown();
  }

  closeRolePicker(): void {
    this.isRolePickerOpen.set(false);
  }

  selectRole(roleId: string): void {
    this.form.controls.role.setValue(roleId);
    this.closeRoleDropdown();
    this.closeRolePicker();
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
