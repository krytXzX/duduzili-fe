import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

type AdsItem = {
  readonly label: string;
  readonly route: string;
};

@Component({
  selector: 'app-ads-page',
  imports: [RouterLink],
  template: `
    <div class="mx-auto w-full max-w-[420px] bg-[#F7F7FA] px-4 pt-4 pb-8 md:hidden">
      <div class="flex items-center gap-3">
        <a
          routerLink="/more"
          aria-label="Back to More"
          class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F6FA] text-[#30313A]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-[16px] w-[16px]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M11.78 4.22a.75.75 0 010 1.06L7.06 10l4.72 4.72a.75.75 0 11-1.06 1.06l-5.25-5.25a.75.75 0 010-1.06l5.25-5.25a.75.75 0 011.06 0z" clip-rule="evenodd" />
          </svg>
        </a>
        <h1 class="text-[20px] font-semibold tracking-[-0.03em] text-[#202335]">Ads</h1>
      </div>

      <div class="mt-5 rounded-[28px] bg-white px-3 py-2.5 shadow-[0_8px_24px_-22px_rgba(34,39,48,0.45)] ring-1 ring-[#F0F1F5]">
        @for (item of items; track item.label) {
          <a
            [routerLink]="item.route"
            class="flex items-center justify-between gap-4 px-2 py-3 text-[#242734]"
          >
            <span class="flex min-w-0 items-center gap-3">
              <span class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2E2F35] text-white">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-[14px] w-[14px]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M10 2.5a7.5 7.5 0 100 15 7.5 7.5 0 000-15zM8.75 6a.75.75 0 000 1.5h1.5a.75.75 0 010 1.5h-.5a2.25 2.25 0 100 4.5h.5V14a.75.75 0 001.5 0v-.3A2.25 2.25 0 0011.25 9h-.5a.75.75 0 010-1.5h2a.75.75 0 000-1.5h-1V5.5a.75.75 0 00-1.5 0V6h-1.5z" clip-rule="evenodd" />
                </svg>
              </span>
              <span class="truncate text-[13px] font-medium">{{ item.label }}</span>
            </span>

            <span class="text-[#7D828D]" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-[18px] w-[18px]" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M7.22 4.22a.75.75 0 011.06 0l5.25 5.25a.75.75 0 010 1.06l-5.25 5.25a.75.75 0 11-1.06-1.06L11.94 10 7.22 5.28a.75.75 0 010-1.06z" clip-rule="evenodd" />
              </svg>
            </span>
          </a>

          @if (!$last) {
            <div class="mx-2 h-px bg-[#F0F1F5]"></div>
          }
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdsPageComponent {
  readonly items: readonly AdsItem[] = [
    { label: 'Plans', route: '/ads/plans' },
    { label: 'Running Ads', route: '/ads/running' },
    { label: 'Billing history', route: '/ads/billing-history' },
  ];
}
