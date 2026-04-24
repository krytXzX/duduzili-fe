import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export type SettingsTab = 'profile' | 'security' | 'notifications';

@Component({
  selector: 'app-settings-nav',
  imports: [CommonModule, NgOptimizedImage],
  template: `
    <section class="w-[261px] rounded-[16px] border border-[#EFEFEF] bg-white p-4">
      <p class="px-2.5 text-[12px] uppercase leading-4 text-[rgba(143,143,143,0.7)]">Select menu</p>

      <div class="mt-3 flex flex-col gap-3">
        @for (item of items; track item.id) {
          <button
            type="button"
            (click)="tabChange.emit(item.id)"
            class="flex h-8 w-full items-center gap-2 rounded-[8px] px-2.5 py-1 text-left text-[14px] leading-5 transition hover:bg-[#F4F4F4] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1B1D]"
            [class.bg-[#F4F4F4]]="activeTab() === item.id"
            [class.bg-[#E9F6EE]]="activeTab() === item.id && item.id === 'notifications'"
            [class.font-medium]="activeTab() === item.id"
            [class.text-[#1F1F1F]]="activeTab() === item.id"
            [class.text-[rgba(13,13,13,0.4)]]="activeTab() !== item.id"
          >
            <img [ngSrc]="activeTab() === item.id ? item.activeIconSrc : item.iconSrc" width="16" height="16" alt="" aria-hidden="true">
            {{ item.label }}
          </button>
        }
      </div>

    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsNavComponent {
  readonly activeTab = input.required<SettingsTab>();
  readonly tabChange = output<SettingsTab>();

  protected readonly items = [
    {
      id: 'profile' as const,
      label: 'Profile settings',
      iconSrc: '/assets/icons/settings/settings-nav-profile.svg',
      activeIconSrc: '/assets/icons/settings/settings-nav-profile.svg',
    },
    {
      id: 'security' as const,
      label: 'Security',
      iconSrc: '/assets/icons/settings/notifications-nav-security.svg',
      activeIconSrc: '/assets/icons/settings/settings-nav-security-active.svg',
    },
    {
      id: 'notifications' as const,
      label: 'Notifications',
      iconSrc: '/assets/icons/settings/settings-nav-notifications.svg',
      activeIconSrc: '/assets/icons/settings/notifications-nav-active.svg',
    },
  ];
}
