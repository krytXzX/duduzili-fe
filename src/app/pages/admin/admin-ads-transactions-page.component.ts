import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroChevronDown,
  heroChevronLeft,
  heroChevronRight,
  heroInformationCircle,
  heroMagnifyingGlass,
} from '@ng-icons/heroicons/outline';

type TransactionYearFilter = 'this-year' | 'last-year';

interface TransactionSummaryBar {
  label: string;
  height: number;
  active?: boolean;
}

interface AdsTransactionRecord {
  id: string;
  transactionId: string;
  userName: string;
  email: string;
  avatar: string;
  plan: string;
  amount: string;
  date: string;
}

@Component({
  selector: 'app-admin-ads-transactions-page',
  imports: [NgIcon, NgOptimizedImage],
  providers: [
    provideIcons({
      heroChevronDown,
      heroChevronLeft,
      heroChevronRight,
      heroInformationCircle,
      heroMagnifyingGlass,
    }),
  ],
  template: `
    <section class="min-h-full rounded-[32px] bg-white">
      <header class="border-b border-[#efefef] px-8 py-6">
        <h1 class="text-[18px] font-medium tracking-[-0.04em] text-[#b3b3b3]">
          Ads management &gt; <span class="font-semibold text-[#202020]">Transactions</span>
        </h1>
      </header>

      <div class="px-5 pb-6 pt-5 md:hidden">
        <section class="rounded-[12px] bg-white">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <p class="text-[14px] font-medium text-[rgba(13,13,13,0.4)]">Total transactions</p>
              <p class="mt-2 text-[28px] font-semibold leading-10 text-[#1a1b1d]">
                ₦1,760,000<span class="text-[20px] text-[rgba(13,13,13,0.4)]">.00</span>
              </p>
              <p class="mt-3 text-[14px] font-medium text-[rgba(26,27,29,0.5)]">16 transactions</p>
            </div>

            <button
              type="button"
              (click)="yearFilter.set(yearFilter() === 'this-year' ? 'last-year' : 'this-year')"
              class="inline-flex h-8 shrink-0 items-center gap-2 rounded-full border border-[#eaeaea] bg-white px-4 text-[14px] font-medium text-[#0d0d0d]"
            >
              <span>{{ yearFilterLabel() }}</span>
              <ng-icon name="heroChevronDown" class="text-[14px]"></ng-icon>
            </button>
          </div>

          <div class="mt-4 flex h-[64px] items-end justify-end gap-[7px] pr-1">
            @for (bar of summaryBars(); track bar.label) {
              <div
                class="rounded-t-[3px] bg-gradient-to-b from-[#6453d9] to-[#cfc8fd]"
                [class.opacity-100]="bar.active"
                [class.opacity-20]="!bar.active"
                [style.height.px]="mobileBarHeight(bar)"
                [style.width.px]="31"
              ></div>
            }
          </div>
        </section>

        <section class="mt-6">
          <div class="flex items-center justify-between gap-2">
            <label class="flex h-10 w-[316px] min-w-0 items-center gap-2 rounded-full bg-[#fafafa] px-4 text-[#9c9c9c]">
              <ng-icon name="heroMagnifyingGlass" class="text-[16px]"></ng-icon>
              <input
                type="search"
                [value]="searchQuery()"
                (input)="updateSearchQuery($event)"
                placeholder="Search"
                class="min-w-0 flex-1 bg-transparent text-[14px] text-[#202020] outline-none placeholder:text-[rgba(26,27,29,0.6)]"
              >
            </label>

            <button
              type="button"
              class="inline-flex h-10 w-6 shrink-0 items-center justify-center"
              aria-label="Filter transactions"
            >
              <img [ngSrc]="mobileFilterIcon" alt="" width="24" height="24" class="h-6 w-6">
            </button>
          </div>

          <div class="mt-6">
            @for (record of paginatedTransactions(); track record.id) {
              <article class="border-b border-[#ebebeb] py-3">
                <div class="flex items-start justify-between gap-3">
                  <div class="flex min-w-0 items-center gap-2">
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
                      <p class="truncate text-[14px] font-medium text-[#1a1b1d]">{{ record.userName }}</p>
                      <p class="truncate text-[12px] font-medium text-[rgba(13,13,13,0.4)]">{{ record.email }}</p>
                    </div>
                  </div>
                </div>

                <div class="mt-4 space-y-2 text-[14px]">
                  <div class="flex items-center justify-between gap-3">
                    <p class="text-[rgba(26,27,29,0.5)]">Plan</p>
                    <p class="font-medium text-[#1a1b1d]">{{ record.plan }}</p>
                  </div>

                  <div class="flex items-center justify-between gap-3">
                    <p class="text-[rgba(26,27,29,0.5)]">Transaction ID</p>
                    <p class="font-medium text-[#1a1b1d]">{{ record.transactionId }}</p>
                  </div>

                  <div class="flex items-center justify-between gap-3">
                    <p class="text-[rgba(26,27,29,0.5)]">Amount</p>
                    <p class="font-medium text-[#1f1f1f]">{{ record.amount }}</p>
                  </div>

                  <div class="flex items-center justify-between gap-3">
                    <p class="text-[rgba(26,27,29,0.5)]">Date</p>
                    <p class="font-medium text-[#1a1b1d]">{{ record.date }}</p>
                  </div>
                </div>
              </article>
            }
          </div>
        </section>
      </div>

      <div class="hidden px-4 py-6 sm:px-6 lg:px-8 md:block">
        <section class="max-w-[660px] rounded-[20px] border border-[#e9e9e9] bg-white px-5 py-5">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div class="flex items-center gap-1 text-[15px] text-[#8b8b8b]">
                <span>Total transactions</span>
                <ng-icon name="heroInformationCircle" class="text-[16px]"></ng-icon>
              </div>

              <p class="mt-3 text-[18px] font-semibold tracking-[-0.04em] text-[#2a2a2a] sm:text-[20px]">
                ₦ 7,500,00,000<span class="text-[16px] text-[#8b8b8b]">.00</span>
              </p>
              <p class="mt-1 text-[14px] text-[#8b8b8b]">1,567 transactions</p>
            </div>

            <button
              type="button"
              (click)="yearFilter.set(yearFilter() === 'this-year' ? 'last-year' : 'this-year')"
              class="inline-flex h-11 items-center gap-2 self-start rounded-full border border-[#e8e8e8] bg-white px-5 text-[15px] text-[#1f1f1f]"
            >
              <span>{{ yearFilterLabel() }}</span>
              <ng-icon name="heroChevronDown" class="text-[16px]"></ng-icon>
            </button>
          </div>

          <div class="mt-8 flex h-[150px] items-end justify-end gap-3">
            @for (bar of summaryBars(); track bar.label) {
              <div
                class="w-14 rounded-t-[6px]"
                [style.height.px]="bar.height"
                [class.bg-[#dcd8fb]]="!bar.active"
                [class.bg-[#6b5adf]]="bar.active"
              ></div>
            }
          </div>
        </section>

        <section class="mt-6 overflow-hidden rounded-[20px] border border-[#e9e9e9] bg-white">
          <div class="flex flex-col gap-4 border-b border-[#efefef] px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div class="flex flex-wrap items-center gap-3">
              <button
                type="button"
                class="inline-flex h-10 items-center gap-2 rounded-full border border-[#e8e8e8] bg-white px-4 text-[14px] text-[#8a8a8a]"
              >
                <span>Plan</span>
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
            <table class="min-w-[980px] w-full table-fixed">
              <thead>
                <tr class="border-b border-[#efefef] bg-[#fafafa] text-left text-[13px] font-medium text-[#7d7d7d]">
                  <th class="w-[220px] px-4 py-3 font-medium">Transaction ID</th>
                  <th class="w-[260px] px-4 py-3 font-medium">User</th>
                  <th class="w-[180px] px-4 py-3 font-medium">Plan</th>
                  <th class="w-[200px] px-4 py-3 font-medium">Amount</th>
                  <th class="w-[180px] px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>

              <tbody>
                @for (record of paginatedTransactions(); track record.id) {
                  <tr class="border-b border-[#efefef] last:border-b-0">
                    <td class="px-4 py-4 text-[15px] text-[#303030]">{{ record.transactionId }}</td>

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

                    <td class="px-4 py-4 text-[15px] text-[#303030]">{{ record.plan }}</td>
                    <td class="px-4 py-4 text-[15px] font-medium text-[#303030]">{{ record.amount }}</td>
                    <td class="px-4 py-4 text-[15px] text-[#303030]">{{ record.date }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>

        <div class="mt-6 flex flex-col gap-4 text-[15px] text-[#4d4d4d] sm:flex-row sm:items-center sm:justify-between">
          <p>{{ paginatedTransactions().length }} results</p>

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
export class AdminAdsTransactionsPageComponent {
  readonly mobileFilterIcon = '/assets/icons/admin-users/filter-tuning.svg';
  readonly yearFilter = signal<TransactionYearFilter>('this-year');
  readonly searchQuery = signal('');
  readonly currentPage = signal(1);
  readonly pageSize = 5;

  readonly transactions = signal<AdsTransactionRecord[]>([
    {
      id: 'txn-1',
      transactionId: 'KAJ632U87WS',
      userName: 'Francis Uche',
      email: 'uche@email.com',
      avatar: '/assets/images/fashion_menswear_hero.png',
      plan: 'Pro',
      amount: '₦1,000.00',
      date: '06 May, 2024',
    },
    {
      id: 'txn-2',
      transactionId: 'KAJ632U87WS',
      userName: 'Mark Anthony',
      email: 'mark@email.com',
      avatar: '/assets/images/product_watch_luxury.png',
      plan: 'Business',
      amount: '₦1,500.00',
      date: '06 May, 2024',
    },
    {
      id: 'txn-3',
      transactionId: 'KAJ632U87WS',
      userName: 'Elle Adebisi',
      email: 'elle@email.com',
      avatar: '/assets/images/product_sneakers_lifestyle.png',
      plan: 'Enterprise',
      amount: '₦2,000.00',
      date: '06 May, 2024',
    },
    {
      id: 'txn-4',
      transactionId: 'KAJ632U87WS',
      userName: 'Francis Uche',
      email: 'uche@email.com',
      avatar: '/assets/images/fashion_menswear_hero.png',
      plan: 'Pro',
      amount: '₦1,000.00',
      date: '06 May, 2024',
    },
    {
      id: 'txn-5',
      transactionId: 'KAJ632U87WS',
      userName: 'Mark Anthony',
      email: 'mark@email.com',
      avatar: '/assets/images/product_watch_luxury.png',
      plan: 'Business',
      amount: '₦1,500.00',
      date: '06 May, 2024',
    },
    {
      id: 'txn-6',
      transactionId: 'KAJ632U87WS',
      userName: 'Elle Adebisi',
      email: 'elle@email.com',
      avatar: '/assets/images/product_sneakers_lifestyle.png',
      plan: 'Enterprise',
      amount: '₦2,000.00',
      date: '06 May, 2024',
    },
  ]);

  readonly summaryBars = computed<ReadonlyArray<TransactionSummaryBar>>(() =>
    this.yearFilter() === 'this-year'
      ? [
          { label: 'Jan', height: 48 },
          { label: 'Feb', height: 96 },
          { label: 'Mar', height: 104 },
          { label: 'Apr', height: 132 },
          { label: 'May', height: 184, active: true },
          { label: 'Jun', height: 132 },
        ]
      : [
          { label: 'Jul', height: 58 },
          { label: 'Aug', height: 88 },
          { label: 'Sep', height: 118 },
          { label: 'Oct', height: 144, active: true },
          { label: 'Nov', height: 128 },
          { label: 'Dec', height: 96 },
        ]
  );

  readonly filteredTransactions = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();

    return this.transactions().filter((record) =>
      query === ''
      || record.transactionId.toLowerCase().includes(query)
      || record.userName.toLowerCase().includes(query)
      || record.plan.toLowerCase().includes(query)
    );
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filteredTransactions().length / this.pageSize)));

  readonly paginatedTransactions = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredTransactions().slice(start, start + this.pageSize);
  });

  readonly yearFilterLabel = computed(() =>
    this.yearFilter() === 'this-year' ? 'This year' : 'Last year'
  );

  mobileBarHeight(bar: TransactionSummaryBar): number {
    return bar.active ? 51 : Math.max(3, Math.round(bar.height * 0.36));
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
}
