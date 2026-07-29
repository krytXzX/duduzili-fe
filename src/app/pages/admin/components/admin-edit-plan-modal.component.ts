import { ChangeDetectionStrategy, Component, OnInit, inject, input, output, signal } from '@angular/core';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroXMark } from '@ng-icons/heroicons/outline';

export type AdminPlanStatus = 'active' | 'inactive';
export type AdminBillingCycleId = 'weekly' | 'monthly' | 'yearly';

export interface AdminPlanFeature {
  label: string;
  description: string;
}

export interface AdminEditablePlan {
  id: number;
  name: string;
  status: AdminPlanStatus;
  prices: Record<AdminBillingCycleId, string>;
  limits: {
    automobile: number;
    property: number;
    other: number;
    image_banner: number;
    video_banner: number;
    store_promotion: number;
  };
  unlimitedViews: boolean;
  features: AdminPlanFeature[];
}

@Component({
  selector: 'app-admin-edit-plan-modal',
  imports: [ReactiveFormsModule, NgIcon],
  providers: [provideIcons({ heroXMark })],
  template: `
    <div
      class="fixed inset-0 z-[220] flex items-end justify-center bg-black/20 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      (click)="close.emit()"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-plan-modal-title"
        class="max-h-[92vh] w-full max-w-[760px] overflow-y-auto rounded-t-[26px] bg-white p-6 shadow-[0_30px_80px_-40px_rgba(19,27,45,0.45)] sm:max-h-[calc(100vh-2rem)] sm:rounded-[26px] sm:p-8"
        (click)="$event.stopPropagation()"
      >
        <div class="flex items-start justify-between gap-4">
          <h2 id="edit-plan-modal-title" class="text-[2rem] font-semibold tracking-[-0.04em] text-[#202020]">
            Edit {{ plan().name }} plan
          </h2>

          <button
            type="button"
            (click)="close.emit()"
            class="flex h-11 w-11 items-center justify-center rounded-full border border-[#e8e8e8] bg-white text-[#626262] shadow-[0_8px_18px_-14px_rgba(0,0,0,0.35)] transition hover:bg-[#fafafa]"
            aria-label="Close edit plan modal"
          >
            <ng-icon name="heroXMark" class="text-xl"></ng-icon>
          </button>
        </div>

        <form class="mt-10" [formGroup]="pricingForm" (ngSubmit)="submit()">
          <section>
            <h3 class="text-[18px] font-semibold text-[#222222] sm:text-[20px]">Plan details</h3>

            <label class="mt-5 block">
              <span class="mb-2 block text-[15px] font-medium text-[#5b5b5b]">Plan name</span>
              <input
                type="text"
                formControlName="name"
                autocomplete="off"
                class="h-12 w-full rounded-[10px] border border-[#e3e3e3] px-4 text-[15px] text-[#202020] outline-none transition placeholder:text-[#b1b1b1] focus:border-[#6a5aed] focus:ring-4 focus:ring-[#6a5aed]/10"
                [class.border-[#f05252]]="pricingForm.controls.name.invalid && pricingForm.controls.name.touched"
                aria-describedby="edit-plan-name-error"
              >
              @if (pricingForm.controls.name.invalid && pricingForm.controls.name.touched) {
                <p id="edit-plan-name-error" class="mt-2 text-[13px] font-medium text-[#d14343]">
                  Enter a plan name.
                </p>
              }
            </label>
          </section>

          <section class="mt-10">
            <h3 class="text-[18px] font-semibold text-[#222222] sm:text-[20px]">Configure the pricing for this plan</h3>

            <div class="mt-5 grid gap-4 md:grid-cols-3">
              <label class="block">
                <span class="mb-2 block text-[15px] font-medium text-[#5b5b5b]">Weekly</span>
                <input
                  type="text"
                  formControlName="weekly"
                  class="h-12 w-full rounded-[10px] border border-[#e3e3e3] px-4 text-[15px] text-[#202020] outline-none transition placeholder:text-[#b1b1b1] focus:border-[#6a5aed] focus:ring-4 focus:ring-[#6a5aed]/10"
                >
              </label>

              <label class="block">
                <span class="mb-2 block text-[15px] font-medium text-[#5b5b5b]">Monthly</span>
                <input
                  type="text"
                  formControlName="monthly"
                  class="h-12 w-full rounded-[10px] border border-[#e3e3e3] px-4 text-[15px] text-[#202020] outline-none transition placeholder:text-[#b1b1b1] focus:border-[#6a5aed] focus:ring-4 focus:ring-[#6a5aed]/10"
                >
              </label>

              <label class="block">
                <span class="mb-2 block text-[15px] font-medium text-[#5b5b5b]">Yearly</span>
                <input
                  type="text"
                  formControlName="yearly"
                  class="h-12 w-full rounded-[10px] border border-[#e3e3e3] px-4 text-[15px] text-[#202020] outline-none transition placeholder:text-[#b1b1b1] focus:border-[#6a5aed] focus:ring-4 focus:ring-[#6a5aed]/10"
                >
              </label>
            </div>
          </section>

          <section class="mt-10">
            <h3 class="text-[18px] font-semibold text-[#222222] sm:text-[20px]">Plan limits & features</h3>

            <div class="mt-5 grid gap-4 sm:grid-cols-2">
              <label class="block">
                <span class="mb-2 block text-[15px] font-medium text-[#5b5b5b]">Automobile Limit</span>
                <input
                  type="number"
                  formControlName="automobileLimit"
                  class="h-12 w-full rounded-[10px] border border-[#e3e3e3] px-4 text-[15px] text-[#202020] outline-none transition placeholder:text-[#b1b1b1] focus:border-[#6a5aed] focus:ring-4 focus:ring-[#6a5aed]/10"
                >
              </label>

              <label class="block">
                <span class="mb-2 block text-[15px] font-medium text-[#5b5b5b]">Property Limit</span>
                <input
                  type="number"
                  formControlName="propertyLimit"
                  class="h-12 w-full rounded-[10px] border border-[#e3e3e3] px-4 text-[15px] text-[#202020] outline-none transition placeholder:text-[#b1b1b1] focus:border-[#6a5aed] focus:ring-4 focus:ring-[#6a5aed]/10"
                >
              </label>

              <label class="block">
                <span class="mb-2 block text-[15px] font-medium text-[#5b5b5b]">Other Categories Limit</span>
                <input
                  type="number"
                  formControlName="otherLimit"
                  class="h-12 w-full rounded-[10px] border border-[#e3e3e3] px-4 text-[15px] text-[#202020] outline-none transition placeholder:text-[#b1b1b1] focus:border-[#6a5aed] focus:ring-4 focus:ring-[#6a5aed]/10"
                >
              </label>

              <label class="block">
                <span class="mb-2 block text-[15px] font-medium text-[#5b5b5b]">Store Promotion Limit</span>
                <input
                  type="number"
                  formControlName="storePromotionLimit"
                  class="h-12 w-full rounded-[10px] border border-[#e3e3e3] px-4 text-[15px] text-[#202020] outline-none transition placeholder:text-[#b1b1b1] focus:border-[#6a5aed] focus:ring-4 focus:ring-[#6a5aed]/10"
                >
              </label>

              <label class="block">
                <span class="mb-2 block text-[15px] font-medium text-[#5b5b5b]">Image Banner Limit</span>
                <input
                  type="number"
                  formControlName="imageBannerLimit"
                  class="h-12 w-full rounded-[10px] border border-[#e3e3e3] px-4 text-[15px] text-[#202020] outline-none transition placeholder:text-[#b1b1b1] focus:border-[#6a5aed] focus:ring-4 focus:ring-[#6a5aed]/10"
                >
              </label>

              <label class="block">
                <span class="mb-2 block text-[15px] font-medium text-[#5b5b5b]">Video Banner Limit</span>
                <input
                  type="number"
                  formControlName="videoBannerLimit"
                  class="h-12 w-full rounded-[10px] border border-[#e3e3e3] px-4 text-[15px] text-[#202020] outline-none transition placeholder:text-[#b1b1b1] focus:border-[#6a5aed] focus:ring-4 focus:ring-[#6a5aed]/10"
                >
              </label>
            </div>

            <div class="mt-5 flex items-center gap-4 rounded-[18px] bg-[#fafafa] p-4">
                <div class="flex-1">
                  <p class="text-[15px] font-medium text-[#313131]">Unlimited Ad Views</p>
                  <p class="mt-1 text-[13px] leading-5 text-[#8a8a8a]">Keeps promoted items visible without a view-count cap.</p>
                </div>
                <button
                  type="button"
                  class="relative h-7 w-12 rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-[#6a5aed]/15"
                  [class.bg-[#6756e8]]="pricingForm.controls.unlimitedViews.value"
                  [class.bg-[#ececec]]="!pricingForm.controls.unlimitedViews.value"
                  (click)="pricingForm.controls.unlimitedViews.setValue(!pricingForm.controls.unlimitedViews.value)"
                >
                  <span
                    class="absolute top-1 h-5 w-5 rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.2)] transition-all"
                    [class.left-1]="!pricingForm.controls.unlimitedViews.value"
                    [class.left-6]="pricingForm.controls.unlimitedViews.value"
                  ></span>
                </button>
            </div>
          </section>

          <section class="mt-8 flex items-start justify-between gap-4">
            <div>
              <h3 class="text-[18px] font-medium text-[#222222]">Deactivate this plan</h3>
              <p class="mt-1 text-[15px] text-[#999999]">Plan will be inactive and hidden from users</p>
            </div>

            <button
              type="button"
              class="relative mt-1 h-7 w-12 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-[#6a5aed]/15"
              [class.bg-[#6756e8]]="isPlanDeactivated()"
              [class.bg-[#ececec]]="!isPlanDeactivated()"
              aria-label="Toggle plan deactivation status"
              [attr.aria-pressed]="isPlanDeactivated()"
              (click)="isPlanDeactivated.set(!isPlanDeactivated())"
            >
              <span
                class="absolute top-1 h-5 w-5 rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.2)] transition-all"
                [class.left-1]="!isPlanDeactivated()"
                [class.left-6]="isPlanDeactivated()"
              ></span>
            </button>
          </section>

          <div class="mt-16 flex justify-end gap-3">
            <button
              type="button"
              (click)="close.emit()"
              class="min-w-26 rounded-full bg-[#f5f5f5] px-6 py-3 text-[15px] font-medium text-[#1f1f1f] transition hover:bg-[#efefef]"
            >
              Cancel
            </button>

            <button
              type="submit"
              [disabled]="pricingForm.invalid"
              class="min-w-34 rounded-full bg-[#6653e4] px-6 py-3 text-[15px] font-medium text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)] transition hover:bg-[#5945db]"
              [class.cursor-not-allowed]="pricingForm.invalid"
              [class.opacity-60]="pricingForm.invalid"
            >
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminEditPlanModalComponent implements OnInit {
  private readonly formBuilder = inject(NonNullableFormBuilder);

  readonly plan = input.required<AdminEditablePlan>();

  readonly close = output<void>();
  readonly save = output<AdminEditablePlan>();

  readonly features = signal<AdminPlanFeature[]>([]);
  readonly isPlanDeactivated = signal(false);

  readonly pricingForm = this.formBuilder.group({
    name: ['', [Validators.required]],
    weekly: ['N0.00'],
    monthly: ['N0.00'],
    yearly: ['N0.00'],
    unlimitedViews: [false],
    automobileLimit: [0, [Validators.min(0)]],
    propertyLimit: [0, [Validators.min(0)]],
    otherLimit: [0, [Validators.min(0)]],
    imageBannerLimit: [0, [Validators.min(0)]],
    videoBannerLimit: [0, [Validators.min(0)]],
    storePromotionLimit: [0, [Validators.min(0)]],
  });

  ngOnInit(): void {
    const plan = this.plan();

    this.pricingForm.setValue(
      {
        name: plan.name,
        weekly: this.toModalCurrency(plan.prices.weekly),
        monthly: this.toModalCurrency(plan.prices.monthly),
        yearly: this.toModalCurrency(plan.prices.yearly),
        unlimitedViews: plan.unlimitedViews,
        automobileLimit: plan.limits.automobile,
        propertyLimit: plan.limits.property,
        otherLimit: plan.limits.other,
        imageBannerLimit: plan.limits.image_banner,
        videoBannerLimit: plan.limits.video_banner,
        storePromotionLimit: plan.limits.store_promotion,
      },
      { emitEvent: false }
    );
    this.isPlanDeactivated.set(plan.status === 'inactive');
  }



  submit(): void {
    if (this.pricingForm.invalid) {
      this.pricingForm.markAllAsTouched();
      return;
    }

    const rawValue = this.pricingForm.getRawValue();

    this.save.emit({
      ...this.plan(),
      name: rawValue.name.trim(),
      status: this.isPlanDeactivated() ? 'inactive' : 'active',
      prices: {
        weekly: this.toCardCurrency(rawValue.weekly),
        monthly: this.toCardCurrency(rawValue.monthly),
        yearly: this.toCardCurrency(rawValue.yearly),
      },
      limits: {
        automobile: rawValue.automobileLimit,
        property: rawValue.propertyLimit,
        other: rawValue.otherLimit,
        image_banner: rawValue.imageBannerLimit,
        video_banner: rawValue.videoBannerLimit,
        store_promotion: rawValue.storePromotionLimit,
      },
      unlimitedViews: rawValue.unlimitedViews,
    });
  }

  private toModalCurrency(value: string): string {
    if (value.startsWith('₦')) {
      return `N${value.slice(1)}.00`;
    }

    if (/^N\d/.test(value)) {
      return value;
    }

    return value;
  }

  private toCardCurrency(value: string): string {
    const digits = value.replace(/[^0-9.]/g, '');
    const [wholeNumber = '0'] = digits.split('.');
    const parsedNumber = Number(wholeNumber || '0');

    return `₦${parsedNumber.toLocaleString('en-NG')}`;
  }
}
