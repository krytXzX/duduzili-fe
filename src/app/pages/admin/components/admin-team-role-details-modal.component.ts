import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroXMark } from '@ng-icons/heroicons/outline';

export interface TeamRoleDetails {
  id: string;
  name: string;
  title: string;
  description: string;
  permissionsList: ReadonlyArray<string>;
}

@Component({
  selector: 'app-admin-team-role-details-modal',
  imports: [NgIcon],
  providers: [provideIcons({ heroXMark })],
  template: `
    <div
      class="fixed inset-0 z-[220] flex items-center justify-center bg-black/20 p-4 backdrop-blur-[2px]"
      (click)="close.emit()"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="team-role-details-modal-title"
        class="max-h-[calc(100vh-2rem)] w-full max-w-[760px] overflow-y-auto rounded-[26px] bg-white p-6 shadow-[0_30px_80px_-40px_rgba(19,27,45,0.45)] sm:p-8"
        (click)="$event.stopPropagation()"
      >
        <div class="flex items-start justify-between gap-4">
          <h2 id="team-role-details-modal-title" class="text-[2rem] font-semibold tracking-[-0.04em] text-[#202020]">
            {{ role().name }}
          </h2>

          <button
            type="button"
            (click)="close.emit()"
            class="flex h-11 w-11 items-center justify-center rounded-full border border-[#e8e8e8] bg-white text-[#626262] shadow-[0_8px_18px_-14px_rgba(0,0,0,0.35)] transition hover:bg-[#fafafa]"
            aria-label="Close role details modal"
          >
            <ng-icon name="heroXMark" class="text-xl"></ng-icon>
          </button>
        </div>

        <section class="mt-10 rounded-[24px] border border-[#e9e9e9] px-5 py-5">
          <label class="block">
            <span class="mb-3 block text-[15px] text-[#505050]">Title of role</span>
            <div class="flex min-h-11 items-center rounded-[12px] bg-[#f3f3f6] px-4 text-[15px] text-[#202020]">
              {{ role().title }}
            </div>
          </label>

          <p class="mt-6 max-w-[640px] text-[15px] leading-8 text-[#7b7b7b]">
            {{ role().description }}
          </p>
        </section>

        <section class="mt-8">
          <h3 class="text-[18px] font-semibold text-[#202020]">Permissions</h3>

          <ul class="mt-4 list-disc space-y-2 pl-6 text-[15px] leading-7 text-[#6f6f6f]">
            @for (permission of role().permissionsList; track permission) {
              <li>{{ permission }}</li>
            }
          </ul>
        </section>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminTeamRoleDetailsModalComponent {
  readonly role = input.required<TeamRoleDetails>();
  readonly close = output<void>();
}
