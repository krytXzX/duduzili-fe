import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroChevronDown,
  heroChevronLeft,
  heroChevronRight,
  heroMagnifyingGlass,
} from '@ng-icons/heroicons/outline';

type UserStatus = 'active' | 'suspended';
type VerificationStatus = 'verified' | 'request-sent' | 'not-verified';
type UserCategoryFilter = 'all' | 'buyers' | 'sellers';
type UserStoreFilter = 'all' | 'with-store' | 'without-store';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  initials: string;
  avatarBackground: string;
  phoneNumber: string;
  verification: VerificationStatus;
  lastSignedIn: string;
  dateJoined: string;
  status: UserStatus;
  category: UserCategoryFilter;
  hasStore: boolean;
}

@Component({
  selector: 'app-admin-users-page',
  imports: [NgIcon],
  providers: [
    provideIcons({
      heroChevronDown,
      heroChevronLeft,
      heroChevronRight,
      heroMagnifyingGlass,
    }),
  ],
  template: `
    <div class="flex h-full flex-col rounded-[24px] border border-gray-100/60 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] sm:rounded-[32px]">
      <div class="border-b border-[#F0F0F2] px-5 py-5 sm:px-8 sm:py-6">
        <h1 class="text-[20px] font-semibold tracking-[-0.03em] text-[#1A1C21]">Users</h1>
      </div>

      <div class="flex flex-1 flex-col px-4 py-5 sm:px-8 sm:py-6">
        <div class="grid gap-3 lg:grid-cols-3">
          @for (card of summaryCards; track card.id) {
            <button
              type="button"
              (click)="activeSummary.set(card.id)"
              class="rounded-[18px] border bg-[#FAFAFB] px-6 py-4 text-left transition"
              [class.border-[#6B5CF0]]="activeSummary() === card.id"
              [class.bg-[#F8F7FF]]="activeSummary() === card.id"
              [class.border-[#F0F1F4]]="activeSummary() !== card.id"
            >
              <p class="text-[14px] font-medium text-[#8C9099]">{{ card.label }}</p>
              <p class="mt-2 text-[26px] font-semibold tracking-[-0.03em] text-[#2A2D34]">{{ card.value }}</p>
            </button>
          }
        </div>

        <div class="mt-6 flex flex-1 flex-col overflow-hidden rounded-[26px] border border-[#ECEEF3] bg-white">
          <div class="flex flex-col gap-4 border-b border-[#F1F2F4] px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div class="flex flex-wrap gap-3">
              <button
                type="button"
                (click)="cycleCategoryFilter()"
                class="inline-flex items-center gap-2 rounded-full border border-[#E8EAF0] bg-white px-4 py-2.5 text-[13px] font-medium text-[#80858F]"
              >
                {{ categoryFilterLabel() }}
                <ng-icon name="heroChevronDown" class="text-sm"></ng-icon>
              </button>

              <button
                type="button"
                (click)="cycleStoreFilter()"
                class="inline-flex items-center gap-2 rounded-full border border-[#E8EAF0] bg-white px-4 py-2.5 text-[13px] font-medium text-[#80858F]"
              >
                {{ storeFilterLabel() }}
                <ng-icon name="heroChevronDown" class="text-sm"></ng-icon>
              </button>

              <button
                type="button"
                (click)="cycleStatusFilter()"
                class="inline-flex items-center gap-2 rounded-full border border-[#E8EAF0] bg-white px-4 py-2.5 text-[13px] font-medium text-[#80858F]"
              >
                {{ statusFilterLabel() }}
                <ng-icon name="heroChevronDown" class="text-sm"></ng-icon>
              </button>
            </div>

            <label class="relative block w-full lg:max-w-[250px]">
              <ng-icon
                name="heroMagnifyingGlass"
                class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#A2A7B0]"
              ></ng-icon>
              <input
                type="text"
                [value]="searchQuery()"
                (input)="updateSearchQuery($any($event.target).value)"
                placeholder="Search"
                class="w-full rounded-full bg-[#FAFAFB] py-3 pl-11 pr-4 text-[14px] font-medium text-[#2A2D34] outline-none placeholder:text-[#B5BAC4] focus:ring-2 focus:ring-[#6B5CF0]/10"
              >
            </label>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full min-w-[980px]">
              <thead class="border-b border-[#F1F2F4] bg-[#FAFAFB] text-left">
                <tr class="text-[12px] font-semibold text-[#9AA0AA]">
                  <th class="px-8 py-4">Name</th>
                  <th class="px-4 py-4">Phone number</th>
                  <th class="px-4 py-4">Identity verification</th>
                  <th class="px-4 py-4">Last signed in</th>
                  <th class="px-4 py-4">Date joined</th>
                  <th class="px-4 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                @for (user of visibleUsers(); track user.id) {
                  <tr
                    class="cursor-pointer border-b border-[#F4F5F7] transition hover:bg-[#FAFAFC] last:border-b-0"
                    (click)="openUser(user.id)"
                  >
                    <td class="px-8 py-5">
                      <div class="flex items-center gap-3">
                        <span
                          class="flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-semibold text-[#1A1C21]"
                          [style.background]="user.avatarBackground"
                        >
                          {{ user.initials }}
                        </span>
                        <div>
                          <p class="text-[14px] font-semibold text-[#2A2D34]">{{ user.name }}</p>
                          <p class="mt-0.5 text-[13px] font-medium text-[#8E9199]">{{ user.email }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-5 text-[14px] font-medium text-[#555A64]">{{ user.phoneNumber }}</td>
                    <td class="px-4 py-5">
                      <span
                        class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold"
                        [class.bg-[#EDF9EF]]="user.verification === 'verified'"
                        [class.text-[#2FB04A]]="user.verification === 'verified'"
                        [class.bg-[#FFF5E8]]="user.verification === 'request-sent'"
                        [class.text-[#FF9800]]="user.verification === 'request-sent'"
                        [class.bg-[#FFF0F0]]="user.verification === 'not-verified'"
                        [class.text-[#FF4B4B]]="user.verification === 'not-verified'"
                      >
                        <span
                          class="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] font-bold text-white"
                          [class.bg-[#2FB04A]]="user.verification === 'verified'"
                          [class.bg-[#FF9800]]="user.verification === 'request-sent'"
                          [class.bg-[#FF4B4B]]="user.verification === 'not-verified'"
                        >
                          {{ verificationMark(user.verification) }}
                        </span>
                        {{ verificationLabel(user.verification) }}
                      </span>
                    </td>
                    <td class="px-4 py-5 text-[14px] font-medium text-[#555A64]">{{ user.lastSignedIn }}</td>
                    <td class="px-4 py-5 text-[14px] font-medium text-[#555A64]">{{ user.dateJoined }}</td>
                    <td class="px-4 py-5">
                      <span
                        class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold"
                        [class.bg-[#EDF9EF]]="user.status === 'active'"
                        [class.text-[#2FB04A]]="user.status === 'active'"
                        [class.bg-[#FFF0F0]]="user.status === 'suspended'"
                        [class.text-[#FF4B4B]]="user.status === 'suspended'"
                      >
                        <span
                          class="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] font-bold text-white"
                          [class.bg-[#2FB04A]]="user.status === 'active'"
                          [class.bg-[#FF4B4B]]="user.status === 'suspended'"
                        >
                          {{ user.status === 'active' ? '✓' : '!' }}
                        </span>
                        {{ user.status === 'active' ? 'Active' : 'Suspended' }}
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="mt-auto flex flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <p class="text-[14px] font-semibold text-[#646A73]">{{ visibleUsers().length }} results</p>

            <div class="flex items-center gap-2 self-end text-[14px] font-medium text-[#B2B7C0]">
              <button
                type="button"
                class="flex h-8 w-8 items-center justify-center rounded-[10px] border border-[#ECEEF3] bg-white transition hover:bg-[#FAFAFC]"
              >
                <ng-icon name="heroChevronLeft" class="text-sm"></ng-icon>
              </button>
              <span class="flex h-8 min-w-8 items-center justify-center rounded-[10px] border border-[#ECEEF3] bg-white px-3 text-[#7A808A]">
                1
              </span>
              <button
                type="button"
                class="flex h-8 w-8 items-center justify-center rounded-[10px] border border-[#ECEEF3] bg-white transition hover:bg-[#FAFAFC]"
              >
                <ng-icon name="heroChevronRight" class="text-sm"></ng-icon>
              </button>
              <span class="ml-2">of 20</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  host: { class: 'block h-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUsersPageComponent {
  private readonly router = inject(Router);

  readonly summaryCards = [
    { id: 'all' as const, label: 'All', value: '65' },
    { id: 'active' as const, label: 'Active', value: '09' },
    { id: 'suspended' as const, label: 'Suspended', value: '03' },
  ];

  readonly users = signal<AdminUser[]>([
    {
      id: 'francis-uche',
      name: 'Francis Uche',
      email: 'uche@email.com',
      initials: 'FU',
      avatarBackground: 'linear-gradient(135deg, #F6B14B 0%, #F28D28 100%)',
      phoneNumber: '+234 816 939 7454',
      verification: 'verified',
      lastSignedIn: '02 Jan, 2026',
      dateJoined: '06 May, 2024',
      status: 'active',
      category: 'buyers',
      hasStore: false,
    },
    {
      id: 'mark-anthony',
      name: 'Mark Anthony',
      email: 'mark@email.com',
      initials: 'MA',
      avatarBackground: 'linear-gradient(135deg, #D6D9E0 0%, #AEB6C7 100%)',
      phoneNumber: '+234 816 939 7454',
      verification: 'request-sent',
      lastSignedIn: '02 Jan, 2026',
      dateJoined: '06 May, 2024',
      status: 'suspended',
      category: 'sellers',
      hasStore: true,
    },
    {
      id: 'elle-adebisi',
      name: 'Elle Adebisi',
      email: 'elle@email.com',
      initials: 'EA',
      avatarBackground: 'linear-gradient(135deg, #E7D9CC 0%, #C3A38E 100%)',
      phoneNumber: '+234 816 939 7454',
      verification: 'not-verified',
      lastSignedIn: '02 Jan, 2026',
      dateJoined: '06 May, 2024',
      status: 'active',
      category: 'buyers',
      hasStore: false,
    },
    {
      id: 'nduka-obasi',
      name: 'Nduka Obasi',
      email: 'nduka@email.com',
      initials: 'NO',
      avatarBackground: 'linear-gradient(135deg, #BFE2FF 0%, #79B8FF 100%)',
      phoneNumber: '+234 805 100 2200',
      verification: 'verified',
      lastSignedIn: '01 Jan, 2026',
      dateJoined: '18 Jul, 2024',
      status: 'active',
      category: 'sellers',
      hasStore: true,
    },
    {
      id: 'mary-jane',
      name: 'Mary Jane',
      email: 'mary@email.com',
      initials: 'MJ',
      avatarBackground: 'linear-gradient(135deg, #D2F5D9 0%, #86D493 100%)',
      phoneNumber: '+234 901 881 7721',
      verification: 'verified',
      lastSignedIn: '30 Dec, 2025',
      dateJoined: '27 Apr, 2024',
      status: 'active',
      category: 'sellers',
      hasStore: true,
    },
  ]);

  readonly activeSummary = signal<'all' | UserStatus>('all');
  readonly categoryFilter = signal<UserCategoryFilter>('all');
  readonly storeFilter = signal<UserStoreFilter>('all');
  readonly statusFilter = signal<'all' | UserStatus>('all');
  readonly searchQuery = signal('');

  readonly visibleUsers = computed(() =>
    this.users().filter((user) => {
      const summaryMatches =
        this.activeSummary() === 'all' || user.status === this.activeSummary();
      const categoryMatches =
        this.categoryFilter() === 'all' || user.category === this.categoryFilter();
      const storeMatches =
        this.storeFilter() === 'all' ||
        (this.storeFilter() === 'with-store' && user.hasStore) ||
        (this.storeFilter() === 'without-store' && !user.hasStore);
      const statusMatches =
        this.statusFilter() === 'all' || user.status === this.statusFilter();
      const query = this.searchQuery().trim().toLowerCase();
      const searchMatches =
        query === '' ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.phoneNumber.toLowerCase().includes(query);

      return summaryMatches && categoryMatches && storeMatches && statusMatches && searchMatches;
    }),
  );

  readonly categoryFilterLabel = computed(() => {
    switch (this.categoryFilter()) {
      case 'buyers':
        return 'Buyer';
      case 'sellers':
        return 'Seller';
      default:
        return 'Category';
    }
  });

  readonly storeFilterLabel = computed(() => {
    switch (this.storeFilter()) {
      case 'with-store':
        return 'With store';
      case 'without-store':
        return 'No store';
      default:
        return 'Store';
    }
  });

  readonly statusFilterLabel = computed(() => {
    switch (this.statusFilter()) {
      case 'active':
        return 'Active';
      case 'suspended':
        return 'Suspended';
      default:
        return 'Status';
    }
  });

  cycleCategoryFilter(): void {
    this.categoryFilter.update((value) => {
      switch (value) {
        case 'all':
          return 'buyers';
        case 'buyers':
          return 'sellers';
        default:
          return 'all';
      }
    });
  }

  cycleStoreFilter(): void {
    this.storeFilter.update((value) => {
      switch (value) {
        case 'all':
          return 'with-store';
        case 'with-store':
          return 'without-store';
        default:
          return 'all';
      }
    });
  }

  cycleStatusFilter(): void {
    this.statusFilter.update((value) => {
      switch (value) {
        case 'all':
          return 'active';
        case 'active':
          return 'suspended';
        default:
          return 'all';
      }
    });
  }

  updateSearchQuery(value: string): void {
    this.searchQuery.set(value);
  }

  openUser(userId: string): void {
    void this.router.navigate(['/admin/users', userId]);
  }

  verificationLabel(status: VerificationStatus): string {
    switch (status) {
      case 'verified':
        return 'Verified';
      case 'request-sent':
        return 'Request sent';
      case 'not-verified':
        return 'Not verified';
    }
  }

  verificationMark(status: VerificationStatus): string {
    switch (status) {
      case 'verified':
        return '✓';
      case 'request-sent':
        return '•';
      case 'not-verified':
        return '!';
    }
  }
}
