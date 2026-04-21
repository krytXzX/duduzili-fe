import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AdsSubscriptionModalComponent } from './components/ads-subscription-modal.component';

type BillingFrequency = 'weekly' | 'monthly' | 'yearly';
type PlanId = 'free' | 'pro' | 'premium' | 'enterprise';

interface BillingTab {
  id: BillingFrequency;
  label: string;
  savings?: string;
}

interface PlanDefinition {
  id: PlanId;
  name: string;
  weeklyPrice: number;
  monthlyPrice: number;
  yearlyPrice: number;
  cta: string;
  current?: boolean;
  highlighted?: boolean;
  desktopBadge?: string;
  features: readonly string[];
}

@Component({
  selector: 'app-ads-plans-page',
  imports: [CommonModule, RouterLink, NgOptimizedImage, AdsSubscriptionModalComponent],
  template: `
    <div class="mx-auto w-full max-w-[390px] bg-white px-5 pb-[124px] pt-4 md:hidden">
      <div class="flex items-center gap-3">
        <button
          type="button"
          (click)="goToAdsMenu()"
          aria-label="Back to Ads"
          class="inline-flex h-9 w-9 items-center justify-center rounded-[100px] bg-[#F3F3F3] text-[#101010]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M12.5 5L7.5 10L12.5 15"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <h1 class="text-[20px] font-semibold leading-[1.2] text-black">Plans</h1>
      </div>

      <div
        class="mt-8 flex items-center gap-2 rounded-[12px] border border-[#9697C4] px-[9px] py-[11px]"
        style="background-image: linear-gradient(105.33deg, rgba(140, 142, 255, 0.2) 0.73%, rgba(255, 255, 255, 0) 31.43%), linear-gradient(90deg, rgba(250, 250, 250, 0.9) 0%, rgba(250, 250, 250, 0.9) 100%);"
      >
        <span
          class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] border border-[#DBDAE8] bg-white"
        >
          <img [ngSrc]="infoIcon" width="18" height="18" alt="" class="h-[18px] w-[18px]" />
        </span>
        <p class="text-[14px] font-medium leading-5 text-[#1F1F1F]">
          Your subscription expires on 27 April, 2026
        </p>
      </div>

      <div
        class="mt-6 inline-flex min-w-full items-center rounded-[100px] border-[3px] border-white bg-[#FAFAFA] p-1 shadow-[0px_0px_4px_1px_rgba(194,194,194,0.25)]"
      >
        @for (tab of billingTabs; track tab.id) {
          <button
            type="button"
            (click)="activeBillingTab.set(tab.id)"
            [class]="mobileBillingTabClass(tab.id)"
          >
            {{ tab.label }}
            @if (tab.savings) {
              <span class="text-[#C3C3C3]">{{ tab.savings }}</span>
            }
          </button>
          @if (!$last) {
            <span class="h-[22px] w-px rounded-[0.5px] bg-[#E0E0E0]"></span>
          }
        }
      </div>

      <div
        class="mt-6 flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        @for (plan of plans(); track plan.id) {
          <article [class]="mobilePlanCardClass(plan)">
            <div [class]="mobilePlanTopCardClass(plan)">
              <div class="flex flex-col gap-4">
                <p class="text-[16px] font-medium leading-[1.2] text-[#1F1F1F]">{{ plan.name }}</p>

                <div class="flex flex-col">
                  <p class="text-[28px] font-medium leading-[1.2] text-[#1F1F1F]">
                    <span class="font-medium">₦</span>{{ displayPrice(plan) }}
                    @if (!plan.current) {
                      <span class="text-[18px] text-[#939393]">/{{ selectedUnitLabel() }}</span>
                    }
                  </p>
                  <p
                    [class]="
                      plan.current
                        ? 'invisible mt-1 text-[14px] leading-[1.2] text-[#1B1B1B]'
                        : 'mt-1 text-[14px] leading-[1.2] text-[#1B1B1B]'
                    "
                  >
                    Billed {{ activeBillingTab() }}
                  </p>
                </div>
              </div>

              <button
                type="button"
                [disabled]="plan.current"
                (click)="openPlan(plan)"
                [class]="mobilePlanButtonClass(plan)"
              >
                {{ plan.cta }}
              </button>
            </div>

            <div class="px-4 pb-5 pt-[18px]">
              <p class="text-[14px] font-medium leading-5 text-black">What you’ll get</p>

              <div class="mt-4 space-y-3">
                @for (feature of plan.features; track feature) {
                  <div>
                    <div class="flex items-center gap-2">
                      <img
                        [ngSrc]="checkIcon"
                        width="24"
                        height="24"
                        alt=""
                        class="h-6 w-6 shrink-0"
                      />
                      <p class="text-[14px] leading-5 text-[#212121]">{{ feature }}</p>
                    </div>
                    @if (!$last) {
                      <div class="ml-0 mt-3 h-px w-[169px] bg-[#E6E6E6]"></div>
                    }
                  </div>
                }
              </div>
            </div>
          </article>
        }
      </div>
    </div>

    <div class="hidden h-full flex-col md:flex">
      <div class="mb-6 px-2">
        <h1 class="text-[24px] font-medium leading-none text-[#0D0D0D]">Plans</h1>
      </div>

      <div
        class="flex h-full flex-1 flex-col rounded-[32px] border border-[#F1F1F4] bg-white px-8 py-8 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]"
      >
        <div
          class="inline-flex items-center gap-2 self-start rounded-[12px] border border-[#9697C4] px-[9px] py-[11px]"
          style="background-image: linear-gradient(105.33deg, rgba(140, 142, 255, 0.2) 0.73%, rgba(255, 255, 255, 0) 31.43%), linear-gradient(90deg, rgba(250, 250, 250, 0.9) 0%, rgba(250, 250, 250, 0.9) 100%);"
        >
          <span
            class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] border border-[#DBDAE8] bg-white"
          >
            <img [ngSrc]="infoIcon" width="18" height="18" alt="" class="h-[18px] w-[18px]" />
          </span>
          <p class="text-[14px] font-medium leading-5 text-[#1F1F1F]">
            Your subscription expires on 27 April, 2026
          </p>
        </div>

        <div
          class="mt-6 inline-flex items-center self-start rounded-[100px] border-[3px] border-white bg-[#FAFAFA] p-1 shadow-[0px_0px_4px_1px_rgba(194,194,194,0.25)]"
        >
          @for (tab of billingTabs; track tab.id) {
            <button
              type="button"
              (click)="activeBillingTab.set(tab.id)"
              [class]="desktopBillingTabClass(tab.id)"
            >
              {{ tab.label }}
              @if (tab.savings) {
                <span class="text-[#C3C3C3]">{{ tab.savings }}</span>
              }
            </button>
            @if (!$last) {
              <span class="h-[22px] w-px rounded-[0.5px] bg-[#E0E0E0]"></span>
            }
          }
        </div>

        <div class="mt-8 grid grid-cols-4 gap-5">
          @for (plan of plans(); track plan.id) {
            <article [class]="desktopPlanCardClass(plan)">
              @if (plan.desktopBadge) {
                <span
                  class="absolute right-4 top-4 rounded-[100px] bg-[#F3EDFF] px-3 py-1 text-[11px] font-medium leading-4 text-[#6453D9]"
                >
                  {{ plan.desktopBadge }}
                </span>
              }

              <div [class]="desktopPlanTopCardClass(plan)">
                <div class="flex flex-col gap-4">
                  <p class="text-[18px] font-medium leading-[1.2] text-[#1F1F1F]">
                    {{ plan.name }}
                  </p>

                  <div class="flex flex-col">
                    <p class="text-[32px] font-medium leading-[1.2] text-[#1F1F1F]">
                      <span class="font-medium">₦</span>{{ displayPrice(plan) }}
                      @if (!plan.current) {
                        <span class="text-[20px] text-[#939393]">/{{ selectedUnitLabel() }}</span>
                      }
                    </p>
                    <p
                      [class]="
                        plan.current
                          ? 'invisible mt-1 text-[14px] leading-[1.2] text-[#1B1B1B]'
                          : 'mt-1 text-[14px] leading-[1.2] text-[#1B1B1B]'
                      "
                    >
                      Billed {{ activeBillingTab() }}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  [disabled]="plan.current"
                  (click)="openPlan(plan)"
                  [class]="desktopPlanButtonClass(plan)"
                >
                  {{ plan.cta }}
                </button>
              </div>

              <div class="px-5 pb-6 pt-5">
                <p class="text-[14px] font-medium leading-5 text-black">What you’ll get</p>

                <div class="mt-4 space-y-3">
                  @for (feature of plan.features; track feature) {
                    <div>
                      <div class="flex items-center gap-2">
                        <img
                          [ngSrc]="checkIcon"
                          width="24"
                          height="24"
                          alt=""
                          class="h-6 w-6 shrink-0"
                        />
                        <p class="text-[14px] leading-5 text-[#212121]">{{ feature }}</p>
                      </div>
                      @if (!$last) {
                        <div class="mt-3 h-px w-full bg-[#E6E6E6]"></div>
                      }
                    </div>
                  }
                </div>
              </div>
            </article>
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
    class: 'block h-full',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdsPlansPageComponent {
  private readonly router = inject(Router);

  readonly infoIcon = '/assets/icons/ads-plans-info.svg';
  readonly checkIcon = '/assets/icons/ads-plans-check.svg';

  readonly billingTabs: readonly BillingTab[] = [
    { id: 'weekly', label: 'Weekly billing' },
    { id: 'monthly', label: 'Monthly billing', savings: 'Save ~ 20%' },
    { id: 'yearly', label: 'Yearly billing', savings: 'Save ~ 35%' },
  ];

  readonly planDefinitions: readonly PlanDefinition[] = [
    {
      id: 'free',
      name: 'Free',
      weeklyPrice: 0,
      monthlyPrice: 0,
      yearlyPrice: 0,
      cta: 'Current plan',
      current: true,
      features: [
        'Limited Ad views',
        '1 listing in Automobile',
        '1 listing in Property',
        '5 listings in Other categories',
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      weeklyPrice: 1000,
      monthlyPrice: 3200,
      yearlyPrice: 26600,
      cta: 'Get Pro',
      highlighted: true,
      desktopBadge: 'Most popular',
      features: [
        'Unlimited Ad views',
        '1 listing in Automobile',
        '1 listing in Property',
        '15 listings in Other categories',
        '1 promotional image banner',
        '1 store promotion',
      ],
    },
    {
      id: 'premium',
      name: 'Premium',
      weeklyPrice: 1500,
      monthlyPrice: 4800,
      yearlyPrice: 39000,
      cta: 'Get Premium',
      features: [
        'Unlimited Ad views',
        '1 listing in Automobile',
        '1 listing in Property',
        '15 listings in Other categories',
        '1 promotional image banner',
        '1 promotional video banner',
        '1 store promotion',
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      weeklyPrice: 2000,
      monthlyPrice: 6400,
      yearlyPrice: 52000,
      cta: 'Get Enterprise',
      features: [
        'Unlimited Ad views',
        '1 listing in Automobile',
        '1 listing in Property',
        '15 listings in Other categories',
        '1 promotional image banner',
        '1 promotional video banner',
        '1 store promotion',
      ],
    },
  ];

  readonly activeBillingTab = signal<BillingFrequency>('weekly');
  readonly isSubscriptionModalOpen = signal(false);
  readonly selectedPlanType = signal<'pro' | 'premium' | 'enterprise'>('pro');

  readonly plans = computed(() => this.planDefinitions);

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

  displayPrice(plan: PlanDefinition): string {
    const value =
      this.activeBillingTab() === 'monthly'
        ? plan.monthlyPrice
        : this.activeBillingTab() === 'yearly'
          ? plan.yearlyPrice
          : plan.weeklyPrice;

    return new Intl.NumberFormat('en-NG').format(value);
  }

  mobileBillingTabClass(tab: BillingFrequency): string {
    return this.activeBillingTab() === tab
      ? 'rounded-[100px] border border-[rgba(0,0,0,0.04)] bg-white px-2 py-[10px] text-[14px] font-medium leading-6 text-[#1F1F1F] shadow-[0px_2px_4px_1px_rgba(192,192,192,0.12)]'
      : 'rounded-[100px] px-2 py-[10px] text-[14px] font-medium leading-6 text-[#969696]';
  }

  desktopBillingTabClass(tab: BillingFrequency): string {
    return this.activeBillingTab() === tab
      ? 'rounded-[100px] border border-[rgba(0,0,0,0.04)] bg-white px-4 py-[10px] text-[14px] font-medium leading-6 text-[#1F1F1F] shadow-[0px_2px_4px_1px_rgba(192,192,192,0.12)]'
      : 'rounded-[100px] px-4 py-[10px] text-[14px] font-medium leading-6 text-[#969696]';
  }

  mobilePlanCardClass(plan: PlanDefinition): string {
    return plan.highlighted
      ? 'relative h-[533px] w-[260px] shrink-0 overflow-hidden rounded-[24px] border-2 border-[#6524FF] bg-[#F7F7F7]'
      : 'relative h-[533px] w-[260px] shrink-0 overflow-hidden rounded-[24px] bg-[#F7F7F7]';
  }

  mobilePlanTopCardClass(plan: PlanDefinition): string {
    return plan.highlighted
      ? 'mx-[2.4px] mt-[2px] flex min-h-[174px] flex-col justify-between overflow-hidden rounded-[20px] bg-white p-3'
      : 'mx-1 mt-1 flex min-h-[174px] flex-col justify-between overflow-hidden rounded-[20px] bg-white p-3';
  }

  mobilePlanButtonClass(plan: PlanDefinition): string {
    return plan.current
      ? 'h-10 w-full rounded-[64px] border border-[#EAEAEA] bg-white text-[14px] font-medium text-black/50'
      : 'h-10 w-full rounded-[64px] border border-white bg-[#6453D9] text-[14px] font-medium text-white shadow-[0px_4px_12px_rgba(81,35,173,0.33),0px_0px_0px_1px_#6B5BD5]';
  }

  desktopPlanCardClass(plan: PlanDefinition): string {
    return plan.highlighted
      ? 'relative min-h-[610px] overflow-hidden rounded-[24px] border-2 border-[#6524FF] bg-[#F7F7F7]'
      : 'relative min-h-[610px] overflow-hidden rounded-[24px] bg-[#F7F7F7]';
  }

  desktopPlanTopCardClass(plan: PlanDefinition): string {
    return plan.highlighted
      ? 'mx-[2px] mt-[2px] flex min-h-[188px] flex-col justify-between overflow-hidden rounded-[20px] bg-white p-4'
      : 'mx-1 mt-1 flex min-h-[188px] flex-col justify-between overflow-hidden rounded-[20px] bg-white p-4';
  }

  desktopPlanButtonClass(plan: PlanDefinition): string {
    return plan.current
      ? 'h-10 w-full rounded-[64px] border border-[#EAEAEA] bg-white text-[14px] font-medium text-black/50'
      : 'h-10 w-full rounded-[64px] border border-white bg-[#6453D9] text-[14px] font-medium text-white shadow-[0px_4px_12px_rgba(81,35,173,0.33),0px_0px_0px_1px_#6B5BD5]';
  }

  openPlan(plan: PlanDefinition): void {
    if (plan.current || plan.id === 'free') {
      return;
    }

    this.selectedPlanType.set(plan.id);
    this.isSubscriptionModalOpen.set(true);
  }

  goToAdsMenu(): void {
    void this.router.navigateByUrl('/ads');
  }
}
