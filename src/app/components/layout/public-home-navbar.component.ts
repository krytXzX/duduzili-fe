import { ChangeDetectionStrategy, Component, computed, inject, output, signal, effect } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthSessionService } from '../../services/auth-session.service';
import { LocationService } from '../../services/location.service';
import type { PublicHomeLocationValue, PublicHomeLocationSelection } from '../../services/location.service';

export type { PublicHomeLocationValue, PublicHomeLocationSelection };

@Component({
  selector: 'app-public-home-navbar',
  imports: [NgOptimizedImage, RouterLink],
  template: `
    <div class="fixed inset-x-0 top-0 z-50 hidden px-2 pt-4 lg:block">
      <header>
        <div class="pointer-events-none mx-auto flex max-w-[1440px] justify-center px-8">
          <div
            class="pointer-events-auto flex w-full max-w-[1238px] items-center justify-between rounded-full bg-[#1a1a1a] px-6 py-[9px] shadow-[0_12px_28px_rgba(0,0,0,0.14)]"
          >
            <div class="flex items-center gap-6">
              <a
                [routerLink]="homeRoute()"
                class="flex items-center transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6453D9]"
                aria-label="Go to Duduzili homepage"
              >
                <img
                  ngSrc="/assets/icons/home-logo-light.svg"
                  alt="Duduzili"
                  width="112"
                  height="26"
                  class="h-[26px] w-auto"
                />
              </a>

              <button
                type="button"
                class="flex h-10 items-center justify-between gap-3 rounded-full bg-[#2f2f2f] py-1 pl-3 pr-1 text-white transition hover:bg-[#3a3a3a] active:scale-[0.98]"
                aria-label="Select location"
                aria-haspopup="dialog"
                [attr.aria-expanded]="locationService.isLocationPickerOpen()"
                (click)="locationService.openLocationPicker()"
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
                  {{ locationService.selectedLocationDisplay().desktop }}
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

            <nav
              class="flex items-center gap-0.5 text-sm text-white"
              aria-label="Desktop navigation"
            >
              <a routerLink="/" class="rounded-full px-3.5 py-2.5 font-medium transition hover:bg-white/10 active:scale-[0.98]">Sell item</a>
              <a routerLink="/sign-in" class="rounded-full px-3.5 py-2.5 font-medium transition hover:bg-white/10 active:scale-[0.98]">Sign in</a>
              <a
                routerLink="/sign-up"
                class="flex items-center gap-2 rounded-full bg-white py-1 pl-1 pr-3 text-[#1d1d1d] transition hover:bg-[#f3f3f3] active:scale-[0.98]"
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
    </div>

    <header class="sticky top-0 z-50 bg-white lg:hidden">
      @if (showMobileMenu()) {
        <button
          type="button"
          class="fixed inset-0 z-10 bg-[rgba(26,27,29,0.55)] backdrop-blur-[3px]"
          aria-label="Close menu"
          (click)="closeMobileMenu()"
        ></button>
      }

      <div
        class="relative z-20 bg-white transition-[border-radius,box-shadow] duration-200"
        [class.rounded-b-[24px]]="showMobileMenu()"
        [class.shadow-[0_16px_40px_rgba(0,0,0,0.18)]]="showMobileMenu()"
      >
        <div class="mx-auto flex h-[72px] w-full max-w-[390px] items-center justify-between px-5">
          <a [routerLink]="homeRoute()" class="block" aria-label="Duduzili home" (click)="closeMobileMenu()">
            <img
              ngSrc="/assets/images/public-mobile-nav/logo.svg"
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
              class="flex h-9 items-center justify-between gap-1 rounded-full border border-white bg-[#f3f3f3] py-1 pl-3 pr-1 text-sm font-medium tracking-[0.01em] text-[#373737] shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition hover:bg-[#ececec] active:scale-[0.98]"
              aria-label="Select location"
              aria-haspopup="dialog"
              [attr.aria-expanded]="locationService.isLocationPickerOpen()"
              (click)="locationService.openLocationPicker()"
            >
              <span class="flex items-center gap-1 whitespace-nowrap">
                <img
                  ngSrc="/assets/images/public-mobile-nav/location-pin.svg"
                  alt=""
                  width="16"
                  height="16"
                  class="h-4 w-4"
                  aria-hidden="true"
                />
                {{ locationService.selectedLocationDisplay().mobile }}
              </span>
              <span class="flex h-7 w-7 items-center justify-center rounded-full bg-white">
                <img
                  ngSrc="/assets/images/public-mobile-nav/chevron-down.svg"
                  alt=""
                  width="14"
                  height="14"
                  class="h-3.5 w-3.5"
                  aria-hidden="true"
                />
              </span>
            </button>

            <button
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-full text-[#36394a] transition hover:bg-[#f3f3f3] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6453d9]"
              [attr.aria-expanded]="showMobileMenu()"
              aria-controls="public-home-mobile-menu"
              [attr.aria-label]="showMobileMenu() ? 'Close menu' : 'Open menu'"
              (click)="toggleMobileMenu()"
            >
              @if (showMobileMenu()) {
                <img
                  ngSrc="/assets/images/public-mobile-nav/close.svg"
                  alt=""
                  width="24"
                  height="24"
                  class="h-6 w-6"
                  aria-hidden="true"
                />
              } @else {
                <img
                  ngSrc="/assets/icons/home-header-menu-mobile.svg"
                  alt=""
                  width="20"
                  height="20"
                  class="h-5 w-5"
                  aria-hidden="true"
                />
              }
            </button>
          </div>
        </div>

        @if (showMobileMenu()) {
          <div
            id="public-home-mobile-menu"
            class="mx-auto flex w-full max-w-[390px] flex-col gap-[38px] px-5 pb-[18px] pt-0"
          >
            <nav
              class="flex flex-col items-start gap-4 text-[16px] font-medium leading-[1.2] tracking-[0.01em] text-[#373737]"
              aria-label="Mobile menu"
            >
              <a routerLink="/sign-in" class="transition hover:text-[#6453d9] active:scale-[0.98]" (click)="closeMobileMenu()">Sign in</a>
              <a routerLink="/sign-up" class="transition hover:text-[#6453d9] active:scale-[0.98]" (click)="closeMobileMenu()">Sign up</a>
              <a routerLink="/" class="transition hover:text-[#6453d9] active:scale-[0.98]" (click)="closeMobileMenu()">Sell item</a>
            </nav>

            <div class="relative h-[339px] w-full overflow-hidden rounded-[20px] border border-[#ededed] bg-white px-5 pt-6">
              <div class="pointer-events-none absolute inset-x-0 top-0 h-[168px] overflow-hidden" aria-hidden="true">
                <img ngSrc="/assets/images/public-mobile-nav/appstore-line-a.svg" alt="" width="31" height="31" class="absolute left-[9px] top-[27px] h-[31px] w-[31px] opacity-90" />
                <img ngSrc="/assets/images/public-mobile-nav/apple-line-a.svg" alt="" width="36" height="36" class="absolute left-[76px] top-[14px] h-9 w-9 opacity-90" />
                <img ngSrc="/assets/images/public-mobile-nav/google-play-line-a.svg" alt="" width="28" height="28" class="absolute right-[28px] top-[24px] h-7 w-7 opacity-90" />
                <img ngSrc="/assets/images/public-mobile-nav/cellphone-line-a.svg" alt="" width="26" height="26" class="absolute left-[40px] top-[95px] h-[26px] w-[26px] opacity-80" />
                <img ngSrc="/assets/images/public-mobile-nav/android-line-a.svg" alt="" width="32" height="32" class="absolute right-[82px] top-[84px] h-8 w-8 opacity-80" />
                <img ngSrc="/assets/images/public-mobile-nav/device-line-a.svg" alt="" width="26" height="26" class="absolute right-[12px] top-[102px] h-[26px] w-[26px] opacity-80" />
                <img ngSrc="/assets/images/public-mobile-nav/appstore-line-b.svg" alt="" width="31" height="31" class="absolute left-[123px] top-[118px] h-[31px] w-[31px] opacity-60" />
                <img ngSrc="/assets/images/public-mobile-nav/apple-line-b.svg" alt="" width="36" height="36" class="absolute right-[126px] top-[18px] h-9 w-9 opacity-60" />
                <img ngSrc="/assets/images/public-mobile-nav/google-play-line-b.svg" alt="" width="28" height="28" class="absolute right-[147px] top-[118px] h-7 w-7 opacity-60" />
                <img ngSrc="/assets/images/public-mobile-nav/cellphone-line-b.svg" alt="" width="26" height="26" class="absolute left-[156px] top-[52px] h-[26px] w-[26px] opacity-60" />
                <img ngSrc="/assets/images/public-mobile-nav/android-line-b.svg" alt="" width="32" height="32" class="absolute left-[115px] top-[74px] h-8 w-8 opacity-60" />
                <img ngSrc="/assets/images/public-mobile-nav/device-line-b.svg" alt="" width="26" height="26" class="absolute right-[168px] top-[67px] h-[26px] w-[26px] opacity-60" />
              </div>

              <div
                class="relative z-10 mx-auto w-fit rounded-[10px] border border-[#f0f0f0] bg-white p-[6px] shadow-[0_4.7px_12.6px_rgba(199,199,199,0.25)]"
              >
                <img
                  ngSrc="/assets/images/public-mobile-nav/qr-code.svg"
                  alt="QR code to download the Duduzili app"
                  width="110"
                  height="110"
                  class="h-[110px] w-[110px]"
                />
              </div>

              <div class="relative z-10 mt-3 flex items-center justify-center gap-5 text-[#99a2b1]" aria-hidden="true">
                <img ngSrc="/assets/images/public-mobile-nav/android-small.svg" alt="" width="18" height="18" class="h-[18px] w-[18px]" />
                <span class="h-5 w-px bg-[#e1e1e5]"></span>
                <img ngSrc="/assets/images/public-mobile-nav/apple-small.svg" alt="" width="18" height="18" class="h-[18px] w-[18px]" />
              </div>

              <p class="relative z-10 mt-[19px] text-center text-[14px] leading-[1.2] text-[#99a2b1]">
                Scan QR code to download mobile app
              </p>

              <div class="relative z-10 mt-5 flex items-center justify-center gap-6">
                <span class="h-px w-[70px] bg-[#dedee1]" aria-hidden="true"></span>
                <span class="text-[14px] text-[rgba(26,27,29,0.7)]">OR</span>
                <span class="h-px w-[70px] bg-[#dedee1]" aria-hidden="true"></span>
              </div>

              <div class="relative z-10 mt-[27px] flex items-center justify-center gap-6">
                <a
                  routerLink="/"
                  class="flex h-10 w-[120px] items-center gap-[7px] rounded-[6px] border border-[#a6a6a6] bg-black px-[7px] text-white transition hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.98]"
                  aria-label="Download on the App Store"
                  (click)="closeMobileMenu()"
                >
                  <img ngSrc="/assets/images/public-mobile-nav/app-store-icon.svg" alt="" width="24" height="24" class="h-6 w-6 shrink-0" aria-hidden="true" />
                  <span class="flex min-w-0 flex-col items-start text-left">
                    <span class="text-[7px] font-semibold leading-[1.05] text-white">Download on the</span>
                    <span class="text-[15px] font-semibold leading-none tracking-[-0.47px] text-white">App Store</span>
                  </span>
                </a>

                <a
                  routerLink="/"
                  class="flex h-10 w-[120px] items-center gap-[7px] rounded-[6px] border border-[#a6a6a6] bg-black px-[7px] text-white transition hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.98]"
                  aria-label="Get it on Google Play"
                  (click)="closeMobileMenu()"
                >
                  <img ngSrc="/assets/images/public-mobile-nav/play-store-icon.svg" alt="" width="21" height="24" class="h-6 w-[21px] shrink-0" aria-hidden="true" />
                  <span class="flex min-w-0 flex-col items-start gap-0.5 text-left">
                    <span class="text-[8px] font-semibold uppercase leading-none tracking-[0.02em] text-white">Get it on</span>
                    <img
                      ngSrc="/assets/images/public-mobile-nav/google-play-wordmark.svg"
                      alt="Google Play"
                      width="74"
                      height="15"
                      class="h-[15px] w-[74px]"
                    />
                  </span>
                </a>
              </div>
            </div>
          </div>
        }
      </div>
    </header>

  `,
  host: {
    class: 'block',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicHomeNavbarComponent {
  private readonly authSession = inject(AuthSessionService);
  readonly locationService = inject(LocationService);

  readonly homeRoute = computed(() => {
    if (!this.authSession.isAuthenticated()) {
      return '/';
    }
    return this.authSession.isSuperuser() ? '/admin' : '/en';
  });
  readonly locationChange = output<PublicHomeLocationSelection>();
  readonly showMobileMenu = signal(false);

  constructor() {
    effect(() => {
      const location = this.locationService.selectedLocation();
      const city = this.locationService.selectedCity();
      const query = this.locationService.selectedLocationQuery();

      this.locationChange.emit({
        location,
        city,
        query,
      });
    });
  }

  toggleMobileMenu(): void {
    this.showMobileMenu.update((value) => !value);
  }

  closeMobileMenu(): void {
    this.showMobileMenu.set(false);
  }
}
