import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { CustomDropdownComponent, type CustomDropdownOption } from '../../components/ui/custom-dropdown.component';
import {
  heroChevronDown,
  heroChevronLeft,
  heroChevronRight,
} from '@ng-icons/heroicons/outline';

type BillingStatus = 'successful' | 'failed' | 'pending';
type TransactionType = 'all' | 'subscription' | 'renewal';
type BillingDateFilter = 'all' | 'feb-2025' | 'mar-2025' | 'apr-2025';

interface BillingRecord {
  id: string;
  transactionType: Exclude<TransactionType, 'all'>;
  plan: string;
  amount: string;
  date: string;
  dateKey: Exclude<BillingDateFilter, 'all'>;
  status: BillingStatus;
}

@Component({
  selector: 'app-billing-history-page',
  imports: [RouterLink, NgIcon, NgOptimizedImage, CustomDropdownComponent],
  providers: [
    provideIcons({
      heroChevronDown,
      heroChevronLeft,
      heroChevronRight,
    }),
  ],
  template: `
    <div class="bg-white md:hidden">
      <div class="px-5 pb-28">
        <div class="flex h-[54px] items-center">
          <a
            routerLink="/ads"
            aria-label="Back to ads"
            class="inline-flex items-center gap-3 text-black"
          >
            <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#F3F3F3]">
              <ng-icon name="heroChevronLeft" class="text-[18px]"></ng-icon>
            </span>
            <span class="text-[20px] font-semibold leading-6 tracking-[-0.03em]">
              Billing history
            </span>
          </a>
        </div>

        <div class="mt-5 flex items-center gap-5">
          <label
            class="flex h-10 flex-1 items-center gap-2 rounded-full bg-[#FAFAFA] px-4 text-[#9B9B9B]"
          >
            <img
              [ngSrc]="assets.searchIcon"
              width="16"
              height="16"
              alt=""
              class="h-4 w-4 shrink-0"
            >
            <input
              type="search"
              [value]="searchQuery()"
              (input)="updateSearchQuery($event)"
              aria-label="Search billing history"
              placeholder="Search"
              class="min-w-0 flex-1 bg-transparent text-[14px] leading-5 text-[#1A1B1D] outline-none placeholder:text-[#A1A1A1]"
            >
          </label>

          <app-custom-dropdown
            [options]="transactionTypeOptions"
            [value]="transactionType()"
            ariaLabel="Select transaction type"
            buttonClass="inline-flex h-6 w-6 items-center justify-center p-0 text-[#1A1B1D]"
            labelClass="sr-only"
            iconClass="text-[#1A1B1D]"
            menuClass="min-w-[190px] right-0"
            align="right"
            (valueChange)="transactionType.set($event)"
          ></app-custom-dropdown>
        </div>

        <section class="mt-6">
          @for (record of visibleRecords(); track record.id) {
            <article class="border-b border-[#EBEBEB] py-3 first:pt-0">
              <div class="flex items-start justify-between gap-4">
                <h2 class="text-[18px] font-semibold leading-6 tracking-[-0.03em] text-[#1A1B1D]">
                  {{ record.plan }}
                </h2>

                <span [class]="statusBadgeClass(record.status)">
                  @if (statusIcon(record.status); as icon) {
                    <img
                      [ngSrc]="icon"
                      width="14"
                      height="14"
                      alt=""
                      class="h-[14px] w-[14px]"
                    >
                  } @else {
                    <span class="h-[14px] w-[14px] rounded-full bg-[#D98A00]"></span>
                  }
                  {{ statusLabel(record.status) }}
                </span>
              </div>

              <dl class="mt-4 space-y-3">
                <div class="flex items-center justify-between gap-4">
                  <dt class="text-[14px] leading-5 text-[rgba(26,27,29,0.5)]">Transaction ID</dt>
                  <dd class="text-right text-[14px] font-medium leading-5 text-[#1A1B1D]">
                    {{ record.id }}
                  </dd>
                </div>

                <div class="flex items-center justify-between gap-4">
                  <dt class="text-[14px] leading-5 text-[rgba(26,27,29,0.5)]">Amount</dt>
                  <dd class="text-right text-[14px] font-medium leading-5 text-[#1A1B1D]">
                    {{ record.amount }}
                  </dd>
                </div>

                <div class="flex items-center justify-between gap-4">
                  <dt class="text-[14px] leading-5 text-[rgba(26,27,29,0.5)]">Date</dt>
                  <dd class="text-right text-[14px] font-medium leading-5 text-[#1A1B1D]">
                    {{ record.date }}
                  </dd>
                </div>
              </dl>
            </article>
          }
        </section>
      </div>
    </div>

    <div class="hidden h-full md:block">
      <div class="flex h-full flex-col rounded-[16px] border border-[#F0F0F0] bg-white">
        <div class="flex items-center justify-between gap-5 border-b border-[#F0F0F0] px-[14px] py-[14px]">
          <div class="flex flex-wrap items-center gap-8">
            <div class="flex flex-wrap items-center gap-8">
              <app-custom-dropdown
                [options]="transactionTypeOptions"
                [value]="transactionType()"
                ariaLabel="Select transaction type"
                buttonClass="inline-flex h-8 items-center gap-2 rounded-[32px] border border-[#EBEBEB] bg-white px-3 text-[14px] font-medium leading-5 text-[rgba(26,27,29,0.5)] shadow-[0_0_0_1px_rgba(18,55,105,0.08)]"
                iconClass="text-[rgba(26,27,29,0.5)]"
                menuClass="min-w-[190px]"
                (valueChange)="transactionType.set($event)"
              ></app-custom-dropdown>

              <app-custom-dropdown
                [options]="dateFilterOptions"
                [value]="dateFilter()"
                ariaLabel="Select date"
                buttonClass="inline-flex h-8 items-center gap-2 rounded-[32px] border border-[#EBEBEB] bg-white px-3 text-[14px] font-medium leading-5 text-[rgba(26,27,29,0.5)] shadow-[0_0_0_1px_rgba(18,55,105,0.08)]"
                iconClass="text-[rgba(26,27,29,0.5)]"
                menuClass="min-w-[150px]"
                (valueChange)="dateFilter.set($event)"
              ></app-custom-dropdown>

              <app-custom-dropdown
                [options]="statusFilterOptions"
                [value]="statusFilter()"
                ariaLabel="Select status"
                buttonClass="inline-flex h-8 items-center gap-2 rounded-[32px] border border-[#EBEBEB] bg-white px-3 text-[14px] font-medium leading-5 text-[rgba(26,27,29,0.5)] shadow-[0_0_0_1px_rgba(18,55,105,0.08)]"
                iconClass="text-[rgba(26,27,29,0.5)]"
                menuClass="min-w-[150px]"
                (valueChange)="statusFilter.set($event)"
              ></app-custom-dropdown>
            </div>
          </div>

          <label
            class="flex h-10 w-full max-w-[224px] items-center gap-2 rounded-full bg-[#FAFAFA] px-3 text-[#777777]"
          >
            <img
              [ngSrc]="assets.searchIcon"
              width="16"
              height="16"
              alt=""
              class="h-4 w-4 shrink-0"
            >
            <input
              type="search"
              [value]="searchQuery()"
              (input)="updateSearchQuery($event)"
              aria-label="Search billing history"
              placeholder="Search"
              class="min-w-0 flex-1 bg-transparent text-[14px] leading-5 text-[#1A1B1D] outline-none placeholder:text-[#777777]"
            >
          </label>
        </div>

        <div class="flex flex-1 flex-col">
          <div class="overflow-x-auto">
            <table class="w-full min-w-[860px] border-collapse">
              <thead>
                <tr class="h-10 bg-[#FAFAFA] text-left text-[12px] font-medium text-[rgba(26,27,29,0.6)]">
                  <th class="px-[34px]">Transaction Id</th>
                  <th class="px-4">Plan</th>
                  <th class="px-4">Amount</th>
                  <th class="px-4">Date</th>
                  <th class="px-4">Status</th>
                </tr>
              </thead>

              <tbody>
                @for (record of visibleRecords(); track record.id) {
                  <tr class="h-[56px] border-b border-[#F0F0F0] text-[14px] text-[#1A1B1D] last:border-b-0">
                    <td class="px-[34px]">{{ record.id }}</td>
                    <td class="px-4">{{ record.plan }}</td>
                    <td class="px-4 font-medium">{{ record.amount }}</td>
                    <td class="px-4">{{ record.date }}</td>
                    <td class="px-4">
                      <span [class]="statusBadgeClass(record.status)">
                        @if (statusIcon(record.status); as icon) {
                          <img
                            [ngSrc]="icon"
                            width="14"
                            height="14"
                            alt=""
                            class="h-[14px] w-[14px]"
                          >
                        } @else {
                          <span class="h-[14px] w-[14px] rounded-full bg-[#D98A00]"></span>
                        }
                        {{ statusLabel(record.status) }}
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="mt-auto flex items-center justify-between px-4 pb-4 pt-6">
            <p class="text-[16px] leading-6 text-[#1A1B1D]">
              {{ visibleRecords().length }} <span class="text-[rgba(26,27,29,0.5)]">results</span>
            </p>

            <div class="flex items-center gap-2 text-[16px] leading-6 text-[#1C1F1D] opacity-50">
              <div class="flex items-end gap-[5px]">
                <button
                  type="button"
                  class="inline-flex h-8 w-8 items-center justify-center rounded-[8px] bg-white shadow-[0_1px_2px_rgba(42,59,81,0.12),0_0_0_1px_rgba(18,55,105,0.08)]"
                  aria-label="Previous page"
                >
                  <ng-icon name="heroChevronLeft" class="text-[14px]"></ng-icon>
                </button>

                <span
                  class="inline-flex h-8 min-w-8 items-center justify-center rounded-[8px] bg-white px-[14px] text-[14px] font-medium shadow-[0_1px_2px_rgba(42,59,81,0.12),0_0_0_1px_rgba(18,55,105,0.08)]"
                >
                  1
                </span>

                <button
                  type="button"
                  class="inline-flex h-8 w-8 items-center justify-center rounded-[8px] bg-white shadow-[0_1px_2px_rgba(42,59,81,0.12),0_0_0_1px_rgba(18,55,105,0.08)]"
                  aria-label="Next page"
                >
                  <ng-icon name="heroChevronRight" class="text-[14px]"></ng-icon>
                </button>
              </div>

              <span>of 12</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  host: { class: 'block h-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillingHistoryPageComponent {
  readonly transactionTypeOptions: readonly CustomDropdownOption<TransactionType>[] = [
    { value: 'all', label: 'All transaction types' },
    { value: 'subscription', label: 'Subscription' },
    { value: 'renewal', label: 'Renewal' },
  ];
  readonly dateFilterOptions: readonly CustomDropdownOption<BillingDateFilter>[] = [
    { value: 'all', label: 'All dates' },
    { value: 'feb-2025', label: 'Feb 2025' },
    { value: 'mar-2025', label: 'Mar 2025' },
    { value: 'apr-2025', label: 'Apr 2025' },
  ];
  readonly statusFilterOptions: readonly CustomDropdownOption<'all' | BillingStatus>[] = [
    { value: 'all', label: 'All statuses' },
    { value: 'successful', label: 'Successful' },
    { value: 'failed', label: 'Failed' },
    { value: 'pending', label: 'Pending' },
  ];
  readonly assets = {
    searchIcon: '/assets/icons/billing-history-search.svg',
    filterIcon: '/assets/icons/billing-history-filter.svg',
    successIcon: '/assets/icons/billing-history-success.svg',
    failedIcon: '/assets/icons/billing-history-failed.svg',
  } as const;

  readonly records = signal<BillingRecord[]>([
    {
      id: '74785GH830X',
      transactionType: 'subscription',
      plan: 'Pro Plan',
      amount: '₦25,000.00',
      date: '14 Feb, 2025',
      dateKey: 'feb-2025',
      status: 'successful',
    },
    {
      id: '74785GH830X',
      transactionType: 'renewal',
      plan: 'Premium Plan',
      amount: '₦25,000.00',
      date: '14 Feb, 2025',
      dateKey: 'feb-2025',
      status: 'successful',
    },
    {
      id: '74785GH830X',
      transactionType: 'subscription',
      plan: 'Business Plan',
      amount: '₦25,000.00',
      date: '14 Feb, 2025',
      dateKey: 'feb-2025',
      status: 'failed',
    },
    {
      id: '74785GH830X',
      transactionType: 'renewal',
      plan: 'Enterprise Plan',
      amount: '₦25,000.00',
      date: '14 Feb, 2025',
      dateKey: 'feb-2025',
      status: 'successful',
    },
    {
      id: '74785GH830X',
      transactionType: 'subscription',
      plan: 'Starter Plan',
      amount: '₦25,000.00',
      date: '14 Feb, 2025',
      dateKey: 'feb-2025',
      status: 'pending',
    },
  ]);

  readonly searchQuery = signal('');
  readonly transactionType = signal<TransactionType>('all');
  readonly dateFilter = signal<BillingDateFilter>('all');
  readonly statusFilter = signal<'all' | BillingStatus>('all');

  readonly visibleRecords = computed(() =>
    this.records().filter(record => {
      const query = this.searchQuery().trim().toLowerCase();
      const matchesSearch =
        query === '' ||
        record.id.toLowerCase().includes(query) ||
        record.plan.toLowerCase().includes(query) ||
        record.amount.toLowerCase().includes(query);

      const matchesType =
        this.transactionType() === 'all' || record.transactionType === this.transactionType();

      const matchesDate = this.dateFilter() === 'all' || record.dateKey === this.dateFilter();
      const matchesStatus =
        this.statusFilter() === 'all' || record.status === this.statusFilter();

      return matchesSearch && matchesType && matchesDate && matchesStatus;
    }),
  );

  readonly transactionTypeLabel = computed(() => {
    switch (this.transactionType()) {
      case 'subscription':
        return 'Subscription';
      case 'renewal':
        return 'Renewal';
      default:
        return 'Transaction type';
    }
  });

  readonly dateFilterLabel = computed(() => {
    switch (this.dateFilter()) {
      case 'feb-2025':
        return 'Feb 2025';
      case 'mar-2025':
        return 'Mar 2025';
      case 'apr-2025':
        return 'Apr 2025';
      default:
        return 'Date';
    }
  });

  readonly statusFilterLabel = computed(() => {
    switch (this.statusFilter()) {
      case 'successful':
        return 'Successful';
      case 'failed':
        return 'Failed';
      case 'pending':
        return 'Pending';
      default:
        return 'Status';
    }
  });

  updateSearchQuery(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  cycleTransactionType(): void {
    const order: TransactionType[] = ['all', 'subscription', 'renewal'];
    const currentIndex = order.indexOf(this.transactionType());
    this.transactionType.set(order[(currentIndex + 1) % order.length]);
  }

  cycleDateFilter(): void {
    const order: BillingDateFilter[] = ['all', 'feb-2025', 'mar-2025', 'apr-2025'];
    const currentIndex = order.indexOf(this.dateFilter());
    this.dateFilter.set(order[(currentIndex + 1) % order.length]);
  }

  cycleStatusFilter(): void {
    const order: Array<'all' | BillingStatus> = ['all', 'successful', 'failed', 'pending'];
    const currentIndex = order.indexOf(this.statusFilter());
    this.statusFilter.set(order[(currentIndex + 1) % order.length]);
  }

  statusLabel(status: BillingStatus): string {
    switch (status) {
      case 'successful':
        return 'Successful';
      case 'failed':
        return 'Failed';
      default:
        return 'Pending';
    }
  }

  statusIcon(status: BillingStatus): string | null {
    if (status === 'successful') {
      return this.assets.successIcon;
    }

    if (status === 'failed') {
      return this.assets.failedIcon;
    }

    return null;
  }

  statusBadgeClass(status: BillingStatus): string {
    if (status === 'successful') {
      return 'inline-flex h-6 items-center gap-1 rounded-[8px] bg-[#F3FBF9] px-2 py-[6px] text-[12px] font-semibold leading-4 text-[#25AD32]';
    }

    if (status === 'failed') {
      return 'inline-flex h-6 items-center gap-1 rounded-[8px] bg-[#FDF6FA] px-2 py-[6px] text-[12px] font-semibold leading-4 text-[#FF2524]';
    }

    return 'inline-flex h-6 items-center gap-1 rounded-[8px] bg-[#FFF7E8] px-2 py-[6px] text-[12px] font-semibold leading-4 text-[#D98A00]';
  }
}
