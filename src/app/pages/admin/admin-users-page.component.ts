import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { CustomDropdownComponent, type CustomDropdownOption } from '../../components/ui/custom-dropdown.component';
import {
  AdminUsersCategoryFilter,
  AdminUsersRecord,
  AdminUsersService,
  AdminUsersStatusFilter,
  AdminUsersStoreFilter,
} from '../../services/admin-users.service';
import {
  heroChevronDown,
  heroChevronLeft,
  heroChevronRight,
  heroMagnifyingGlass,
} from '@ng-icons/heroicons/outline';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

type UserStatus = 'active' | 'suspended' | 'banned';
type UserStatusFilter = 'active' | 'suspended';
type VerificationStatus = 'verified' | 'request-sent' | 'not-verified';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  initials: string;
  avatarBackground: string;
  avatarUrl: string | null;
  phoneNumber: string;
  verification: VerificationStatus;
  lastSignedIn: string;
  dateJoined: string;
  status: UserStatus;
  category: AdminUsersCategoryFilter;
  hasStore: boolean;
}

@Component({
  selector: 'app-admin-users-page',
  imports: [NgIcon, NgOptimizedImage, CustomDropdownComponent],
  providers: [
    provideIcons({
      heroChevronDown,
      heroChevronLeft,
      heroChevronRight,
      heroMagnifyingGlass,
    }),
  ],
  template: `
    <section class="min-h-full bg-white px-4 pb-8 pt-2 lg:hidden">
      <div class="flex h-[54px] items-center">
        <h1 class="text-[24px] font-semibold leading-8 text-[#1A1B1D]">Users</h1>
      </div>

      <div class="-mx-4 overflow-x-auto px-4 pt-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div class="flex w-max gap-3">
          @for (card of mobileSummaryCards(); track card.id) {
            <button
              type="button"
              (click)="selectSummary(card.id)"
              class="h-[75px] w-[153px] rounded-[10px] px-2.5 text-left transition"
              [class.border-[1.5px]]="activeSummary() === card.id"
              [class.border-[#6453D9]]="activeSummary() === card.id"
              [class.bg-[rgba(100,83,217,0.05)]]="activeSummary() === card.id"
              [class.bg-[#FAFAFA]]="activeSummary() !== card.id"
            >
              <p class="text-[12px] font-normal leading-none text-[#1A1B1D]/50">{{ card.label }}</p>
              <p
                class="mt-[22px] text-[20px] font-semibold leading-none"
                [class.text-[#1A1B1D]]="activeSummary() === card.id"
                [class.text-[#1A1B1D]/50]="activeSummary() !== card.id"
              >
                {{ card.value }}
              </p>
            </button>
          }
        </div>
      </div>

      <div class="mt-6 flex items-center gap-3">
        <label class="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-full bg-[#FAFAFA] px-3">
          <img
            ngSrc="/assets/icons/admin-users/search.svg"
            width="16"
            height="16"
            alt=""
            class="h-4 w-4"
            aria-hidden="true"
          />
          <input
            type="text"
            [value]="searchQuery()"
            (input)="updateSearchQuery($any($event.target).value)"
            placeholder="Search"
            class="min-w-0 flex-1 border-none bg-transparent text-[14px] font-normal leading-5 text-[#1A1B1D] outline-none placeholder:text-[#777777] focus:ring-0"
          >
        </label>

        <app-custom-dropdown
          [options]="statusOptions"
          [value]="statusFilter()"
          ariaLabel="Filter users by status"
          align="right"
          buttonClass="flex h-10 w-10 shrink-0 items-center justify-center p-0 text-[#1A1B1D]"
          labelClass="sr-only"
          iconClass="text-[#1A1B1D]"
          menuClass="min-w-[170px]"
          (valueChange)="selectStatus($event)"
        ></app-custom-dropdown>
      </div>

      <div class="mt-6 flex flex-col">
        @if (visibleUsers().length === 0) {
          <p class="py-8 text-[14px] font-medium text-[#8E9199]">No users match the current filters.</p>
        } @else {
          @for (user of visibleUsers(); track user.id) {
            <button
              type="button"
              (click)="openUser(user.id)"
              class="flex flex-col gap-4 border-b border-[#EBEBEB] py-3 text-left"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="flex min-w-0 items-center gap-2">
                  @if (user.avatarUrl) {
                    <img
                      [src]="user.avatarUrl"
                      alt=""
                      class="h-9 w-9 shrink-0 rounded-full object-cover"
                      aria-hidden="true"
                    >
                  } @else {
                    <span
                      class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold text-[#1A1C21]"
                      [style.background]="user.avatarBackground"
                    >
                      {{ user.initials }}
                    </span>
                  }
                  <span class="min-w-0">
                    <span class="flex items-center gap-1.5">
                      <span class="truncate text-[14px] font-medium leading-5 text-[#0D0D0D]">
                        {{ user.name }}
                      </span>
                      @if (user.verification === 'verified') {
                        <img
                          ngSrc="/assets/icons/admin-users/verify.svg"
                          width="16"
                          height="16"
                          alt=""
                          class="h-4 w-4 shrink-0"
                          aria-hidden="true"
                        />
                      }
                    </span>
                    <span class="block truncate text-[12px] font-normal leading-4 text-[#8C8C8C]">
                      {{ user.email }}
                    </span>
                  </span>
                </div>

                <span
                  class="inline-flex h-6 shrink-0 items-center gap-1 rounded-lg px-2 text-[12px] font-semibold leading-4"
                  [class.bg-[#F3FBF9]]="user.status === 'active'"
                  [class.text-[#25AD32]]="user.status === 'active'"
                  [class.bg-[#FDF6FA]]="user.status === 'suspended'"
                  [class.text-[#FF2524]]="user.status === 'suspended'"
                  [class.bg-[#FFF7ED]]="user.status === 'banned'"
                  [class.text-[#C2410C]]="user.status === 'banned'"
                >
                  <img
                    [ngSrc]="user.status === 'active' ? '/assets/icons/admin-users/tick-circle.svg' : '/assets/icons/admin-users/slash.svg'"
                    width="14"
                    height="14"
                    alt=""
                    class="h-3.5 w-3.5"
                    aria-hidden="true"
                  />
                  {{ user.status === 'active' ? 'Active' : user.status === 'banned' ? 'Banned' : 'Suspended' }}
                </span>
              </div>

              <div class="flex flex-col gap-3 text-[14px] leading-5">
                <div class="flex items-center justify-between gap-4">
                  <span class="font-normal text-[#1A1B1D]/50">Date joined</span>
                  <span class="font-medium text-[#1A1B1D]">{{ user.dateJoined }}</span>
                </div>
                <div class="flex items-center justify-between gap-4">
                  <span class="font-normal text-[#1A1B1D]/50">Last signed in</span>
                  <span class="font-medium text-[#1A1B1D]">{{ user.lastSignedIn }}</span>
                </div>
              </div>
            </button>
          }
        }
      </div>
    </section>

    <div class="hidden h-full flex-col rounded-[24px] border border-gray-100/60 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] sm:rounded-[32px] lg:flex">
      <div class="border-b border-[#F0F0F2] px-5 py-5 sm:px-8 sm:py-6">
        <h1 class="text-[20px] font-semibold tracking-[-0.03em] text-[#1A1C21]">Users</h1>
      </div>

      <div class="flex flex-1 flex-col px-4 py-5 sm:px-8 sm:py-6">
        <div class="grid gap-3 lg:grid-cols-3">
          @for (card of summaryCards(); track card.id) {
            <button
              type="button"
              (click)="selectSummary(card.id)"
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
              <app-custom-dropdown
                [options]="categoryOptions"
                [value]="categoryFilter()"
                ariaLabel="Select user category"
                buttonClass="inline-flex items-center gap-2 rounded-full border border-[#E8EAF0] bg-white px-4 py-2.5 text-[13px] font-medium text-[#80858F]"
                iconClass="text-[#80858F]"
                menuClass="min-w-[170px]"
                (valueChange)="selectCategory($event)"
              ></app-custom-dropdown>

              <app-custom-dropdown
                [options]="storeOptions"
                [value]="storeFilter()"
                ariaLabel="Select store filter"
                buttonClass="inline-flex items-center gap-2 rounded-full border border-[#E8EAF0] bg-white px-4 py-2.5 text-[13px] font-medium text-[#80858F]"
                iconClass="text-[#80858F]"
                menuClass="min-w-[170px]"
                (valueChange)="selectStore($event)"
              ></app-custom-dropdown>

              <app-custom-dropdown
                [options]="statusOptions"
                [value]="statusFilter()"
                ariaLabel="Select user status"
                buttonClass="inline-flex items-center gap-2 rounded-full border border-[#E8EAF0] bg-white px-4 py-2.5 text-[13px] font-medium text-[#80858F]"
                iconClass="text-[#80858F]"
                menuClass="min-w-[170px]"
                (valueChange)="selectStatus($event)"
              ></app-custom-dropdown>
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
                @if (visibleUsers().length === 0) {
                  <tr>
                    <td colspan="6" class="px-8 py-12 text-center text-[14px] font-medium text-[#8E9199]">
                      No users match the current filters.
                    </td>
                  </tr>
                } @else {
                  @for (user of visibleUsers(); track user.id) {
                    <tr
                      class="cursor-pointer border-b border-[#F4F5F7] transition hover:bg-[#FAFAFC] last:border-b-0"
                      (click)="openUser(user.id)"
                    >
                      <td class="px-8 py-5">
                        <div class="flex items-center gap-3">
                          @if (user.avatarUrl) {
                            <img
                              [src]="user.avatarUrl"
                              alt=""
                              class="h-10 w-10 rounded-full object-cover"
                              aria-hidden="true"
                            >
                          } @else {
                            <span
                              class="flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-semibold text-[#1A1C21]"
                              [style.background]="user.avatarBackground"
                            >
                              {{ user.initials }}
                            </span>
                          }
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
                          [class.bg-[#FFF7ED]]="user.status === 'banned'"
                          [class.text-[#C2410C]]="user.status === 'banned'"
                        >
                          <span
                            class="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] font-bold text-white"
                            [class.bg-[#2FB04A]]="user.status === 'active'"
                            [class.bg-[#FF4B4B]]="user.status === 'suspended'"
                            [class.bg-[#C2410C]]="user.status === 'banned'"
                          >
                            {{ user.status === 'active' ? '✓' : '!' }}
                          </span>
                          {{ user.status === 'active' ? 'Active' : user.status === 'banned' ? 'Banned' : 'Suspended' }}
                        </span>
                      </td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>

          <div class="mt-auto flex flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <p class="text-[14px] font-semibold text-[#646A73]">{{ totalResults() }} results</p>

            <div class="flex items-center gap-2 self-end text-[14px] font-medium text-[#B2B7C0]">
              <button
                type="button"
                class="flex h-8 w-8 items-center justify-center rounded-[10px] border border-[#ECEEF3] bg-white transition hover:bg-[#FAFAFC] disabled:cursor-not-allowed disabled:opacity-50"
                [disabled]="currentPage() <= 1"
                (click)="goToPreviousPage()"
              >
                <ng-icon name="heroChevronLeft" class="text-sm"></ng-icon>
              </button>
              <span class="flex h-8 min-w-8 items-center justify-center rounded-[10px] border border-[#ECEEF3] bg-white px-3 text-[#7A808A]">
                {{ currentPage() }}
              </span>
              <button
                type="button"
                class="flex h-8 w-8 items-center justify-center rounded-[10px] border border-[#ECEEF3] bg-white transition hover:bg-[#FAFAFC] disabled:cursor-not-allowed disabled:opacity-50"
                [disabled]="currentPage() >= totalPages()"
                (click)="goToNextPage()"
              >
                <ng-icon name="heroChevronRight" class="text-sm"></ng-icon>
              </button>
              <span class="ml-2">of {{ totalPages() }}</span>
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
  readonly categoryOptions: readonly CustomDropdownOption<AdminUsersCategoryFilter>[] = [
    { value: 'all', label: 'All categories' },
    { value: 'buyers', label: 'Buyers' },
    { value: 'sellers', label: 'Sellers' },
  ];
  readonly storeOptions: readonly CustomDropdownOption<AdminUsersStoreFilter>[] = [
    { value: 'all', label: 'All stores' },
    { value: 'with-store', label: 'With store' },
    { value: 'without-store', label: 'Without store' },
  ];
  readonly statusOptions: readonly CustomDropdownOption<'all' | UserStatusFilter>[] = [
    { value: 'all', label: 'All statuses' },
    { value: 'active', label: 'Active' },
    { value: 'suspended', label: 'Suspended' },
  ];

  private readonly router = inject(Router);
  private readonly adminUsersService = inject(AdminUsersService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly pageSize = 5;

  readonly users = signal<AdminUser[]>([]);
  readonly totalResults = signal(0);
  readonly currentPage = signal(1);
  readonly counts = signal({ all: 0, active: 0, suspended: 0 });
  readonly activeSummary = signal<'all' | UserStatusFilter>('all');
  readonly categoryFilter = signal<AdminUsersCategoryFilter>('all');
  readonly storeFilter = signal<AdminUsersStoreFilter>('all');
  readonly statusFilter = signal<'all' | UserStatusFilter>('all');
  readonly searchQuery = signal('');

  readonly summaryCards = computed(() => [
    { id: 'all' as const, label: 'All', value: this.formatCount(this.counts().all) },
    { id: 'active' as const, label: 'Active', value: this.formatCount(this.counts().active) },
    {
      id: 'suspended' as const,
      label: 'Suspended',
      value: this.formatCount(this.counts().suspended),
    },
  ]);
  readonly mobileSummaryCards = this.summaryCards;
  readonly visibleUsers = computed(() => this.users());
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalResults() / this.pageSize)));
  private readonly requestQuery = computed((): {
    page: number;
    search: string;
    status: 'all' | UserStatusFilter;
    category: AdminUsersCategoryFilter;
    store: AdminUsersStoreFilter;
  } => ({
    page: this.currentPage(),
    search: this.searchQuery(),
    status: this.statusFilter(),
    category: this.categoryFilter(),
    store: this.storeFilter(),
  }));

  constructor() {
    toObservable(this.requestQuery)
      .pipe(
        debounceTime(150),
        distinctUntilChanged((previous, current) => JSON.stringify(previous) === JSON.stringify(current)),
        switchMap((query) => this.adminUsersService.getUsers(query)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((response) => {
        this.users.set(response.results.map((user) => this.mapUser(user)));
        this.totalResults.set(response.count ?? response.results.length);
        this.counts.set({
          all: response.counts?.all ?? response.count ?? response.results.length,
          active: response.counts?.active ?? 0,
          suspended: response.counts?.suspended ?? 0,
        });
      });
  }

  selectSummary(value: 'all' | UserStatusFilter): void {
    this.activeSummary.set(value);
    this.statusFilter.set(value);
    this.currentPage.set(1);
  }

  selectCategory(value: AdminUsersCategoryFilter): void {
    this.categoryFilter.set(value);
    this.currentPage.set(1);
  }

  selectStore(value: AdminUsersStoreFilter): void {
    this.storeFilter.set(value);
    this.currentPage.set(1);
  }

  selectStatus(value: 'all' | UserStatusFilter): void {
    this.statusFilter.set(value);
    this.activeSummary.set(value);
    this.currentPage.set(1);
  }

  updateSearchQuery(value: string): void {
    this.searchQuery.set(value);
    this.currentPage.set(1);
  }

  goToPreviousPage(): void {
    if (this.currentPage() <= 1) {
      return;
    }
    this.currentPage.update((value) => value - 1);
  }

  goToNextPage(): void {
    if (this.currentPage() >= this.totalPages()) {
      return;
    }
    this.currentPage.update((value) => value + 1);
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

  private mapUser(user: AdminUsersRecord): AdminUser {
    const name = user.full_name?.trim() || user.email;
    return {
      id: String(user.id),
      name,
      email: user.email,
      initials: this.initials(name),
      avatarBackground: this.avatarBackground(name),
      avatarUrl: user.avatar,
      phoneNumber: user.phone_number?.trim() || '—',
      verification: this.mapVerification(user.identity_verification.status),
      lastSignedIn: this.formatLastSignedIn(user.last_login),
      dateJoined: this.formatDate(user.created_at),
      status: user.is_banned ? 'banned' : user.is_active ? 'active' : 'suspended',
      category: user.is_vendor ? 'sellers' : 'buyers',
      hasStore: user.has_store,
    };
  }

  private mapVerification(status: string): VerificationStatus {
    if (status === 'verified') {
      return 'verified';
    }
    if (status === 'request_sent') {
      return 'request-sent';
    }
    return 'not-verified';
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

  private formatLastSignedIn(value: string | null): string {
    if (!value) {
      return 'Never';
    }
    return this.formatDate(value);
  }

  private formatCount(value: number): string {
    return String(value).padStart(2, '0');
  }

  private initials(name: string): string {
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

  private avatarBackground(seedValue: string): string {
    const palette = [
      'linear-gradient(135deg, #F6B14B 0%, #F28D28 100%)',
      'linear-gradient(135deg, #D6D9E0 0%, #AEB6C7 100%)',
      'linear-gradient(135deg, #E7D9CC 0%, #C3A38E 100%)',
      'linear-gradient(135deg, #BFE2FF 0%, #79B8FF 100%)',
      'linear-gradient(135deg, #D2F5D9 0%, #86D493 100%)',
    ];
    const seed = Array.from(seedValue).reduce((sum, character) => sum + character.charCodeAt(0), 0);
    return palette[seed % palette.length];
  }
}
