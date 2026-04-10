import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-notifications-page',
  template: `
    <div class="flex h-full flex-col rounded-[32px] border border-gray-100/60 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
      <div class="border-b border-[#F0F0F2] px-8 py-6">
        <h1 class="text-[20px] font-black tracking-tight text-[#1A1C21]">Notifications</h1>
      </div>
      <div class="flex flex-1 items-center justify-center px-8 py-12 text-center">
        <div>
          <h2 class="text-[21px] font-bold text-[#1A1C21]">Notifications page coming next</h2>
          <p class="mt-3 text-[13px] font-medium text-[#8A8F98]">This route exists now so the dashboard build can complete.</p>
        </div>
      </div>
    </div>
  `,
  host: { class: 'block h-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsPageComponent {}
