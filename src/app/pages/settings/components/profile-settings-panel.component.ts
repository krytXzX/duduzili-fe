import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface ProfileSettingsData {
  email: string;
  callNumber: string;
  whatsappNumber: string;
  fullName: string;
}

type ProfileAction = 'edit-name' | 'edit-email' | 'edit-call' | 'edit-whatsapp';
type ProfilePanelMode = 'full' | 'details-only';

@Component({
  selector: 'app-profile-settings-panel',
  imports: [CommonModule, NgOptimizedImage],
  template: `
    <section class="w-full max-w-[579px]">
      @if (mode() === 'full') {
        <div class="space-y-1 md:space-y-0">
          <h2 class="text-[25px] font-semibold leading-[1.2] text-[#1A1B1D] md:text-[28px] md:leading-[40px]">
            Profile settings
          </h2>
          <p class="text-[12px] leading-normal text-[rgba(26,27,29,0.6)] md:text-[14px] md:leading-5">
            Manage your account preferences and personal information<span class="hidden md:inline">.</span>
          </p>
        </div>
      }

      <div class="mt-8 md:mt-10">
        <button
          type="button"
          class="relative block h-[100px] w-[104px] rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1B1D] focus-visible:ring-offset-4"
          aria-label="Update profile photo"
        >
          <span class="hidden h-[100px] w-[100px] overflow-hidden rounded-full border-2 border-white bg-[#F3F3F3] md:block">
            <img
              ngSrc="/assets/images/settings/profile-avatar.png"
              width="100"
              height="100"
              alt="Profile avatar"
              class="h-full w-full object-cover"
              priority
            >
          </span>
          <span class="flex h-[100px] w-[100px] items-center justify-center rounded-full bg-[#FFA72B] text-[54px] font-semibold leading-[1.2] text-white md:hidden">
            B
          </span>
          <span class="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#252B16] text-white">
            <svg class="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M5.667 2.667 4.833 4H3.667A1.667 1.667 0 0 0 2 5.667v5A1.667 1.667 0 0 0 3.667 12.333h8.666A1.667 1.667 0 0 0 14 10.667v-5A1.667 1.667 0 0 0 12.333 4h-1.166l-.834-1.333H5.667Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
              <path d="M8 10.333A2.167 2.167 0 1 0 8 6a2.167 2.167 0 0 0 0 4.333Z" stroke="currentColor" stroke-width="1.2"/>
            </svg>
          </span>
        </button>
      </div>

      <div class="mt-8 md:mt-10">
        <div class="flex h-5 w-full items-center justify-between md:w-[358px]">
          <p class="text-[14px] uppercase leading-5 text-[rgba(26,27,29,0.5)]">General details</p>
        </div>

        <div class="mt-3 w-full rounded-[24px] bg-[#FAFAFA] p-4 md:mt-2">
          <div class="flex flex-col gap-6">
            @for (item of detailRows(); track item.label) {
              <div class="flex min-h-10 items-center justify-between gap-4">
                <div class="min-w-0">
                  <p class="text-[14px] leading-5 text-[rgba(26,27,29,0.5)]">
                    {{ item.label }}
                  </p>
                  <p class="mt-0.5 truncate text-[16px] font-medium leading-6 text-[#1A1B1D]">
                    @if (item.mobileValue) {
                      <span class="md:hidden">{{ item.mobileValue }}</span>
                      <span class="hidden md:inline">{{ item.value }}</span>
                    } @else {
                      {{ item.value }}
                    }
                  </p>
                </div>

                @if (item.action === 'edit-name' || item.action === 'edit-email' || (item.action === 'edit-whatsapp' && item.mobileValue)) {
                  <button
                    type="button"
                    (click)="action.emit(item.action)"
                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#858585] transition hover:bg-white hover:text-[#1A1B1D] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1B1D]"
                    [attr.aria-label]="'Edit ' + item.label"
                  >
                    <svg class="h-4 w-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                      <path d="M10.72 2.03a1.75 1.75 0 0 1 2.475 2.475l-.76.76-2.475-2.474.76-.76ZM9.253 3.498 3.86 8.89a2 2 0 0 0-.52.898l-.67 2.456a.75.75 0 0 0 .918.918l2.456-.67a2 2 0 0 0 .898-.52l5.392-5.393-2.475-2.475Z"/>
                    </svg>
                  </button>
                } @else {
                  <button
                    type="button"
                    (click)="action.emit(item.action)"
                    class="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1 text-[16px] font-medium leading-[22px] text-[#1D1D1D] transition hover:bg-[#F2F2F2] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1B1D]"
                  >
                    <span aria-hidden="true">+</span>
                    <span class="hidden md:inline">Add number</span>
                    <span class="md:hidden">Add</span>
                  </button>
                }
              </div>
            }
          </div>
        </div>
      </div>

      @if (mode() === 'full') {
        <div class="mt-8 hidden md:block">
          <div class="mb-5 flex items-center gap-2">
            <span class="h-px flex-1 bg-[#EFEFEF]"></span>
            <span class="inline-flex items-center gap-2 text-[14px] font-medium leading-5 text-[#A2A2A2]">
              <img ngSrc="/assets/icons/settings/mobile-danger.svg" width="16" height="16" alt="" aria-hidden="true">
              Danger zone
            </span>
            <span class="h-px flex-1 bg-[#EFEFEF]"></span>
          </div>

          <button
            type="button"
            (click)="deleteRequest.emit()"
            class="flex h-11 items-center justify-center rounded-full border border-[#FF7B7B] bg-[linear-gradient(180deg,#FF6B73_0%,#FF5E67_100%)] px-5 text-[14px] font-semibold leading-5 text-white shadow-[0_6px_16px_rgba(255,95,103,0.22)] transition duration-200 hover:-translate-y-0.5 hover:bg-[linear-gradient(180deg,#FF7680_0%,#FF6871_100%)] hover:shadow-[0_10px_22px_rgba(255,95,103,0.28)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5E67] focus-visible:ring-offset-2"
          >
            Delete / deactivate account
          </button>
        </div>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileSettingsPanelComponent {
  readonly profile = input.required<ProfileSettingsData>();
  readonly mode = input<ProfilePanelMode>('full');
  readonly action = output<ProfileAction>();
  readonly deleteRequest = output<void>();

  protected detailRows(): Array<{
    label: string;
    value: string;
    mobileValue?: string;
    action: ProfileAction;
  }> {
    return [
      { label: 'Email', value: this.profile().email, action: 'edit-email' },
      { label: 'Call number', value: this.profile().callNumber || '---', action: 'edit-call' },
      {
        label: 'WhatsApp number',
        value: this.profile().whatsappNumber || '---',
        mobileValue: this.profile().whatsappNumber || '08169397443',
        action: 'edit-whatsapp',
      },
      { label: 'Full name', value: this.profile().fullName, action: 'edit-name' },
    ];
  }
}
