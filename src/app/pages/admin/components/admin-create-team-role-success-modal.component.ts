import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroCheck, heroShieldCheck } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-admin-create-team-role-success-modal',
  imports: [NgIcon],
  providers: [provideIcons({ heroCheck, heroShieldCheck })],
  template: `
    <div
      class="fixed inset-0 z-[230] flex items-center justify-center bg-black/20 p-4 backdrop-blur-[2px]"
      (click)="done.emit()"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-team-role-success-modal-title"
        class="w-full max-w-[620px] rounded-[26px] bg-white px-6 py-10 text-center shadow-[0_30px_80px_-40px_rgba(19,27,45,0.45)] sm:px-8 sm:py-12"
        (click)="$event.stopPropagation()"
      >
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

        <div class="mt-10 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            (click)="addAnother.emit()"
            class="min-w-[168px] rounded-full border border-[#ececec] bg-white px-6 py-3 text-[15px] font-medium text-[#1f1f1f] transition hover:bg-[#fafafa]"
          >
            Add another role
          </button>

          <button
            type="button"
            (click)="done.emit()"
            class="min-w-[126px] rounded-full bg-[#6653e4] px-6 py-3 text-[15px] font-medium text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)] transition hover:bg-[#5945db]"
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
