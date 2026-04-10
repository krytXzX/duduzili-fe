import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroChevronDown,
  heroChevronUp,
  heroMagnifyingGlass,
  heroXMark,
} from '@ng-icons/heroicons/outline';

export interface CreateTeamRolePayload {
  title: string;
  description: string;
  permissionsList: string[];
}

interface PermissionSection {
  id: string;
  label: string;
  permissions: string[];
}

type CreateRoleStep = 'details' | 'permissions';

@Component({
  selector: 'app-admin-create-team-role-modal',
  imports: [ReactiveFormsModule, NgIcon],
  providers: [provideIcons({ heroChevronDown, heroChevronUp, heroMagnifyingGlass, heroXMark })],
  template: `
    <div
      class="fixed inset-0 z-[220] flex items-center justify-center bg-black/20 p-4 backdrop-blur-[2px]"
      (click)="close.emit()"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-team-role-modal-title"
        class="max-h-[calc(100vh-2rem)] w-full max-w-[760px] overflow-y-auto rounded-[26px] bg-white p-6 shadow-[0_30px_80px_-40px_rgba(19,27,45,0.45)] sm:p-8"
        (click)="$event.stopPropagation()"
      >
        <div class="flex items-start justify-between gap-4">
          <h2 id="create-team-role-modal-title" class="text-[2rem] font-semibold tracking-[-0.04em] text-[#202020]">
            Create new role
          </h2>

          <button
            type="button"
            (click)="close.emit()"
            class="flex h-11 w-11 items-center justify-center rounded-full border border-[#e8e8e8] bg-white text-[#626262] shadow-[0_8px_18px_-14px_rgba(0,0,0,0.35)] transition hover:bg-[#fafafa]"
            aria-label="Close create new role modal"
          >
            <ng-icon name="heroXMark" class="text-xl"></ng-icon>
          </button>
        </div>

        @if (step() === 'details') {
          <form [formGroup]="form" (ngSubmit)="goToPermissionsStep()" class="mt-12">
            <section>
              <h3 class="max-w-[360px] text-[2rem] font-semibold tracking-[-0.04em] text-[#202020]">
                Fill in basic details about this role
              </h3>

              <div class="mt-10 grid gap-5">
                <label class="block">
                  <span class="mb-2 block text-[15px] text-[#505050]">Role title</span>
                  <input
                    type="text"
                    formControlName="title"
                    class="h-11 w-full rounded-[12px] border border-[#e7e7e7] px-4 text-[15px] text-[#202020] outline-none transition focus:border-[#6653e4] focus:ring-4 focus:ring-[#6653e4]/10"
                  >
                </label>

                <label class="block">
                  <span class="mb-2 block text-[15px] text-[#505050]">Description</span>
                  <textarea
                    formControlName="description"
                    class="min-h-[160px] w-full rounded-[12px] border border-[#e7e7e7] px-4 py-3 text-[15px] text-[#202020] outline-none transition focus:border-[#6653e4] focus:ring-4 focus:ring-[#6653e4]/10"
                  ></textarea>
                </label>
              </div>
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
                Continue
              </button>
            </div>
          </form>
        } @else {
          <section class="mt-12">
            <h3 class="max-w-[460px] text-[2rem] font-semibold tracking-[-0.04em] text-[#202020]">
              Select some permissions for this role
            </h3>

            <label class="mt-10 flex h-10 w-full items-center gap-2 rounded-full bg-[#fafafa] px-4 text-[#9c9c9c]">
              <ng-icon name="heroMagnifyingGlass" class="text-[16px]"></ng-icon>
              <input
                type="search"
                [value]="searchQuery()"
                (input)="updateSearchQuery($event)"
                placeholder="Search"
                class="min-w-0 flex-1 bg-transparent text-[14px] text-[#202020] outline-none placeholder:text-[#9c9c9c]"
              >
            </label>

            <div class="mt-8">
              @for (section of filteredSections(); track section.id) {
                <div class="border-b border-[#efefef] py-4 first:border-t-0">
                  <div class="flex items-center gap-4">
                    <button
                      type="button"
                      role="switch"
                      [attr.aria-checked]="isSectionEnabled(section)"
                      (click)="toggleSection(section)"
                      class="relative h-6 w-8 rounded-full transition"
                      [class.bg-[#6653e4]]="isSectionEnabled(section)"
                      [class.bg-[#ececec]]="!isSectionEnabled(section)"
                      [attr.aria-label]="'Toggle ' + section.label + ' permissions'"
                    >
                      <span
                        class="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition"
                        [class.left-[10px]]="isSectionEnabled(section)"
                        [class.left-0.5]="!isSectionEnabled(section)"
                      ></span>
                    </button>

                    <div class="min-w-0 flex-1">
                      <p class="text-[16px] font-medium text-[#202020]">{{ section.label }}</p>
                    </div>

                    <p class="text-[15px] text-[#5f5f5f]">{{ selectedCount(section) }}/{{ section.permissions.length }}</p>

                    <button
                      type="button"
                      (click)="toggleSectionExpanded(section.id)"
                      class="flex h-8 w-8 items-center justify-center rounded-full text-[#545454] transition hover:bg-[#fafafa]"
                      [attr.aria-label]="expandedSections().has(section.id) ? 'Collapse section' : 'Expand section'"
                    >
                      <ng-icon [name]="expandedSections().has(section.id) ? 'heroChevronUp' : 'heroChevronDown'" class="text-[18px]"></ng-icon>
                    </button>
                  </div>

                  @if (expandedSections().has(section.id)) {
                    <div class="mt-4 space-y-4 pl-12">
                      @for (permission of section.permissions; track permission) {
                        <label class="flex items-center gap-3 text-[15px] text-[#5f5f5f]">
                          <input
                            type="checkbox"
                            [checked]="selectedPermissionIds().has(permission)"
                            (change)="togglePermission(permission)"
                            class="h-4 w-4 rounded border border-[#d7d7d7] text-[#6653e4] focus:ring-[#6653e4]/20"
                          >
                          <span>{{ permission }}</span>
                        </label>
                      }
                    </div>
                  }
                </div>
              }
            </div>

            <div class="mt-16 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                (click)="goBackToDetailsStep()"
                class="min-w-[126px] rounded-full border border-[#ececec] bg-white px-6 py-3 text-[15px] font-medium text-[#1f1f1f] transition hover:bg-[#fafafa]"
              >
                Back
              </button>

              <button
                type="button"
                (click)="submitRole()"
                class="min-w-[146px] rounded-full bg-[#6653e4] px-6 py-3 text-[15px] font-medium text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)] transition hover:bg-[#5945db]"
              >
                Create role
              </button>
            </div>
          </section>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCreateTeamRoleModalComponent {
  private readonly formBuilder = inject(FormBuilder);

  readonly close = output<void>();
  readonly continue = output<CreateTeamRolePayload>();

  readonly step = signal<CreateRoleStep>('details');
  readonly searchQuery = signal('');
  readonly selectedPermissionIds = signal<Set<string>>(new Set(['See quick links']));
  readonly expandedSections = signal<Set<string>>(new Set(['home']));

  readonly form = this.formBuilder.nonNullable.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
  });

  readonly permissionSections: ReadonlyArray<PermissionSection> = [
    { id: 'home', label: 'Home', permissions: ['See quick links', 'Manage dashboard widgets', 'View overview stats'] },
    { id: 'users', label: 'Users', permissions: ['View users', 'Suspend users', 'Edit users', 'View KYC status', 'Approve users', 'Export users', 'Delete users', 'Reset passwords', 'Invite users'] },
    { id: 'listings', label: 'Listings', permissions: ['View listings', 'Edit listings', 'Delete listings', 'Feature listings', 'Moderate listings', 'Approve listings', 'Reject listings', 'Export listings', 'View listing reports'] },
    { id: 'stores', label: 'Stores', permissions: ['View stores', 'Edit stores', 'Approve stores', 'Suspend stores', 'Delete stores', 'Export stores', 'Manage categories', 'Manage store banners', 'View store reports'] },
    { id: 'ads-management', label: 'Ads management', permissions: ['View ad plans', 'Edit ad plans', 'Approve banners', 'Reject banners', 'View transactions', 'Manage running ads', 'Pause ads', 'Resume ads', 'Export transactions'] },
    { id: 'kyc-requests', label: 'KYC requests', permissions: ['View KYC requests', 'Approve KYC', 'Decline KYC', 'View uploaded documents', 'Export KYC data', 'Filter requests', 'Search requests', 'Audit KYC actions', 'Reopen KYC cases'] },
    { id: 'reports', label: 'Reports', permissions: ['View seller reports', 'View listing reports', 'Resolve reports', 'Escalate reports', 'Archive reports', 'Export reports', 'Filter reports', 'Search reports', 'Delete reports'] },
    { id: 'analytics', label: 'Analytics', permissions: ['View overview analytics', 'View user analytics', 'View listing analytics', 'View revenue charts', 'Export analytics', 'Filter by date', 'Compare trends', 'View top regions', 'View conversion metrics'] },
  ];

  readonly filteredSections = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();

    return this.permissionSections.filter((section) =>
      query === ''
      || section.label.toLowerCase().includes(query)
      || section.permissions.some((permission) => permission.toLowerCase().includes(query)),
    );
  });

  goToPermissionsStep(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.step.set('permissions');
  }

  goBackToDetailsStep(): void {
    this.step.set('details');
  }

  updateSearchQuery(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  toggleSectionExpanded(sectionId: string): void {
    this.expandedSections.update((current) => {
      const next = new Set(current);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }

  togglePermission(permission: string): void {
    this.selectedPermissionIds.update((current) => {
      const next = new Set(current);
      if (next.has(permission)) {
        next.delete(permission);
      } else {
        next.add(permission);
      }
      return next;
    });
  }

  toggleSection(section: PermissionSection): void {
    const isEnabled = this.isSectionEnabled(section);

    this.selectedPermissionIds.update((current) => {
      const next = new Set(current);
      for (const permission of section.permissions) {
        if (isEnabled) {
          next.delete(permission);
        } else {
          next.add(permission);
        }
      }
      return next;
    });
  }

  isSectionEnabled(section: PermissionSection): boolean {
    return section.permissions.some((permission) => this.selectedPermissionIds().has(permission));
  }

  selectedCount(section: PermissionSection): number {
    return section.permissions.filter((permission) => this.selectedPermissionIds().has(permission)).length;
  }

  submitRole(): void {
    const value = this.form.getRawValue();

    this.continue.emit({
      title: value.title.trim(),
      description: value.description.trim(),
      permissionsList: Array.from(this.selectedPermissionIds()),
    });
  }
}
