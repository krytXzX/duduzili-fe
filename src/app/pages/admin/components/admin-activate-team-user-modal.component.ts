import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroExclamationTriangle, heroXMark } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-admin-activate-team-user-modal',
  imports: [NgIcon],
  providers: [provideIcons({ heroExclamationTriangle, heroXMark })],
  template: `
    <div
      class="fixed inset-0 z-[230] flex items-center justify-center bg-black/20 p-4 backdrop-blur-[2px]"
      (click)="close.emit()"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="activate-team-user-modal-title"
        class="w-full max-w-[620px] rounded-[26px] bg-white p-6 shadow-[0_30px_80px_-40px_rgba(19,27,45,0.45)] sm:p-8"
        (click)="$event.stopPropagation()"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex h-24 w-24 items-center justify-center rounded-full bg-[#faf7ec]">
            <div class="flex h-16 w-16 items-center justify-center rounded-full bg-[#f9efc8] text-[#d8b600]">
              <ng-icon name="heroExclamationTriangle" class="text-[34px]"></ng-icon>
            </div>
          </div>

          <button
            type="button"
            (click)="close.emit()"
            class="flex h-11 w-11 items-center justify-center rounded-full border border-[#e8e8e8] bg-white text-[#626262] shadow-[0_8px_18px_-14px_rgba(0,0,0,0.35)] transition hover:bg-[#fafafa]"
            aria-label="Close activate user modal"
          >
            <ng-icon name="heroXMark" class="text-[20px]"></ng-icon>
          </button>
        </div>

        <div class="mt-4">
          <h2 id="activate-team-user-modal-title" class="text-[18px] font-semibold text-[#202020] sm:text-[20px]">
            Activate user
          </h2>

          <p class="mt-3 max-w-[520px] text-[15px] leading-7 text-[#575757]">
            Are you sure you want to activate this user? Once activated, this user will regain access to their portal
          </p>
        </div>

        <div class="mt-14 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            (click)="close.emit()"
            class="min-w-[126px] rounded-full border border-[#ececec] bg-white px-6 py-3 text-[15px] font-medium text-[#1f1f1f] transition hover:bg-[#fafafa]"
          >
            No, hold on
          </button>

          <button
            type="button"
            (click)="confirm.emit()"
            class="min-w-[142px] rounded-full bg-[#6653e4] px-6 py-3 text-[15px] font-medium text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)] transition hover:bg-[#5945db]"
          >
            Yes, activate
          </button>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminActivateTeamUserModalComponent {
  readonly close = output<void>();
  readonly confirm = output<void>();
}
