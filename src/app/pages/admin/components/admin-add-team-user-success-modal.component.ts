import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroCheck } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-admin-add-team-user-success-modal',
  imports: [NgIcon],
  providers: [provideIcons({ heroCheck })],
  template: `
    <div
      class="fixed inset-0 z-[230] flex items-end justify-center bg-black/20 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      (click)="done.emit()"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-team-user-success-modal-title"
        class="w-full rounded-t-[32px] rounded-b-[32px] bg-white text-center shadow-[0_30px_80px_-40px_rgba(19,27,45,0.45)] sm:max-w-[600px] sm:rounded-[10px] sm:px-10 sm:py-16"
        (click)="$event.stopPropagation()"
      >
        <div class="sm:hidden">
          <div class="relative px-4 pb-2 pt-3">
            <div class="mx-auto h-1 w-[50px] rounded-full bg-[#D9D9D9]"></div>
            <button
              type="button"
              (click)="done.emit()"
              class="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full text-[#141414]"
              aria-label="Close success sheet"
            >
              <span class="text-[24px] leading-none">&times;</span>
            </button>
          </div>
        </div>

        <div class="mx-auto flex w-full max-w-[395px] flex-col items-center gap-6 px-4 pb-6 pt-10 sm:px-0 sm:pb-0 sm:pt-0">
          <div class="relative flex h-[120px] w-[120px] items-center justify-center rounded-full bg-[#F9F9F9]">
            <div class="absolute right-[54px] top-3 h-[39px] w-[38px] rounded-full bg-[#A9EAD0] shadow-[2px_1px_4px_rgba(153,153,153,0.1),6px_3px_7px_rgba(153,153,153,0.09),14px_7px_10px_rgba(153,153,153,0.05)]"></div>
            <div class="absolute right-[23px] top-[59px] h-[89px] w-[103px] rounded-full bg-[#A9EAD0] shadow-[2px_1px_4px_rgba(153,153,153,0.1),6px_3px_7px_rgba(153,153,153,0.09),14px_7px_10px_rgba(153,153,153,0.05)]"></div>
            <div class="absolute left-[72px] top-[57px] flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#6453D9] text-white shadow-[0_4px_12px_rgba(81,35,173,0.33)]">
              <ng-icon name="heroCheck" class="text-[18px]"></ng-icon>
            </div>
          </div>

          <div class="flex w-full flex-col items-center gap-8">
            <div class="flex max-w-[403px] flex-col items-center gap-3 text-center">
              <h2 id="add-team-user-success-modal-title" class="text-[18px] font-medium leading-7 text-[#0D0D0D]">
                User added successfully
              </h2>
              <p class="text-[16px] leading-6 text-[#0D0D0D]/50">
                You have successfully added a new user. Login details have been sent to your team member’s email
              </p>
            </div>

            <div class="flex w-full items-center justify-center gap-2">
              <button
                type="button"
                (click)="addAnother.emit()"
                class="h-[52px] rounded-[82px] bg-[#F5F5F5] px-6 text-[16px] font-medium tracking-[-0.5px] text-[#05061A] transition hover:bg-[#ededed]"
              >
                Add another user
              </button>

              <button
                type="button"
                (click)="done.emit()"
                class="h-[52px] rounded-full border border-white bg-[#6453D9] px-6 text-[14px] font-medium text-white shadow-[0_4px_12px_rgba(81,35,173,0.33),0_0_0_1px_#6B5BD5] transition hover:bg-[#5C4AD0]"
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
export class AdminAddTeamUserSuccessModalComponent {
  readonly addAnother = output<void>();
  readonly done = output<void>();
}
