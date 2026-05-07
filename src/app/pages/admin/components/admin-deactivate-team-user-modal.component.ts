import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroExclamationTriangle, heroXMark } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-admin-deactivate-team-user-modal',
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
        aria-labelledby="deactivate-team-user-modal-title"
        class="w-full rounded-t-[32px] rounded-b-[32px] bg-white p-6 shadow-[0_30px_80px_-40px_rgba(19,27,45,0.45)] sm:max-w-[620px] sm:rounded-[26px] sm:p-8"
        (click)="$event.stopPropagation()"
      >
        <div class="mb-3 sm:hidden">
          <div class="mx-auto h-1 w-[50px] rounded-full bg-[#D9D9D9]"></div>
        </div>

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
            aria-label="Close deactivate user modal"
          >
            <ng-icon name="heroXMark" class="text-[20px]"></ng-icon>
          </button>
        </div>

        <div class="mt-4">
          <h2 id="deactivate-team-user-modal-title" class="text-[18px] font-semibold text-[#202020] sm:text-[20px]">
            Deactivate user
          </h2>

          <p class="mt-3 max-w-[520px] text-[15px] leading-7 text-[#575757]">
            Are you sure you want to deactivate this user? Once deactivated, this user will lose access to their portal
          </p>
        </div>

        <div class="mt-14 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
          <button
            type="button"
            (click)="close.emit()"
            class="w-full rounded-full border border-[#ececec] bg-white px-6 py-3 text-[15px] font-medium text-[#1f1f1f] transition hover:bg-[#fafafa] sm:min-w-[126px] sm:w-auto"
          >
            No, hold on
          </button>

          <button
            type="button"
            (click)="confirm.emit()"
            class="w-full rounded-full bg-[#ff2d2d] px-6 py-3 text-[15px] font-medium text-white shadow-[0_16px_32px_-18px_rgba(255,45,45,0.9)] transition hover:bg-[#f32020] sm:min-w-[156px] sm:w-auto"
          >
            Yes, deactivate
          </button>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDeactivateTeamUserModalComponent {
  readonly close = output<void>();
  readonly confirm = output<void>();
}
