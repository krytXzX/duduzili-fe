import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-public-home-navbar',
  imports: [NgOptimizedImage, RouterLink],
  template: `
    @if (showAppDownloadBanner() && !showMobileMenu()) {
      <section class="border-b border-[#ececf2] bg-white px-4 py-3 lg:hidden">
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="flex h-5 w-5 items-center justify-center text-[#8e8e98]"
            (click)="dismissAppDownloadBanner()"
            aria-label="Dismiss app download banner"
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" class="h-4 w-4 fill-current">
              <path
                d="M5.28 4.22 10 8.94l4.72-4.72 1.06 1.06L11.06 10l4.72 4.72-1.06 1.06L10 11.06l-4.72 4.72-1.06-1.06L8.94 10 4.22 5.28Z"
              />
            </svg>
          </button>

          <div class="flex min-w-0 flex-1 items-center gap-2.5">
            <div
              class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6453d9] shadow-[0_10px_18px_-14px_rgba(100,83,217,0.95)]"
            >
              <img
                ngSrc="/assets/images/logo-light-fill.svg"
                alt=""
                width="20"
                height="20"
                class="h-5 w-5"
                aria-hidden="true"
              />
            </div>
            <div class="min-w-0">
              <p class="text-[13px] font-semibold leading-4 text-[#373737]">Get the app</p>
              <p class="truncate text-[11px] leading-4 text-[#99a2b1]">
                The easiest way to use Duduzili
              </p>
            </div>
          </div>

          <button
            type="button"
            class="rounded-full bg-[#6453d9] px-3 py-2 text-[10px] font-semibold tracking-[0.06em] text-white shadow-[0_10px_18px_-14px_rgba(100,83,217,0.95)]"
          >
            DOWNLOAD
          </button>
        </div>
      </section>
    }

    <header class="sticky top-4 z-40 hidden lg:block">
      <div class="pointer-events-none mx-auto flex max-w-[1440px] justify-center px-8">
        <div
          class="pointer-events-auto flex w-full max-w-[1238px] items-center justify-between rounded-full bg-[#1a1a1a] px-6 py-[9px] shadow-[0_12px_28px_rgba(0,0,0,0.14)]"
        >
          <div class="flex items-center gap-6">
            <img
              ngSrc="/assets/icons/home-logo-light.svg"
              alt="Duduzili"
              width="112"
              height="26"
              class="h-[26px] w-auto"
              priority
            />

            <button
              type="button"
              class="flex h-10 items-center justify-between gap-3 rounded-full bg-[#2f2f2f] py-1 pl-3 pr-1 text-white"
              aria-label="Select location"
            >
              <span class="flex items-center gap-1 text-sm font-semibold tracking-[0.01em]">
                <img
                  ngSrc="/assets/icons/home-location.svg"
                  alt=""
                  width="16"
                  height="16"
                  class="h-4 w-4"
                  aria-hidden="true"
                />
                All of Nigeria
              </span>
              <span class="flex h-8 w-10 items-center justify-center rounded-full bg-[#515151]">
                <img
                  ngSrc="/assets/icons/home-chevron-down.svg"
                  alt=""
                  width="16"
                  height="16"
                  class="h-4 w-4"
                  aria-hidden="true"
                />
              </span>
            </button>
          </div>

          <nav class="flex items-center gap-0.5 text-sm text-white" aria-label="Desktop navigation">
            <a routerLink="/" class="rounded-full px-3.5 py-2.5 font-medium">Sell item</a>
            <a routerLink="/sign-in" class="rounded-full px-3.5 py-2.5 font-medium">Sign in</a>
            <a
              routerLink="/sign-up"
              class="flex items-center gap-2 rounded-full bg-white py-1 pl-1 pr-3 text-[#1d1d1d]"
            >
              <span
                class="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#dbe5ff]"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" class="h-6 w-6 fill-[#8da7ff]">
                  <path
                    d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Zm0 2.25c-4.14 0-7.5 2.52-7.5 5.63V21h15v-1.12c0-3.11-3.36-5.63-7.5-5.63Z"
                  />
                </svg>
              </span>
              <span class="text-base font-medium">Sign up</span>
            </a>
          </nav>
        </div>
      </div>
    </header>

    <header
      class="relative z-30 lg:hidden"
      [class]="showMobileMenu() ? 'rounded-b-[24px] border-x border-b border-[#ededed] bg-white' : ''"
    >
      <div class="flex items-center justify-between px-5 py-[18px]">
        <a routerLink="/" class="block" aria-label="Duduzili home">
          <img
            ngSrc="/assets/icons/home-header-logo-mobile.svg"
            alt="Duduzili"
            width="111"
            height="24"
            class="h-6 w-auto"
            priority
          />
        </a>

        <div class="flex items-center gap-2">
          @if (!showMobileMenu()) {
            <button
              type="button"
              class="flex h-9 items-center justify-between gap-1 rounded-full border border-white bg-[#f3f3f3] py-1 pl-3 pr-1 text-sm font-medium tracking-[0.01em] text-[#373737] shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
              aria-label="Select location"
            >
              <span class="flex items-center gap-1">
                <img
                  ngSrc="/assets/icons/home-header-location-mobile.svg"
                  alt=""
                  width="16"
                  height="16"
                  class="h-4 w-4"
                  aria-hidden="true"
                />
                All Nigeria
              </span>
              <span class="flex h-7 w-7 items-center justify-center rounded-full bg-white">
                <img
                  ngSrc="/assets/icons/home-header-chevron-mobile.svg"
                  alt=""
                  width="14"
                  height="14"
                  class="h-3.5 w-3.5"
                  aria-hidden="true"
                />
              </span>
            </button>
          }

          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-lg"
            [attr.aria-expanded]="showMobileMenu()"
            aria-controls="public-home-mobile-menu"
            [attr.aria-label]="showMobileMenu() ? 'Close menu' : 'Open menu'"
            (click)="toggleMobileMenu()"
          >
            <img
              [ngSrc]="showMobileMenu() ? '/assets/icons/home-mobile-menu/close.svg' : '/assets/icons/home-header-menu-mobile.svg'"
              alt=""
              width="20"
              height="20"
              class="h-5 w-5"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      @if (showMobileMenu()) {
        <button
          type="button"
          class="fixed inset-0 z-10 bg-[rgba(26,27,29,0.24)] backdrop-blur-[3px]"
          aria-label="Close menu"
          (click)="closeMobileMenu()"
        ></button>

        <div class="absolute inset-x-0 top-0 z-20 rounded-b-2xl bg-white">
          <div class="flex items-center justify-between px-5 py-[18px]">
            <a routerLink="/" class="block" aria-label="Duduzili home">
              <img
                ngSrc="/assets/icons/home-header-logo-mobile.svg"
                alt="Duduzili"
                width="111"
                height="24"
                class="h-6 w-auto"
                priority
              />
            </a>

            <div class="flex items-center gap-2">
              <button
                type="button"
                class="flex h-8 w-8 items-center justify-center rounded-lg"
                [attr.aria-expanded]="showMobileMenu()"
                aria-controls="public-home-mobile-menu"
                [attr.aria-label]="showMobileMenu() ? 'Close menu' : 'Open menu'"
                (click)="toggleMobileMenu()"
              >
                <img
                  [ngSrc]="showMobileMenu() ? '/assets/icons/home-mobile-menu/close.svg' : '/assets/icons/home-header-menu-mobile.svg'"
                  alt=""
                  width="20"
                  height="20"
                  class="h-5 w-5"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>

          <div id="public-home-mobile-menu" class="relative mx-auto h-[550px] w-full max-w-[390px]">
            <nav
              class="absolute left-[19px] top-[5px] flex flex-col items-start gap-3 text-[16px] font-medium leading-[1.2] tracking-[0.01em] text-[#373737]"
              aria-label="Mobile menu"
            >
              <a routerLink="/sign-in" class="leading-[1.2]" (click)="closeMobileMenu()">Sign in</a>
              <a routerLink="/sign-up" class="leading-[1.2]" (click)="closeMobileMenu()">Sign up</a>
              <a routerLink="/" class="leading-[1.2]" (click)="closeMobileMenu()">Sell item</a>
            </nav>

            <div
              class="absolute bottom-[18px] left-[19px] h-[339px] w-[350px] rounded-[20px] border border-[#ededed] bg-white px-4 pb-6 pt-5"
            >
              <div
                class="mx-auto w-fit rounded-[10px] border border-[#f0f0f0] bg-white p-[6px] shadow-[0_4.7px_12.6px_rgba(199,199,199,0.25)]"
              >
                <img
                  ngSrc="/assets/images/home-qr-code.png"
                  alt="QR code to download the Duduzili app"
                  width="110"
                  height="110"
                  class="h-[110px] w-[110px]"
                />
              </div>

              <div class="mt-3 flex items-center justify-center gap-4">
                <img
                  ngSrc="/assets/icons/home-google-play.svg"
                  alt=""
                  width="24"
                  height="24"
                  class="h-6 w-6"
                  aria-hidden="true"
                />
                <span class="h-4 w-px bg-[#d8d8d8]" aria-hidden="true"></span>
                <img
                  ngSrc="/assets/icons/home-apple.svg"
                  alt=""
                  width="20"
                  height="20"
                  class="h-5 w-5"
                  aria-hidden="true"
                />
              </div>

              <p class="mt-3 text-center text-[14px] leading-[1.2] text-[#99a2b1]">
                Scan QR code to download mobile app
              </p>

              <div class="mt-4 flex items-center justify-center gap-6">
                <span class="h-px w-[70px] bg-[#dedee1]" aria-hidden="true"></span>
                <span class="text-[14px] text-[rgba(26,27,29,0.7)]">OR</span>
                <span class="h-px w-[70px] bg-[#dedee1]" aria-hidden="true"></span>
              </div>

              <div class="mt-4 flex flex-col gap-3">
                <button
                  type="button"
                  class="flex h-[48px] items-center justify-center gap-3 rounded-[18px] border border-[#e7e7ec] bg-white text-[15px] font-medium text-[#1a1b1d]"
                >
                  <img
                    ngSrc="/assets/icons/home-apple.svg"
                    alt=""
                    width="20"
                    height="20"
                    class="h-5 w-5 shrink-0"
                    aria-hidden="true"
                  />
                  Download on App Store
                </button>

                <button
                  type="button"
                  class="flex h-[48px] items-center justify-center gap-3 rounded-[18px] border border-[#e7e7ec] bg-white text-[15px] font-medium text-[#1a1b1d]"
                >
                  <img
                    ngSrc="/assets/icons/home-google-play.svg"
                    alt=""
                    width="20"
                    height="20"
                    class="h-5 w-5 shrink-0"
                    aria-hidden="true"
                  />
                  Download on Google Play
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </header>
  `,
  host: {
    class: 'block',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicHomeNavbarComponent {
  readonly showAppDownloadBanner = signal(true);
  readonly showMobileMenu = signal(false);

  dismissAppDownloadBanner(): void {
    this.showAppDownloadBanner.set(false);
  }

  toggleMobileMenu(): void {
    this.showMobileMenu.update((value) => !value);
  }

  closeMobileMenu(): void {
    this.showMobileMenu.set(false);
  }
}
