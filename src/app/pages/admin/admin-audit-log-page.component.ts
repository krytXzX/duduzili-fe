import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { CustomDropdownComponent, type CustomDropdownOption } from '../../components/ui/custom-dropdown.component';
import {
  heroAdjustmentsHorizontal,
  heroArrowLeft,
  heroChevronDown,
  heroChevronLeft,
  heroChevronRight,
  heroMagnifyingGlass,
} from '@ng-icons/heroicons/outline';

type AuditActivityFilter = 'all' | 'login' | 'logout' | 'sign-up' | 'password-reset' | 'profile-update';
type AuditDateFilter = 'all' | 'may-2024';

interface AuditLogRecord {
  id: string;
  userName: string;
  email: string;
  avatar: string;
  activityType: string;
  activityDescription: string;
  ipAddress: string;
  date: string;
}

@Component({
  selector: 'app-admin-audit-log-page',
  imports: [RouterLink, NgIcon, NgOptimizedImage, CustomDropdownComponent],
  providers: [
    provideIcons({
      heroAdjustmentsHorizontal,
      heroArrowLeft,
      heroChevronDown,
      heroChevronLeft,
      heroChevronRight,
      heroMagnifyingGlass,
    }),
  ],
  template: `
    <section class="bg-white px-4 pb-8 pt-[10px] lg:hidden">
      <div class="mx-auto max-w-[358px]">
        <div class="flex h-[54px] items-center">
          <a routerLink="/admin/more" class="flex items-center gap-2">
            <span class="inline-flex h-8 w-11 items-center justify-center rounded-full bg-[#F3F3F3]">
              <ng-icon name="heroArrowLeft" class="text-[20px] text-black"></ng-icon>
            </span>
            <span class="text-[20px] font-semibold leading-[1.2] text-black">Audit log</span>
          </a>
        </div>

        <div class="mt-6 flex items-center gap-3">
          <label class="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-full bg-[#FAFAFA] px-3 text-[#777777]">
            <ng-icon name="heroMagnifyingGlass" class="text-[16px]"></ng-icon>
            <input
              type="search"
              [value]="searchQuery()"
              (input)="updateSearchQuery($event)"
              placeholder="Search"
              class="min-w-0 flex-1 bg-transparent text-[14px] text-[#141414] outline-none placeholder:text-[#777777]"
            >
          </label>

          <button
            type="button"
            class="inline-flex h-6 w-6 items-center justify-center text-[#141414]"
            aria-label="Filter audit logs"
          >
            <ng-icon name="heroAdjustmentsHorizontal" class="text-[20px]"></ng-icon>
          </button>
        </div>

        <div class="mt-6 flex flex-col">
          @for (record of paginatedLogs(); track record.id) {
            <article class="border-b border-[#EBEBEB] py-3">
              <div class="flex items-start justify-between gap-3">
                <div class="flex min-w-0 items-center gap-2">
                  <div class="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#F3F3F3]">
                    <img
                      [ngSrc]="record.avatar"
                      [alt]="record.userName"
                      width="40"
                      height="40"
                      class="h-10 w-10 rounded-full object-cover"
                    >
                  </div>
                  <div class="min-w-0">
                    <p class="truncate text-[14px] font-medium leading-5 text-[#0D0D0D]">{{ record.userName }}</p>
                    <p class="truncate text-[12px] leading-4 text-[#8C8C8C]">{{ record.email }}</p>
                  </div>
                </div>
                <p class="shrink-0 text-[14px] leading-5 text-[#1A1B1D]/50">{{ mobileDateLabel(record.date) }}</p>
              </div>

              <dl class="mt-4 flex flex-col gap-3">
                <div class="flex items-center justify-between gap-4">
                  <dt class="text-[14px] leading-5 text-[#1A1B1D]/50">Activity type</dt>
                  <dd class="text-right text-[14px] font-medium leading-5 text-[#1A1B1D]">{{ record.activityType }}</dd>
                </div>

                <div class="flex items-center justify-between gap-4">
                  <dt class="text-[14px] leading-5 text-[#1A1B1D]/50">Activity description</dt>
                  <dd class="text-right text-[14px] font-medium leading-5 text-[#1A1B1D]">{{ record.activityDescription }}</dd>
                </div>

                <div class="flex items-center justify-between gap-4">
                  <dt class="text-[14px] leading-5 text-[#1A1B1D]/50">IP address</dt>
                  <dd class="text-right text-[14px] font-medium leading-5 text-[#1A1B1D]">{{ record.ipAddress }}</dd>
                </div>
              </dl>
            </article>
          }
        </div>
      </div>
    </section>

    <section class="hidden min-h-full rounded-[32px] bg-white lg:block">
      <header class="border-b border-[#efefef] px-8 py-6">
        <h1 class="text-[2rem] font-semibold tracking-[-0.04em] text-[#202020]">Audit log</h1>
      </header>

      <div class="px-4 py-6 sm:px-6 lg:px-8">
        <section class="overflow-hidden rounded-[20px] border border-[#e9e9e9] bg-white">
          <div class="flex flex-col gap-4 border-b border-[#efefef] px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div class="flex flex-wrap items-center gap-3">
              <app-custom-dropdown
                [options]="activityTypeOptions"
                [value]="activityTypeFilter()"
                ariaLabel="Select activity type"
                buttonClass="inline-flex h-10 items-center gap-2 rounded-full border border-[#e8e8e8] bg-white px-4 text-[14px] text-[#8a8a8a]"
                iconClass="text-[#8a8a8a]"
                menuClass="min-w-[190px]"
                (valueChange)="activityTypeFilter.set($event); currentPage.set(1)"
              ></app-custom-dropdown>

              <app-custom-dropdown
                [options]="dateOptions"
                [value]="dateFilter()"
                ariaLabel="Select date"
                buttonClass="inline-flex h-10 items-center gap-2 rounded-full border border-[#e8e8e8] bg-white px-4 text-[14px] text-[#8a8a8a]"
                iconClass="text-[#8a8a8a]"
                menuClass="min-w-[150px]"
                (valueChange)="dateFilter.set($event); currentPage.set(1)"
              ></app-custom-dropdown>
            </div>

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
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-[1060px] w-full table-fixed">
              <thead>
                <tr class="border-b border-[#efefef] bg-[#fafafa] text-left text-[13px] font-medium text-[#7d7d7d]">
                  <th class="w-[260px] px-4 py-3 font-medium">User</th>
                  <th class="w-[190px] px-4 py-3 font-medium">Activity type</th>
                  <th class="w-[260px] px-4 py-3 font-medium">Activity description</th>
                  <th class="w-[180px] px-4 py-3 font-medium">IP address</th>
                  <th class="w-[170px] px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>

              <tbody>
                @for (record of paginatedLogs(); track record.id) {
                  <tr class="border-b border-[#efefef] last:border-b-0">
                    <td class="px-4 py-4">
                      <div class="flex items-center gap-3">
                        <div class="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#f3f3f3]">
                          <img
                            [ngSrc]="record.avatar"
                            [alt]="record.userName"
                            width="36"
                            height="36"
                            class="h-9 w-9 object-cover"
                          >
                        </div>
                        <div class="min-w-0">
                          <p class="truncate text-[15px] font-medium text-[#222222]">{{ record.userName }}</p>
                          <p class="truncate text-[13px] text-[#8b8b8b]">{{ record.email }}</p>
                        </div>
                      </div>
                    </td>

                    <td class="px-4 py-4 text-[15px] text-[#303030]">{{ record.activityType }}</td>
                    <td class="px-4 py-4 text-[15px] text-[#303030]">{{ record.activityDescription }}</td>
                    <td class="px-4 py-4 text-[15px] text-[#303030]">{{ record.ipAddress }}</td>
                    <td class="px-4 py-4 text-[15px] text-[#303030]">{{ record.date }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>

        <div class="mt-6 flex flex-col gap-4 text-[15px] text-[#4d4d4d] sm:flex-row sm:items-center sm:justify-between">
          <p>{{ paginatedLogs().length }} results</p>

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
      </div>
    </section>
  `,
  host: {
    class: 'block h-full',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAuditLogPageComponent {
  readonly activityTypeOptions: readonly CustomDropdownOption<AuditActivityFilter>[] = [
    { value: 'all', label: 'All activities' },
    { value: 'login', label: 'Login' },
    { value: 'logout', label: 'Logout' },
    { value: 'sign-up', label: 'Sign up' },
    { value: 'password-reset', label: 'Password reset' },
    { value: 'profile-update', label: 'Profile update' },
  ];
  readonly dateOptions: readonly CustomDropdownOption<AuditDateFilter>[] = [
    { value: 'all', label: 'All dates' },
    { value: 'may-2024', label: 'May 2024' },
  ];
  readonly activityTypeFilter = signal<AuditActivityFilter>('all');
  readonly dateFilter = signal<AuditDateFilter>('all');
  readonly searchQuery = signal('');
  readonly currentPage = signal(1);
  readonly pageSize = 5;

  readonly logs = signal<AuditLogRecord[]>([
    {
      id: 'audit-1',
      userName: 'Francis Uche',
      email: 'uche@email.com',
      avatar: '/assets/images/fashion_menswear_hero.png',
      activityType: 'Login',
      activityDescription: 'User logged in',
      ipAddress: '192.168.1.1',
      date: '06 May, 2024',
    },
    {
      id: 'audit-2',
      userName: 'Mark Anthony',
      email: 'mark@email.com',
      avatar: '/assets/images/product_watch_luxury.png',
      activityType: 'Logout',
      activityDescription: 'User logged out',
      ipAddress: '192.168.1.1',
      date: '06 May, 2024',
    },
    {
      id: 'audit-3',
      userName: 'Elle Adebisi',
      email: 'elle@email.com',
      avatar: '/assets/images/product_sneakers_lifestyle.png',
      activityType: 'Sign up',
      activityDescription: 'User signed up',
      ipAddress: '192.168.1.1',
      date: '06 May, 2024',
    },
    {
      id: 'audit-4',
      userName: 'Bryan Odjede',
      email: 'bryan@email.com',
      avatar: '/assets/images/fashion_menswear_hero.png',
      activityType: 'Password reset',
      activityDescription: 'User changed password',
      ipAddress: '192.168.1.1',
      date: '06 May, 2024',
    },
    {
      id: 'audit-5',
      userName: 'David Akins',
      email: 'david@email.com',
      avatar: '/assets/images/product_keyboard_rgb.png',
      activityType: 'Profile update',
      activityDescription: 'User updated profile',
      ipAddress: '192.168.1.1',
      date: '06 May, 2024',
    },
  ]);

  readonly filteredLogs = computed(() => {
    const activityType = this.activityTypeFilter();
    const date = this.dateFilter();
    const query = this.searchQuery().trim().toLowerCase();

    return this.logs().filter((record) =>
      (query === ''
      || record.userName.toLowerCase().includes(query)
      || record.email.toLowerCase().includes(query)
      || record.activityType.toLowerCase().includes(query)
      || record.activityDescription.toLowerCase().includes(query)
      || record.ipAddress.toLowerCase().includes(query))
      && (activityType === 'all' || this.activityTypeKey(record.activityType) === activityType)
      && (date === 'all' || record.date.toLowerCase().includes('may'))
    );
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filteredLogs().length / this.pageSize)));

  readonly paginatedLogs = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredLogs().slice(start, start + this.pageSize);
  });

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

  mobileDateLabel(date: string): string {
    return date.replace(/^(\d{2})\s+([A-Za-z]+),\s+(\d{4})$/, '$2 $1,$3');
  }

  private activityTypeKey(activityType: string): AuditActivityFilter {
    const normalized = activityType.toLowerCase();

    switch (normalized) {
      case 'login':
        return 'login';
      case 'logout':
        return 'logout';
      case 'sign up':
        return 'sign-up';
      case 'password reset':
        return 'password-reset';
      default:
        return 'profile-update';
    }
  }
}
