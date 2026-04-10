import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroChevronDown,
  heroChevronLeft,
  heroChevronRight,
  heroMagnifyingGlass,
} from '@ng-icons/heroicons/outline';

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
  imports: [NgIcon, NgOptimizedImage],
  providers: [
    provideIcons({
      heroChevronDown,
      heroChevronLeft,
      heroChevronRight,
      heroMagnifyingGlass,
    }),
  ],
  template: `
    <section class="min-h-full rounded-[32px] bg-white">
      <header class="border-b border-[#efefef] px-8 py-6">
        <h1 class="text-[2rem] font-semibold tracking-[-0.04em] text-[#202020]">Audit log</h1>
      </header>

      <div class="px-4 py-6 sm:px-6 lg:px-8">
        <section class="overflow-hidden rounded-[20px] border border-[#e9e9e9] bg-white">
          <div class="flex flex-col gap-4 border-b border-[#efefef] px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div class="flex flex-wrap items-center gap-3">
              <button
                type="button"
                class="inline-flex h-10 items-center gap-2 rounded-full border border-[#e8e8e8] bg-white px-4 text-[14px] text-[#8a8a8a]"
              >
                <span>Activity type</span>
                <ng-icon name="heroChevronDown" class="text-[16px]"></ng-icon>
              </button>

              <button
                type="button"
                class="inline-flex h-10 items-center gap-2 rounded-full border border-[#e8e8e8] bg-white px-4 text-[14px] text-[#8a8a8a]"
              >
                <span>Date</span>
                <ng-icon name="heroChevronDown" class="text-[16px]"></ng-icon>
              </button>
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
    const query = this.searchQuery().trim().toLowerCase();

    return this.logs().filter((record) =>
      query === ''
      || record.userName.toLowerCase().includes(query)
      || record.email.toLowerCase().includes(query)
      || record.activityType.toLowerCase().includes(query)
      || record.activityDescription.toLowerCase().includes(query)
      || record.ipAddress.toLowerCase().includes(query)
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
}
