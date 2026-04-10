import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroChevronDown,
  heroChevronLeft,
  heroChevronRight,
  heroMagnifyingGlass,
  heroPlus,
} from '@ng-icons/heroicons/outline';

type WalletStatus = 'successful' | 'failed';
type WalletTransactionType = 'all' | 'wallet funding' | 'subscription payment';
type WalletDateFilter = 'all' | 'feb-2025' | 'mar-2025';

interface WalletTransaction {
  id: string;
  amount: string;
  type: Exclude<WalletTransactionType, 'all'>;
  date: string;
  dateKey: WalletDateFilter;
  status: WalletStatus;
}

@Component({
  selector: 'app-wallet-page',
  imports: [CommonModule, NgIcon],
  providers: [
    provideIcons({
      heroChevronDown,
      heroChevronLeft,
      heroChevronRight,
      heroMagnifyingGlass,
      heroPlus,
    }),
  ],
  template: `
    <div class="flex h-full flex-col rounded-[32px] border border-gray-100/60 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
      <div class="flex flex-col gap-4 border-b border-[#F0F0F2] px-8 py-6 lg:flex-row lg:items-center lg:justify-between">
        <h1 class="text-[20px] font-black tracking-tight text-[#1A1C21]">Wallet</h1>

        <button
          type="button"
          class="inline-flex items-center gap-2 self-start rounded-full bg-[#6653E4] px-5 py-3 text-[13px] font-semibold text-white shadow-[0_14px_28px_-18px_rgba(102,83,228,0.9)] transition hover:bg-[#5945DB] focus:outline-none focus:ring-4 focus:ring-[#6653E4]/20"
        >
          <ng-icon name="heroPlus" class="text-sm"></ng-icon>
          Fund wallet
        </button>
      </div>

      <div class="flex-1 overflow-y-auto px-4 py-5 sm:px-8 sm:py-6">
        <section>
          <h2 class="max-w-[460px] text-[34px] font-medium leading-[1.2] tracking-tight text-[#2A2D34]">
            You currently have
            <span class="font-black text-[#8E939D]">₦0.00</span>
            in your wallet
          </h2>
        </section>

        <section class="mt-12">
          <h3 class="text-[18px] font-black tracking-tight text-[#1A1C21]">Transaction history</h3>

          <div class="mt-4 overflow-hidden rounded-[26px] border border-[#ECEEF3] bg-white">
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
            </div>

            <div class="overflow-x-auto">
              <table class="w-full min-w-[760px]">
                <thead class="border-b border-[#F1F2F4] bg-[#FAFAFB] text-left">
                  <tr class="text-[12px] font-semibold text-[#9AA0AA]">
                    <th class="px-8 py-4">Amount</th>
                    <th class="px-4 py-4">Transaction type</th>
                    <th class="px-4 py-4">Date</th>
                    <th class="px-4 py-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  @for (transaction of visibleTransactions(); track transaction.id) {
                    <tr class="border-b border-[#F4F5F7] last:border-b-0">
                      <td class="px-8 py-5 text-[14px] font-semibold text-[#555A64]">{{ transaction.amount }}</td>
                      <td class="px-4 py-5 text-[14px] font-medium text-[#555A64]">{{ transaction.type | titlecase }}</td>
                      <td class="px-4 py-5 text-[14px] font-medium text-[#555A64]">{{ transaction.date }}</td>
                      <td class="px-4 py-5">
                        <span
                          class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold"
                          [class.bg-[#EDF9EF]]="transaction.status === 'successful'"
                          [class.text-[#2FB04A]]="transaction.status === 'successful'"
                          [class.bg-[#FFF0F0]]="transaction.status === 'failed'"
                          [class.text-[#FF4B4B]]="transaction.status === 'failed'"
                        >
                          <span
                            class="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] font-bold text-white"
                            [class.bg-[#2FB04A]]="transaction.status === 'successful'"
                            [class.bg-[#FF4B4B]]="transaction.status === 'failed'"
                          >
                            {{ transaction.status === 'successful' ? '✓' : '!' }}
                          </span>
                          {{ transaction.status === 'successful' ? 'Successful' : 'Failed' }}
                        </span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <div class="mt-auto flex items-center justify-between px-2 pt-6">
          <p class="text-[14px] font-semibold text-[#646A73]">{{ visibleTransactions().length }} results</p>

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
export class WalletPageComponent {
  readonly transactions = signal<WalletTransaction[]>([
    {
      id: 'wallet-1',
      amount: '₦25,000.00',
      type: 'wallet funding',
      date: '14 Feb, 2025',
      dateKey: 'feb-2025',
      status: 'successful',
    },
    {
      id: 'wallet-2',
      amount: '₦25,000.00',
      type: 'subscription payment',
      date: '14 Feb, 2025',
      dateKey: 'feb-2025',
      status: 'successful',
    },
    {
      id: 'wallet-3',
      amount: '₦25,000.00',
      type: 'wallet funding',
      date: '14 Feb, 2025',
      dateKey: 'feb-2025',
      status: 'failed',
    },
    {
      id: 'wallet-4',
      amount: '₦25,000.00',
      type: 'subscription payment',
      date: '14 Feb, 2025',
      dateKey: 'feb-2025',
      status: 'successful',
    },
    {
      id: 'wallet-5',
      amount: '₦40,000.00',
      type: 'wallet funding',
      date: '03 Mar, 2025',
      dateKey: 'mar-2025',
      status: 'successful',
    },
  ]);

  readonly transactionType = signal<WalletTransactionType>('all');
  readonly dateFilter = signal<WalletDateFilter>('all');
  readonly statusFilter = signal<'all' | WalletStatus>('all');

  readonly visibleTransactions = computed(() =>
    this.transactions().filter(transaction => {
      const matchesType =
        this.transactionType() === 'all' || transaction.type === this.transactionType();

      const matchesDate =
        this.dateFilter() === 'all' || transaction.dateKey === this.dateFilter();

      const matchesStatus =
        this.statusFilter() === 'all' || transaction.status === this.statusFilter();

      return matchesType && matchesDate && matchesStatus;
    }),
  );

  readonly transactionTypeLabel = computed(() => {
    switch (this.transactionType()) {
      case 'wallet funding':
        return 'Wallet funding';
      case 'subscription payment':
        return 'Subscription payment';
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

  cycleTransactionType(): void {
    const order: WalletTransactionType[] = ['all', 'wallet funding', 'subscription payment'];
    const currentIndex = order.indexOf(this.transactionType());
    this.transactionType.set(order[(currentIndex + 1) % order.length]);
  }

  cycleDateFilter(): void {
    const order: WalletDateFilter[] = ['all', 'feb-2025', 'mar-2025'];
    const currentIndex = order.indexOf(this.dateFilter());
    this.dateFilter.set(order[(currentIndex + 1) % order.length]);
  }

  cycleStatusFilter(): void {
    const order: Array<'all' | WalletStatus> = ['all', 'successful', 'failed'];
    const currentIndex = order.indexOf(this.statusFilter());
    this.statusFilter.set(order[(currentIndex + 1) % order.length]);
  }
}
