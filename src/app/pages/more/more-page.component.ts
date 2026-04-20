import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MobileBottomNavComponent } from '../../components/layout/mobile-bottom-nav.component';

type MoreItem = {
  readonly label: string;
  readonly route: string;
  readonly icon: 'requests' | 'promotions' | 'ads' | 'analytics' | 'wallet' | 'settings';
};

@Component({
  selector: 'app-more-page',
  imports: [NgOptimizedImage, RouterLink, MobileBottomNavComponent],
  template: `
    <div class="min-h-full bg-[#F7F7FA] pb-28 md:bg-transparent md:px-6 md:py-8">
      <div
        class="mx-auto max-w-[420px] px-5 pt-4 md:max-w-5xl md:rounded-[32px] md:border md:border-[#ECECF3] md:bg-white md:px-8 md:py-8 md:shadow-[0_12px_40px_-32px_rgba(23,29,38,0.35)]"
      >
        <div class="flex items-center justify-between gap-4">
          <h1 class="text-[20px] font-semibold tracking-[-0.03em] text-[#202335]">More</h1>

          <a
            routerLink="/notifications"
            aria-label="Open notifications"
            class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#30313A] shadow-[0_6px_18px_-16px_rgba(34,39,48,0.5)] ring-1 ring-[#F0F1F5] transition hover:text-[#6F56F6]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                d="M10 2.75A3.25 3.25 0 006.75 6v1.02c0 .5-.14.99-.404 1.415L5.51 9.77a3.25 3.25 0 00-.51 1.747V13.5h10v-1.983a3.25 3.25 0 00-.51-1.747l-.836-1.335A2.75 2.75 0 0113.25 7V6A3.25 3.25 0 0010 2.75z"
              />
              <path d="M8.5 15.25a1.5 1.5 0 003 0h-3z" />
            </svg>
          </a>
        </div>

        <div class="mt-6 space-y-7">
          <section
            class="rounded-[28px] bg-white p-3 shadow-[0_8px_24px_-22px_rgba(34,39,48,0.45)] ring-1 ring-[#F0F1F5]"
          >
            <a
              routerLink="/requests"
              class="flex items-center justify-between gap-4 rounded-[22px] px-2 py-1.5 text-[#242734]"
            >
              <span class="flex min-w-0 items-center gap-3">
                <span
                  class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-[#4CB46C] text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-[18px] w-[18px]"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      d="M3.25 5A2.75 2.75 0 016 2.25h8A2.75 2.75 0 0116.75 5v5A2.75 2.75 0 0114 12.75H8.31l-3.624 2.719A.75.75 0 013.5 14.87v-2.379A2.75 2.75 0 011.25 10V5A.75.75 0 012 4.25h1.25V5zM6 3.75A1.25 1.25 0 004.75 5v5A1.25 1.25 0 006 11.25h8A1.25 1.25 0 0015.25 10V5A1.25 1.25 0 0014 3.75H6z"
                    />
                    <path
                      d="M7 6.75a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5h-4.5A.75.75 0 017 6.75zm0 2.75a.75.75 0 01.75-.75h3a.75.75 0 010 1.5h-3A.75.75 0 017 9.5z"
                    />
                  </svg>
                </span>
                <span class="truncate text-[13px] font-medium">Requests</span>
              </span>

              <span class="text-[#7D828D]" aria-hidden="true">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-[18px] w-[18px]"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M7.22 4.22a.75.75 0 011.06 0l5.25 5.25a.75.75 0 010 1.06l-5.25 5.25a.75.75 0 11-1.06-1.06L11.94 10 7.22 5.28a.75.75 0 010-1.06z"
                    clip-rule="evenodd"
                  />
                </svg>
              </span>
            </a>
          </section>

          <section
            class="rounded-[28px] bg-white px-3 py-2.5 shadow-[0_8px_24px_-22px_rgba(34,39,48,0.45)] ring-1 ring-[#F0F1F5]"
          >
            @for (item of primaryItems; track item.label) {
              <a
                [routerLink]="item.route"
                class="flex items-center justify-between gap-4 px-2 py-3 text-[#242734]"
              >
                <span class="flex min-w-0 items-center gap-3">
                  <span
                    class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] text-white"
                    [class.bg-[#7A55D8]]="item.icon === 'promotions'"
                    [class.bg-[#2FB543]]="item.icon === 'ads'"
                    [class.bg-[#E5B13C]]="item.icon === 'analytics'"
                    [class.bg-[#EC3B84]]="item.icon === 'wallet'"
                    [class.bg-[#2E6FF2]]="item.icon === 'settings'"
                  >
                    @switch (item.icon) {
                      @case ('promotions') {
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-[18px] w-[18px]"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            d="M5.5 3A2.5 2.5 0 003 5.5v9A2.5 2.5 0 005.5 17h9a2.5 2.5 0 002.5-2.5v-9A2.5 2.5 0 0014.5 3h-9zm.75 3.25a2 2 0 11-.001 4 2 2 0 01.001-4zm7.5.75a.75.75 0 00-.75-.75h-2a.75.75 0 000 1.5h2a.75.75 0 00.75-.75zm-6.5 7.5l2.05-2.56a.75.75 0 011.17-.03l1.35 1.58 1.48-1.64a.75.75 0 111.12 1l-2.05 2.28a.75.75 0 01-1.14-.01l-1.34-1.56-1.48 1.85a.75.75 0 01-1.17-.93z"
                          />
                        </svg>
                      }
                      @case ('ads') {
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-[18px] w-[18px]"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M10 2.5a3 3 0 00-3 3V6H5.75A2.75 2.75 0 003 8.75v5.5A2.75 2.75 0 005.75 17h8.5A2.75 2.75 0 0017 14.25v-5.5A2.75 2.75 0 0014.25 6H13v-.5a3 3 0 00-3-3zm1.5 3V6h-3v-.5a1.5 1.5 0 013 0zm-1.5 4a1.75 1.75 0 100 3.5 1.75 1.75 0 000-3.5z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      }
                      @case ('analytics') {
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-[18px] w-[18px]"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            d="M5.75 3A2.75 2.75 0 003 5.75v8.5A2.75 2.75 0 005.75 17h8.5A2.75 2.75 0 0017 14.25v-8.5A2.75 2.75 0 0014.25 3h-8.5zM7 12.25A.75.75 0 017.75 13h.5a.75.75 0 000-1.5h-.5a.75.75 0 01-.75-.75v-3a.75.75 0 011.5 0v3zm4 0A.75.75 0 0111.75 13h.5a.75.75 0 000-1.5h-.5a.75.75 0 01-.75-.75V7.5a.75.75 0 011.5 0v3.25z"
                          />
                        </svg>
                      }
                      @case ('wallet') {
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-[18px] w-[18px]"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            d="M3 6.25A2.25 2.25 0 015.25 4h8.5A2.25 2.25 0 0116 6.25v.5h.5A1.5 1.5 0 0118 8.25v5.5a2.25 2.25 0 01-2.25 2.25h-10.5A2.25 2.25 0 013 13.75v-7.5zm11.5.5v-.5a.75.75 0 00-.75-.75h-8.5a.75.75 0 00-.75.75v7.5c0 .414.336.75.75.75h10.5a.75.75 0 00.75-.75v-5h-3a1.75 1.75 0 010-3.5h1zm-.5 1.5a.25.25 0 000 .5h2.5v-.5H14z"
                          />
                        </svg>
                      }
                      @case ('settings') {
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-[18px] w-[18px]"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M7.84 2.36a1 1 0 011.27.63l.2.62a6.98 6.98 0 011.38 0l.2-.62a1 1 0 111.9.64l-.2.61c.39.19.76.42 1.1.69l.58-.3a1 1 0 11.92 1.78l-.57.3c.09.45.14.91.14 1.38s-.05.93-.14 1.38l.57.3a1 1 0 11-.92 1.78l-.58-.3c-.34.27-.71.5-1.1.69l.2.61a1 1 0 11-1.9.64l-.2-.62a6.98 6.98 0 01-1.38 0l-.2.62a1 1 0 11-1.9-.64l.2-.61a7.05 7.05 0 01-1.1-.69l-.58.3a1 1 0 11-.92-1.78l.57-.3A7.02 7.02 0 015 10c0-.47.05-.93.14-1.38l-.57-.3a1 1 0 11.92-1.78l.58.3c.34-.27.71-.5 1.1-.69l-.2-.61a1 1 0 01.63-1.28zM10 12.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      }
                    }
                  </span>
                  <span class="truncate text-[13px] font-medium">{{ item.label }}</span>
                </span>

                <span class="text-[#7D828D]" aria-hidden="true">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-[18px] w-[18px]"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M7.22 4.22a.75.75 0 011.06 0l5.25 5.25a.75.75 0 010 1.06l-5.25 5.25a.75.75 0 11-1.06-1.06L11.94 10 7.22 5.28a.75.75 0 010-1.06z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </span>
              </a>

              @if (!$last) {
                <div class="mx-2 h-px bg-[#F0F1F5]"></div>
              }
            }
          </section>
        </div>

        <div class="mt-28 flex justify-center md:mt-16">
          <button
            type="button"
            class="inline-flex min-h-14 w-full max-w-[280px] items-center justify-center gap-2 rounded-full bg-[#6F56F6] px-6 py-4 text-[13px] font-medium text-white shadow-[0_18px_34px_-18px_rgba(111,86,246,0.9)] transition hover:bg-[#6249ef]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                d="M3.5 5.75A2.25 2.25 0 015.75 3.5h4a.75.75 0 010 1.5h-4A.75.75 0 005 5.75v4a.75.75 0 01-1.5 0v-4zm7.5-.75a.75.75 0 010-1.5h3.25A2.25 2.25 0 0116.5 5.75V9a.75.75 0 01-1.5 0V5.75a.75.75 0 00-.75-.75H11zm-7 6.25A.75.75 0 015 12v2.25c0 .414.336.75.75.75H9a.75.75 0 010 1.5H5.75A2.25 2.25 0 013.5 14.25V12a.75.75 0 01.75-.75zm11.25 0a.75.75 0 01.75.75v2.25a2.25 2.25 0 01-2.25 2.25H11a.75.75 0 010-1.5h3.25a.75.75 0 00.75-.75V12a.75.75 0 01.75-.75z"
              />
            </svg>
            Switch to buyer mode
          </button>
        </div>
      </div>

      <app-mobile-bottom-nav />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MorePageComponent {
  readonly primaryItems: readonly MoreItem[] = [
    { label: 'Banner promotions', route: '/promotions', icon: 'promotions' },
    { label: 'Ads', route: '/ads', icon: 'ads' },
    { label: 'Analytics', route: '/analytics', icon: 'analytics' },
    { label: 'Wallet', route: '/wallet', icon: 'wallet' },
    { label: 'Account settings', route: '/settings', icon: 'settings' },
  ];
}
