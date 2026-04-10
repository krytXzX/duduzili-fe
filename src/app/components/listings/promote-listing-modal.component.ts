import { ChangeDetectionStrategy, Component, computed, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroGlobeAlt,
  heroWallet,
  heroXMark,
} from '@ng-icons/heroicons/outline';
import { heroStarSolid } from '@ng-icons/heroicons/solid';

interface ListingBoostPlan {
  id: '1-day' | '7-days' | '14-days' | '30-days';
  label: string;
  price: string;
  unit: string;
  billing: string;
  subscriptionAmount: string;
  vatAmount: string;
  totalAmount: string;
  summaryTitle: string;
  summaryBilling: string;
  savings?: string;
}

@Component({
  selector: 'app-promote-listing-modal',
  imports: [CommonModule, NgIcon],
  providers: [provideIcons({ heroXMark, heroWallet, heroGlobeAlt, heroStarSolid })],
  template: `
    <div class="fixed inset-0 z-[220] flex items-center justify-center p-4" (click)="close.emit()">
      <div class="absolute inset-0 bg-black/20 backdrop-blur-[2px]"></div>

      <div
        class="relative overflow-hidden rounded-[32px] bg-white shadow-[0_30px_80px_-40px_rgba(19,27,45,0.45)]"
        [class.w-full]="step() !== 'confirm'"
        [style.max-width]="modalWidth()"
        (click)="$event.stopPropagation()"
      >
        @if (step() === 'confirm') {
          <div class="p-10 pt-16 text-center">
            <button
              type="button"
              (click)="close.emit()"
              class="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm transition hover:text-gray-600"
            >
              <ng-icon name="heroXMark" class="text-xl"></ng-icon>
            </button>

            <div class="mb-10 flex justify-center">
              <div class="flex h-32 w-32 items-center justify-center rounded-full bg-[#F8F6EE]">
                <div class="flex h-24 w-24 items-center justify-center rounded-full bg-[#FFF2BD]">
                  <div class="flex h-16 w-16 items-center justify-center rounded-[20px] bg-[#D0B21F] text-white shadow-lg shadow-yellow-100">
                    <ng-icon name="heroStarSolid" class="text-2xl"></ng-icon>
                  </div>
                </div>
              </div>
            </div>

            <h2 class="text-[24px] font-semibold leading-tight tracking-tight text-[#1A1C21]">
              You have <span class="font-black">4/100</span> listing promotion left
            </h2>

            <p class="mx-auto mt-5 max-w-[420px] text-[15px] leading-7 text-gray-500">
              Promoting this would mean, kinikan kinikan and more kinikan. You get?
            </p>

            <div class="mt-12 flex items-center justify-center gap-3">
              <button
                type="button"
                (click)="close.emit()"
                class="rounded-full border border-gray-100 bg-white px-8 py-4 text-[15px] font-medium text-[#1A1C21] transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                (click)="step.set('plan')"
                class="rounded-full bg-[#6653E4] px-8 py-4 text-[15px] font-medium text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)] transition hover:bg-[#5945DB]"
              >
                Yes, promote listing
              </button>
            </div>
          </div>
        }

        @if (step() === 'plan') {
          <div class="relative flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div class="relative bg-linear-to-b from-[#B5A9FF] via-[#EEE9FF] to-white px-10 pb-18 pt-10 text-center">
              <button
                type="button"
                (click)="close.emit()"
                class="absolute right-8 top-8 flex h-10 w-10 items-center justify-center rounded-full text-[#1A1C21] transition hover:bg-white/60"
              >
                <ng-icon name="heroXMark" class="text-2xl"></ng-icon>
              </button>

              <div class="mx-auto max-w-xl pt-16">
                <h2 class="text-[2rem] font-black leading-[1.02] tracking-tight text-[#17181D]">
                  Choose a boosting plan to proceed🚀
                </h2>
                <p class="mt-3 text-[0.95rem] font-medium text-[#7F828B]">
                  Give your listing more visibility
                </p>
              </div>
            </div>

            <div class="flex-1 overflow-y-auto px-10 pb-12">
              <div class="-mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                @for (plan of plans; track plan.id) {
                  <button
                    type="button"
                    (click)="selectedPlanId.set(plan.id)"
                    class="flex min-h-[225px] flex-col justify-between rounded-[26px] border bg-white p-6 text-left transition-all"
                    [class.border-[#6955F2]]="selectedPlanId() === plan.id"
                    [class.bg-[#F8F6FF]]="selectedPlanId() === plan.id"
                    [class.shadow-[0_16px_38px_-28px_rgba(105,85,242,0.8)]]="selectedPlanId() === plan.id"
                    [class.border-[#E7E8EC]]="selectedPlanId() !== plan.id"
                  >
                    <div>
                      <h3 class="text-[1rem] font-semibold tracking-tight text-[#1B1D23]">{{ plan.label }}</h3>
                    </div>

                    <div>
                      @if (plan.savings) {
                        <span class="mb-4 inline-flex rounded-full bg-[#F1F7AA] px-2.5 py-1 text-xs font-semibold text-[#6A7414]">
                          Save {{ plan.savings }}
                        </span>
                      }

                      <div class="flex items-baseline gap-1 text-[#1B1D23]">
                        <span class="text-[1.8rem] font-black leading-none">{{ plan.price }}</span>
                        <span class="text-[0.875rem] font-medium text-[#8B8F98]">/{{ plan.unit }}</span>
                      </div>
                      <p class="mt-1 text-[0.875rem] font-medium text-[#666B74]">{{ plan.billing }}</p>
                    </div>
                  </button>
                }
              </div>

              <div class="mt-16 flex justify-center">
                <button
                  type="button"
                  (click)="step.set('payment')"
                  class="w-full max-w-[460px] rounded-full bg-[#6653E4] px-8 py-4 text-[1rem] font-semibold text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)] transition hover:bg-[#5945DB]"
                >
                  Proceed
                </button>
              </div>
            </div>
          </div>
        }

        @if (step() === 'payment') {
          <div class="grid h-full gap-6 p-8 lg:grid-cols-[minmax(0,1fr)_480px]">
            <section class="min-w-0 pt-4">
              <h2 class="text-[1.8rem] font-bold tracking-tight text-[#1A1C21]">Select your payment method</h2>

              <div class="mt-8 space-y-4">
                <button
                  type="button"
                  (click)="selectedPaymentId.set('wallet')"
                  class="flex w-full items-start justify-between rounded-[16px] border px-4 py-3.5 text-left transition"
                  [class.border-[#6955F2]]="selectedPaymentId() === 'wallet'"
                  [class.bg-[#F8F6FF]]="selectedPaymentId() === 'wallet'"
                  [class.border-[#E6E7EB]]="selectedPaymentId() !== 'wallet'"
                >
                  <div class="flex items-start gap-3">
                    <span class="mt-0.5 text-[#272A31]">
                      <ng-icon name="heroWallet" class="text-lg"></ng-icon>
                    </span>
                    <p class="text-[0.95rem] font-medium text-[#1A1C21]">Wallet (Balance: N250,000)</p>
                  </div>
                  <span
                    class="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border"
                    [class.border-[#6955F2]]="selectedPaymentId() === 'wallet'"
                    [class.border-[#D9DBE2]]="selectedPaymentId() !== 'wallet'"
                  >
                    @if (selectedPaymentId() === 'wallet') {
                      <span class="h-2.5 w-2.5 rounded-full bg-[#6955F2]"></span>
                    }
                  </span>
                </button>

                <button
                  type="button"
                  (click)="selectedPaymentId.set('online')"
                  class="flex w-full items-start justify-between rounded-[16px] border px-4 py-3.5 text-left transition"
                  [class.border-[#6955F2]]="selectedPaymentId() === 'online'"
                  [class.bg-[#F8F6FF]]="selectedPaymentId() === 'online'"
                  [class.border-[#E6E7EB]]="selectedPaymentId() !== 'online'"
                >
                  <div class="flex items-start gap-3">
                    <span class="mt-0.5 text-[#272A31]">
                      <ng-icon name="heroGlobeAlt" class="text-lg"></ng-icon>
                    </span>
                    <p class="text-[0.95rem] font-medium text-[#1A1C21]">Online</p>
                  </div>
                  <span
                    class="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border"
                    [class.border-[#6955F2]]="selectedPaymentId() === 'online'"
                    [class.border-[#D9DBE2]]="selectedPaymentId() !== 'online'"
                  >
                    @if (selectedPaymentId() === 'online') {
                      <span class="h-2.5 w-2.5 rounded-full bg-[#6955F2]"></span>
                    }
                  </span>
                </button>
              </div>
            </section>

            <aside class="relative rounded-[28px] bg-[#FAFAFB] p-8 shadow-[inset_0_0_0_1px_rgba(235,237,242,0.9)]">
              <button
                type="button"
                (click)="close.emit()"
                class="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-[#1A1C21] transition hover:bg-white"
              >
                <ng-icon name="heroXMark" class="text-xl"></ng-icon>
              </button>

              <h3 class="pr-14 text-[2.65rem] font-medium leading-none tracking-tight text-[#1A1C21]">{{ selectedPlan().summaryTitle }}</h3>
              <p class="mt-3 text-[0.95rem] font-medium text-[#8B8F98]">{{ selectedPlan().summaryBilling }}</p>

              <div class="mt-8 h-px bg-[#E3E5EA]"></div>

              <div class="mt-8 space-y-4 text-[0.95rem] text-[#595E68]">
                <div class="flex items-center justify-between gap-4">
                  <span>Weekly subscription</span>
                  <span>{{ selectedPlan().subscriptionAmount }}</span>
                </div>
                <div class="flex items-center justify-between gap-4">
                  <span>VAT (7.5%)</span>
                  <span>{{ selectedPlan().vatAmount }}</span>
                </div>
                <div class="flex items-center justify-between gap-4 pt-2 text-[1.05rem] font-semibold text-[#1A1C21]">
                  <span>Total due today</span>
                  <span>{{ selectedPlan().totalAmount }}</span>
                </div>
              </div>

              <div class="mt-8 h-px bg-[#E3E5EA]"></div>

              <label class="mt-8 flex cursor-pointer items-center gap-3 text-[0.95rem] font-medium text-[#424750]">
                <input
                  type="checkbox"
                  [checked]="isRecurring()"
                  (change)="isRecurring.set(!isRecurring())"
                  class="h-4 w-4 rounded border-[#D3D6DE] text-[#6955F2] focus:ring-[#6955F2]/20"
                >
                <span>Mark this payment as recurring</span>
              </label>

              <button
                type="button"
                (click)="step.set('success')"
                class="mt-16 w-full rounded-full bg-[#6653E4] px-8 py-4 text-[1rem] font-semibold text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)] transition hover:bg-[#5945DB]"
              >
                Confirm and pay
              </button>

              <p class="mt-10 text-[0.875rem] leading-6 text-[#6D727C]">
                By clicking on Confirm and pay, you accept the
                <span class="text-[#6653E4]">Terms of Use</span>, confirm that you will abide by the
                Safety Tips and declare that this posting does not include any Prohibited Items.
              </p>
            </aside>
          </div>
        }

        @if (step() === 'success') {
          <div class="flex h-full flex-col items-center justify-center px-6 py-12 text-center animate-in fade-in zoom-in-95 duration-300">
            <div class="mb-10 text-[92px] leading-none">🛒</div>
            <h2 class="text-[2rem] font-black tracking-tight text-[#1A1C21]">
              Listing promotion is now active 🚀
            </h2>
            <p class="mt-4 max-w-[620px] text-[0.95rem] font-medium leading-7 text-[#8E929B]">
              Your listing is now promoted across Search, Categories, and Explore.
              Promotion ends on 27 April 2026.
            </p>

            <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                (click)="resetFlow()"
                class="rounded-full bg-[#F3F3F5] px-6 py-3.5 text-sm font-semibold text-[#353A43] transition hover:bg-[#E9EAF0]"
              >
                Promote another listing
              </button>
              <button
                type="button"
                (click)="finishAndClose()"
                class="rounded-full bg-[#6653E4] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)] transition hover:bg-[#5945DB]"
              >
                View running Ads
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: contents;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromoteListingModalComponent {
  close = output<void>();
  promoted = output<void>();

  readonly step = signal<'confirm' | 'plan' | 'payment' | 'success'>('confirm');
  readonly selectedPlanId = signal<ListingBoostPlan['id']>('7-days');
  readonly selectedPaymentId = signal<'wallet' | 'online'>('wallet');
  readonly isRecurring = signal(false);

  readonly plans: ListingBoostPlan[] = [
    {
      id: '1-day',
      label: 'Promote for 1 day',
      price: '₦100',
      unit: 'day',
      billing: 'Billed daily',
      subscriptionAmount: '₦100.00',
      vatAmount: '₦7.50',
      totalAmount: '₦107.50',
      summaryTitle: 'Feature for 1 day',
      summaryBilling: 'Billed daily',
    },
    {
      id: '7-days',
      label: 'Promote for 7 days',
      price: '₦500',
      unit: 'week',
      billing: 'Billed weekly',
      subscriptionAmount: '₦1,000.00',
      vatAmount: '₦75.00',
      totalAmount: '₦1,075.00',
      summaryTitle: 'Feature for 7 days',
      summaryBilling: 'Billed monthly',
    },
    {
      id: '14-days',
      label: 'Promote for 14 days',
      price: '₦700',
      unit: 'bi-weekly',
      billing: 'Billed bi-weekly',
      subscriptionAmount: '₦700.00',
      vatAmount: '₦52.50',
      totalAmount: '₦752.50',
      summaryTitle: 'Feature for 14 days',
      summaryBilling: 'Billed bi-weekly',
      savings: '20%',
    },
    {
      id: '30-days',
      label: 'Promote for 30 days',
      price: '₦1,000',
      unit: 'month',
      billing: 'Billed monthly',
      subscriptionAmount: '₦1,000.00',
      vatAmount: '₦75.00',
      totalAmount: '₦1,075.00',
      summaryTitle: 'Feature for 30 days',
      summaryBilling: 'Billed monthly',
      savings: '50%',
    },
  ];

  readonly selectedPlan = computed(
    () => this.plans.find((plan) => plan.id === this.selectedPlanId()) ?? this.plans[1],
  );

  readonly modalWidth = computed(() => {
    switch (this.step()) {
      case 'confirm':
        return '560px';
      case 'plan':
        return '1120px';
      case 'payment':
        return '1120px';
      default:
        return '760px';
    }
  });

  resetFlow() {
    this.selectedPlanId.set('7-days');
    this.selectedPaymentId.set('wallet');
    this.isRecurring.set(false);
    this.step.set('confirm');
  }

  finishAndClose() {
    this.promoted.emit();
    this.close.emit();
  }
}
