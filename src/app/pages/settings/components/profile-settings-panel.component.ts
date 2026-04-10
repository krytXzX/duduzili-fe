import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroPencilSquare } from '@ng-icons/heroicons/outline';

export interface ProfileSettingsData {
  email: string;
  callNumber: string;
  whatsappNumber: string;
  firstName: string;
}

type ProfileAction = 'edit-name' | 'edit-email' | 'edit-call' | 'edit-whatsapp';

@Component({
  selector: 'app-profile-settings-panel',
  imports: [CommonModule, NgIcon],
  providers: [provideIcons({ heroPencilSquare })],
  template: `
    <section>
      <div>
        <h2 class="text-[20px] font-black tracking-tight text-[#1A1C21]">Profile settings</h2>
        <p class="mt-1 text-[12px] font-medium text-[#A2A7B0]">
          Manage your account preferences and personal information
        </p>
      </div>

      <div class="mt-6 flex items-center gap-4">
        <div class="relative h-14 w-14 overflow-hidden rounded-full border border-[#ECEEF3] bg-[#E8EDF6]">
          <img
            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop"
            alt="Profile avatar"
            class="h-full w-full object-cover"
          >
          <span class="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white bg-[#2FCB56]"></span>
        </div>
      </div>

      <div class="mt-8 max-w-[460px] rounded-[18px] border border-[#EEF0F4] bg-white">
        <p class="border-b border-[#F2F3F6] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#B4B8C0]">
          General details
        </p>

        @for (item of detailRows(); track item.label) {
          <div class="flex items-center justify-between gap-6 border-b border-[#F2F3F6] px-4 py-4 last:border-b-0">
            <div>
              <p class="text-[11px] font-medium text-[#B0B4BD]">{{ item.label }}</p>
              <p class="mt-1 text-[13px] font-medium text-[#2C3037]">{{ item.value }}</p>
            </div>

            @if (item.action === 'edit-name' || item.action === 'edit-email') {
              <button
                type="button"
                (click)="action.emit(item.action)"
                class="text-[#6A6F78] transition hover:text-[#4F42A4]"
                [attr.aria-label]="'Edit ' + item.label"
              >
                <ng-icon name="heroPencilSquare" class="text-sm"></ng-icon>
              </button>
            } @else {
              <button
                type="button"
                (click)="action.emit(item.action)"
                class="text-[12px] font-semibold text-[#6A6F78] transition hover:text-[#4F42A4]"
              >
                {{ item.value === '-' ? '+ Add number' : 'Update' }}
              </button>
            }
          </div>
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileSettingsPanelComponent {
  readonly profile = input.required<ProfileSettingsData>();
  readonly action = output<ProfileAction>();

  protected detailRows(): Array<{ label: string; value: string; action: ProfileAction }> {
    return [
      { label: 'Email', value: this.profile().email, action: 'edit-email' },
      { label: 'Call number', value: this.profile().callNumber || '-', action: 'edit-call' },
      { label: 'WhatsApp number', value: this.profile().whatsappNumber || '-', action: 'edit-whatsapp' },
      { label: 'First name', value: this.profile().firstName, action: 'edit-name' },
    ];
  }
}
