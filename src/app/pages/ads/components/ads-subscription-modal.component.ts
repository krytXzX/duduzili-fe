import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroCheckSolid } from '@ng-icons/heroicons/solid';
import { heroGlobeAlt, heroWallet, heroXMark } from '@ng-icons/heroicons/outline';
import { MobileOverlayService } from '../../../services/mobile-overlay.service';

type BillingOptionId = 'week' | 'month' | 'year';
type PaymentOptionId = 'wallet' | 'online';

export type AdsSubscriptionSelection = {
  billingId: BillingOptionId;
  paymentId: PaymentOptionId;
};

interface BillingOption {
  id: BillingOptionId;
  label: string;
  weeklyRate?: string;
  total: string;
  savings?: string;
}

interface FeaturePlanConfig {
  name: string;
  features: string[];
}

@Component({
  selector: 'app-ads-subscription-modal',
  imports: [CommonModule, NgIcon, NgOptimizedImage],
  providers: [provideIcons({ heroWallet, heroGlobeAlt, heroXMark, heroCheck: heroCheckSolid })],
  template: `
    <div
      class="fixed inset-0 z-[220] bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-300 md:flex md:p-4"
      (click)="handleBackdropClick()"
    >
      <div
        class="flex h-full w-full flex-col overflow-hidden bg-white md:rounded-[32px] md:shadow-[0_30px_80px_-40px_rgba(19,27,45,0.45)]"
        (click)="$event.stopPropagation()"
      >
        <div class="flex h-full flex-col md:hidden">
          @if (step() === 'review') {
            <div class="flex min-h-0 flex-1 flex-col">
              <header class="relative px-4 pb-4 pt-5">
                <div class="mx-auto h-1.5 w-14 rounded-full bg-[#E6E7EC]"></div>
                <button
                  type="button"
                  (click)="close.emit()"
                  class="absolute right-4 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-[#ECEEF4] bg-white text-[#1A1C21]"
                  aria-label="Close subscription modal"
                >
                  <ng-icon name="heroXMark" class="text-[16px]"></ng-icon>
                </button>
              </header>

              <div class="min-h-0 flex-1 overflow-y-auto px-4 pb-5">
                <div
                  class="rounded-[18px] bg-[#FAFAFB] p-4 shadow-[inset_0_0_0_1px_rgba(235,237,242,0.9)]"
                >
                  <h2 class="text-[16px] font-semibold tracking-[-0.03em] text-[#1A1C21]">
                    {{ planConfig().name }}
                  </h2>
                  <p class="mt-1 text-[10px] text-[#8B8F98]">{{ summaryLabel() | lowercase }}</p>

                  <div class="mt-4">
                    <h3 class="text-[12px] font-semibold text-[#1A1C21]">Top features</h3>
                    <div class="mt-3 space-y-2">
                      @for (feature of planConfig().features; track feature) {
                        <div class="flex items-start gap-2 text-[10px] text-[#464B54]">
                          <ng-icon
                            name="heroCheck"
                            class="mt-0.5 text-[10px] text-[#7A6AF1]"
                          ></ng-icon>
                          <span>{{ feature }}</span>
                        </div>
                      }
                    </div>
                  </div>

                  <div
                    class="mt-5 space-y-3 border-t border-[#E3E5EA] pt-4 text-[11px] text-[#595E68]"
                  >
                    <div class="flex items-center justify-between gap-4">
                      <span>{{ summaryLabel() }}</span>
                      <span>{{ selectedOption().total }}.00</span>
                    </div>
                    <div class="flex items-center justify-between gap-4">
                      <span>VAT (7.5%)</span>
                      <span>₦0.00</span>
                    </div>
                    <div
                      class="flex items-center justify-between gap-4 text-[12px] font-semibold text-[#1A1C21]"
                    >
                      <span>Total due today</span>
                      <span>{{ selectedOption().total }}.00</span>
                    </div>
                  </div>

                  <label
                    class="mt-4 flex cursor-pointer items-center gap-2 text-[10px] text-[#464B54]"
                  >
                    <input
                      type="checkbox"
                      [checked]="isAutoRenewing()"
                      (change)="isAutoRenewing.set(!isAutoRenewing())"
                      class="h-3.5 w-3.5 rounded border-[#D3D6DE] text-[#6D5AF0] focus:ring-[#6D5AF0]/20"
                    />
                    <span>Auto-renew subscription</span>
                  </label>
                </div>

                <div class="mt-6">
                  <h3 class="text-[12px] font-semibold text-[#1A1C21]">1. Choose billing cycle</h3>

                  <div class="mt-3 space-y-3">
                    @for (option of billingOptions(); track option.id) {
                      <button
                        type="button"
                        (click)="selectedBillingId.set(option.id)"
                        class="flex w-full items-center justify-between rounded-[16px] border px-4 py-3 text-left transition"
                        [class.border-[#6D5AF0]]="selectedBillingId() === option.id"
                        [class.bg-[#FBFAFF]]="selectedBillingId() === option.id"
                        [class.border-[#E6E7EB]]="selectedBillingId() !== option.id"
                      >
                        <div class="flex items-start gap-3">
                          <span
                            class="mt-0.5 flex h-4 w-4 items-center justify-center rounded-full border"
                            [class.border-[#6D5AF0]]="selectedBillingId() === option.id"
                            [class.border-[#D7D9E0]]="selectedBillingId() !== option.id"
                          >
                            @if (selectedBillingId() === option.id) {
                              <span class="h-2 w-2 rounded-full bg-[#6D5AF0]"></span>
                            }
                          </span>

                          <div>
                            <div class="flex items-center gap-2">
                              <p class="text-[12px] font-medium text-[#1A1C21]">
                                {{ option.label }}
                              </p>
                              @if (option.savings) {
                                <span
                                  class="rounded-full bg-[#F1F7AA] px-1.5 py-0.5 text-[8px] font-semibold text-[#6A7414]"
                                  >Save {{ option.savings }}</span
                                >
                              }
                            </div>
                            @if (option.weeklyRate) {
                              <p class="mt-1 text-[10px] text-[#8C9098]">{{ option.weeklyRate }}</p>
                            }
                          </div>
                        </div>

                        <span class="text-[11px] font-medium text-[#6D5AF0]"
                          >For {{ option.total }}</span
                        >
                      </button>
                    }
                  </div>
                </div>

                <button
                  type="button"
                  (click)="handleSubscribe()"
                  [disabled]="isSubmitting()"
                  class="mt-6 w-full rounded-full bg-[#6653E4] px-6 py-3 text-[12px] font-medium text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)] disabled:opacity-50 disabled:pointer-events-none inline-flex items-center justify-center gap-2"
                >
                  @if (isSubmitting()) {
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  }
                  Subscribe
                </button>

                <p class="mt-4 text-[9px] leading-4 text-[#6D727C]">
                  By clicking on Subscribe, you agree to the
                  <span class="text-[#6653E4]">Terms of Use</span> and authorize Duduzili to store
                  and charge your payment method.
                </p>
              </div>
            </div>
          } @else {
            <div
              class="flex flex-1 flex-col items-center justify-center px-4 pb-12 pt-10 text-center"
            >
              <div class="mx-auto h-1.5 w-[50px] rounded-[100px] bg-[#EBEBEB]"></div>

              <div class="mt-16 flex w-full max-w-[334px] flex-col items-center gap-12">
                <div class="flex w-full flex-col items-center gap-4">
                  <img
                    [ngSrc]="successMobileImage"
                    width="134"
                    height="134"
                    alt=""
                    class="h-[134px] w-[134px]"
                  />

                  <div class="flex w-full flex-col items-center gap-3 text-center">
                    <h2 class="text-[26px] font-semibold leading-[40px] text-[#2D2D2D]">
                      Subscription successful 🥳
                    </h2>

                    <p class="text-[16px] leading-6 text-[#959595]">
                      You have subscribed to
                      <span class="font-medium text-[#171717]"> {{ planConfig().name }}</span>
                      for
                      <span class="font-medium text-[#1A1A1A]"> {{ selectedOption().label }}</span
                      >. This expires and renews on
                      <span class="font-medium text-[#101010]"> 7 March, 2026.</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  (click)="emitSelectedSubscription()"
                  [disabled]="isSubmitting()"
                  class="inline-flex h-[52px] w-[174px] items-center justify-center rounded-[64px] border border-white bg-[#6453D9] text-[16px] font-medium text-white shadow-[0px_4px_12px_rgba(81,35,173,0.33),0px_0px_0px_1px_#6B5BD5] disabled:opacity-50 disabled:pointer-events-none gap-2"
                >
                  @if (isSubmitting()) {
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  }
                  Got it
                </button>
              </div>
            </div>
          }
        </div>

        <div class="hidden h-full flex-col md:flex">
          @if (step() === 'review') {
            <div class="grid h-full gap-6 p-8 lg:grid-cols-[minmax(0,1fr)_430px]">
              <section class="min-w-0 pt-2">
                <h2 class="text-[2rem] font-bold tracking-tight text-[#1A1C21]">
                  Review subscription and pay
                </h2>

                <div class="mt-8">
                  <h3 class="text-[1.05rem] font-semibold text-[#1A1C21]">
                    1. Choose billing cycle
                  </h3>

                  <div class="mt-4 space-y-3">
                    @for (option of billingOptions(); track option.id) {
                      <button
                        type="button"
                        (click)="selectedBillingId.set(option.id)"
                        class="flex w-full items-center justify-between rounded-[18px] border px-4 py-4 text-left transition"
                        [class.border-[#6D5AF0]]="selectedBillingId() === option.id"
                        [class.bg-[#FBFAFF]]="selectedBillingId() === option.id"
                        [class.border-[#E6E7EB]]="selectedBillingId() !== option.id"
                      >
                        <div class="flex items-start gap-3">
                          <span
                            class="mt-1 flex h-5 w-5 items-center justify-center rounded-full border"
                            [class.border-[#6D5AF0]]="selectedBillingId() === option.id"
                            [class.border-[#D7D9E0]]="selectedBillingId() !== option.id"
                          >
                            @if (selectedBillingId() === option.id) {
                              <span class="h-2.5 w-2.5 rounded-full bg-[#6D5AF0]"></span>
                            }
                          </span>

                          <div>
                            <div class="flex items-center gap-3">
                              <p class="text-[1rem] font-semibold text-[#1A1C21]">
                                {{ option.label }}
                              </p>
                              @if (option.savings) {
                                <span
                                  class="rounded-full bg-[#F1F7AA] px-2 py-0.5 text-xs font-semibold text-[#6A7414]"
                                  >Save {{ option.savings }}</span
                                >
                              }
                            </div>
                            @if (option.weeklyRate) {
                              <p class="mt-1 text-[0.875rem] font-medium text-[#8C9098]">
                                {{ option.weeklyRate }}
                              </p>
                            }
                          </div>
                        </div>

                        <span class="text-[0.95rem] font-semibold text-[#6D5AF0]"
                          >For {{ option.total }}</span
                        >
                      </button>
                    }
                  </div>
                </div>

                <div class="mt-10">
                  <h3 class="text-[1.05rem] font-semibold text-[#1A1C21]">
                    2. Select your payment method
                  </h3>

                  <div class="mt-4 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      (click)="selectedPaymentId.set('wallet')"
                      class="flex items-start justify-between rounded-[16px] border px-4 py-3.5 text-left transition"
                      [class.border-[#6D5AF0]]="selectedPaymentId() === 'wallet'"
                      [class.bg-[#FBFAFF]]="selectedPaymentId() === 'wallet'"
                      [class.border-[#E6E7EB]]="selectedPaymentId() !== 'wallet'"
                    >
                      <div class="flex items-start gap-3">
                        <ng-icon name="heroWallet" class="mt-0.5 text-lg text-[#2A2D34]"></ng-icon>
                        <p class="text-[0.95rem] font-medium text-[#1A1C21]">
                          Wallet (Balance: N250,000)
                        </p>
                      </div>
                      <span
                        class="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border"
                        [class.border-[#6D5AF0]]="selectedPaymentId() === 'wallet'"
                        [class.border-[#D7D9E0]]="selectedPaymentId() !== 'wallet'"
                      >
                        @if (selectedPaymentId() === 'wallet') {
                          <span class="h-2.5 w-2.5 rounded-full bg-[#6D5AF0]"></span>
                        }
                      </span>
                    </button>

                    <button
                      type="button"
                      (click)="selectedPaymentId.set('online')"
                      class="flex items-start justify-between rounded-[16px] border px-4 py-3.5 text-left transition"
                      [class.border-[#6D5AF0]]="selectedPaymentId() === 'online'"
                      [class.bg-[#FBFAFF]]="selectedPaymentId() === 'online'"
                      [class.border-[#E6E7EB]]="selectedPaymentId() !== 'online'"
                    >
                      <div class="flex items-start gap-3">
                        <ng-icon
                          name="heroGlobeAlt"
                          class="mt-0.5 text-lg text-[#2A2D34]"
                        ></ng-icon>
                        <p class="text-[0.95rem] font-medium text-[#1A1C21]">Online</p>
                      </div>
                      <span
                        class="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border"
                        [class.border-[#6D5AF0]]="selectedPaymentId() === 'online'"
                        [class.border-[#D7D9E0]]="selectedPaymentId() !== 'online'"
                      >
                        @if (selectedPaymentId() === 'online') {
                          <span class="h-2.5 w-2.5 rounded-full bg-[#6D5AF0]"></span>
                        }
                      </span>
                    </button>
                  </div>

                  <label
                    class="mt-5 flex cursor-pointer items-center gap-3 text-[0.95rem] font-medium text-[#464B54]"
                  >
                    <input
                      type="checkbox"
                      [checked]="isAutoRenewing()"
                      (change)="isAutoRenewing.set(!isAutoRenewing())"
                      class="h-4 w-4 rounded border-[#D3D6DE] text-[#6D5AF0] focus:ring-[#6D5AF0]/20"
                    />
                    <span>Auto-renew subscription</span>
                  </label>
                </div>
              </section>

              <aside
                class="relative rounded-[28px] bg-[#FAFAFB] p-8 shadow-[inset_0_0_0_1px_rgba(235,237,242,0.9)]"
              >
                <button
                  type="button"
                  (click)="close.emit()"
                  class="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-[#1A1C21] transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-gray-200"
                >
                  <ng-icon name="heroXMark" class="text-xl"></ng-icon>
                </button>

                <h3
                  class="pr-14 text-[2.65rem] font-medium leading-none tracking-tight text-[#1A1C21]"
                >
                  {{ planConfig().name }}
                </h3>

                <div class="mt-8">
                  <h4 class="text-[1.05rem] font-semibold text-[#1A1C21]">Top features</h4>
                  <div class="mt-5 space-y-3">
                    @for (feature of planConfig().features; track feature) {
                      <div class="flex items-start gap-3 text-[0.95rem] font-medium text-[#464B54]">
                        <ng-icon name="heroCheck" class="mt-0.5 text-sm text-[#7A6AF1]"></ng-icon>
                        <span>{{ feature }}</span>
                      </div>
                    }
                  </div>
                </div>

                <div class="mt-8 h-px bg-[#E3E5EA]"></div>

                <div class="mt-8 space-y-4 text-[0.95rem] text-[#595E68]">
                  <div class="flex items-center justify-between gap-4">
                    <span>{{ summaryLabel() }}</span>
                    <span>{{ selectedOption().total }}.00</span>
                  </div>
                  <div class="flex items-center justify-between gap-4">
                    <span>Service charge</span>
                    <span>₦0.00</span>
                  </div>
                  <div
                    class="flex items-center justify-between gap-4 pt-2 text-[1.05rem] font-semibold text-[#1A1C21]"
                  >
                    <span>Total due today</span>
                    <span>{{ selectedOption().total }}.00</span>
                  </div>
                </div>

                <button
                  type="button"
                  (click)="step.set('success')"
                  class="mt-12 w-full rounded-full bg-[#6653E4] px-8 py-4 text-[1rem] font-semibold text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)] transition hover:bg-[#5945DB] focus:outline-none focus:ring-4 focus:ring-[#6653E4]/20"
                >
                  Subscribe
                </button>

                <p class="mt-10 text-[0.875rem] leading-6 text-[#6D727C]">
                  Renews monthly until cancelled. {{ renewalText() }} will be charged. Cancel
                  anytime in Settings. By subscribing, you agree to the
                  <span class="text-[#6653E4]">Terms of Use</span> and authorize Duduzili to store
                  and charge your payment method.
                </p>
              </aside>
            </div>
          } @else {
            <div class="flex h-full flex-col items-center justify-center px-6 py-10 text-center">
              <div class="flex flex-col items-center gap-8">
                <div class="flex flex-col items-center gap-6">
                  <img
                    [ngSrc]="successDesktopImage"
                    width="200"
                    height="200"
                    alt=""
                    class="h-[200px] w-[200px]"
                  />

                  <div class="flex flex-col items-center gap-2 text-center">
                    <h2 class="w-[460px] text-[32px] font-semibold leading-[1.1] text-[#0D0D0D]">
                      Subscription successful 🥳
                    </h2>

                    <p class="w-[340px] text-[16px] leading-6 text-[#747474]">
                      You have subscribed to
                      <span class="font-medium text-[#0D0D0D]"> {{ planConfig().name }}</span>
                      for
                      <span class="font-medium text-[#0D0D0D]"> {{ selectedOption().label }}.</span>
                      This expires and renews on
                      <span class="font-medium text-[#0D0D0D]"> 7 March, 2026.</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  (click)="emitSelectedSubscription()"
                  [disabled]="isSubmitting()"
                  class="inline-flex h-10 w-[208px] items-center justify-center rounded-[64px] border border-white bg-[#6453D9] text-[14px] font-medium text-white shadow-[0px_4px_12px_rgba(81,35,173,0.33),0px_0px_0px_1px_#6B5BD5] disabled:opacity-50 disabled:pointer-events-none gap-2"
                >
                  @if (isSubmitting()) {
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  }
                  Got it
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdsSubscriptionModalComponent implements OnDestroy {
  readonly close = output<void>();
  readonly subscribe = output<AdsSubscriptionSelection>();
  readonly plan = input<'pro' | 'premium' | 'enterprise'>('pro');
  readonly isSubmitting = input(false);

  private readonly mobileOverlayService = inject(MobileOverlayService);
  readonly successDesktopImage = '/assets/images/ads-plan-success-desktop.png';
  readonly successMobileImage = '/assets/images/ads-plan-success-mobile.png';

  readonly step = signal<'review' | 'success'>('review');
  readonly selectedBillingId = signal<BillingOptionId>('week');
  readonly selectedPaymentId = signal<PaymentOptionId>('wallet');
  readonly isAutoRenewing = signal(false);

  constructor() {
    this.mobileOverlayService.openMobileModal();
  }

  ngOnDestroy(): void {
    this.mobileOverlayService.closeMobileModal();
  }

  handleBackdropClick(): void {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      this.close.emit();
    }
  }

  readonly billingOptions = computed<BillingOption[]>(() => {
    switch (this.plan()) {
      case 'premium':
        return [
          { id: 'week', label: '1 Week', total: '₦1,500' },
          {
            id: 'month',
            label: '1 Month',
            weeklyRate: '₦1,200/week',
            total: '₦4,800',
            savings: '20%',
          },
          {
            id: 'year',
            label: '1 Year',
            weeklyRate: '₦750/week',
            total: '₦39,000',
            savings: '50%',
          },
        ];
      case 'enterprise':
        return [
          { id: 'week', label: '1 Week', total: '₦2,000' },
          {
            id: 'month',
            label: '1 Month',
            weeklyRate: '₦1,600/week',
            total: '₦6,400',
            savings: '20%',
          },
          {
            id: 'year',
            label: '1 Year',
            weeklyRate: '₦1,000/week',
            total: '₦52,000',
            savings: '50%',
          },
        ];
      default:
        return [
          { id: 'week', label: '1 Week', total: '₦1,000' },
          {
            id: 'month',
            label: '1 Month',
            weeklyRate: '₦800/week',
            total: '₦3,200',
            savings: '20%',
          },
          {
            id: 'year',
            label: '1 Year',
            weeklyRate: '₦500/week',
            total: '₦26,600',
            savings: '50%',
          },
        ];
    }
  });

  readonly selectedOption = computed(
    () =>
      this.billingOptions().find((option) => option.id === this.selectedBillingId()) ??
      this.billingOptions()[0],
  );

  readonly planConfig = computed<FeaturePlanConfig>(() => {
    switch (this.plan()) {
      case 'premium':
        return {
          name: 'Premium Plan',
          features: [
            'Unlimited ads views',
            'Unlimited listings in Automobile',
            'Unlimited listings in Property',
            'Unlimited listings in Other categories',
            '10 Promoted listings',
            '1 promotional image banner listing',
            '1 promotional video banner listing',
          ],
        };
      case 'enterprise':
        return {
          name: 'Enterprise Plan',
          features: [
            'Unlimited ads views',
            'Unlimited listings in Automobile',
            'Unlimited listings in Property',
            'Unlimited listings in Other categories',
            '10 Promoted listings',
            '1 promotional image banner listing',
            '1 promotional video banner listing',
            'Unlimited store promotions',
          ],
        };
      default:
        return {
          name: 'Pro Plan',
          features: [
            'Unlimited ads views',
            '5 listings in Automobile',
            '5 listings in Property',
            '15 listings in Other categories',
            '3 Promoted listings',
            '1 promotional image banner listing',
          ],
        };
    }
  });

  readonly summaryLabel = computed(() => {
    switch (this.selectedBillingId()) {
      case 'month':
        return 'Monthly subscription';
      case 'year':
        return 'Yearly subscription';
      default:
        return 'Weekly subscription';
    }
  });

  readonly renewalText = computed(() => {
    switch (this.selectedBillingId()) {
      case 'month':
        return `${this.selectedOption().total}/month`;
      case 'year':
        return `${this.selectedOption().total}/year`;
      default:
        return `${this.selectedOption().total}/week`;
    }
  });

  handleSubscribe(): void {
    this.subscribe.emit({
      billingId: this.selectedBillingId(),
      paymentId: this.selectedPaymentId(),
    });
  }

  emitSelectedSubscription(): void {
    this.handleSubscribe();
  }
}
