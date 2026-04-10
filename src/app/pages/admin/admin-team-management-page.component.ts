import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroArrowUpTray,
  heroCheckCircle,
  heroChevronLeft,
  heroChevronRight,
  heroEllipsisHorizontal,
  heroMagnifyingGlass,
  heroPlus,
  heroUserCircle,
  heroUsers,
  heroXCircle,
} from '@ng-icons/heroicons/outline';
import {
  AdminAddTeamUserModalComponent,
  NewTeamUserPayload,
  TeamRoleOption,
} from './components/admin-add-team-user-modal.component';
import {
  AdminTeamMemberDetailsModalComponent,
  TeamMemberDetails,
  TeamMemberUpdatePayload,
} from './components/admin-team-member-details-modal.component';
import { AdminActivateTeamUserModalComponent } from './components/admin-activate-team-user-modal.component';
import {
  AdminCreateTeamRoleModalComponent,
  CreateTeamRolePayload,
} from './components/admin-create-team-role-modal.component';
import { AdminCreateTeamRoleSuccessModalComponent } from './components/admin-create-team-role-success-modal.component';
import { AdminDeleteTeamUserModalComponent } from './components/admin-delete-team-user-modal.component';
import { AdminDeactivateTeamUserModalComponent } from './components/admin-deactivate-team-user-modal.component';
import {
  AdminTeamRoleDetailsModalComponent,
  TeamRoleDetails,
} from './components/admin-team-role-details-modal.component';

type TeamManagementTab = 'users' | 'roles';
type TeamMemberStatus = 'active' | 'inactive' | 'pending activation';

interface TeamMemberRecord {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  phoneNumber: string;
  avatar: string;
  role: string;
  lastSignedIn: string;
  status: TeamMemberStatus;
  isCurrentUser?: boolean;
}

interface TeamRoleRecord {
  id: string;
  name: string;
  title: string;
  description: string;
  users: number;
  permissions: number;
  permissionsList: ReadonlyArray<string>;
}

@Component({
  selector: 'app-admin-team-management-page',
  imports: [
    NgIcon,
    NgOptimizedImage,
    AdminAddTeamUserModalComponent,
    AdminTeamMemberDetailsModalComponent,
    AdminActivateTeamUserModalComponent,
    AdminCreateTeamRoleModalComponent,
    AdminCreateTeamRoleSuccessModalComponent,
    AdminDeleteTeamUserModalComponent,
    AdminDeactivateTeamUserModalComponent,
    AdminTeamRoleDetailsModalComponent,
  ],
  providers: [
    provideIcons({
      heroArrowUpTray,
      heroCheckCircle,
      heroChevronLeft,
      heroChevronRight,
      heroEllipsisHorizontal,
      heroMagnifyingGlass,
      heroPlus,
      heroUserCircle,
      heroUsers,
      heroXCircle,
    }),
  ],
  template: `
    <section class="min-h-full rounded-[32px] bg-white">
      <header class="border-b border-[#efefef] px-8 py-6">
        <h1 class="text-[2rem] font-semibold tracking-[-0.04em] text-[#202020]">Team management</h1>
      </header>

      <div class="px-4 py-6 sm:px-6 lg:px-8">
        <div class="border-b border-[#efefef]">
          <div class="flex items-center gap-8">
            <button
              type="button"
              (click)="setActiveTab('users')"
              class="flex items-center gap-2 border-b-2 px-1 py-4 text-[15px] font-medium transition-colors"
              [class.border-[#6254f3]]="activeTab() === 'users'"
              [class.text-[#6254f3]]="activeTab() === 'users'"
              [class.border-transparent]="activeTab() !== 'users'"
              [class.text-[#8b8b8b]]="activeTab() !== 'users'"
            >
              <ng-icon name="heroUsers" class="text-[16px]"></ng-icon>
              Users
            </button>

            <button
              type="button"
              (click)="setActiveTab('roles')"
              class="flex items-center gap-2 border-b-2 px-1 py-4 text-[15px] font-medium transition-colors"
              [class.border-[#6254f3]]="activeTab() === 'roles'"
              [class.text-[#6254f3]]="activeTab() === 'roles'"
              [class.border-transparent]="activeTab() !== 'roles'"
              [class.text-[#8b8b8b]]="activeTab() !== 'roles'"
            >
              <ng-icon name="heroUserCircle" class="text-[16px]"></ng-icon>
              Roles
            </button>
          </div>
        </div>

        @if (activeTab() === 'users') {
          <section class="mt-6 overflow-hidden rounded-[20px] border border-[#e9e9e9] bg-white">
            <div class="flex flex-col gap-4 border-b border-[#efefef] px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
              <label class="flex h-10 w-full items-center gap-2 rounded-full bg-[#fafafa] px-4 text-[#9c9c9c] lg:max-w-[226px]">
                <ng-icon name="heroMagnifyingGlass" class="text-[16px]"></ng-icon>
                <input
                  type="search"
                  [value]="searchQuery()"
                  (input)="updateSearchQuery($event)"
                  placeholder="Search"
                  class="min-w-0 flex-1 bg-transparent text-[14px] text-[#202020] outline-none placeholder:text-[#9c9c9c]"
                >
              </label>

              <div class="flex flex-wrap items-center gap-3 self-end">
                <button
                  type="button"
                  class="inline-flex h-11 items-center gap-2 rounded-full border border-[#e8e8e8] bg-white px-5 text-[15px] font-medium text-[#202020]"
                >
                  <ng-icon name="heroArrowUpTray" class="text-[16px]"></ng-icon>
                  Export
                </button>

                <button
                  type="button"
                  (click)="isAddUserModalOpen.set(true)"
                  class="inline-flex h-11 items-center gap-2 rounded-full bg-[#6653e4] px-5 text-[15px] font-medium text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)] transition hover:bg-[#5945db]"
                >
                  <ng-icon name="heroPlus" class="text-[16px]"></ng-icon>
                  Add user
                </button>
              </div>
            </div>

            <div class="overflow-x-auto">
              <table class="min-w-[1080px] w-full table-fixed">
                <thead>
                  <tr class="border-b border-[#efefef] bg-[#fafafa] text-left text-[13px] font-medium text-[#7d7d7d]">
                    <th class="w-[280px] px-4 py-3 font-medium">User</th>
                    <th class="w-[260px] px-4 py-3 font-medium">Role</th>
                    <th class="w-[220px] px-4 py-3 font-medium">Last signed in</th>
                    <th class="w-[210px] px-4 py-3 font-medium">Status</th>
                    <th class="w-[70px] px-4 py-3 font-medium"></th>
                  </tr>
                </thead>

                <tbody>
                  @for (record of paginatedUsers(); track record.id) {
                    <tr
                      class="cursor-pointer border-b border-[#efefef] transition-colors hover:bg-[#fcfcfc] last:border-b-0"
                      (click)="openMemberDetails(record)"
                    >
                      <td class="px-4 py-4">
                        <div class="flex items-center gap-3">
                          <div class="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#f3f3f3]">
                            <img
                              [ngSrc]="record.avatar"
                              [alt]="record.userName"
                              width="40"
                              height="40"
                              class="h-10 w-10 object-cover"
                            >
                          </div>
                          <div class="min-w-0">
                            <div class="flex items-center gap-2">
                              <p class="truncate text-[15px] font-medium text-[#222222]">{{ record.userName }}</p>
                              @if (record.isCurrentUser) {
                                <span class="inline-flex rounded-full border border-[#d7d0ff] bg-[#f7f5ff] px-2 py-0.5 text-[12px] font-medium text-[#6653e4]">
                                  You
                                </span>
                              }
                            </div>
                            <p class="truncate text-[13px] text-[#8b8b8b]">{{ record.email }}</p>
                          </div>
                        </div>
                      </td>

                      <td class="px-4 py-4 text-[15px] text-[#303030]">{{ record.role }}</td>
                      <td class="px-4 py-4 text-[15px] text-[#303030]">{{ record.lastSignedIn }}</td>
                      <td class="px-4 py-4">
                        <span
                          class="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[14px] font-medium"
                          [class.bg-[#eefbf1]]="record.status === 'active'"
                          [class.text-[#2ab83f]]="record.status === 'active'"
                          [class.bg-[#fff1f1]]="record.status === 'inactive'"
                          [class.text-[#ff2d2d]]="record.status === 'inactive'"
                          [class.bg-[#fff6e8]]="record.status === 'pending activation'"
                          [class.text-[#f39a22]]="record.status === 'pending activation'"
                        >
                          <ng-icon [name]="statusIcon(record.status)" class="text-[15px]"></ng-icon>
                          {{ statusLabel(record.status) }}
                        </span>
                      </td>
                      <td class="px-4 py-4 text-right">
                        <button
                          type="button"
                          class="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#8b8b8b] transition hover:bg-[#fafafa] hover:text-[#202020]"
                          aria-label="More actions"
                        >
                          <ng-icon name="heroEllipsisHorizontal" class="text-[18px]"></ng-icon>
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </section>

          <div class="mt-6 flex flex-col gap-4 text-[15px] text-[#4d4d4d] sm:flex-row sm:items-center sm:justify-between">
            <p>{{ paginatedUsers().length }} results</p>

            <div class="flex items-center gap-2 self-end">
              <button
                type="button"
                (click)="goToPreviousPage()"
                [disabled]="currentPage() === 1"
                class="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#ececec] text-[#b3b3b3] transition hover:bg-[#fafafa] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Previous page"
              >
                <ng-icon name="heroChevronLeft" class="text-[16px]"></ng-icon>
              </button>

              <div class="flex h-9 min-w-10 items-center justify-center rounded-[10px] border border-[#ececec] px-3 text-[15px] text-[#707070]">
                {{ currentPage() }}
              </div>

              <button
                type="button"
                (click)="goToNextPage()"
                [disabled]="currentPage() === totalPages()"
                class="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#ececec] text-[#9a9a9a] transition hover:bg-[#fafafa] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Next page"
              >
                <ng-icon name="heroChevronRight" class="text-[16px]"></ng-icon>
              </button>

              <span class="ml-1 text-[15px] text-[#7d7d7d]">of {{ totalPages() }}</span>
            </div>
          </div>
        } @else {
          <section class="mt-6 overflow-hidden rounded-[20px] border border-[#e9e9e9] bg-white">
            <div class="flex flex-col gap-4 border-b border-[#efefef] px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
              <label class="flex h-10 w-full items-center gap-2 rounded-full bg-[#fafafa] px-4 text-[#9c9c9c] lg:max-w-[226px]">
                <ng-icon name="heroMagnifyingGlass" class="text-[16px]"></ng-icon>
                <input
                  type="search"
                  [value]="searchQuery()"
                  (input)="updateSearchQuery($event)"
                  placeholder="Search"
                  class="min-w-0 flex-1 bg-transparent text-[14px] text-[#202020] outline-none placeholder:text-[#9c9c9c]"
                >
              </label>

              <button
                type="button"
                (click)="isCreateRoleModalOpen.set(true)"
                class="inline-flex h-11 items-center gap-2 self-end rounded-full bg-[#6653e4] px-5 text-[15px] font-medium text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)] transition hover:bg-[#5945db]"
              >
                <ng-icon name="heroPlus" class="text-[16px]"></ng-icon>
                Create role
              </button>
            </div>

            <div class="overflow-x-auto">
              <table class="min-w-[1040px] w-full table-fixed">
                <thead>
                  <tr class="border-b border-[#efefef] bg-[#fafafa] text-left text-[13px] font-medium text-[#7d7d7d]">
                    <th class="w-[280px] px-4 py-3 font-medium">User</th>
                    <th class="w-[500px] px-4 py-3 font-medium">Description</th>
                    <th class="w-[170px] px-4 py-3 font-medium">Users</th>
                    <th class="w-[150px] px-4 py-3 font-medium">Permissions</th>
                  </tr>
                </thead>

                <tbody>
                  @for (role of paginatedRoles(); track role.id) {
                    <tr
                      class="cursor-pointer border-b border-[#efefef] transition-colors hover:bg-[#fcfcfc] last:border-b-0"
                      (click)="openRoleDetails(role)"
                    >
                      <td class="px-4 py-5 text-[15px] font-medium text-[#303030]">{{ role.name }}</td>
                      <td class="px-4 py-5">
                        <p class="max-w-[420px] text-[15px] leading-6 text-[#6f6f6f]">{{ role.description }}</p>
                      </td>
                      <td class="px-4 py-5 text-[15px] text-[#303030]">{{ role.users }}</td>
                      <td class="px-4 py-5 text-[15px] text-[#303030]">{{ role.permissions }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </section>

          <div class="mt-6 flex flex-col gap-4 text-[15px] text-[#4d4d4d] sm:flex-row sm:items-center sm:justify-between">
            <p>{{ paginatedRoles().length }} results</p>

            <div class="flex items-center gap-2 self-end">
              <button
                type="button"
                (click)="goToPreviousPage()"
                [disabled]="currentPage() === 1"
                class="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#ececec] text-[#b3b3b3] transition hover:bg-[#fafafa] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Previous page"
              >
                <ng-icon name="heroChevronLeft" class="text-[16px]"></ng-icon>
              </button>

              <div class="flex h-9 min-w-10 items-center justify-center rounded-[10px] border border-[#ececec] px-3 text-[15px] text-[#707070]">
                {{ currentPage() }}
              </div>

              <button
                type="button"
                (click)="goToNextPage()"
                [disabled]="currentPage() === totalPages()"
                class="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#ececec] text-[#9a9a9a] transition hover:bg-[#fafafa] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Next page"
              >
                <ng-icon name="heroChevronRight" class="text-[16px]"></ng-icon>
              </button>

              <span class="ml-1 text-[15px] text-[#7d7d7d]">of {{ totalPages() }}</span>
            </div>
          </div>
        }
      </div>

      @if (isAddUserModalOpen()) {
        <app-admin-add-team-user-modal
          [roles]="addUserRoles"
          (close)="isAddUserModalOpen.set(false)"
          (submitUser)="addUser($event)"
        ></app-admin-add-team-user-modal>
      }

      @if (isCreateRoleModalOpen()) {
        <app-admin-create-team-role-modal
          (close)="isCreateRoleModalOpen.set(false)"
          (continue)="createRole($event)"
        ></app-admin-create-team-role-modal>
      }

      @if (isCreateRoleSuccessModalOpen()) {
        <app-admin-create-team-role-success-modal
          (addAnother)="openCreateAnotherRole()"
          (done)="closeCreateRoleSuccessModal()"
        ></app-admin-create-team-role-success-modal>
      }

      @if (selectedMember()) {
        <app-admin-team-member-details-modal
          [member]="selectedMember()!"
          [roles]="availableRoles"
          (close)="selectedMember.set(null)"
          (save)="saveMemberChanges($event)"
          (activate)="openActivateUserModal($event)"
          (deactivate)="openDeactivateUserModal($event)"
          (resendInvite)="resendInvite($event)"
          (deleteUser)="openDeleteUserModal($event)"
        ></app-admin-team-member-details-modal>
      }

      @if (selectedRole()) {
        <app-admin-team-role-details-modal
          [role]="selectedRole()!"
          (close)="selectedRole.set(null)"
        ></app-admin-team-role-details-modal>
      }

      @if (activateMemberId()) {
        <app-admin-activate-team-user-modal
          (close)="activateMemberId.set(null)"
          (confirm)="confirmActivateMember()"
        ></app-admin-activate-team-user-modal>
      }

      @if (deactivateMemberId()) {
        <app-admin-deactivate-team-user-modal
          (close)="deactivateMemberId.set(null)"
          (confirm)="confirmDeactivateMember()"
        ></app-admin-deactivate-team-user-modal>
      }

      @if (deleteMemberId()) {
        <app-admin-delete-team-user-modal
          (close)="deleteMemberId.set(null)"
          (confirm)="confirmDeleteMember()"
        ></app-admin-delete-team-user-modal>
      }
    </section>
  `,
  host: {
    class: 'block h-full',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminTeamManagementPageComponent {
  readonly activeTab = signal<TeamManagementTab>('users');
  readonly searchQuery = signal('');
  readonly currentPage = signal(1);
  readonly pageSize = 5;
  readonly isAddUserModalOpen = signal(false);
  readonly isCreateRoleModalOpen = signal(false);
  readonly isCreateRoleSuccessModalOpen = signal(false);
  readonly selectedMember = signal<TeamMemberDetails | null>(null);
  readonly selectedRole = signal<TeamRoleDetails | null>(null);
  readonly activateMemberId = signal<string | null>(null);
  readonly deactivateMemberId = signal<string | null>(null);
  readonly deleteMemberId = signal<string | null>(null);
  readonly availableRoles: ReadonlyArray<TeamRoleOption> = [
    {
      id: 'super-administrator',
      label: 'Super Admin',
      description: 'A Super Administrator is a special type of Administrator that can perform all actions, including closing the account. Only a Super Administrator can assign the Super Administrator role to other team members.',
    },
    {
      id: 'administrator',
      label: 'Admin',
      description: 'This role is for people who need similar access as the account owner. This role can see and manage almost everything.',
    },
    {
      id: 'account-manager',
      label: 'Account manager',
      description: 'This role manages customer relationships, user issues, and account-related support tasks across the platform.',
    },
    {
      id: 'customer-service',
      label: 'Customer service',
      description: 'This role supports buyers and sellers by resolving tickets, responding to inquiries, and escalating urgent issues.',
    },
    {
      id: 'operations-lead',
      label: 'Operations lead',
      description: 'This role oversees daily platform operations, coordinates moderation processes, and helps maintain service quality.',
    },
    {
      id: 'support-supervisor',
      label: 'Support supervisor',
      description: 'This role guides the support team, monitors service delivery, and helps enforce response standards.',
    },
  ];
  readonly addUserRoles: ReadonlyArray<TeamRoleOption> = this.availableRoles.filter(
    (role) => role.id === 'super-administrator' || role.id === 'administrator',
  );
  readonly teamRoles = signal<TeamRoleRecord[]>([
    {
      id: 'role-1',
      name: 'Super administrator',
      title: 'Super administrator',
      description: 'A Super Administrator is a special type of Administrator that can perform all actions, including closing the account. The creator of a business account is automatically assigned as a Super Administrator. Only a Super Administrator can assign the Super Administrator role to other team members.',
      users: 1,
      permissions: 32,
      permissionsList: ['Permission 1', 'Permission 2', 'Permission 3'],
    },
    {
      id: 'role-2',
      name: 'Account manager',
      title: 'Account manager',
      description: 'Description. Description. Description. Description. Description. Description. Description. Description. Description. Description. Description. Descri.',
      users: 3,
      permissions: 21,
      permissionsList: ['Permission 1', 'Permission 2', 'Permission 3'],
    },
    {
      id: 'role-3',
      name: 'Customer service',
      title: 'Customer service',
      description: 'Description. Description. Description. Description. Description. Description. Description. Description. Description. Description. Description. Descri.',
      users: 7,
      permissions: 12,
      permissionsList: ['Permission 1', 'Permission 2', 'Permission 3'],
    },
    {
      id: 'role-4',
      name: 'Admin',
      title: 'Admin',
      description: 'Description. Description. Description. Description. Description. Description. Description. Description. Description. Description. Description. Descri.',
      users: 2,
      permissions: 28,
      permissionsList: ['Permission 1', 'Permission 2', 'Permission 3'],
    },
    {
      id: 'role-5',
      name: 'Operations lead',
      title: 'Operations lead',
      description: 'Description. Description. Description. Description. Description. Description. Description. Description. Description. Description. Description. Descri.',
      users: 4,
      permissions: 18,
      permissionsList: ['Permission 1', 'Permission 2', 'Permission 3'],
    },
  ]);

  readonly teamMembers = signal<TeamMemberRecord[]>([
    {
      id: 'team-1',
      firstName: 'Bryan',
      lastName: 'Odjede',
      userName: 'Bryan Odjede',
      email: 'bryan@email.com',
      phoneNumber: '+234 816 939 7454',
      avatar: '/assets/images/fashion_menswear_hero.png',
      role: 'Super administrator',
      lastSignedIn: '02 Jan, 2026',
      status: 'active',
      isCurrentUser: true,
    },
    {
      id: 'team-2',
      firstName: 'Mark',
      lastName: 'Anthony',
      userName: 'Mark Anthony',
      email: 'mark@email.com',
      phoneNumber: '+234 816 939 7454',
      avatar: '/assets/images/product_watch_luxury.png',
      role: 'Account manager',
      lastSignedIn: '02 Jan, 2026',
      status: 'inactive',
    },
    {
      id: 'team-3',
      firstName: 'Elle',
      lastName: 'Adebisi',
      userName: 'Elle Adebisi',
      email: 'elle@email.com',
      phoneNumber: '+234 816 939 7454',
      avatar: '/assets/images/product_sneakers_lifestyle.png',
      role: 'Customer service',
      lastSignedIn: '02 Jan, 2026',
      status: 'pending activation',
    },
    {
      id: 'team-4',
      firstName: 'David',
      lastName: 'Akins',
      userName: 'David Akins',
      email: 'david@email.com',
      phoneNumber: '+234 816 939 7454',
      avatar: '/assets/images/product_keyboard_rgb.png',
      role: 'Operations lead',
      lastSignedIn: '01 Jan, 2026',
      status: 'active',
    },
    {
      id: 'team-5',
      firstName: 'Titi',
      lastName: 'Ogunlesi',
      userName: 'Titi Ogunlesi',
      email: 'titi@email.com',
      phoneNumber: '+234 816 939 7454',
      avatar: '/assets/images/product_sneakers_lifestyle.png',
      role: 'Support supervisor',
      lastSignedIn: '29 Dec, 2025',
      status: 'active',
    },
  ]);

  readonly filteredUsers = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();

    return this.teamMembers().filter((record) =>
      query === ''
      || record.userName.toLowerCase().includes(query)
      || record.email.toLowerCase().includes(query)
      || record.role.toLowerCase().includes(query)
      || record.status.toLowerCase().includes(query)
    );
  });

  readonly filteredRoles = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();

    return this.teamRoles().filter((role) =>
      query === ''
      || role.name.toLowerCase().includes(query)
      || role.description.toLowerCase().includes(query)
      || role.users.toString().includes(query)
      || role.permissions.toString().includes(query)
    );
  });

  readonly totalPages = computed(() => {
    const totalItems = this.activeTab() === 'users' ? this.filteredUsers().length : this.filteredRoles().length;
    return Math.max(1, Math.ceil(totalItems / this.pageSize));
  });

  readonly paginatedUsers = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredUsers().slice(start, start + this.pageSize);
  });

  readonly paginatedRoles = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredRoles().slice(start, start + this.pageSize);
  });

  setActiveTab(tab: TeamManagementTab): void {
    this.activeTab.set(tab);
    this.searchQuery.set('');
    this.currentPage.set(1);
  }

  updateSearchQuery(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.currentPage.set(1);
  }

  goToPreviousPage(): void {
    this.currentPage.update((page) => Math.max(1, page - 1));
  }

  goToNextPage(): void {
    this.currentPage.update((page) => Math.min(this.totalPages(), page + 1));
  }

  addUser(payload: NewTeamUserPayload): void {
    const userName = `${payload.firstName} ${payload.lastName}`.trim();

    this.teamMembers.update((current) => [
      {
        id: `team-${current.length + 1}`,
        firstName: payload.firstName,
        lastName: payload.lastName,
        userName,
        email: payload.email,
        phoneNumber: payload.phoneNumber,
        avatar: '/assets/images/product_sneakers_lifestyle.png',
        role: this.availableRoles.find((role) => role.id === payload.role)?.label ?? payload.role,
        lastSignedIn: 'Pending',
        status: 'pending activation',
      },
      ...current,
    ]);

    this.isAddUserModalOpen.set(false);
    this.currentPage.set(1);
  }

  createRole(payload: CreateTeamRolePayload): void {
    this.teamRoles.update((current) => [
      {
        id: `role-${current.length + 1}`,
        name: payload.title,
        title: payload.title,
        description: payload.description,
        users: 0,
        permissions: payload.permissionsList.length,
        permissionsList: payload.permissionsList,
      },
      ...current,
    ]);

    this.isCreateRoleModalOpen.set(false);
    this.isCreateRoleSuccessModalOpen.set(true);
    this.currentPage.set(1);
  }

  openCreateAnotherRole(): void {
    this.isCreateRoleSuccessModalOpen.set(false);
    this.isCreateRoleModalOpen.set(true);
  }

  closeCreateRoleSuccessModal(): void {
    this.isCreateRoleSuccessModalOpen.set(false);
  }

  openMemberDetails(record: TeamMemberRecord): void {
    this.selectedMember.set({ ...record });
  }

  openRoleDetails(role: TeamRoleRecord): void {
    this.selectedRole.set({ ...role });
  }

  saveMemberChanges(payload: TeamMemberUpdatePayload): void {
    const nextRole = this.availableRoles.find((role) => role.id === payload.role)?.label ?? payload.role;

    this.teamMembers.update((current) =>
      current.map((member) =>
        member.id === payload.id
          ? {
              ...member,
              role: nextRole,
            }
          : member,
      ),
    );

    this.selectedMember.update((member) =>
      member?.id === payload.id
        ? {
            ...member,
            role: nextRole,
          }
        : member,
    );
  }

  deactivateMember(memberId: string): void {
    this.teamMembers.update((current) =>
      current.map((member) =>
        member.id === memberId
          ? {
              ...member,
              status: 'inactive',
            }
          : member,
      ),
    );

    this.selectedMember.update((member) =>
      member?.id === memberId
        ? {
            ...member,
            status: 'inactive',
          }
        : member,
    );
  }

  openDeactivateUserModal(memberId: string): void {
    this.deactivateMemberId.set(memberId);
  }

  confirmDeactivateMember(): void {
    const memberId = this.deactivateMemberId();

    if (!memberId) {
      return;
    }

    this.deactivateMember(memberId);
    this.deactivateMemberId.set(null);
  }

  activateMember(memberId: string): void {
    this.teamMembers.update((current) =>
      current.map((member) =>
        member.id === memberId
          ? {
              ...member,
              status: 'active',
            }
          : member,
      ),
    );

    this.selectedMember.update((member) =>
      member?.id === memberId
        ? {
            ...member,
            status: 'active',
          }
        : member,
    );
  }

  openActivateUserModal(memberId: string): void {
    this.activateMemberId.set(memberId);
  }

  confirmActivateMember(): void {
    const memberId = this.activateMemberId();

    if (!memberId) {
      return;
    }

    this.activateMember(memberId);
    this.activateMemberId.set(null);
  }

  resendInvite(memberId: string): void {
    this.selectedMember.update((member) =>
      member?.id === memberId
        ? {
            ...member,
          }
        : member,
    );
  }

  openDeleteUserModal(memberId: string): void {
    this.deleteMemberId.set(memberId);
  }

  confirmDeleteMember(): void {
    const memberId = this.deleteMemberId();
    if (!memberId) {
      return;
    }

    this.deleteMember(memberId);
    this.deleteMemberId.set(null);
  }

  deleteMember(memberId: string): void {
    this.teamMembers.update((current) => current.filter((member) => member.id !== memberId));
    this.selectedMember.set(null);
    this.currentPage.set(1);
  }

  statusLabel(status: TeamMemberStatus): string {
    switch (status) {
      case 'active':
        return 'Active';
      case 'inactive':
        return 'Inactive';
      default:
        return 'Pending activation';
    }
  }

  statusIcon(status: TeamMemberStatus): 'heroCheckCircle' | 'heroXCircle' | 'heroUserCircle' {
    switch (status) {
      case 'active':
        return 'heroCheckCircle';
      case 'inactive':
        return 'heroXCircle';
      default:
        return 'heroUserCircle';
    }
  }
}
