import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroSparklesSolid, heroCheckSolid } from '@ng-icons/heroicons/solid';
import { AdsSubscriptionModalComponent } from './components/ads-subscription-modal.component';

interface BillingTab {
  id: 'weekly' | 'monthly' | 'yearly';
  label: string;
}

interface PlanFeature {
  label: string;
  free: string;
  pro: string;
  premium: string;
  enterprise: string;
}

@Component({
  selector: 'app-ads-plans-page',
  imports: [CommonModule, RouterLink, NgIcon, AdsSubscriptionModalComponent],
  providers: [provideIcons({ heroSparklesSolid, heroCheck: heroCheckSolid })],
  template: `
    <div class="mx-auto w-full max-w-[420px] bg-[#F7F7FA] px-4 pt-4 pb-8 md:hidden">
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <button
            type="button"
            (click)="goToAdsMenu()"
            aria-label="Back to Ads"
            class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F6FA] text-[#30313A]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-[16px] w-[16px]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M11.78 4.22a.75.75 0 010 1.06L7.06 10l4.72 4.72a.75.75 0 11-1.06 1.06l-5.25-5.25a.75.75 0 010-1.06l5.25-5.25a.75.75 0 011.06 0z" clip-rule="evenodd" />
            </svg>
          </button>
          <h1 class="text-[20px] font-semibold tracking-[-0.03em] text-[#202335]">Plans</h1>
        </div>
      </div>

      <div class="mt-5 inline-flex w-full items-center gap-3 rounded-[14px] bg-[#F5F3FF] px-3 py-3 text-[11px] font-medium text-[#4A4F57]">
        <span class="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#6D5AF0] shadow-sm">
          <ng-icon name="heroSparklesSolid" class="text-[12px]"></ng-icon>
        </span>
        Your subscription expires on 27 April, 2026
      </div>

      <div class="mt-4 flex items-center rounded-full border border-[#EFEFF3] bg-white p-1 shadow-[0_10px_18px_-18px_rgba(18,24,39,0.45)]">
        @for (tab of billingTabs; track tab.id) {
          <button
            type="button"
            (click)="activeBillingTab.set(tab.id)"
            class="rounded-full px-3 py-2 text-[10px] font-medium transition"
            [class.bg-[#F7F7FA]]="activeBillingTab() === tab.id"
            [class.text-[#3A3E46]]="activeBillingTab() === tab.id"
            [class.text-[#9A9EA8]]="activeBillingTab() !== tab.id"
          >
            {{ tab.label }}
            @if (tab.id === 'monthly') {
              <span class="text-[#C7B97A]">Save ~ 20%</span>
            }
          </button>
        }
      </div>

      <div class="mt-4 flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        @for (card of mobilePlans(); track card.id) {
          <article
            class="min-w-[160px] flex-1 rounded-[20px] border bg-white p-4 shadow-[0_10px_24px_-24px_rgba(17,24,39,0.55)]"
            [class.border-[#EEEFF3]]="card.id !== 'pro'"
            [class.border-[#E0D3FF]]="card.id === 'pro'"
            [class.shadow-[inset_0_0_0_1px_rgba(114,90,242,0.18)]]="card.id === 'pro'"
          >
            <div class="flex items-start justify-between gap-2">
              <div>
                <p class="text-[13px] font-semibold text-[#1D2027]">{{ card.name }}</p>
                <div class="mt-3 flex items-baseline gap-1">
                  <span class="text-[17px] font-black text-[#1D2027]">{{ card.price }}</span>
                </div>
                <p class="mt-1 text-[10px] text-[#8A8E96]">{{ card.billing }}</p>
              </div>
            </div>

            <button
              type="button"
              (click)="card.id === 'free' ? null : openSubscriptionModal(card.id)"
              [disabled]="card.id === 'free'"
              class="mt-4 w-full rounded-full px-3 py-2 text-[10px] font-medium"
              [class.border]="card.id === 'free'"
              [class.border-[#E8E8ED]]="card.id === 'free'"
              [class.bg-[#FAFAFB]]="card.id === 'free'"
              [class.text-[#A7AAB2]]="card.id === 'free'"
              [class.bg-[#6653E4]]="card.id !== 'free'"
              [class.text-white]="card.id !== 'free'"
              [class.shadow-[0_16px_30px_-18px_rgba(102,83,228,0.9)]]="card.id !== 'free'"
            >
              {{ card.cta }}
            </button>

            <div class="mt-4">
              <p class="text-[10px] font-medium text-[#1D2027]">What you'll get</p>
              <div class="mt-3 space-y-2">
                @for (feature of card.features; track feature) {
                  <div class="flex items-start gap-2 text-[9px] text-[#555B66]">
                    <ng-icon name="heroCheck" class="mt-0.5 text-[10px] text-[#7A6AF1]"></ng-icon>
                    <span>{{ feature }}</span>
                  </div>
                }
              </div>
            </div>
          </article>
        }
      </div>
    </div>

    <div class="hidden h-full flex-col rounded-[32px] border border-gray-100/60 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] md:flex">
      <div class="border-b border-[#F0F0F2] px-8 py-6">
        <h1 class="text-[20px] font-black tracking-tight text-[#1A1C21]">Ads &gt; Plans</h1>
      </div>

      <div class="flex-1 overflow-y-auto px-8 py-6">
        <div class="inline-flex items-center gap-3 rounded-2xl bg-[#F5F3FF] px-4 py-3 text-sm font-semibold text-[#4A4F57]">
          <span class="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#6D5AF0] shadow-sm">
            <ng-icon name="heroSparklesSolid" class="text-sm"></ng-icon>
          </span>
          Your subscription expires on 27 April, 2026 (102 days)
        </div>

        <div class="mt-5 inline-flex rounded-full border border-[#EFEFF3] bg-white p-1 shadow-[0_10px_18px_-18px_rgba(18,24,39,0.45)]">
          @for (tab of billingTabs; track tab.id) {
            <button
              type="button"
              (click)="activeBillingTab.set(tab.id)"
              class="rounded-full px-5 py-2.5 text-sm font-semibold transition"
              [class.bg-[#F7F7FA]]="activeBillingTab() === tab.id"
              [class.text-[#3A3E46]]="activeBillingTab() === tab.id"
              [class.text-[#9A9EA8]]="activeBillingTab() !== tab.id"
            >
              {{ tab.label }}
            </button>
          }
        </div>

        <div class="mt-6 overflow-hidden rounded-[30px] border border-[#ECEBF2]">
          <div class="grid grid-cols-[1.2fr_repeat(4,minmax(0,1fr))] bg-white">
            <div class="border-r border-[#EEEFF3] px-6 py-8"></div>

            <div class="border-r border-[#EEEFF3] px-6 py-8">
              <p class="text-[1.05rem] font-semibold text-[#1D2027]">Free</p>
              <div class="mt-3 flex items-baseline gap-1">
                <span class="text-[2rem] font-black text-[#1D2027]">₦0</span>
              </div>
              <button
                type="button"
                class="mt-6 w-full rounded-full border border-[#E8E8ED] bg-[#FAFAFB] px-4 py-3 text-sm font-semibold text-[#A7AAB2]"
              >
                Current plan
              </button>
            </div>

            <div class="relative border-r border-[#D9CCFF] bg-[#FCFBFF] px-6 py-8 shadow-[inset_0_0_0_1px_rgba(114,90,242,0.12)]">
              <span class="absolute right-4 top-4 rounded-full bg-[#EDE8FF] px-3 py-1 text-xs font-semibold text-[#725AF2]">Most popular</span>
              <p class="text-[1.05rem] font-semibold text-[#1D2027]">Pro</p>
              <div class="mt-3 flex items-baseline gap-1">
                <span class="text-[2rem] font-black text-[#1D2027]">₦1,000</span>
                <span class="text-[0.95rem] font-medium text-[#8A8E96]">/{{ selectedUnitLabel() }}</span>
              </div>
              <p class="mt-1 text-sm font-medium text-[#666B74]">Billed {{ activeBillingTab() }}</p>
              <button
                type="button"
                (click)="openSubscriptionModal('pro')"
                class="mt-6 w-full rounded-full bg-[#6653E4] px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_-18px_rgba(102,83,228,0.9)]"
              >
                Get Pro
              </button>
            </div>

            <div class="border-r border-[#EEEFF3] px-6 py-8">
              <p class="text-[1.05rem] font-semibold text-[#1D2027]">Premium</p>
              <div class="mt-3 flex items-baseline gap-1">
                <span class="text-[2rem] font-black text-[#1D2027]">₦1,500</span>
                <span class="text-[0.95rem] font-medium text-[#8A8E96]">/{{ selectedUnitLabel() }}</span>
              </div>
              <p class="mt-1 text-sm font-medium text-[#666B74]">Billed {{ activeBillingTab() }}</p>
              <button
                type="button"
                (click)="openSubscriptionModal('premium')"
                class="mt-6 w-full rounded-full bg-[#6653E4] px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_-18px_rgba(102,83,228,0.9)]"
              >
                Get Premium
              </button>
            </div>

            <div class="px-6 py-8">
              <p class="text-[1.05rem] font-semibold text-[#1D2027]">Enterprise</p>
              <div class="mt-3 flex items-baseline gap-1">
                <span class="text-[2rem] font-black text-[#1D2027]">₦2,000</span>
                <span class="text-[0.95rem] font-medium text-[#8A8E96]">/{{ selectedUnitLabel() }}</span>
              </div>
              <p class="mt-1 text-sm font-medium text-[#666B74]">Billed {{ activeBillingTab() }}</p>
              <button
                type="button"
                (click)="openSubscriptionModal('enterprise')"
                class="mt-6 w-full rounded-full bg-[#6653E4] px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_-18px_rgba(102,83,228,0.9)]"
              >
                Get Enterprise
              </button>
            </div>
          </div>

          <div class="grid grid-cols-[1.2fr_repeat(4,minmax(0,1fr))] border-t border-[#EEEFF3] bg-white">
            <div class="border-r border-[#EEEFF3] px-6 py-5">
              <h2 class="text-[1.6rem] font-bold tracking-tight text-[#1D2027]">Promotions</h2>
            </div>

            <div class="border-r border-[#EEEFF3] px-6 py-5"></div>
            <div class="border-r border-[#D9CCFF] px-6 py-5"></div>
            <div class="border-r border-[#EEEFF3] px-6 py-5"></div>
            <div class="px-6 py-5"></div>
          </div>

          @for (feature of features; track feature.label) {
            <div class="grid grid-cols-[1.2fr_repeat(4,minmax(0,1fr))] border-t border-[#EEEFF3] bg-white">
              <div class="border-r border-[#EEEFF3] px-6 py-4 text-[0.95rem] font-medium text-[#555B66]">
                {{ feature.label }}
              </div>

              <div class="border-r border-[#EEEFF3] px-6 py-4">
                <span class="inline-flex items-center gap-2 text-[0.95rem] font-medium text-[#555B66]">
                  @if (feature.free !== '-') {
                    <ng-icon name="heroCheck" class="text-sm text-[#7A6AF1]"></ng-icon>
                  }
                  {{ feature.free === '-' ? '' : feature.free }}
                </span>
              </div>

              <div class="border-r border-[#D9CCFF] px-6 py-4">
                <span class="inline-flex items-center gap-2 text-[0.95rem] font-medium text-[#555B66]">
                  @if (feature.pro !== '-') {
                    <ng-icon name="heroCheck" class="text-sm text-[#7A6AF1]"></ng-icon>
                  }
                  {{ feature.pro === '-' ? '' : feature.pro }}
                </span>
              </div>

              <div class="border-r border-[#EEEFF3] px-6 py-4">
                <span class="inline-flex items-center gap-2 text-[0.95rem] font-medium text-[#555B66]">
                  @if (feature.premium !== '-') {
                    <ng-icon name="heroCheck" class="text-sm text-[#7A6AF1]"></ng-icon>
                  }
                  {{ feature.premium === '-' ? '' : feature.premium }}
                </span>
              </div>

              <div class="px-6 py-4">
                <span class="inline-flex items-center gap-2 text-[0.95rem] font-medium text-[#555B66]">
                  @if (feature.enterprise !== '-') {
                    <ng-icon name="heroCheck" class="text-sm text-[#7A6AF1]"></ng-icon>
                  }
                  {{ feature.enterprise === '-' ? '' : feature.enterprise }}
                </span>
              </div>
            </div>
          }
        </div>
      </div>

    </div>

    @if (isSubscriptionModalOpen()) {
      <app-ads-subscription-modal
        [plan]="selectedPlanType()"
        (close)="isSubscriptionModalOpen.set(false)"
        (subscribe)="isSubscriptionModalOpen.set(false)"
      ></app-ads-subscription-modal>
    }
  `,
  host: {
    class: 'block h-full'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdsPlansPageComponent {
  private readonly router = inject(Router);

  readonly billingTabs: BillingTab[] = [
    { id: 'weekly', label: 'Weekly billing' },
    { id: 'monthly', label: 'Monthly billing' },
    { id: 'yearly', label: 'Yearly billing' },
  ];

  readonly activeBillingTab = signal<BillingTab['id']>('weekly');
  readonly isSubscriptionModalOpen = signal(false);
  readonly selectedPlanType = signal<'pro' | 'premium' | 'enterprise'>('pro');

  readonly selectedUnitLabel = computed(() => {
    switch (this.activeBillingTab()) {
      case 'monthly':
        return 'month';
      case 'yearly':
        return 'year';
      default:
        return 'week';
    }
  });

  readonly features: PlanFeature[] = [
    { label: 'Ad views', free: 'Limited', pro: 'Unlimited', premium: 'Unlimited', enterprise: 'Unlimited' },
    { label: 'Automobile listings', free: '1', pro: '5', premium: 'Unlimited', enterprise: 'Unlimited' },
    { label: 'Property listings', free: '1', pro: '5', premium: 'Unlimited', enterprise: 'Unlimited' },
    { label: 'Other listings', free: '5', pro: '15', premium: 'Unlimited', enterprise: 'Unlimited' },
    { label: 'Promoted listing', free: '-', pro: '3', premium: '10', enterprise: '10' },
    { label: 'Image banner Ad', free: '-', pro: '1', premium: '1', enterprise: '1' },
    { label: 'Video banner Ad', free: '-', pro: '-', premium: '1', enterprise: '1' },
    { label: 'Store promotion', free: '-', pro: '-', premium: '1', enterprise: 'Unlimited' },
  ];

  readonly mobilePlans = computed(() => {
    const billing = this.activeBillingTab();
    const unit = billing === 'monthly' ? 'Billed monthly' : billing === 'yearly' ? 'Billed yearly' : 'Billed weekly';

    return [
      {
        id: 'free' as const,
        name: 'Free',
        price: '₦0',
        billing: '',
        cta: 'Current plan',
        features: [
          'Limited Ad views',
          '1 listing in Automobile',
          '1 listing in Property',
          '5 listings in Other categories',
        ],
      },
      {
        id: 'pro' as const,
        name: 'Pro',
        price: billing === 'monthly' ? '₦3,200' : billing === 'yearly' ? '₦26,600' : '₦1,000',
        billing: unit,
        cta: 'Get Pro',
        features: [
          'Unlimited Ad views',
          '5 listings in Automobile',
          '5 listings in Property',
          '15 listings in Other categories',
          '1 promotional image banner listing',
        ],
      },
      {
        id: 'premium' as const,
        name: 'Premium',
        price: billing === 'monthly' ? '₦4,800' : billing === 'yearly' ? '₦39,000' : '₦1,500',
        billing: unit,
        cta: 'Get Premium',
        features: [
          'Unlimited Ad views',
          'Unlimited Automobile listings',
          'Unlimited Property listings',
          '10 Promoted listings',
          '1 promotional video banner listing',
        ],
      },
      {
        id: 'enterprise' as const,
        name: 'Enterprise',
        price: billing === 'monthly' ? '₦6,400' : billing === 'yearly' ? '₦52,000' : '₦2,000',
        billing: unit,
        cta: 'Get Enterprise',
        features: [
          'Unlimited Ad views',
          'Unlimited listings in all categories',
          '10 Promoted listings',
          'Unlimited store promotions',
        ],
      },
    ];
  });

  openSubscriptionModal(plan: 'pro' | 'premium' | 'enterprise'): void {
    this.selectedPlanType.set(plan);
    this.isSubscriptionModalOpen.set(true);
  }

  goToAdsMenu(): void {
    void this.router.navigateByUrl('/ads');
  }
}
