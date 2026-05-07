import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroArrowPath,
  heroCheckCircle,
  heroChevronDown,
  heroNoSymbol,
  heroTrash,
  heroUserCircle,
  heroCheck,
  heroXCircle,
  heroXMark,
} from '@ng-icons/heroicons/outline';
import { TeamRoleOption } from './admin-add-team-user-modal.component';

export type TeamMemberModalStatus = 'active' | 'inactive' | 'pending activation';

export interface TeamMemberDetails {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  phoneNumber: string;
  avatar: string;
  role: string;
  status: TeamMemberModalStatus;
}

export interface TeamMemberUpdatePayload {
  id: string;
  role: string;
}

@Component({
  selector: 'app-admin-team-member-details-modal',
  imports: [NgIcon, NgOptimizedImage, ReactiveFormsModule],
  providers: [
    provideIcons({
      heroArrowPath,
      heroCheck,
      heroCheckCircle,
      heroChevronDown,
      heroNoSymbol,
      heroTrash,
      heroUserCircle,
      heroXCircle,
      heroXMark,
    }),
  ],
  template: `
    <div
      class="fixed inset-0 z-[220] flex items-center justify-center bg-black/20 p-4 backdrop-blur-[2px]"
      (click)="closeRoleDropdown(); close.emit()"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="team-member-modal-title"
        class="max-h-[calc(100vh-2rem)] w-full max-w-[760px] overflow-y-auto rounded-[26px] bg-white p-6 shadow-[0_30px_80px_-40px_rgba(19,27,45,0.45)] sm:p-8"
        (click)="$event.stopPropagation()"
      >
        <div class="flex items-start justify-between gap-4">
          <h2 id="team-member-modal-title" class="text-[28px] font-semibold tracking-[-0.04em] text-[#202020]">
            User details
          </h2>

          <button
            type="button"
            (click)="close.emit()"
            class="flex h-11 w-11 items-center justify-center rounded-full border border-[#e8e8e8] bg-white text-[#626262] shadow-[0_8px_18px_-14px_rgba(0,0,0,0.35)] transition hover:bg-[#fafafa]"
            aria-label="Close user details modal"
          >
            <ng-icon name="heroXMark" class="text-xl"></ng-icon>
          </button>
        </div>

        <form [formGroup]="form" (ngSubmit)="saveChanges()" class="mt-8">
          <div class="flex flex-wrap items-center gap-4">
            <div class="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-[#f3f3f3]">
              <img
                [ngSrc]="member().avatar"
                [alt]="member().userName"
                width="80"
                height="80"
                class="h-20 w-20 object-cover"
              >
            </div>

            <div class="min-w-0">
              <h3 class="truncate text-[16px] font-semibold text-[#202020]">{{ member().userName }}</h3>
              <p class="mt-1 truncate text-[15px] text-[#8b8b8b]">{{ member().email }}</p>
            </div>

            <span
              class="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[14px] font-medium"
              [class.bg-[#eefbf1]]="member().status === 'active'"
              [class.text-[#2ab83f]]="member().status === 'active'"
              [class.bg-[#fff1f1]]="member().status === 'inactive'"
              [class.text-[#ff2d2d]]="member().status === 'inactive'"
              [class.bg-[#fff6e8]]="member().status === 'pending activation'"
              [class.text-[#f39a22]]="member().status === 'pending activation'"
            >
              <ng-icon [name]="statusIconName()" class="text-[15px]"></ng-icon>
              {{ statusLabel() }}
            </span>
          </div>

          @if (member().status === 'active') {
            <div class="mt-8">
              <button
                type="button"
                (click)="deactivate.emit(member().id)"
                class="inline-flex h-10 items-center gap-2 rounded-full border border-[#e8e8e8] bg-white px-4 text-[15px] font-medium text-[#202020] transition hover:bg-[#fafafa]"
              >
                <ng-icon name="heroNoSymbol" class="text-[16px]"></ng-icon>
                Deactivate user
              </button>
            </div>
          } @else if (member().status === 'inactive') {
            <div class="mt-8">
              <button
                type="button"
                (click)="activate.emit(member().id)"
                class="inline-flex h-10 items-center gap-2 rounded-full border border-[#e8e8e8] bg-white px-4 text-[15px] font-medium text-[#202020] transition hover:bg-[#fafafa]"
              >
                <ng-icon name="heroCheck" class="text-[16px]"></ng-icon>
                Activate user
              </button>
            </div>
          } @else if (member().status === 'pending activation') {
            <div class="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                (click)="resendInvite.emit(member().id)"
                class="inline-flex h-10 items-center gap-2 rounded-full border border-[#e8e8e8] bg-white px-4 text-[15px] font-medium text-[#202020] transition hover:bg-[#fafafa]"
              >
                <ng-icon name="heroArrowPath" class="text-[16px]"></ng-icon>
                Resend invite
              </button>

              <button
                type="button"
                (click)="deleteUser.emit(member().id)"
                class="inline-flex h-10 items-center gap-2 rounded-full border border-[#e8e8e8] bg-white px-4 text-[15px] font-medium text-[#ff2d2d] transition hover:bg-[#fff7f7]"
              >
                <ng-icon name="heroTrash" class="text-[16px]"></ng-icon>
                Delete user
              </button>
            </div>
          }

          <section class="mt-8 rounded-[24px] border border-[#e9e9e9] px-5 py-5">
            <h3 class="text-[16px] font-medium text-[#8b8b8b]">User details</h3>

            <div class="mt-6 grid gap-y-5 sm:grid-cols-[170px_minmax(0,1fr)]">
              <p class="text-[15px] text-[#8f8f8f]">First name</p>
              <p class="text-[15px] font-medium text-[#222222]">{{ member().firstName }}</p>

              <p class="text-[15px] text-[#8f8f8f]">Last name</p>
              <p class="text-[15px] font-medium text-[#222222]">{{ member().lastName }}</p>

              <p class="text-[15px] text-[#8f8f8f]">Email address</p>
              <p class="text-[15px] font-medium text-[#222222]">{{ member().email }}</p>

              <p class="text-[15px] text-[#8f8f8f]">Phone number</p>
              <p class="text-[15px] font-medium text-[#222222]">{{ member().phoneNumber }}</p>
            </div>
          </section>

          <section class="mt-8">
            <h3 class="text-[16px] font-semibold text-[#202020]">Update role</h3>

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
                  <span>{{ selectedRoleLabel() }}</span>
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
              class="min-w-[140px] rounded-full bg-[#6653e4] px-6 py-3 text-[15px] font-medium text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)] transition hover:bg-[#5945db]"
            >
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminTeamMemberDetailsModalComponent {
  private readonly formBuilder = inject(FormBuilder);

  readonly member = input.required<TeamMemberDetails>();
  readonly roles = input.required<ReadonlyArray<TeamRoleOption>>();

  readonly close = output<void>();
  readonly save = output<TeamMemberUpdatePayload>();
  readonly activate = output<string>();
  readonly deactivate = output<string>();
  readonly resendInvite = output<string>();
  readonly deleteUser = output<string>();

  readonly isRoleDropdownOpen = signal(false);

  readonly form = this.formBuilder.nonNullable.group({
    role: ['', Validators.required],
  });

  readonly selectedRoleLabel = computed(
    () => this.roles().find((role) => role.id === this.form.controls.role.value)?.label ?? this.member().role,
  );

  constructor() {
    effect(() => {
      const memberRole = this.member().role;
      const matchingRole = this.roles().find((role) => role.label === memberRole)?.id ?? this.roles()[0]?.id ?? '';
      this.form.controls.role.setValue(matchingRole);
      this.closeRoleDropdown();
    });
  }

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

  saveChanges(): void {
    this.save.emit({
      id: this.member().id,
      role: this.form.controls.role.value,
    });
  }

  statusLabel(): string {
    switch (this.member().status) {
      case 'active':
        return 'Active';
      case 'inactive':
        return 'Inactive';
      default:
        return 'Pending activation';
    }
  }

  statusIconName(): 'heroCheckCircle' | 'heroXCircle' | 'heroUserCircle' {
    switch (this.member().status) {
      case 'active':
        return 'heroCheckCircle';
      case 'inactive':
        return 'heroXCircle';
      default:
        return 'heroUserCircle';
    }
  }
}
