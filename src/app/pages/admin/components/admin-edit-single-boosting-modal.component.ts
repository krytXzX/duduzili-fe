import { ChangeDetectionStrategy, Component, OnInit, input, output, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroXMark } from '@ng-icons/heroicons/outline';

export type SingleBoostingPlanStatus = 'active' | 'inactive';

export interface SingleBoostingRate {
  label: string;
  price: string;
  enabled: boolean;
}

export interface EditableSingleBoostingPlan {
  name: string;
  status: SingleBoostingPlanStatus;
  rates: SingleBoostingRate[];
}

type SingleBoostingRatesForm = FormGroup<Record<string, FormControl<string>>>;

@Component({
  selector: 'app-admin-edit-single-boosting-modal',
  imports: [ReactiveFormsModule, NgIcon],
  providers: [provideIcons({ heroXMark })],
  template: `
    <div
      class="fixed inset-0 z-[220] flex items-center justify-center bg-black/20 p-4 backdrop-blur-[2px]"
      (click)="close.emit()"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-single-boosting-modal-title"
        class="max-h-[calc(100vh-2rem)] w-full max-w-[760px] overflow-y-auto rounded-[26px] bg-white p-6 shadow-[0_30px_80px_-40px_rgba(19,27,45,0.45)] sm:p-8"
        (click)="$event.stopPropagation()"
      >
        <div class="flex items-start justify-between gap-4">
          <h2 id="edit-single-boosting-modal-title" class="text-[2rem] font-semibold tracking-[-0.04em] text-[#202020]">
            Edit {{ modalTitle() }} plan
          </h2>

          <button
            type="button"
            (click)="close.emit()"
            class="flex h-11 w-11 items-center justify-center rounded-full border border-[#e8e8e8] bg-white text-[#626262] shadow-[0_8px_18px_-14px_rgba(0,0,0,0.35)] transition hover:bg-[#fafafa]"
            aria-label="Close edit single boosting modal"
          >
            <ng-icon name="heroXMark" class="text-xl"></ng-icon>
          </button>
        </div>

        <form class="mt-10" [formGroup]="ratesForm()" (ngSubmit)="submit()">
          <section>
            <h3 class="text-[18px] font-semibold text-[#222222] sm:text-[20px]">Configure the pricing for this plan</h3>

            <div class="mt-6 overflow-hidden rounded-[18px] bg-[#fafafa]">
              @for (rate of rates(); track rate.label) {
                <div class="flex items-center gap-4 border-b border-[#ececec] px-3 py-3 last:border-b-0">
                  <div class="min-w-0 flex-1 text-[15px] text-[#313131]">{{ rate.label }}</div>

                  <input
                    type="text"
                    [formControlName]="rateKey(rate.label)"
                    class="h-11 w-[132px] rounded-[10px] border border-[#f0f0f0] bg-white px-4 text-center text-[15px] text-[#202020] outline-none transition focus:border-[#6a5aed] focus:ring-4 focus:ring-[#6a5aed]/10"
                  >

                  <button
                    type="button"
                    class="relative h-7 w-12 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-[#6a5aed]/15"
                    [class.bg-[#6756e8]]="rate.enabled"
                    [class.bg-[#ececec]]="!rate.enabled"
                    [attr.aria-label]="'Toggle ' + rate.label"
                    [attr.aria-pressed]="rate.enabled"
                    (click)="toggleRate(rate.label)"
                  >
                    <span
                      class="absolute top-1 h-5 w-5 rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.2)] transition-all"
                      [class.left-1]="!rate.enabled"
                      [class.left-6]="rate.enabled"
                    ></span>
                  </button>
                </div>
              }
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
              class="min-w-34 rounded-full bg-[#6653e4] px-6 py-3 text-[15px] font-medium text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)] transition hover:bg-[#5945db]"
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
export class AdminEditSingleBoostingModalComponent implements OnInit {
  readonly plan = input.required<EditableSingleBoostingPlan>();

  readonly close = output<void>();
  readonly save = output<EditableSingleBoostingPlan>();

  readonly rates = signal<SingleBoostingRate[]>([]);
  readonly isPlanDeactivated = signal(false);
  readonly ratesForm = signal<SingleBoostingRatesForm>(new FormGroup({}));

  readonly modalTitle = signal('');

  ngOnInit(): void {
    const plan = this.plan();
    const controls: Record<string, FormControl<string>> = {};

    this.modalTitle.set(
      plan.name.replace('Promote for ', '').replace('Promote ', '')
    );
    this.rates.set(plan.rates.map((rate) => ({ ...rate })));
    this.isPlanDeactivated.set(plan.status === 'inactive');

    for (const rate of plan.rates) {
      controls[this.rateKey(rate.label)] = new FormControl(rate.price, { nonNullable: true });
    }

    this.ratesForm.set(new FormGroup(controls));
  }

  rateKey(label: string): string {
    return label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }

  toggleRate(label: string): void {
    this.rates.update((rates) =>
      rates.map((rate) =>
        rate.label === label ? { ...rate, enabled: !rate.enabled } : rate
      )
    );
  }

  submit(): void {
    const formValue = this.ratesForm().getRawValue();

    this.save.emit({
      ...this.plan(),
      status: this.isPlanDeactivated() ? 'inactive' : 'active',
      rates: this.rates().map((rate) => ({
        ...rate,
        price: this.normalizeCurrency(formValue[this.rateKey(rate.label)] ?? rate.price),
      })),
    });
  }

  private normalizeCurrency(value: string): string {
    const digits = value.replace(/[^0-9.]/g, '');
    const [wholeNumber = '0'] = digits.split('.');
    const parsedNumber = Number(wholeNumber || '0');

    return `₦${parsedNumber.toLocaleString('en-NG')}`;
  }
}
