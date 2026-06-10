import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroBolt,
  heroCheckCircle,
  heroPencilSquare,
  heroSquares2x2,
  heroXCircle,
} from '@ng-icons/heroicons/outline';
import {
  AdminEditablePlan,
  AdminEditPlanModalComponent,
} from './components/admin-edit-plan-modal.component';
import {
  AdminEditSingleBoostingModalComponent,
  EditableSingleBoostingPlan,
  SingleBoostingRate,
} from './components/admin-edit-single-boosting-modal.component';
import { AppToastService } from '../../services/app-toast.service';
import {
  AdminAdsPlansService,
  AdminSingleBoostingPlanRecord,
  AdminSubscriptionPlanRecord,
} from '../../services/admin-ads-plans.service';

type AdsPlanTabId = 'subscriptions' | 'single-boosting';
type BillingCycleId = 'weekly' | 'monthly' | 'yearly';

interface AdsPlanTab {
  id: AdsPlanTabId;
  label: string;
  icon: 'heroSquares2x2' | 'heroBolt';
}

interface BillingCycle {
  id: BillingCycleId;
  label: string;
}

const PLAN_FEATURE_CATALOG = [
  'Limited ads views',
  'Unlimited ads views',
  '1 listings in Automobile',
  '5 listings in Automobile',
  'Unlimited listings in Automobile',
  '1 listings in Property',
  '5 listings in Property',
  'Unlimited listings in Property',
  '5 listings in Other categories',
  '15 listings in Other categories',
  'Unlimited listings in Others',
  '1 image banner listing',
  '1 video banner listing',
  '1 store promotion',
  'Unlimited store promotion',
] as const;

@Component({
  selector: 'app-admin-ads-plans-page',
  imports: [NgIcon, AdminEditPlanModalComponent, AdminEditSingleBoostingModalComponent],
  providers: [
    provideIcons({
      heroBolt,
      heroCheckCircle,
      heroPencilSquare,
      heroSquares2x2,
      heroXCircle,
    }),
  ],
  template: `
    <section class="min-h-full rounded-[32px] bg-white">
      <header class="border-b border-[#efefef] px-8 py-6">
        <h1 class="text-[18px] font-medium tracking-[-0.04em] text-[#b3b3b3]">
          Ads management &gt; <span class="font-semibold text-[#202020]">Plans</span>
        </h1>
      </header>

      <div class="px-5 pb-6 pt-5 md:hidden">
        <div class="border-b border-[#efefef]">
          <div class="flex items-center gap-3">
            @for (tab of planTabs; track tab.id) {
              <button
                type="button"
                (click)="activeTab.set(tab.id)"
                [attr.aria-pressed]="activeTab() === tab.id"
                class="flex items-center gap-1 border-b-2 px-3 py-3 text-[16px] font-medium transition-colors"
                [class.border-[#6254f3]]="activeTab() === tab.id"
                [class.text-[#6254f3]]="activeTab() === tab.id"
                [class.border-transparent]="activeTab() !== tab.id"
                [class.text-[#9b9b9b]]="activeTab() !== tab.id"
              >
                <ng-icon [name]="tab.icon" class="text-[16px]"></ng-icon>
                {{ tab.label }}
              </button>
            }
          </div>
        </div>

        @if (activeTab() === 'subscriptions') {
          <div class="pt-5">
            <div class="inline-flex w-full items-center rounded-full border border-[#ededed] bg-[#fafafa] p-1 shadow-[0_0_4px_1px_rgba(194,194,194,0.25)]">
              @for (cycle of billingCycles; track cycle.id; let last = $last) {
                <button
                  type="button"
                  (click)="activeBillingCycle.set(cycle.id)"
                  [attr.aria-pressed]="activeBillingCycle() === cycle.id"
                  class="rounded-full px-3 py-2 text-[14px] font-medium transition-colors"
                  [class.border]="activeBillingCycle() === cycle.id"
                  [class.border-[rgba(0,0,0,0.04)]]="activeBillingCycle() === cycle.id"
                  [class.bg-white]="activeBillingCycle() === cycle.id"
                  [class.shadow-[0_2px_4px_1px_rgba(192,192,192,0.12)]]="activeBillingCycle() === cycle.id"
                  [class.text-[#1f1f1f]]="activeBillingCycle() === cycle.id"
                  [class.text-[#969696]]="activeBillingCycle() !== cycle.id"
                >
                  {{ cycle.label }}
                </button>
                @if (!last) {
                  <span class="h-6 w-px bg-[#e0e0e0]"></span>
                }
              }
            </div>

            <div class="mt-5 flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              @for (plan of plans(); track plan.name) {
                <article class="h-[470px] w-[250px] shrink-0 rounded-[16px] border border-[#efefef] bg-[#fafafa] px-5 py-5">
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex items-center gap-1">
                      <h2 class="text-[20px] font-semibold leading-7 text-[#1a1b1d]">{{ plan.name }}</h2>
                      <button
                        type="button"
                        (click)="openEditPlanModal(plan)"
                        class="text-[#2c2c2c] transition-colors hover:text-[#111111]"
                        [attr.aria-label]="'Edit ' + plan.name + ' plan'"
                      >
                        <ng-icon name="heroPencilSquare" class="text-[16px]"></ng-icon>
                      </button>
                    </div>

                    <span
                      class="inline-flex items-center gap-1 rounded-[8px] bg-white px-2 py-1 text-[12px] font-semibold"
                      [class.text-[#25ad32]]="plan.status === 'active'"
                      [class.text-[#ff2524]]="plan.status === 'inactive'"
                    >
                      <ng-icon
                        [name]="plan.status === 'active' ? 'heroCheckCircle' : 'heroXCircle'"
                        class="text-[14px]"
                      ></ng-icon>
                      {{ plan.status === 'active' ? 'Active' : 'Inactive' }}
                    </span>
                  </div>

                  <div class="mt-12">
                    <div class="text-[28px] font-medium leading-[1.2] text-[#1f1f1f]">
                      {{ plan.prices[activeBillingCycle()] }}
                      @if (plan.prices[activeBillingCycle()] !== '₦0') {
                        <span class="text-[18px] text-[#939393]">/{{ billingUnitLabel() }}</span>
                      }
                    </div>
                    @if (plan.prices[activeBillingCycle()] !== '₦0') {
                      <p class="mt-1 text-[14px] text-[#1b1b1b]">Billed {{ activeBillingCycle() }}</p>
                    }
                  </div>

                  <div class="mt-7 border-t border-[#e7e7e7] pt-4">
                    <h3 class="text-[18px] font-medium text-[#0d0d0d]">Features</h3>
                    <ul class="mt-4 space-y-3 text-[14px] leading-5 text-[#0d0d0d]">
                      @for (feature of enabledFeatures(plan); track feature) {
                        <li class="flex items-start gap-2">
                          <span class="mt-[8px] h-[5px] w-[5px] shrink-0 rounded-full bg-[#bfbfbf]"></span>
                          <span>{{ feature }}</span>
                        </li>
                      }
                    </ul>
                  </div>
                </article>
              }
            </div>
          </div>
        } @else {
          <div class="pt-5">
            <div class="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              @for (plan of singleBoostingPlans(); track plan.name) {
                <article class="w-[250px] shrink-0 rounded-[16px] border border-[#efefef] bg-[#fafafa] px-5 py-5">
                  <span
                    class="inline-flex items-center gap-1 rounded-[8px] bg-white px-2 py-1 text-[12px] font-semibold"
                    [class.text-[#25ad32]]="plan.status === 'active'"
                    [class.text-[#ff2524]]="plan.status === 'inactive'"
                  >
                    <ng-icon
                      [name]="plan.status === 'active' ? 'heroCheckCircle' : 'heroXCircle'"
                      class="text-[14px]"
                    ></ng-icon>
                    {{ plan.status === 'active' ? 'Active' : 'Inactive' }}
                  </span>

                  <div class="mt-5 flex items-center gap-1">
                    <h2 class="text-[20px] font-medium text-[#222222]">{{ plan.name }}</h2>
                    <button
                      type="button"
                      (click)="openEditSingleBoostingPlanModal(plan)"
                      class="text-[#2c2c2c] transition-colors hover:text-[#111111]"
                      [attr.aria-label]="'Edit ' + plan.name"
                    >
                      <ng-icon name="heroPencilSquare" class="text-[16px]"></ng-icon>
                    </button>
                  </div>

                  <div class="mt-5 border-t border-[#e7e7e7] pt-4">
                    <div class="space-y-3">
                      @for (rate of plan.rates; track rate.label) {
                        <div class="flex items-center justify-between gap-4 text-[14px] leading-6 text-[#313131]">
                          <span>{{ rate.label }}</span>
                          <span class="font-medium text-[#202020]">{{ rate.price }}</span>
                        </div>
                      }
                    </div>
                  </div>
                </article>
              }
            </div>
          </div>
        }
      </div>

      <div class="hidden px-4 py-6 sm:px-6 lg:px-8 md:block">
        <div class="border-b border-[#efefef]">
          <div class="flex items-center gap-8">
            @for (tab of planTabs; track tab.id) {
              <button
                type="button"
                (click)="activeTab.set(tab.id)"
                [attr.aria-pressed]="activeTab() === tab.id"
                class="flex items-center gap-2 border-b-2 px-3 py-3 text-[15px] font-medium transition-colors"
                [class.border-[#6254f3]]="activeTab() === tab.id"
                [class.text-[#6254f3]]="activeTab() === tab.id"
                [class.border-transparent]="activeTab() !== tab.id"
                [class.text-[#9b9b9b]]="activeTab() !== tab.id"
              >
                <ng-icon [name]="tab.icon" class="text-[16px]"></ng-icon>
                {{ tab.label }}
              </button>
            }
          </div>
        </div>

        @if (activeTab() === 'subscriptions') {
          <div class="pt-5">
            <div class="inline-flex items-center rounded-full border border-[#ededed] bg-white p-1 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
              @for (cycle of billingCycles; track cycle.id; let last = $last) {
                <button
                  type="button"
                  (click)="activeBillingCycle.set(cycle.id)"
                  [attr.aria-pressed]="activeBillingCycle() === cycle.id"
                  class="rounded-full px-6 py-3 text-[15px] font-medium transition-colors"
                  [class.bg-[#f8f8f8]]="activeBillingCycle() === cycle.id"
                  [class.text-[#222222]]="activeBillingCycle() === cycle.id"
                  [class.text-[#9b9b9b]]="activeBillingCycle() !== cycle.id"
                >
                  {{ cycle.label }}
                </button>
                @if (!last) {
                  <span class="h-6 w-px bg-[#e5e5e5]"></span>
                }
              }
            </div>

            <div class="mt-5 grid gap-4 xl:grid-cols-4">
              @for (plan of plans(); track plan.name) {
                <article class="rounded-[18px] border border-[#e9e9e9] bg-white px-5 py-5">
                  <div class="flex items-start justify-between gap-4">
                    <div class="flex items-center gap-2">
                      <h2 class="text-[18px] font-semibold text-[#222222]">{{ plan.name }}</h2>
                      <button
                        type="button"
                        (click)="openEditPlanModal(plan)"
                        class="text-[#2c2c2c] transition-colors hover:text-[#111111]"
                        [attr.aria-label]="'Edit ' + plan.name + ' plan'"
                      >
                        <ng-icon name="heroPencilSquare" class="text-[16px]"></ng-icon>
                      </button>
                    </div>

                    <span
                      class="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[14px] font-medium"
                      [class.text-[#2ab83f]]="plan.status === 'active'"
                      [class.text-[#ff3333]]="plan.status === 'inactive'"
                    >
                      <ng-icon
                        [name]="plan.status === 'active' ? 'heroCheckCircle' : 'heroXCircle'"
                        class="text-[15px]"
                      ></ng-icon>
                      {{ plan.status === 'active' ? 'Active' : 'Inactive' }}
                    </span>
                  </div>

                  <div class="mt-12">
                    <div class="flex items-end gap-1">
                      <span class="text-[30px] font-semibold tracking-[-0.04em] text-[#222222]">
                        {{ plan.prices[activeBillingCycle()] }}
                      </span>
                      @if (plan.prices[activeBillingCycle()] !== '₦0') {
                        <span class="mb-1 text-[16px] font-medium text-[#9a9a9a]">/{{ billingUnitLabel() }}</span>
                      }
                    </div>
                    @if (plan.prices[activeBillingCycle()] !== '₦0') {
                      <p class="mt-1 text-[14px] text-[#4d4d4d]">Billed {{ activeBillingCycle() }}</p>
                    }
                  </div>

                  <div class="mt-6 border-t border-[#e7e7e7] pt-5">
                    <h3 class="text-[16px] font-medium text-[#222222]">Features</h3>
                    <ul class="mt-4 space-y-4 text-[15px] leading-6 text-[#363636]">
                      @for (feature of enabledFeatures(plan); track feature) {
                        <li class="flex items-start gap-3">
                          <span class="mt-[10px] h-[5px] w-[5px] shrink-0 rounded-full bg-[#bfbfbf]"></span>
                          <span>{{ feature }}</span>
                        </li>
                      }
                    </ul>
                  </div>
                </article>
              }
            </div>
          </div>
        } @else {
          <div class="pt-6">
            <div class="grid gap-4 xl:grid-cols-4">
              @for (plan of singleBoostingPlans(); track plan.name) {
                <article class="rounded-[18px] border border-[#e9e9e9] bg-white px-5 py-5">
                  <span
                    class="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[14px] font-medium"
                    [class.text-[#2ab83f]]="plan.status === 'active'"
                    [class.text-[#ff3333]]="plan.status === 'inactive'"
                  >
                    <ng-icon
                      [name]="plan.status === 'active' ? 'heroCheckCircle' : 'heroXCircle'"
                      class="text-[15px]"
                    ></ng-icon>
                    {{ plan.status === 'active' ? 'Active' : 'Inactive' }}
                  </span>

                  <div class="mt-6 flex items-center gap-2">
                    <h2 class="text-[18px] font-medium text-[#222222]">{{ plan.name }}</h2>
                    <button
                      type="button"
                      (click)="openEditSingleBoostingPlanModal(plan)"
                      class="text-[#2c2c2c] transition-colors hover:text-[#111111]"
                      [attr.aria-label]="'Edit ' + plan.name"
                    >
                      <ng-icon name="heroPencilSquare" class="text-[16px]"></ng-icon>
                    </button>
                  </div>

                  <div class="mt-8 border-t border-[#e7e7e7] pt-6">
                    <div class="space-y-3">
                      @for (rate of plan.rates; track rate.label) {
                        <div class="flex items-center justify-between gap-4 text-[15px] leading-6 text-[#313131]">
                          <span>{{ rate.label }}</span>
                          <span class="font-medium text-[#202020]">{{ rate.price }}</span>
                        </div>
                      }
                    </div>
                  </div>
                </article>
              }
            </div>
          </div>
        }
      </div>

      @if (editingPlan()) {
        <app-admin-edit-plan-modal
          [plan]="editingPlan()!"
          (close)="editingPlan.set(null)"
          (save)="savePlanChanges($event)"
        ></app-admin-edit-plan-modal>
      }

      @if (editingSingleBoostingPlan()) {
        <app-admin-edit-single-boosting-modal
          [plan]="editingSingleBoostingPlan()!"
          (close)="editingSingleBoostingPlan.set(null)"
          (save)="saveSingleBoostingPlanChanges($event)"
        ></app-admin-edit-single-boosting-modal>
      }
    </section>
  `,
  host: {
    class: 'block h-full',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAdsPlansPageComponent {
  private readonly adsPlansService = inject(AdminAdsPlansService);
  private readonly toast = inject(AppToastService);

  readonly activeTab = signal<AdsPlanTabId>('subscriptions');
  readonly activeBillingCycle = signal<BillingCycleId>('weekly');
  readonly editingPlan = signal<AdminEditablePlan | null>(null);
  readonly editingSingleBoostingPlan = signal<EditableSingleBoostingPlan | null>(null);
  readonly subscriptionPlanRecords = signal<AdminSubscriptionPlanRecord[]>([]);
  readonly singleBoostingPlanRecords = signal<AdminSingleBoostingPlanRecord[]>([]);

  readonly planTabs: ReadonlyArray<AdsPlanTab> = [
    { id: 'subscriptions', label: 'Subscriptions', icon: 'heroSquares2x2' },
    { id: 'single-boosting', label: 'Single boosting', icon: 'heroBolt' },
  ];

  readonly billingCycles: ReadonlyArray<BillingCycle> = [
    { id: 'weekly', label: 'Weekly billing' },
    { id: 'monthly', label: 'Monthly billing' },
    { id: 'yearly', label: 'Yearly billing' },
  ];

  readonly billingUnitLabel = computed(() => {
    switch (this.activeBillingCycle()) {
      case 'monthly':
        return 'month';
      case 'yearly':
        return 'year';
      default:
        return 'week';
    }
  });

  readonly plans = computed<AdminEditablePlan[]>(() =>
    this.subscriptionPlanRecords().map((plan) => this.mapSubscriptionPlan(plan))
  );

  readonly singleBoostingPlans = computed<EditableSingleBoostingPlan[]>(() =>
    this.singleBoostingPlanRecords().map((plan) => this.mapSingleBoostingPlan(plan))
  );

  constructor() {
    this.loadPlans();
  }

  enabledFeatures(plan: AdminEditablePlan): string[] {
    return plan.features.filter((feature) => feature.enabled).map((feature) => feature.label);
  }

  openEditPlanModal(plan: AdminEditablePlan): void {
    this.editingPlan.set({
      ...plan,
      prices: { ...plan.prices },
      features: plan.features.map((feature) => ({ ...feature })),
    });
  }

  savePlanChanges(updatedPlan: AdminEditablePlan): void {
    const backendPlan = this.subscriptionPlanRecords().find(
      (plan) => plan.plan_name.trim().toLowerCase() === updatedPlan.name.trim().toLowerCase(),
    );

    if (!backendPlan) {
      this.toast.show({ message: 'That subscription plan isn’t available right now. Please try again.' });
      return;
    }

    const payload = this.toSubscriptionPlanPayload(updatedPlan, backendPlan);
    this.adsPlansService.updateSubscriptionPlan(backendPlan.id, payload).subscribe({
      next: (response) => {
        this.subscriptionPlanRecords.update((plans) =>
          plans.map((plan) => (plan.id === response.id ? response : plan)),
        );
        this.editingPlan.set(null);
        this.toast.show({ message: 'Subscription plan updated successfully.' });
      },
      error: () => {
        this.toast.show({ message: 'That subscription plan couldn’t be updated right now. Please try again.' });
      },
    });
  }

  openEditSingleBoostingPlanModal(plan: EditableSingleBoostingPlan): void {
    this.editingSingleBoostingPlan.set({
      ...plan,
      rates: plan.rates.map((rate) => ({ ...rate })),
    });
  }

  saveSingleBoostingPlanChanges(updatedPlan: EditableSingleBoostingPlan): void {
    const backendPlan = this.singleBoostingPlanRecords().find((plan) => plan.name === updatedPlan.name);

    if (!backendPlan) {
      this.toast.show({ message: 'That boost plan isn’t available right now. Please try again.' });
      return;
    }

    const payload = this.toSingleBoostingPayload(updatedPlan);
    this.adsPlansService.updateSingleBoostingPlan(backendPlan.id, payload).subscribe({
      next: (response) => {
        this.singleBoostingPlanRecords.update((plans) =>
          plans.map((plan) => (plan.id === response.id ? response : plan)),
        );
        this.editingSingleBoostingPlan.set(null);
        this.toast.show({ message: 'Single boosting plan updated successfully.' });
      },
      error: () => {
        this.toast.show({ message: 'That boost plan couldn’t be updated right now. Please try again.' });
      },
    });
  }

  private loadPlans(): void {
    this.adsPlansService.getPlans().subscribe({
      next: (response) => {
        this.subscriptionPlanRecords.set(response.subscription_plans);
        this.singleBoostingPlanRecords.set(response.single_boosting_plans);
      },
      error: () => {
        this.subscriptionPlanRecords.set([]);
        this.singleBoostingPlanRecords.set([]);
        this.toast.show({ message: 'Ads plans aren’t available right now. Please try again shortly.' });
      },
    });
  }

  private mapSubscriptionPlan(plan: AdminSubscriptionPlanRecord): AdminEditablePlan {
    const enabledLabels: string[] = [];

    if (plan.unlimited_ads_views) {
      enabledLabels.push('Unlimited ads views');
    } else {
      enabledLabels.push('Limited ads views');
    }

    enabledLabels.push(this.automobileFeatureLabel(plan.automobile_limit));
    enabledLabels.push(this.propertyFeatureLabel(plan.property_limit));
    enabledLabels.push(this.otherFeatureLabel(plan.other_limit));

    if (plan.image_banner_limit > 0) {
      enabledLabels.push('1 image banner listing');
    }
    if (plan.video_banner_limit > 0) {
      enabledLabels.push('1 video banner listing');
    }
    if (plan.store_promotion_limit > 1) {
      enabledLabels.push('Unlimited store promotion');
    } else if (plan.store_promotion_limit > 0) {
      enabledLabels.push('1 store promotion');
    }

    return {
      name: plan.plan_name,
      status: plan.is_active ? 'active' : 'inactive',
      prices: {
        weekly: this.toCurrency(plan.weekly_price || plan.price),
        monthly: this.toCurrency(plan.monthly_price || plan.price),
        yearly: this.toCurrency(plan.yearly_price || plan.price),
      },
      features: this.createPlanFeatures(enabledLabels),
    };
  }

  private mapSingleBoostingPlan(plan: AdminSingleBoostingPlanRecord): EditableSingleBoostingPlan {
    return {
      name: plan.name,
      status: plan.status,
      rates: [
        { label: 'Automobile listing', price: this.toCurrency(plan.automobile_price), enabled: Number(plan.automobile_price) > 0 },
        { label: 'Property listing', price: this.toCurrency(plan.property_price), enabled: Number(plan.property_price) > 0 },
        { label: 'Other listing', price: this.toCurrency(plan.other_listing_price), enabled: Number(plan.other_listing_price) > 0 },
        { label: 'Image banner', price: this.toCurrency(plan.image_banner_price), enabled: Number(plan.image_banner_price) > 0 },
        { label: 'Video banner', price: this.toCurrency(plan.video_banner_price), enabled: Number(plan.video_banner_price) > 0 },
        { label: 'Stores', price: this.toCurrency(plan.store_promotion_price), enabled: Number(plan.store_promotion_price) > 0 },
      ],
    };
  }

  private toSubscriptionPlanPayload(updatedPlan: AdminEditablePlan, backendPlan: AdminSubscriptionPlanRecord): Partial<AdminSubscriptionPlanRecord> {
    const enabledLabels = new Set(
      updatedPlan.features.filter((feature) => feature.enabled).map((feature) => feature.label),
    );

    return {
      plan_name: updatedPlan.name,
      weekly_price: this.toBackendDecimal(updatedPlan.prices.weekly),
      monthly_price: this.toBackendDecimal(updatedPlan.prices.monthly),
      yearly_price: this.toBackendDecimal(updatedPlan.prices.yearly),
      price: this.toBackendDecimal(updatedPlan.prices.monthly),
      is_active: updatedPlan.status === 'active',
      unlimited_ads_views: enabledLabels.has('Unlimited ads views'),
      automobile_limit: enabledLabels.has('Unlimited listings in Automobile')
        ? 999999
        : enabledLabels.has('5 listings in Automobile')
          ? 5
          : 1,
      property_limit: enabledLabels.has('Unlimited listings in Property')
        ? 999999
        : enabledLabels.has('5 listings in Property')
          ? 5
          : 1,
      other_limit: enabledLabels.has('Unlimited listings in Others')
        ? 999999
        : enabledLabels.has('15 listings in Other categories')
          ? 15
          : 5,
      image_banner_limit: enabledLabels.has('1 image banner listing') ? 1 : 0,
      video_banner_limit: enabledLabels.has('1 video banner listing') ? 1 : 0,
      store_promotion_limit: enabledLabels.has('Unlimited store promotion')
        ? 999999
        : enabledLabels.has('1 store promotion')
          ? 1
          : 0,
      discount_percentage: backendPlan.discount_percentage,
      vat_percentage: backendPlan.vat_percentage,
    };
  }

  private toSingleBoostingPayload(updatedPlan: EditableSingleBoostingPlan): Partial<AdminSingleBoostingPlanRecord> {
    const rateMap = new Map(updatedPlan.rates.map((rate) => [rate.label, rate]));
    const amountFor = (label: string): string => {
      const rate = rateMap.get(label);
      if (!rate || !rate.enabled) {
        return '0.00';
      }
      return this.toBackendDecimal(rate.price);
    };

    return {
      name: updatedPlan.name,
      status: updatedPlan.status,
      automobile_price: amountFor('Automobile listing'),
      property_price: amountFor('Property listing'),
      other_listing_price: amountFor('Other listing'),
      image_banner_price: amountFor('Image banner'),
      video_banner_price: amountFor('Video banner'),
      store_promotion_price: amountFor('Stores'),
    };
  }

  private automobileFeatureLabel(limit: number): string {
    if (limit >= 999999) {
      return 'Unlimited listings in Automobile';
    }
    return limit >= 5 ? '5 listings in Automobile' : '1 listings in Automobile';
  }

  private propertyFeatureLabel(limit: number): string {
    if (limit >= 999999) {
      return 'Unlimited listings in Property';
    }
    return limit >= 5 ? '5 listings in Property' : '1 listings in Property';
  }

  private otherFeatureLabel(limit: number): string {
    if (limit >= 999999) {
      return 'Unlimited listings in Others';
    }
    return limit >= 15 ? '15 listings in Other categories' : '5 listings in Other categories';
  }

  private createPlanFeatures(enabledLabels: readonly string[]) {
    const enabledSet = new Set(enabledLabels);

    return PLAN_FEATURE_CATALOG.map((label) => ({
      label,
      enabled: enabledSet.has(label),
    }));
  }

  private toCurrency(value: string | number): string {
    const numericValue = Number(value) || 0;
    return `₦${numericValue.toLocaleString('en-NG')}`;
  }

  private toBackendDecimal(value: string): string {
    const digits = value.replace(/[^0-9.]/g, '');
    const parsedNumber = Number(digits || '0');
    return parsedNumber.toFixed(2);
  }
}
