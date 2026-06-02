import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
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
import { AdminAddTeamUserSuccessModalComponent } from './components/admin-add-team-user-success-modal.component';
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
import {
  AdminTeamManagementService,
  AdminTeamMemberRecord,
  AdminTeamMemberStatus,
  AdminTeamRoleRecord,
  CreateAdminRolePayload,
} from '../../services/admin-team-management.service';
import { AppToastService } from '../../services/app-toast.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

type TeamManagementTab = 'users' | 'roles';
type TeamMemberStatus = 'active' | 'inactive' | 'pending activation';

interface TeamMemberRecord {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  phoneNumber: string;
  avatar: string | null;
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
    RouterLink,
    NgIcon,
    AdminAddTeamUserModalComponent,
    AdminAddTeamUserSuccessModalComponent,
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
    <section class="bg-white px-5 pb-8 pt-[10px] lg:hidden">
      <div class="mx-auto max-w-[350px]">
        <div class="flex h-[54px] items-center">
          <a routerLink="/admin/more" class="flex items-center gap-2">
            <span
              class="inline-flex h-8 w-11 items-center justify-center rounded-full bg-[#F3F3F3]"
            >
              <ng-icon name="heroChevronLeft" class="text-[20px] text-black"></ng-icon>
            </span>
            <span class="text-[20px] font-semibold leading-[1.2] text-black">Team management</span>
          </a>
        </div>

        <div class="mt-6 border-b border-[#EAEAEA]">
          <div class="flex items-center">
            <button
              type="button"
              (click)="setActiveTab('users')"
              class="flex items-center gap-1 border-b-2 px-3 py-1 text-[16px] font-medium leading-6"
              [class.border-[#6453D9]]="activeTab() === 'users'"
              [class.text-[#6453D9]]="activeTab() === 'users'"
              [class.border-transparent]="activeTab() !== 'users'"
              [class.text-[#959595]]="activeTab() !== 'users'"
            >
              <ng-icon name="heroUsers" class="text-[16px]"></ng-icon>
              Users
            </button>

            <button
              type="button"
              (click)="setActiveTab('roles')"
              class="flex items-center gap-1 border-b-2 px-3 py-1 text-[16px] font-medium leading-6"
              [class.border-[#6453D9]]="activeTab() === 'roles'"
              [class.text-[#6453D9]]="activeTab() === 'roles'"
              [class.border-transparent]="activeTab() !== 'roles'"
              [class.text-[#959595]]="activeTab() !== 'roles'"
            >
              <ng-icon name="heroUserCircle" class="text-[16px]"></ng-icon>
              Roles
            </button>
          </div>
        </div>

        @if (activeTab() === 'users') {
          <section class="pt-6">
            <div class="flex items-center gap-5">
              <label
                class="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-full bg-[#FAFAFA] px-3 text-[#777777]"
              >
                <ng-icon name="heroMagnifyingGlass" class="text-[16px]"></ng-icon>
                <input
                  type="search"
                  [value]="searchQuery()"
                  (input)="updateSearchQuery($event)"
                  placeholder="Search"
                  class="min-w-0 flex-1 bg-transparent text-[14px] text-[#202020] outline-none placeholder:text-[#777777]"
                />
              </label>

              <div class="flex items-center gap-3">
                <button
                  type="button"
                  class="inline-flex h-6 w-6 items-center justify-center text-[#202020]"
                  aria-label="Export users"
                >
                  <ng-icon name="heroArrowUpTray" class="text-[22px]"></ng-icon>
                </button>

                <button
                  type="button"
                  (click)="openAddUserModal($event)"
                  class="inline-flex h-8 w-8 items-center justify-center text-[#202020]"
                  aria-label="Add user"
                >
                  <ng-icon name="heroPlus" class="text-[26px]"></ng-icon>
                </button>
              </div>
            </div>

            <div class="mt-4 flex flex-col">
              @for (record of paginatedUsers(); track record.id) {
                <button
                  type="button"
                  class="w-full border-b border-[#EBEBEB] py-3 text-left"
                  (click)="openMemberDetails(record)"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex min-w-0 items-center gap-2">
                      @if (record.avatar) {
                        <img
                          [src]="record.avatar"
                          [alt]="record.userName"
                          class="h-9 w-9 shrink-0 rounded-full object-cover"
                        />
                      } @else {
                        <span
                          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold text-[#1A1C21]"
                          [style.background]="avatarBackground(record.userName)"
                        >
                          {{ initials(record.userName) }}
                        </span>
                      }

                      <div class="min-w-0">
                        <div class="flex items-center gap-2">
                          <p class="truncate text-[14px] font-medium leading-5 text-[#0D0D0D]">
                            {{ record.userName }}
                          </p>
                          @if (record.isCurrentUser) {
                            <span
                              class="inline-flex h-[18px] items-center rounded-[8px] border border-[#D7D0FF] bg-[#6453D9]/5 px-2 text-[10px] font-medium leading-[15px] text-[#6453D9]"
                            >
                              You
                            </span>
                          }
                        </div>
                        <p class="truncate text-[12px] leading-4 text-[#8C8C8C]">
                          {{ record.email }}
                        </p>
                      </div>
                    </div>

                    <span
                      class="inline-flex h-6 items-center gap-1 rounded-[8px] px-2 py-1 text-[12px] font-semibold"
                      [class.bg-[#F3FBF9]]="record.status === 'active'"
                      [class.text-[#25AD32]]="record.status === 'active'"
                      [class.bg-[#FDF6FA]]="record.status === 'inactive'"
                      [class.text-[#FF2524]]="record.status === 'inactive'"
                      [class.bg-[#F9F9F9]]="record.status === 'pending activation'"
                      [class.text-[#EE9C2E]]="record.status === 'pending activation'"
                    >
                      <ng-icon [name]="statusIcon(record.status)" class="text-[14px]"></ng-icon>
                      {{ statusLabel(record.status) }}
                    </span>
                  </div>

                  <dl class="mt-4 flex flex-col gap-3">
                    <div class="flex items-center justify-between gap-4">
                      <dt class="text-[14px] leading-5 text-[#1A1B1D]/50">Role</dt>
                      <dd class="text-right text-[14px] font-medium leading-5 text-[#1A1B1D]">
                        {{ record.role }}
                      </dd>
                    </div>

                    <div class="flex items-center justify-between gap-4">
                      <dt class="text-[14px] leading-5 text-[#1A1B1D]/50">Last signed in</dt>
                      <dd class="text-right text-[14px] font-medium leading-5 text-[#1A1B1D]">
                        {{ mobileDateLabel(record.lastSignedIn) }}
                      </dd>
                    </div>
                  </dl>
                </button>
              }
            </div>
          </section>
        } @else {
          <section class="pt-6">
            <div class="flex items-center gap-5">
              <label
                class="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-full bg-[#FAFAFA] px-3 text-[#777777]"
              >
                <ng-icon name="heroMagnifyingGlass" class="text-[16px]"></ng-icon>
                <input
                  type="search"
                  [value]="searchQuery()"
                  (input)="updateSearchQuery($event)"
                  placeholder="Search"
                  class="min-w-0 flex-1 bg-transparent text-[14px] text-[#202020] outline-none placeholder:text-[#777777]"
                />
              </label>

              <button
                type="button"
                (click)="openCreateRoleModal($event)"
                class="inline-flex h-8 w-8 items-center justify-center text-[#202020]"
                aria-label="Create role"
              >
                <ng-icon name="heroPlus" class="text-[26px]"></ng-icon>
              </button>
            </div>

            <div class="mt-4 flex flex-col">
              @for (role of paginatedRoles(); track role.id) {
                <button
                  type="button"
                  class="w-full border-b border-[#EBEBEB] py-3 text-left"
                  (click)="openRoleDetails(role)"
                >
                  <h2 class="text-[16px] font-medium leading-6 text-[#1A1B1D]">{{ role.name }}</h2>

                  <dl class="mt-4 flex flex-col gap-3">
                    <div class="flex items-center justify-between gap-4">
                      <dt class="text-[14px] leading-5 text-[#1A1B1D]/50">Users</dt>
                      <dd class="text-right text-[14px] font-medium leading-5 text-[#1A1B1D]">
                        {{ role.users }}
                      </dd>
                    </div>

                    <div class="flex items-center justify-between gap-4">
                      <dt class="text-[14px] leading-5 text-[#1A1B1D]/50">Permissions</dt>
                      <dd class="text-right text-[14px] font-medium leading-5 text-[#1A1B1D]">
                        {{ role.permissions }}
                      </dd>
                    </div>
                  </dl>
                </button>
              }
            </div>
          </section>
        }
      </div>
    </section>

    <section class="hidden min-h-full rounded-[32px] bg-white lg:block">
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
            <div
              class="flex flex-col gap-4 border-b border-[#efefef] px-4 py-4 lg:flex-row lg:items-center lg:justify-between"
            >
              <label
                class="flex h-10 w-full items-center gap-2 rounded-full bg-[#fafafa] px-4 text-[#9c9c9c] lg:max-w-[226px]"
              >
                <ng-icon name="heroMagnifyingGlass" class="text-[16px]"></ng-icon>
                <input
                  type="search"
                  [value]="searchQuery()"
                  (input)="updateSearchQuery($event)"
                  placeholder="Search"
                  class="min-w-0 flex-1 bg-transparent text-[14px] text-[#202020] outline-none placeholder:text-[#9c9c9c]"
                />
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
                  (click)="openAddUserModal($event)"
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
                  <tr
                    class="border-b border-[#efefef] bg-[#fafafa] text-left text-[13px] font-medium text-[#7d7d7d]"
                  >
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
                          @if (record.avatar) {
                            <img
                              [src]="record.avatar"
                              [alt]="record.userName"
                              class="h-10 w-10 shrink-0 rounded-full object-cover"
                            />
                          } @else {
                            <span
                              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold text-[#1A1C21]"
                              [style.background]="avatarBackground(record.userName)"
                            >
                              {{ initials(record.userName) }}
                            </span>
                          }
                          <div class="min-w-0">
                            <div class="flex items-center gap-2">
                              <p class="truncate text-[15px] font-medium text-[#222222]">
                                {{ record.userName }}
                              </p>
                              @if (record.isCurrentUser) {
                                <span
                                  class="inline-flex rounded-full border border-[#d7d0ff] bg-[#f7f5ff] px-2 py-0.5 text-[12px] font-medium text-[#6653e4]"
                                >
                                  You
                                </span>
                              }
                            </div>
                            <p class="truncate text-[13px] text-[#8b8b8b]">{{ record.email }}</p>
                          </div>
                        </div>
                      </td>

                      <td class="px-4 py-4 text-[15px] text-[#303030]">{{ record.role }}</td>
                      <td class="px-4 py-4 text-[15px] text-[#303030]">
                        {{ record.lastSignedIn }}
                      </td>
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

          <div
            class="mt-6 flex flex-col gap-4 text-[15px] text-[#4d4d4d] sm:flex-row sm:items-center sm:justify-between"
          >
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

              <div
                class="flex h-9 min-w-10 items-center justify-center rounded-[10px] border border-[#ececec] px-3 text-[15px] text-[#707070]"
              >
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
            <div
              class="flex flex-col gap-4 border-b border-[#efefef] px-4 py-4 lg:flex-row lg:items-center lg:justify-between"
            >
              <label
                class="flex h-10 w-full items-center gap-2 rounded-full bg-[#fafafa] px-4 text-[#9c9c9c] lg:max-w-[226px]"
              >
                <ng-icon name="heroMagnifyingGlass" class="text-[16px]"></ng-icon>
                <input
                  type="search"
                  [value]="searchQuery()"
                  (input)="updateSearchQuery($event)"
                  placeholder="Search"
                  class="min-w-0 flex-1 bg-transparent text-[14px] text-[#202020] outline-none placeholder:text-[#9c9c9c]"
                />
              </label>

              <button
                type="button"
                (click)="openCreateRoleModal($event)"
                class="inline-flex h-11 items-center gap-2 self-end rounded-full bg-[#6653e4] px-5 text-[15px] font-medium text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)] transition hover:bg-[#5945db]"
              >
                <ng-icon name="heroPlus" class="text-[16px]"></ng-icon>
                Create role
              </button>
            </div>

            <div class="overflow-x-auto">
              <table class="min-w-[1040px] w-full table-fixed">
                <thead>
                  <tr
                    class="border-b border-[#efefef] bg-[#fafafa] text-left text-[13px] font-medium text-[#7d7d7d]"
                  >
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
                      <td class="px-4 py-5 text-[15px] font-medium text-[#303030]">
                        {{ role.name }}
                      </td>
                      <td class="px-4 py-5">
                        <p class="max-w-[420px] text-[15px] leading-6 text-[#6f6f6f]">
                          {{ role.description }}
                        </p>
                      </td>
                      <td class="px-4 py-5 text-[15px] text-[#303030]">{{ role.users }}</td>
                      <td class="px-4 py-5 text-[15px] text-[#303030]">{{ role.permissions }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </section>

          <div
            class="mt-6 flex flex-col gap-4 text-[15px] text-[#4d4d4d] sm:flex-row sm:items-center sm:justify-between"
          >
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

              <div
                class="flex h-9 min-w-10 items-center justify-center rounded-[10px] border border-[#ececec] px-3 text-[15px] text-[#707070]"
              >
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
    </section>

    @if (isAddUserModalOpen()) {
      <app-admin-add-team-user-modal
        [roles]="addUserRoles()"
        (close)="isAddUserModalOpen.set(false)"
        (submitUser)="addUser($event)"
      ></app-admin-add-team-user-modal>
    }

    @if (isAddUserSuccessModalOpen()) {
      <app-admin-add-team-user-success-modal
        (addAnother)="openAddAnotherUser()"
        (done)="closeAddUserSuccessModal()"
      ></app-admin-add-team-user-success-modal>
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
        [roles]="availableRoles()"
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
  `,
  host: {
    class: 'block h-full',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminTeamManagementPageComponent {
  private readonly teamService = inject(AdminTeamManagementService);
  private readonly toast = inject(AppToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly activeTab = signal<TeamManagementTab>('users');
  readonly searchQuery = signal('');
  readonly currentPage = signal(1);
  readonly pageSize = 5;
  readonly isAddUserModalOpen = signal(false);
  readonly isAddUserSuccessModalOpen = signal(false);
  readonly isCreateRoleModalOpen = signal(false);
  readonly isCreateRoleSuccessModalOpen = signal(false);
  readonly selectedMember = signal<TeamMemberDetails | null>(null);
  readonly selectedRole = signal<TeamRoleDetails | null>(null);
  readonly activateMemberId = signal<string | null>(null);
  readonly deactivateMemberId = signal<string | null>(null);
  readonly deleteMemberId = signal<string | null>(null);
  readonly teamRoles = signal<TeamRoleRecord[]>([]);
  readonly teamMembers = signal<TeamMemberRecord[]>([]);
  readonly totalResults = signal({ users: 0, roles: 0 });
  readonly availableRoles = computed<ReadonlyArray<TeamRoleOption>>(() =>
    this.teamRoles().map((role) => ({
      id: role.id,
      label: role.name,
      description: role.description || 'No description provided.',
    })),
  );
  readonly addUserRoles = this.availableRoles;
  readonly paginatedUsers = computed(() => this.teamMembers());
  readonly paginatedRoles = computed(() => this.teamRoles());
  readonly totalPages = computed(() => {
    const count =
      this.activeTab() === 'users' ? this.totalResults().users : this.totalResults().roles;
    return Math.max(1, Math.ceil(count / this.pageSize));
  });

  private readonly requestQuery = computed(() => ({
    tab: this.activeTab(),
    page: this.currentPage(),
    search: this.searchQuery().trim(),
  }));

  constructor() {
    toObservable(this.requestQuery)
      .pipe(
        debounceTime(150),
        distinctUntilChanged(
          (previous, current) => JSON.stringify(previous) === JSON.stringify(current),
        ),
        switchMap((query) =>
          query.tab === 'users'
            ? this.teamService.getTeamMembers({ page: query.page, search: query.search })
            : this.teamService.getRoles({ page: query.page, search: query.search }),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((response) => {
        if (this.activeTab() === 'users') {
          this.teamMembers.set(
            response.results.map((member) => this.mapTeamMember(member as AdminTeamMemberRecord)),
          );
          this.totalResults.update((current) => ({
            ...current,
            users: response.count ?? response.results.length,
          }));
          return;
        }

        this.teamRoles.set(
          response.results.map((role) => this.mapRole(role as AdminTeamRoleRecord)),
        );
        this.totalResults.update((current) => ({
          ...current,
          roles: response.count ?? response.results.length,
        }));
      });
  }

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
    this.teamService
      .addTeamMember({
        email: payload.email.trim(),
        first_name: payload.firstName.trim(),
        last_name: payload.lastName.trim(),
        phone_number: payload.phoneNumber.trim(),
        role: payload.role,
        status: 'pending_activation',
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isAddUserModalOpen.set(false);
          this.isAddUserSuccessModalOpen.set(true);
          this.currentPage.set(1);
          this.refreshUsers();
        },
        error: () => {
          this.toast.show({ message: 'We could not add that team member right now.' });
        },
      });
  }

  createRole(payload: CreateTeamRolePayload): void {
    const createPayload: CreateAdminRolePayload = {
      name: payload.title.trim(),
      role_type: 'analyst',
      description: payload.description.trim(),
      can_manage_users: this.hasAnyPermission(payload.permissionsList, 'Users'),
      can_manage_listings: this.hasAnyPermission(payload.permissionsList, 'Listings'),
      can_manage_transactions: this.hasTransactionPermission(payload.permissionsList),
      can_manage_kyc: this.hasAnyPermission(payload.permissionsList, 'KYC requests'),
      can_manage_reports: this.hasAnyPermission(payload.permissionsList, 'Reports'),
      can_view_analytics: this.hasAnyPermission(payload.permissionsList, 'Analytics'),
      can_manage_ads: this.hasAnyPermission(payload.permissionsList, 'Ads management'),
      can_manage_categories: payload.permissionsList.includes('Manage categories'),
      can_manage_team:
        this.hasAnyPermission(payload.permissionsList, 'Home') ||
        payload.permissionsList.includes('Invite users'),
    };

    this.teamService
      .createRole(createPayload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isCreateRoleModalOpen.set(false);
          this.isCreateRoleSuccessModalOpen.set(true);
          this.currentPage.set(1);
          this.refreshRoles();
        },
        error: () => {
          this.toast.show({ message: 'We could not create that role right now.' });
        },
      });
  }

  openCreateAnotherRole(): void {
    this.isCreateRoleSuccessModalOpen.set(false);
    this.isCreateRoleModalOpen.set(true);
  }

  openCreateRoleModal(event?: Event): void {
    event?.stopPropagation();
    this.isCreateRoleSuccessModalOpen.set(false);
    this.isCreateRoleModalOpen.set(true);
  }

  openAddUserModal(event?: Event): void {
    event?.stopPropagation();
    this.isAddUserSuccessModalOpen.set(false);
    this.isAddUserModalOpen.set(true);
  }

  openAddAnotherUser(): void {
    this.openAddUserModal();
  }

  closeAddUserSuccessModal(): void {
    this.isAddUserSuccessModalOpen.set(false);
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
    this.teamService
      .updateTeamMember(payload.id, { role: payload.role })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (member) => {
          const mapped = this.mapTeamMember(member);
          this.replaceMember(mapped);
          this.selectedMember.set({ ...mapped });
          this.toast.show({ message: 'Team member role updated successfully.' });
        },
        error: () => {
          this.toast.show({ message: 'We could not update that team member right now.' });
        },
      });
  }

  deactivateMember(memberId: string): void {
    this.teamService
      .updateTeamMember(memberId, { status: 'inactive' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (member) => {
          const mapped = this.mapTeamMember(member);
          this.replaceMember(mapped);
          this.selectedMember.set({ ...mapped });
          this.toast.show({ message: 'Team member deactivated successfully.' });
        },
        error: () => {
          this.toast.show({ message: 'We could not deactivate that team member right now.' });
        },
      });
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
    this.teamService
      .updateTeamMember(memberId, { status: 'active' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (member) => {
          const mapped = this.mapTeamMember(member);
          this.replaceMember(mapped);
          this.selectedMember.set({ ...mapped });
          this.toast.show({ message: 'Team member activated successfully.' });
        },
        error: () => {
          this.toast.show({ message: 'We could not activate that team member right now.' });
        },
      });
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
    this.teamService
      .resendInvite(memberId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.show({ message: 'Invite email sent successfully.' });
        },
        error: () => {
          this.toast.show({ message: 'We could not resend that invite right now.' });
        },
      });
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
    this.teamService
      .deleteTeamMember(memberId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.teamMembers.update((current) => current.filter((member) => member.id !== memberId));
          this.totalResults.update((current) => ({
            ...current,
            users: Math.max(0, current.users - 1),
          }));
          this.selectedMember.set(null);
          this.currentPage.set(1);
          this.toast.show({ message: 'Team member removed successfully.' });
        },
        error: () => {
          this.toast.show({ message: 'We could not remove that team member right now.' });
        },
      });
  }

  mobileDateLabel(date: string): string {
    return this.formatDate(date);
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

  initials(name: string): string {
    const parts = name
      .split(/\s+/)
      .map((part) => part.trim())
      .filter((part) => part.length > 0);

    if (parts.length === 0) {
      return 'NA';
    }

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  avatarBackground(seedValue: string): string {
    const palette = [
      'linear-gradient(135deg, #F6B14B 0%, #F28D28 100%)',
      'linear-gradient(135deg, #D6D9E0 0%, #AEB6C7 100%)',
      'linear-gradient(135deg, #E7D9CC 0%, #C3A38E 100%)',
      'linear-gradient(135deg, #BFE2FF 0%, #79B8FF 100%)',
      'linear-gradient(135deg, #D2F5D9 0%, #86D493 100%)',
    ];

    let hash = 0;
    for (const character of seedValue) {
      hash = (hash << 5) - hash + character.charCodeAt(0);
      hash |= 0;
    }

    return palette[Math.abs(hash) % palette.length];
  }

  private refreshUsers(): void {
    this.teamService
      .getTeamMembers({ page: this.currentPage(), search: this.searchQuery().trim() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        this.teamMembers.set(response.results.map((member) => this.mapTeamMember(member)));
        this.totalResults.update((current) => ({
          ...current,
          users: response.count ?? response.results.length,
        }));
      });
  }

  private refreshRoles(): void {
    this.teamService
      .getRoles({ page: this.currentPage(), search: this.searchQuery().trim() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        this.teamRoles.set(response.results.map((role) => this.mapRole(role)));
        this.totalResults.update((current) => ({
          ...current,
          roles: response.count ?? response.results.length,
        }));
      });
  }

  private replaceMember(nextMember: TeamMemberRecord): void {
    this.teamMembers.update((current) =>
      current.map((member) => (member.id === nextMember.id ? nextMember : member)),
    );
  }

  private mapTeamMember(member: AdminTeamMemberRecord): TeamMemberRecord {
    const userName = member.user_name?.trim() || member.user_email;
    const firstName = member.user_first_name?.trim() || this.nameParts(userName).firstName;
    const lastName = member.user_last_name?.trim() || this.nameParts(userName).lastName;

    return {
      id: member.id,
      firstName,
      lastName,
      userName,
      email: member.user_email,
      phoneNumber: member.user_phone_number?.trim() || '—',
      avatar: member.user_avatar,
      role: member.role_name,
      lastSignedIn: member.last_signed_in ? this.formatDate(member.last_signed_in) : 'Never',
      status: this.mapMemberStatus(member.status),
    };
  }

  private mapRole(role: AdminTeamRoleRecord): TeamRoleRecord {
    const permissionsList = this.permissionLabels(role);
    return {
      id: role.id,
      name: role.name,
      title: role.name,
      description: role.description || 'No description provided.',
      users: role.members_count,
      permissions: permissionsList.length,
      permissionsList,
    };
  }

  private mapMemberStatus(status: AdminTeamMemberStatus): TeamMemberStatus {
    switch (status) {
      case 'inactive':
        return 'inactive';
      case 'pending_activation':
        return 'pending activation';
      default:
        return 'active';
    }
  }

  private formatDate(value: string): string {
    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('en-NG', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(parsedDate);
  }

  private nameParts(name: string): { firstName: string; lastName: string } {
    const parts = name
      .split(/\s+/)
      .map((part) => part.trim())
      .filter((part) => part.length > 0);

    return {
      firstName: parts[0] ?? '—',
      lastName: parts.slice(1).join(' ') || '—',
    };
  }

  private permissionLabels(role: AdminTeamRoleRecord): string[] {
    const permissions: string[] = [];

    if (role.can_manage_users) {
      permissions.push('Manage users');
    }
    if (role.can_manage_listings) {
      permissions.push('Manage listings');
    }
    if (role.can_manage_transactions) {
      permissions.push('Manage transactions');
    }
    if (role.can_manage_kyc) {
      permissions.push('Manage KYC requests');
    }
    if (role.can_manage_reports) {
      permissions.push('Manage reports');
    }
    if (role.can_view_analytics) {
      permissions.push('View analytics');
    }
    if (role.can_manage_ads) {
      permissions.push('Manage ads');
    }
    if (role.can_manage_categories) {
      permissions.push('Manage categories');
    }
    if (role.can_manage_team) {
      permissions.push('Manage team');
    }

    return permissions;
  }

  private hasAnyPermission(permissions: readonly string[], sectionLabel: string): boolean {
    return permissions.some(
      (permission) => this.permissionSectionLabel(permission) === sectionLabel,
    );
  }

  private hasTransactionPermission(permissions: readonly string[]): boolean {
    return permissions.some(
      (permission) =>
        permission.toLowerCase().includes('transaction') ||
        permission.toLowerCase().includes('export transactions'),
    );
  }

  private permissionSectionLabel(permission: string): string {
    const sectionMap: Record<string, string> = {
      'See quick links': 'Home',
      'Manage dashboard widgets': 'Home',
      'View overview stats': 'Home',
      'View users': 'Users',
      'Suspend users': 'Users',
      'Edit users': 'Users',
      'View KYC status': 'Users',
      'Approve users': 'Users',
      'Export users': 'Users',
      'Delete users': 'Users',
      'Reset passwords': 'Users',
      'Invite users': 'Users',
      'View listings': 'Listings',
      'Edit listings': 'Listings',
      'Delete listings': 'Listings',
      'Feature listings': 'Listings',
      'Moderate listings': 'Listings',
      'Approve listings': 'Listings',
      'Reject listings': 'Listings',
      'Export listings': 'Listings',
      'View stores': 'Stores',
      'Edit stores': 'Stores',
      'Approve stores': 'Stores',
      'Suspend stores': 'Stores',
      'Delete stores': 'Stores',
      'Export stores': 'Stores',
      'Manage categories': 'Stores',
      'Manage store banners': 'Stores',
      'View store reports': 'Stores',
      'View ad plans': 'Ads management',
      'Edit ad plans': 'Ads management',
      'Approve banners': 'Ads management',
      'Reject banners': 'Ads management',
      'View transactions': 'Ads management',
      'Manage running ads': 'Ads management',
      'Pause ads': 'Ads management',
      'Resume ads': 'Ads management',
      'Export transactions': 'Ads management',
      'View KYC requests': 'KYC requests',
      'Approve KYC': 'KYC requests',
      'Decline KYC': 'KYC requests',
      'View uploaded documents': 'KYC requests',
      'Export KYC data': 'KYC requests',
      'Filter requests': 'KYC requests',
      'Search requests': 'KYC requests',
      'Audit KYC actions': 'KYC requests',
      'Reopen KYC cases': 'KYC requests',
      'View seller reports': 'Reports',
      'View listing reports': 'Reports',
      'Resolve reports': 'Reports',
      'Escalate reports': 'Reports',
      'Archive reports': 'Reports',
      'Export reports': 'Reports',
      'Filter reports': 'Reports',
      'Search reports': 'Reports',
      'Delete reports': 'Reports',
      'View overview analytics': 'Analytics',
      'View user analytics': 'Analytics',
      'View listing analytics': 'Analytics',
      'View revenue charts': 'Analytics',
      'Export analytics': 'Analytics',
      'Filter by date': 'Analytics',
      'Compare trends': 'Analytics',
      'View top regions': 'Analytics',
      'View conversion metrics': 'Analytics',
    };

    return sectionMap[permission] ?? '';
  }
}
