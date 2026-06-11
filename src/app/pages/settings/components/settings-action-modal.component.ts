import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-settings-action-modal',
  imports: [CommonModule, NgOptimizedImage],
  template: `
    <div
      class="fixed inset-0 z-[220] flex items-end justify-center bg-black/20 md:items-center"
      (click)="close.emit()"
    >
      <div
        class="settings-action-dialog relative flex w-full max-w-[390px] flex-col overflow-hidden rounded-t-[36px] bg-white shadow-[0_-24px_70px_-42px_rgba(19,27,45,0.45)] md:max-w-[600px] md:rounded-[16px] md:shadow-[0_30px_80px_-40px_rgba(19,27,45,0.45)]"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="modalTitleId"
        [style.--dialog-mobile-height.px]="dialogMobileHeight()"
        (click)="$event.stopPropagation()"
      >
        <div class="absolute left-1/2 top-[10px] h-1 w-[50px] -translate-x-1/2 rounded-full bg-[#EBEBEB] md:hidden"></div>

        <button
          type="button"
          (click)="close.emit()"
          [disabled]="isLoading()"
          class="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-[#EAEAEA] bg-white text-[#333436] shadow-[0_4px_8px_rgba(202,202,202,0.25)] transition hover:bg-[#F8F8F8] active:scale-95 duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6453D9] md:right-6 md:top-6 disabled:opacity-50 disabled:pointer-events-none"
          aria-label="Close modal"
        >
          <img
            [ngSrc]="closeIconSrc()"
            width="24"
            height="24"
            alt=""
            aria-hidden="true"
          >
        </button>

        <div class="flex-1 px-4 pt-[85px] md:px-[43px] md:pt-[39px]">
          <div class="max-w-[334px] md:max-w-[515px]">
            <div class="space-y-1.5 md:space-y-3">
              <h3
                [id]="modalTitleId"
                class="text-[24px] font-semibold leading-8 text-[#1A1B1D]"
              >
                {{ title() }}
              </h3>
              <p class="text-[16px] leading-6 text-[#656565] md:text-[14px] md:leading-5 md:text-[#5A5A5A]">
                {{ description() }}
              </p>
            </div>

            <div class="mt-8 md:mt-9">
              <label
                for="settings-modal-input"
                class="mb-1.5 block text-[14px] font-medium leading-5 text-[#6A6A6A] md:mb-1 md:text-[#777777]"
              >
                <span class="md:hidden">{{ mobileFieldLabel() }}</span>
                <span class="hidden md:inline">{{ fieldLabel() }}</span>
              </label>

              <div class="flex h-11 items-center gap-2 rounded-[10px] border border-[#E6E6E8] bg-white px-3 py-1.5 md:h-10 md:rounded-[16px] md:border-[#EFEFEF] md:pl-4 md:pr-2 md:py-0.5">
                <input
                  id="settings-modal-input"
                  [type]="inputType()"
                  [value]="value()"
                  (input)="onInput($event)"
                  [readonly]="isLoading()"
                  class="min-w-0 flex-1 bg-transparent text-[16px] leading-6 text-[#252628] outline-none placeholder:text-[#A8A8A8] md:text-[14px] md:leading-5 md:text-[#434455] readonly:opacity-50"
                >

                @if (value()) {
                  <button
                    type="button"
                    (click)="clearValue()"
                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F6F6F6] transition hover:bg-[#EEEEEE] active:scale-95 duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6453D9]"
                    aria-label="Clear value"
                  >
                    <img
                      [ngSrc]="clearIconSrc()"
                      width="8"
                      height="8"
                      alt=""
                      aria-hidden="true"
                    >
                  </button>
                }
              </div>
            </div>
          </div>
        </div>

        <div class="border-t border-[#F5F5F5] bg-white px-4 pb-[26px] pt-2.5 md:border-t-0 md:px-[43px] md:pb-[67px] md:pt-0">
          <div class="grid gap-3 md:grid-cols-2">
            <button
              type="button"
              (click)="close.emit()"
              [disabled]="isLoading()"
              class="hidden h-10 items-center justify-center rounded-full border border-[#EAEAEA] bg-white px-5 text-[14px] font-medium leading-5 text-black transition hover:bg-[#FAFAFA] active:scale-95 duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6453D9] md:flex disabled:opacity-50 disabled:pointer-events-none"
            >
              Cancel
            </button>
            <button
              type="button"
              (click)="confirm.emit()"
              [disabled]="isLoading()"
              class="flex h-[52px] items-center justify-center rounded-full border border-white bg-[#6453D9] px-5 text-[16px] font-medium leading-6 text-white shadow-[0_4px_8px_rgba(81,35,173,0.4),0_0_0_1px_#2A6CE8] transition hover:bg-[#5848CF] active:scale-95 duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2A6CE8] focus-visible:ring-offset-2 md:h-10 md:text-[14px] md:leading-5 disabled:opacity-50 disabled:pointer-events-none gap-2"
            >
              @if (isLoading()) {
                <svg class="animate-spin h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              }
              @if (isPhoneInput() && confirmLabel() === 'Add number') {
                <span class="md:hidden">Send verification code</span>
                <span class="hidden md:inline">Add number</span>
              } @else {
                {{ confirmLabel() }}
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-action-dialog {
      height: var(--dialog-mobile-height);
    }

    @media (min-width: 768px) {
      .settings-action-dialog {
        height: 376px;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsActionModalComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly fieldLabel = input.required<string>();
  readonly value = input.required<string>();
  readonly inputType = input<'text' | 'email' | 'tel'>('text');
  readonly confirmLabel = input.required<string>();
  readonly showDropdown = input(false);
  readonly isLoading = input(false);

  readonly close = output<void>();
  readonly confirm = output<void>();
  readonly valueChange = output<string>();

  protected readonly modalTitleId = 'settings-action-modal-title';

  protected mobileFieldLabel(): string {
    if (this.isPhoneInput()) {
      return 'Number';
    }

    return this.fieldLabel().toLowerCase() === 'full name' ? 'Name' : this.fieldLabel();
  }

  protected isPhoneInput(): boolean {
    return this.inputType() === 'tel';
  }

  protected isEmailInput(): boolean {
    return this.inputType() === 'email';
  }

  protected dialogMobileHeight(): number {
    if (this.isPhoneInput()) {
      return 451;
    }

    if (this.isEmailInput()) {
      return 419;
    }

    return 407;
  }

  protected closeIconSrc(): string {
    if (this.isPhoneInput()) {
      return '/assets/icons/settings/phone-modal-close.svg';
    }

    if (this.isEmailInput()) {
      return '/assets/icons/settings/email-modal-close.svg';
    }

    return '/assets/icons/settings/modal-close.svg';
  }

  protected clearIconSrc(): string {
    if (this.isPhoneInput()) {
      return '/assets/icons/settings/phone-input-clear.svg';
    }

    if (this.isEmailInput()) {
      return '/assets/icons/settings/email-input-clear.svg';
    }

    return '/assets/icons/settings/input-clear.svg';
  }

  protected clearValue(): void {
    this.valueChange.emit('');
  }

  protected onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.valueChange.emit(input.value);
  }
}
