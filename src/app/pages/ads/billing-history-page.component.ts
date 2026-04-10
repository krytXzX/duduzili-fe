import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroChevronDown,
  heroChevronLeft,
  heroChevronRight,
  heroMagnifyingGlass,
} from '@ng-icons/heroicons/outline';

type BillingStatus = 'successful' | 'failed';
type TransactionType = 'all' | 'subscription' | 'renewal';
type BillingDateFilter = 'all' | 'feb-2025' | 'mar-2025';

interface BillingRecord {
  id: string;
  transactionType: TransactionType;
  plan: string;
  amount: string;
  date: string;
  dateKey: BillingDateFilter;
  status: BillingStatus;
}

@Component({
  selector: 'app-billing-history-page',
  imports: [CommonModule, NgIcon],
  providers: [
    provideIcons({
      heroChevronDown,
      heroChevronLeft,
      heroChevronRight,
      heroMagnifyingGlass,
    }),
  ],
  template: `
    <div class="flex h-full flex-col rounded-[32px] border border-gray-100/60 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
      <div class="border-b border-[#F0F0F2] px-8 py-6">
        <h1 class="text-[20px] font-black tracking-tight text-[#1A1C21]">Ads &gt; Billing history</h1>
      </div>

      <div class="flex flex-1 flex-col px-4 py-5 sm:px-8 sm:py-6">
        <div class="overflow-hidden rounded-[26px] border border-[#ECEEF3] bg-white">
          <div class="flex flex-col gap-4 border-b border-[#F1F2F4] px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div class="flex flex-wrap gap-3">
              <button
                type="button"
                (click)="cycleTransactionType()"
                class="inline-flex items-center gap-2 rounded-full border border-[#E8EAF0] bg-white px-4 py-2.5 text-[13px] font-medium text-[#80858F]"
              >
                {{ transactionTypeLabel() }}
                <ng-icon name="heroChevronDown" class="text-sm"></ng-icon>
              </button>

              <button
                type="button"
                (click)="cycleDateFilter()"
                class="inline-flex items-center gap-2 rounded-full border border-[#E8EAF0] bg-white px-4 py-2.5 text-[13px] font-medium text-[#80858F]"
              >
                {{ dateFilterLabel() }}
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

            <label class="relative block w-full max-w-[250px]">
              <ng-icon
                name="heroMagnifyingGlass"
                class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#A2A7B0]"
              ></ng-icon>
              <input
                type="text"
                [value]="searchQuery()"
                (input)="updateSearchQuery($event)"
                placeholder="Search"
                class="w-full rounded-full bg-[#FAFAFB] py-3 pl-11 pr-4 text-[14px] font-medium text-[#2A2D34] outline-none placeholder:text-[#B5BAC4] focus:ring-2 focus:ring-[#6B5CF0]/10"
              >
            </label>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full min-w-[760px]">
              <thead class="border-b border-[#F1F2F4] bg-[#FAFAFB] text-left">
                <tr class="text-[12px] font-semibold text-[#9AA0AA]">
                  <th class="px-8 py-4">Transaction Id</th>
                  <th class="px-4 py-4">Plan</th>
                  <th class="px-4 py-4">Amount</th>
                  <th class="px-4 py-4">Date</th>
                  <th class="px-4 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                @for (record of visibleRecords(); track record.id + record.plan) {
                  <tr class="border-b border-[#F4F5F7] last:border-b-0">
                    <td class="px-8 py-5 text-[14px] font-medium text-[#555A64]">{{ record.id }}</td>
                    <td class="px-4 py-5 text-[14px] font-medium text-[#555A64]">{{ record.plan }}</td>
                    <td class="px-4 py-5 text-[14px] font-semibold text-[#555A64]">{{ record.amount }}</td>
                    <td class="px-4 py-5 text-[14px] font-medium text-[#555A64]">{{ record.date }}</td>
                    <td class="px-4 py-5">
                      <span
                        class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold"
                        [class.bg-[#EDF9EF]]="record.status === 'successful'"
                        [class.text-[#2FB04A]]="record.status === 'successful'"
                        [class.bg-[#FFF0F0]]="record.status === 'failed'"
                        [class.text-[#FF4B4B]]="record.status === 'failed'"
                      >
                        <span
                          class="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] font-bold text-white"
                          [class.bg-[#2FB04A]]="record.status === 'successful'"
                          [class.bg-[#FF4B4B]]="record.status === 'failed'"
                        >
                          {{ record.status === 'successful' ? '✓' : '!' }}
                        </span>
                        {{ record.status === 'successful' ? 'Successful' : 'Failed' }}
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <div class="mt-auto flex items-center justify-between px-2 pt-6">
          <p class="text-[14px] font-semibold text-[#646A73]">{{ visibleRecords().length }} results</p>

          <div class="flex items-center gap-2 text-[14px] font-medium text-[#B2B7C0]">
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
            <span class="ml-2">of 12</span>
          </div>
        </div>
      </div>
    </div>
  `,
  host: { class: 'block h-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillingHistoryPageComponent {
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
      id: '74785GH830Y',
      transactionType: 'renewal',
      plan: 'Premium Plan',
      amount: '₦25,000.00',
      date: '14 Feb, 2025',
      dateKey: 'feb-2025',
      status: 'successful',
    },
    {
      id: '74785GH830Z',
      transactionType: 'subscription',
      plan: 'Business Plan',
      amount: '₦25,000.00',
      date: '14 Feb, 2025',
      dateKey: 'feb-2025',
      status: 'failed',
    },
    {
      id: '74785GH831A',
      transactionType: 'renewal',
      plan: 'Enterprise Plan',
      amount: '₦25,000.00',
      date: '14 Feb, 2025',
      dateKey: 'feb-2025',
      status: 'successful',
    },
    {
      id: '74785GH831B',
      transactionType: 'subscription',
      plan: 'Pro Plan',
      amount: '₦25,000.00',
      date: '03 Mar, 2025',
      dateKey: 'mar-2025',
      status: 'successful',
    },
  ]);

  readonly searchQuery = signal('');
  readonly transactionType = signal<TransactionType>('all');
  readonly dateFilter = signal<BillingDateFilter>('all');
  readonly statusFilter = signal<'all' | BillingStatus>('all');

  readonly visibleRecords = computed(() =>
    this.records().filter(record => {
      const matchesSearch =
        this.searchQuery().trim() === '' ||
        record.id.toLowerCase().includes(this.searchQuery().toLowerCase()) ||
        record.plan.toLowerCase().includes(this.searchQuery().toLowerCase());

      const matchesType =
        this.transactionType() === 'all' || record.transactionType === this.transactionType();

      const matchesDate =
        this.dateFilter() === 'all' || record.dateKey === this.dateFilter();

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
    const order: BillingDateFilter[] = ['all', 'feb-2025', 'mar-2025'];
    const currentIndex = order.indexOf(this.dateFilter());
    this.dateFilter.set(order[(currentIndex + 1) % order.length]);
  }

  cycleStatusFilter(): void {
    const order: Array<'all' | BillingStatus> = ['all', 'successful', 'failed'];
    const currentIndex = order.indexOf(this.statusFilter());
    this.statusFilter.set(order[(currentIndex + 1) % order.length]);
  }
}
