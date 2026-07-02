import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AdminLocationsSettingsPanelComponent } from '../settings/components/admin-locations-settings-panel.component';

@Component({
  selector: 'app-admin-locations-page',
  imports: [AdminLocationsSettingsPanelComponent],
  template: `
    <section class="flex h-full min-h-0 flex-col rounded-[32px] bg-white">
      <header class="shrink-0 border-b border-[#F0F0F2] px-6 py-5 md:px-8 md:py-6">
        <h1 class="text-[24px] font-semibold leading-[1.2] text-[#1A1B1D] md:text-[28px]">
          Locations
        </h1>
        <p class="mt-2 max-w-[640px] text-[14px] leading-5 text-[rgba(26,27,29,0.6)]">
          Manage the states and cities available in platform location pickers.
        </p>
      </header>

      <div class="min-h-0 flex-1 overflow-y-auto px-5 py-6 md:px-8">
        <app-admin-locations-settings-panel></app-admin-locations-settings-panel>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLocationsPageComponent {}
