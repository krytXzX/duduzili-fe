import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MobileBottomNavComponent } from '../../components/layout/mobile-bottom-nav.component';

type RequestItem = {
  readonly label: string;
  readonly description: string;
  readonly route: string;
  readonly icon: 'offers' | 'callbacks';
};

@Component({
  selector: 'app-requests-page',
  imports: [RouterLink, MobileBottomNavComponent],
  template: `
    <div class="min-h-full bg-[#F7F7FA] pb-28 md:bg-transparent md:px-6 md:py-8">
      <div class="mx-auto max-w-[420px] px-5 pt-4 md:max-w-5xl md:rounded-[32px] md:border md:border-[#ECECF3] md:bg-white md:px-8 md:py-8 md:shadow-[0_12px_40px_-32px_rgba(23,29,38,0.35)]">
        <div class="flex items-center justify-between gap-4">
          <a
            routerLink="/"
            aria-label="Go to Duduzili home"
            class="text-[22px] font-medium tracking-[-0.04em] text-[#6F56F6]"
          >
            Duduzili
          </a>

          <img
            src="/assets/images/image-1-1.jpg"
            width="44"
            height="44"
            alt="Profile picture"
            class="h-10 w-10 rounded-full object-cover"
          >
        </div>

        <div class="mt-7 flex items-center gap-3">
          <a
            routerLink="/more"
            aria-label="Back to More"
            class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F6FA] text-[#30313A]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-[18px] w-[18px]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M11.78 4.22a.75.75 0 010 1.06L7.06 10l4.72 4.72a.75.75 0 11-1.06 1.06l-5.25-5.25a.75.75 0 010-1.06l5.25-5.25a.75.75 0 011.06 0z" clip-rule="evenodd" />
            </svg>
          </a>

          <h1 class="text-[20px] font-semibold tracking-[-0.03em] text-[#202335]">Requests</h1>
        </div>

        <div class="mt-6 rounded-[28px] bg-white px-3 py-2.5 shadow-[0_8px_24px_-22px_rgba(34,39,48,0.45)] ring-1 ring-[#F0F1F5]">
          @for (item of requestItems; track item.label) {
            <a
              [routerLink]="item.route"
              class="flex items-center justify-between gap-4 px-2 py-3 text-[#242734]"
            >
              <span class="flex min-w-0 items-center gap-3">
                <span class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2E2F35] text-white">
                  @if (item.icon === 'offers') {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-[18px] w-[18px]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M10 2.5a7.5 7.5 0 100 15 7.5 7.5 0 000-15zM8.75 6a.75.75 0 000 1.5h1.5a.75.75 0 010 1.5h-.5a2.25 2.25 0 100 4.5h.5V14a.75.75 0 001.5 0v-.3A2.25 2.25 0 0011.25 9h-.5a.75.75 0 010-1.5h2a.75.75 0 000-1.5h-1V5.5a.75.75 0 00-1.5 0V6h-1.5z" clip-rule="evenodd" />
                    </svg>
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-[18px] w-[18px]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M3.5 2.75A2.75 2.75 0 00.75 5.5v9A2.75 2.75 0 003.5 17.25h13A2.75 2.75 0 0019.25 14.5v-9A2.75 2.75 0 0016.5 2.75h-13zm1 2.5a.75.75 0 01.75-.75h1.25a.75.75 0 01.75.75v1.03c0 .2.08.39.22.53l.82.82a.75.75 0 010 1.06l-1.28 1.28a.75.75 0 01-1.06 0l-.82-.82a.75.75 0 00-.53-.22H3.5a.75.75 0 01-.75-.75V5.5a.75.75 0 01.75-.75h1zm8 0a.75.75 0 01.75-.75h1.25a.75.75 0 01.75.75v2.25a.75.75 0 01-.75.75h-1.1a.75.75 0 00-.53.22l-.82.82a.75.75 0 01-1.06 0L9.7 8.66a.75.75 0 010-1.06l.82-.82a.75.75 0 00.22-.53V5.5z" />
                    </svg>
                  }
                </span>

                <span class="min-w-0">
                  <span class="block truncate text-[14px] font-medium text-[#242734]">{{ item.label }}</span>
                  <span class="block truncate text-[11px] text-[#9094A0]">{{ item.description }}</span>
                </span>
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

      <app-mobile-bottom-nav />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestsPageComponent {
  readonly requestItems: readonly RequestItem[] = [
    { label: 'Offers', description: 'Buyer price offers', route: '/requests/offers', icon: 'offers' },
    { label: 'Call back requests', description: 'Buyers requesting a phone call', route: '/requests/callbacks', icon: 'callbacks' },
  ];
}
