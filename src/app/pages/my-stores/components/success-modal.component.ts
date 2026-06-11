import { ChangeDetectionStrategy, Component, inject, input, OnDestroy, output } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

import { MobileOverlayService } from '../../../services/mobile-overlay.service';

@Component({
  selector: 'app-success-modal',
  imports: [NgOptimizedImage],
  template: `
    <div
      class="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[4px] md:flex md:items-center md:justify-center md:p-4"
      (click)="ok.emit()"
    >
      <div
        class="fixed inset-x-0 bottom-0 top-3 flex max-h-[calc(100dvh-0.75rem)] flex-col overflow-hidden rounded-t-[36px] bg-white md:relative md:top-auto md:h-[85%] md:max-h-[85%] md:w-full md:max-w-[600px] md:rounded-[16px]"
        (click)="$event.stopPropagation()"
      >
        <div class="absolute left-1/2 top-[11px] h-1 w-[50px] -translate-x-1/2 rounded-full bg-[#ebebeb] md:hidden"></div>

        <button
          type="button"
          class="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#eaeaea] bg-white shadow-[0_4px_8px_rgba(202,202,202,0.25)] md:hidden transition-all duration-200 hover:bg-gray-50 active:scale-95"
          aria-label="Close success modal"
          (click)="ok.emit()"
        >
          <img [ngSrc]="closeIconUrl" alt="" width="24" height="24" class="h-6 w-6" aria-hidden="true" />
        </button>

        <div class="flex min-h-0 flex-1 flex-col items-center justify-center px-4 pb-10 pt-10 text-center md:px-0 md:pb-0 md:pt-0">
          <div class="flex w-full max-w-[430px] flex-col items-center gap-11 md:gap-[60px]">
            <div class="flex w-full flex-col items-center gap-6">
              <div class="relative h-[200px] w-[200px] overflow-hidden">
                <img
                  [ngSrc]="illustrationUrl"
                  alt=""
                  width="512"
                  height="512"
                  class="absolute left-1/2 top-1/2 h-[163px] w-[163px] -translate-x-1/2 -translate-y-1/2 object-contain"
                  aria-hidden="true"
                />
              </div>

              <div class="flex w-full flex-col items-center gap-2 text-center">
                <h2 class="max-w-[300px] text-[28px] leading-[1.1] font-semibold text-[#0d0d0d] md:max-w-none md:text-[32px]">
                  Store created successfully
                </h2>

                <p class="max-w-[315px] text-[16px] leading-6 text-[#747474] md:max-w-none">
                  You have successfully created
                  <span class="font-medium text-[#0d0d0d]">
                    {{ storeName() ? storeName() : 'your store' }}
                  </span>
                </p>
              </div>
            </div>

            <div class="flex h-[52px] items-center gap-2 md:h-10">
              <button
                type="button"
                class="inline-flex h-full items-center justify-center rounded-[82px] bg-[#f5f5f5] px-6 text-[16px] leading-[22px] font-medium tracking-[-0.03em] text-[#05061a] transition-all duration-200 hover:bg-[#ebebeb] active:scale-95"
                (click)="addAnother.emit()"
              >
                Add another store
              </button>

              <button
                type="button"
                class="inline-flex h-full min-w-[89px] items-center justify-center rounded-[64px] border border-white bg-[#6453d9] px-5 text-[16px] leading-5 font-medium text-white shadow-[0_4px_12px_rgba(81,35,173,0.33),0_0_0_1px_#6b5bd5] md:text-[14px] transition-all duration-200 hover:bg-[#5342c6] active:scale-95"
                (click)="ok.emit()"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuccessModalComponent implements OnDestroy {
  readonly storeName = input<string | null>(null);
  readonly ok = output<void>();
  readonly addAnother = output<void>();

  protected readonly illustrationUrl = '/assets/images/my-stores-success-illustration.png';
  protected readonly closeIconUrl = '/assets/icons/my-stores-success-close.svg';

  private readonly mobileOverlayService = inject(MobileOverlayService);

  constructor() {
    this.mobileOverlayService.openMobileModal();
  }

  ngOnDestroy(): void {
    this.mobileOverlayService.closeMobileModal();
  }
}
