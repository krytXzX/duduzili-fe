import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  imports: [CommonModule, NgIcon, AdsSubscriptionModalComponent],
  providers: [provideIcons({ heroSparklesSolid, heroCheck: heroCheckSolid })],
  template: `
    <div class="flex h-full flex-col rounded-[32px] border border-gray-100/60 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
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

      @if (isSubscriptionModalOpen()) {
        <app-ads-subscription-modal
          [plan]="selectedPlanType()"
          (close)="isSubscriptionModalOpen.set(false)"
          (subscribe)="isSubscriptionModalOpen.set(false)"
        ></app-ads-subscription-modal>
      }
    </div>
  `,
  host: {
    class: 'block h-full'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdsPlansPageComponent {
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

  openSubscriptionModal(plan: 'pro' | 'premium' | 'enterprise'): void {
    this.selectedPlanType.set(plan);
    this.isSubscriptionModalOpen.set(true);
  }
}
