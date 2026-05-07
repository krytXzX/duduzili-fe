import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroCheck, heroShieldCheck } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-admin-create-team-role-success-modal',
  imports: [NgIcon],
  providers: [provideIcons({ heroCheck, heroShieldCheck })],
  template: `
    <div
      class="fixed inset-0 z-[230] flex items-end justify-center bg-black/20 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      (click)="done.emit()"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-team-role-success-modal-title"
        class="w-full rounded-t-[32px] rounded-b-[32px] bg-white px-6 py-8 text-center shadow-[0_30px_80px_-40px_rgba(19,27,45,0.45)] sm:max-w-[620px] sm:rounded-[26px] sm:px-8 sm:py-12"
        (click)="$event.stopPropagation()"
      >
        <div class="mb-4 sm:hidden">
          <div class="mx-auto h-1 w-[50px] rounded-full bg-[#D9D9D9]"></div>
        </div>

        <div class="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-[#f5f5f5]">
          <div class="relative flex items-center justify-center text-[#83dfbd]">
            <ng-icon name="heroShieldCheck" class="text-[72px]"></ng-icon>
            <div class="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-[#6653e4] text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)]">
              <ng-icon name="heroCheck" class="text-[20px]"></ng-icon>
            </div>
          </div>
        </div>

        <h2 id="create-team-role-success-modal-title" class="mt-8 text-[28px] font-semibold tracking-[-0.04em] text-[#202020]">
          Role created successfully
        </h2>

        <p class="mx-auto mt-4 max-w-[430px] text-[15px] leading-8 text-[#8d8d8d]">
          You successfully created a new role. Users can now be assigned to the new role created
        </p>

        <div class="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
          <button
            type="button"
            (click)="addAnother.emit()"
            class="w-full rounded-full border border-[#ececec] bg-white px-6 py-3 text-[15px] font-medium text-[#1f1f1f] transition hover:bg-[#fafafa] sm:min-w-[168px] sm:w-auto"
          >
            Add another role
          </button>

          <button
            type="button"
            (click)="done.emit()"
            class="w-full rounded-full bg-[#6653e4] px-6 py-3 text-[15px] font-medium text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)] transition hover:bg-[#5945db] sm:min-w-[126px] sm:w-auto"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCreateTeamRoleSuccessModalComponent {
  readonly addAnother = output<void>();
  readonly done = output<void>();
}
