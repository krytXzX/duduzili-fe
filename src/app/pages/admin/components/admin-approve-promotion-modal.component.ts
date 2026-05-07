import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroExclamationTriangle, heroXMark } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-admin-approve-promotion-modal',
  imports: [NgIcon],
  providers: [provideIcons({ heroExclamationTriangle, heroXMark })],
  template: `
    <div
      class="fixed inset-0 z-[230] flex items-end justify-center bg-black/20 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      (click)="close.emit()"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="approve-promotion-modal-title"
        class="relative w-full max-w-[620px] rounded-t-[36px] bg-white px-4 pb-6 pt-3 shadow-[0_30px_80px_-40px_rgba(19,27,45,0.45)] sm:rounded-[26px] sm:p-8"
        (click)="$event.stopPropagation()"
      >
        <div class="mx-auto mb-3 h-1 w-[50px] rounded-full bg-[#ebebeb] sm:hidden"></div>

        <button
          type="button"
          (click)="close.emit()"
          class="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-[#eaeaea] bg-white text-[#626262] shadow-[0_4px_8px_rgba(202,202,202,0.25)] transition hover:bg-[#f8f8f8] sm:h-10 sm:w-10 sm:border-0 sm:bg-[#fafafa] sm:shadow-none sm:hover:bg-[#f2f2f2]"
          aria-label="Close approve modal"
        >
          <ng-icon name="heroXMark" class="text-[20px]"></ng-icon>
        </button>

        <div class="flex items-start justify-between gap-4 sm:mt-0">
          <div class="flex h-[120px] w-[120px] items-center justify-center rounded-full bg-[#f0efed] sm:h-24 sm:w-24 sm:bg-[#faf7ec]">
            <div class="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-[#efe5c3] text-[#d8b600] sm:h-16 sm:w-16 sm:bg-[#f9efc8]">
              <ng-icon name="heroExclamationTriangle" class="text-[42px] sm:text-[34px]"></ng-icon>
            </div>
          </div>
        </div>

        <div class="mt-1 pr-12 sm:mt-4 sm:pr-0">
          <h2 id="approve-promotion-modal-title" class="text-[24px] font-semibold leading-8 text-[#1a1b1d] sm:text-[20px] sm:text-[#202020]">
            Approve banner Ad?
          </h2>

          <p class="mt-2 max-w-[520px] text-[16px] leading-6 text-[#5a5a5a] sm:mt-3 sm:text-[15px] sm:leading-7 sm:text-[#575757]">
            Approving this banner will allow it to run on the platform according to its scheduled duration.
          </p>
        </div>

        <div class="mt-10 hidden flex-wrap justify-end gap-3 sm:flex">
          <button
            type="button"
            (click)="close.emit()"
            class="min-w-[126px] rounded-full border border-[#ececec] bg-white px-6 py-3 text-[15px] font-medium text-[#1f1f1f] transition hover:bg-[#fafafa]"
          >
            Cancel
          </button>

          <button
            type="button"
            (click)="confirm.emit(requestId())"
            class="min-w-[154px] rounded-full bg-[#6653e4] px-6 py-3 text-[15px] font-medium text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)] transition hover:bg-[#5945db]"
          >
            Yes, approve
          </button>
        </div>

        <div class="mt-12 sm:hidden">
          <button
            type="button"
            (click)="confirm.emit(requestId())"
            class="h-[52px] w-full rounded-full border border-white bg-[#6453d9] text-[16px] font-medium text-white shadow-[0_4px_12px_rgba(81,35,173,0.33),0_0_0_1px_#6b5bd5]"
          >
            Yes, approve
          </button>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminApprovePromotionModalComponent {
  readonly requestId = input.required<string>();

  readonly close = output<void>();
  readonly confirm = output<string>();
}
