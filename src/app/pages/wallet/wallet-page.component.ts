import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroBanknotes,
  heroChevronDown,
  heroChevronLeft,
  heroChevronRight,
  heroBuildingLibrary,
  heroClipboardDocument,
  heroMagnifyingGlass,
  heroPlus,
  heroUser,
  heroXMark,
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
      heroXMark,
      heroClipboardDocument,
      heroBuildingLibrary,
      heroUser,
      heroBanknotes,
    }),
  ],
  template: `
    <div class="flex h-full flex-col rounded-[32px] border border-gray-100/60 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
      <div class="flex flex-col gap-4 border-b border-[#F0F0F2] px-8 py-6 lg:flex-row lg:items-center lg:justify-between">
        <h1 class="text-[20px] font-black tracking-tight text-[#1A1C21]">Wallet</h1>

        <button
          type="button"
          (click)="isFundWalletModalOpen.set(true)"
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

    @if (isFundWalletModalOpen()) {
      <div
        class="fixed inset-0 z-[220] flex items-center justify-center bg-black/20 p-4 backdrop-blur-[2px]"
        (click)="isFundWalletModalOpen.set(false)"
      >
        <div
          class="w-full max-w-[560px] rounded-[28px] bg-white px-6 py-6 shadow-[0_30px_80px_-40px_rgba(19,27,45,0.45)] sm:px-8 sm:py-7"
          (click)="$event.stopPropagation()"
        >
          <div class="flex items-start justify-between gap-4">
            <h2 class="text-[22px] font-black tracking-tight text-[#1A1C21]">Fund wallet</h2>

            <button
              type="button"
              (click)="isFundWalletModalOpen.set(false)"
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F7F7F8] text-[#525762] shadow-sm transition hover:bg-[#EFEFF2]"
              aria-label="Close fund wallet modal"
            >
              <ng-icon name="heroXMark" class="text-xl"></ng-icon>
            </button>
          </div>

          <div class="mt-8 overflow-hidden rounded-[24px] bg-[#FCFCFD] p-5 shadow-[inset_0_0_0_1px_rgba(236,238,243,1)]">
            <p class="max-w-[360px] text-[14px] font-medium leading-7 text-[#5E636D]">
              Transfer to the account details below and your wallet will be funded instantly ⚡
            </p>

            <div class="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_132px] lg:items-end">
              <div class="space-y-6">
                <div class="flex items-center gap-4">
                  <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[#F2F3F5] text-[#555A64]">
                    <ng-icon name="heroClipboardDocument" class="text-xl"></ng-icon>
                  </div>
                  <div>
                    <p class="text-[14px] font-medium text-[#9DA2AB]">Account number</p>
                    <div class="mt-1 flex items-center gap-2">
                      <span class="text-[21px] font-medium tracking-tight text-[#20242B]">3105500602</span>
                      <button
                        type="button"
                        class="text-[#6B5CF0] transition hover:text-[#5945DB]"
                        aria-label="Copy account number"
                      >
                        <ng-icon name="heroClipboardDocument" class="text-lg"></ng-icon>
                      </button>
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-4">
                  <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[#F2F3F5] text-[#555A64]">
                    <ng-icon name="heroBuildingLibrary" class="text-xl"></ng-icon>
                  </div>
                  <div>
                    <p class="text-[14px] font-medium text-[#9DA2AB]">Bank name</p>
                    <p class="mt-1 text-[17px] font-medium tracking-tight text-[#20242B]">Wema Bank</p>
                  </div>
                </div>

                <div class="flex items-center gap-4">
                  <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[#F2F3F5] text-[#555A64]">
                    <ng-icon name="heroUser" class="text-xl"></ng-icon>
                  </div>
                  <div>
                    <p class="text-[14px] font-medium text-[#9DA2AB]">Name</p>
                    <p class="mt-1 text-[17px] font-medium tracking-tight text-[#20242B]">Bryan Odjede</p>
                  </div>
                </div>
              </div>

              <div class="relative mx-auto h-[126px] w-[132px]">
                <div class="absolute right-0 top-5 h-[86px] w-[104px] rounded-[18px] bg-linear-to-br from-[#7D6AF6] to-[#5C44DF] shadow-[0_22px_30px_-20px_rgba(92,68,223,0.7)]"></div>
                <div class="absolute right-[20px] top-0 h-12 w-12 rotate-[45deg] rounded-[10px] bg-[#7D6AF6]"></div>
                <div class="absolute right-[82px] top-[18px] h-8 w-8 rounded-full border border-[#DADCF4] bg-white/70"></div>
                <div class="absolute right-[58px] top-[18px] h-8 w-8 rounded-full border border-[#DADCF4] bg-white/50"></div>
                <div class="absolute right-[60px] top-[56px] flex h-7 w-12 items-center justify-center rounded-[8px] bg-[#E9EAF5] text-[#666B74] shadow-sm">
                  <span class="h-2.5 w-2.5 rounded-full bg-[#8F96A3]"></span>
                </div>
              </div>
            </div>
          </div>

          <div class="my-7 flex items-center gap-4 text-[#7D828B]">
            <span class="h-px flex-1 bg-[#E7EAF0]"></span>
            <span class="text-[14px] font-medium">OR</span>
            <span class="h-px flex-1 bg-[#E7EAF0]"></span>
          </div>

          <button
            type="button"
            class="flex w-full items-center justify-between rounded-[22px] border border-[#ECEEF3] bg-white px-5 py-4 text-left transition hover:bg-[#FAFAFC]"
          >
            <div class="flex items-center gap-4">
              <div class="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#F2F3F5] text-[#4D8DF7]">
                <ng-icon name="heroBanknotes" class="text-xl"></ng-icon>
              </div>
              <div>
                <p class="text-[16px] font-semibold text-[#20242B]">Pay online</p>
                <p class="mt-1 text-[14px] font-medium text-[#9DA2AB]">Fund your wallet via Paystack</p>
              </div>
            </div>

            <span class="text-[24px] font-light text-[#8C919A]">›</span>
          </button>
        </div>
      </div>
    }
  `,
  host: { class: 'block h-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WalletPageComponent {
  readonly isFundWalletModalOpen = signal(false);
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
