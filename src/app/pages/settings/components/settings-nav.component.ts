import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroUser, heroShieldCheck, heroBell } from '@ng-icons/heroicons/outline';

export type SettingsTab = 'profile' | 'security' | 'notifications';

@Component({
  selector: 'app-settings-nav',
  imports: [CommonModule, NgIcon],
  providers: [provideIcons({ heroUser, heroShieldCheck, heroBell })],
  template: `
    <section class="rounded-[20px] border border-[#EEF0F4] bg-white p-4">
      <p class="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#B4B8C0]">Select page</p>

      <div class="space-y-1">
        @for (item of items; track item.id) {
          <button
            type="button"
            (click)="tabChange.emit(item.id)"
            class="flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-left text-[13px] font-medium transition hover:bg-[#F8F9FB]"
            [class.bg-[#F4F5F8]]="activeTab() === item.id"
            [class.text-[#2A2D34]]="activeTab() === item.id"
            [class.text-[#9297A1]]="activeTab() !== item.id"
          >
            <ng-icon [name]="item.icon" class="text-sm"></ng-icon>
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
    { id: 'profile' as const, label: 'Profile settings', icon: 'heroUser' },
    { id: 'security' as const, label: 'Security', icon: 'heroShieldCheck' },
    { id: 'notifications' as const, label: 'Notifications', icon: 'heroBell' },
  ];
}
