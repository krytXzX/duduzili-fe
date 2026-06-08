import { ChangeDetectionStrategy, Component, computed, output, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';

export type PublicHomeLocationValue =
  | 'all-nigeria'
  | 'lagos'
  | 'abuja'
  | 'rivers'
  | 'oyo'
  | 'enugu'
  | 'kaduna'
  | 'edo'
  | 'kano'
  | 'ogun';

type PublicHomeLocationGroup = {
  value: PublicHomeLocationValue;
  label: string;
  desktopLabel?: string;
  cities: readonly string[];
};

export type PublicHomeLocationSelection = {
  location: PublicHomeLocationValue;
  city: string | null;
  query: string;
};

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

    <div class="fixed inset-x-0 top-0 z-50 hidden px-2 pt-4 lg:block">
      <header>
        <div class="pointer-events-none mx-auto flex max-w-[1440px] justify-center px-8">
          <div
            class="pointer-events-auto flex w-full max-w-[1238px] items-center justify-between rounded-full bg-[#1a1a1a] px-6 py-[9px] shadow-[0_12px_28px_rgba(0,0,0,0.14)]"
          >
            <div class="flex items-center gap-6">
              <a
                routerLink="/"
                class="flex items-center transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6453D9]"
                aria-label="Go to Duduzili homepage"
              >
                <img
                  ngSrc="/assets/icons/home-logo-light.svg"
                  alt="Duduzili"
                  width="112"
                  height="26"
                  class="h-[26px] w-auto"
                  priority
                />
              </a>

              <button
                type="button"
                class="flex h-10 items-center justify-between gap-3 rounded-full bg-[#2f2f2f] py-1 pl-3 pr-1 text-white"
                aria-label="Select location"
                aria-haspopup="dialog"
                [attr.aria-expanded]="isLocationPickerOpen()"
                (click)="openLocationPicker()"
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
                  {{ selectedLocationDisplay().desktop }}
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
    </div>

    <header
      class="sticky top-0 z-30 bg-white lg:hidden"
      [class]="
        showMobileMenu() ? 'rounded-b-[24px] border-x border-b border-[#ededed] bg-white' : ''
      "
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
              aria-haspopup="dialog"
              [attr.aria-expanded]="isLocationPickerOpen()"
              (click)="openLocationPicker()"
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
                {{ selectedLocationDisplay().mobile }}
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
              [ngSrc]="
                showMobileMenu()
                  ? '/assets/icons/home-mobile-menu/close.svg'
                  : '/assets/icons/home-header-menu-mobile.svg'
              "
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
                  [ngSrc]="
                    showMobileMenu()
                      ? '/assets/icons/home-mobile-menu/close.svg'
                      : '/assets/icons/home-header-menu-mobile.svg'
                  "
                  alt=""
                  width="20"
                  height="20"
                  class="h-5 w-5"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>

          <div
            id="public-home-mobile-menu"
            class="mx-auto flex w-full max-w-[390px] flex-col gap-6 px-[19px] pb-[18px] pt-[5px]"
          >
            <nav
              class="flex flex-col items-start gap-3 text-[16px] font-medium leading-[1.2] tracking-[0.01em] text-[#373737]"
              aria-label="Mobile menu"
            >
              <a routerLink="/sign-in" class="leading-[1.2]" (click)="closeMobileMenu()">Sign in</a>
              <a routerLink="/sign-up" class="leading-[1.2]" (click)="closeMobileMenu()">Sign up</a>
              <a routerLink="/" class="leading-[1.2]" (click)="closeMobileMenu()">Sell item</a>
            </nav>

            <div class="w-full rounded-[20px] border border-[#ededed] bg-white px-4 pb-6 pt-5">
              <div
                class="mx-auto w-fit rounded-[10px] border border-[#f0f0f0] bg-white p-[6px] shadow-[0_4.7px_12.6px_rgba(199,199,199,0.25)]"
              >
                <img
                  ngSrc="/assets/images/home-qr-code.svg"
                  alt="QR code to download the Duduzili app"
                  width="110"
                  height="110"
                  class="h-[110px] w-[110px]"
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

              <div class="mt-[38px] flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  class="flex h-10 w-[132px] items-center gap-2 rounded-[8px] border border-[#a6a6a6] bg-black px-[10px] text-white"
                  aria-label="Download on the App Store"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 24"
                    class="h-6 w-5 shrink-0 fill-white"
                  >
                    <path
                      d="M16.7045 12.7631C16.7166 11.8432 16.9669 10.9413 17.4321 10.1412C17.8972 9.34108 18.5621 8.66885 19.3648 8.18702C18.8548 7.47597 18.1821 6.89081 17.4 6.478C16.6178 6.0652 15.7479 5.83613 14.8592 5.80898C12.9635 5.61471 11.1258 6.91644 10.1598 6.91644C9.17506 6.91644 7.68776 5.82827 6.08616 5.86044C5.05021 5.89311 4.04059 6.18722 3.15568 6.7141C2.27077 7.24099 1.54075 7.98268 1.03674 8.86691C-1.14648 12.5573 0.482005 17.9809 2.57338 20.964C3.61975 22.4247 4.84264 24.0564 6.44279 23.9985C8.00863 23.9351 8.59344 23.0237 10.4835 23.0237C12.3561 23.0237 12.9048 23.9985 14.5374 23.9617C16.2176 23.9351 17.2762 22.4945 18.2859 21.02C19.0377 19.9792 19.6162 18.8288 20 17.6116C19.0238 17.2085 18.1908 16.5338 17.6048 15.6716C17.0187 14.8094 16.7056 13.7979 16.7045 12.7631Z"
                    />
                    <path
                      d="M13.6208 3.84713C14.5369 2.77343 14.9883 1.39335 14.879 0C13.4794 0.143519 12.1865 0.796596 11.258 1.82911C10.804 2.33351 10.4563 2.92033 10.2348 3.55601C10.0132 4.19168 9.92221 4.86375 9.96687 5.5338C10.6669 5.54084 11.3595 5.3927 11.9924 5.10054C12.6254 4.80838 13.1821 4.37982 13.6208 3.84713Z"
                    />
                  </svg>
                  <span class="flex min-w-0 flex-col items-start text-left">
                    <span class="text-[9px] font-medium leading-[1.05] text-white">Download on the</span>
                    <span class="text-[17px] font-medium leading-none tracking-[-0.47px] text-white">App Store</span>
                  </span>
                </button>

                <button
                  type="button"
                  class="flex h-10 w-[132px] items-center gap-2 rounded-[8px] border border-[#a6a6a6] bg-black px-[10px] text-white"
                  aria-label="Get it on Google Play"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 21 24"
                    class="h-6 w-[21px] shrink-0"
                  >
                    <path d="M9.80482 11.4617L0.0896003 22.0059C0.0905128 22.0078 0.0905127 22.0106 0.0914252 22.0125C0.389807 23.1574 1.41179 24 2.62539 24C3.11083 24 3.56616 23.8656 3.95671 23.6305L3.98773 23.6118L14.9229 17.1593L9.80482 11.4617Z" fill="#EA4335"/>
                    <path d="M19.6331 9.66619L19.624 9.65966L14.9028 6.86123L9.58391 11.7013L14.9219 17.1582L19.6176 14.3878C20.4406 13.9324 21 13.045 21 12.0223C21 11.0052 20.4489 10.1225 19.6331 9.66619Z" fill="#FBBC04"/>
                    <path d="M0.0894234 1.99332C0.0310244 2.21353 0 2.44495 0 2.68382V21.3164C0 21.5552 0.0310245 21.7866 0.0903359 22.0059L10.1386 11.7313L0.0894234 1.99332Z" fill="#4285F4"/>
                    <path d="M9.87657 11.9999L14.9044 6.85936L3.98192 0.383511C3.58499 0.139967 3.12145 1.42739e-07 2.62597 1.42739e-07C1.41237 1.42739e-07 0.38856 0.844472 0.0901781 1.99034C0.0901781 1.99128 0.0892662 1.99221 0.0892662 1.99314L9.87657 11.9999Z" fill="#34A853"/>
                  </svg>
                  <span class="flex min-w-0 flex-col items-start text-left">
                    <span class="text-[10px] font-medium uppercase leading-[1.05] tracking-[0.02em] text-white">Get it on</span>
                    <span class="text-[15px] font-medium leading-none tracking-[-0.02em] text-white">Google Play</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </header>

    @if (isLocationPickerOpen()) {
      <section
        class="fixed inset-0 z-[130] flex items-end justify-center bg-[rgba(13,13,13,0.18)] lg:items-center"
        aria-label="Choose location"
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          class="absolute inset-0"
          aria-label="Close location picker"
          (click)="closeLocationPicker()"
        ></button>

        <div
          class="relative z-[1] flex max-h-[85dvh] w-full flex-col rounded-t-[36px] bg-white pb-8 lg:max-h-[80vh] lg:w-[min(760px,calc(100vw-64px))] lg:rounded-[36px] lg:pb-10"
        >
          <div class="relative h-6 w-full lg:hidden">
            <div
              class="absolute left-1/2 top-[11px] h-1 w-[50px] -translate-x-1/2 rounded-[100px] bg-[#EBEBEB]"
            ></div>
          </div>

          <button
            type="button"
            (click)="closeLocationPicker()"
            aria-label="Close location picker"
            class="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-[#EAEAEA] bg-white shadow-[0_4px_8px_rgba(202,202,202,0.25)]"
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" class="h-5 w-5 fill-[#1A1B1D]">
              <path
                d="M5.28 4.22 10 8.94l4.72-4.72 1.06 1.06L11.06 10l4.72 4.72-1.06 1.06L10 11.06l-4.72 4.72-1.06-1.06L8.94 10 4.22 5.28Z"
              />
            </svg>
          </button>

          <div
            class="relative flex min-h-0 flex-1 flex-col overflow-hidden px-5 pt-8 lg:px-8 lg:pt-10"
          >
            <h2
              class="text-[24px] font-semibold leading-8 tracking-[-0.03em] text-[#1A1B1D] lg:text-[32px] lg:leading-9"
            >
              Choose location
            </h2>

            <div class="relative mt-6 min-h-0 flex-1 overflow-hidden lg:mt-8">
              <div
                class="no-scrollbar h-full overflow-y-auto pr-1 transition-transform duration-300 ease-out lg:pr-2"
                [class.-translate-x-[8%]]="activeLocationPanel() !== null"
                [class.opacity-0]="activeLocationPanel() !== null"
                [class.pointer-events-none]="activeLocationPanel() !== null"
              >
                <div class="space-y-4 pb-2 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
                  @for (group of locationGroups; track group.value) {
                    <section class="rounded-[24px] border border-[#EFEFEF] bg-white">
                      <div class="flex items-center gap-3 p-2 lg:p-3">
                        <button
                          type="button"
                          (click)="selectLocationGroup(group.value)"
                          class="flex min-w-0 flex-1 items-center rounded-[18px] px-4 py-4 text-left transition lg:px-5"
                          [class.bg-[#F3F1FF]]="isLocationSelected(group.value)"
                          [class.text-[#6453D9]]="isLocationSelected(group.value)"
                          [class.bg-transparent]="!isLocationSelected(group.value)"
                          [class.text-[#1A1B1D]]="!isLocationSelected(group.value)"
                        >
                          <span
                            class="text-[16px] font-semibold leading-5 lg:text-[18px] lg:leading-5"
                          >
                            {{ group.desktopLabel ?? group.label }}
                          </span>
                        </button>

                        <button
                          type="button"
                          (click)="openLocationCities(group.value)"
                          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F7F7F7] text-[#5B5B66] transition lg:h-12 lg:w-12"
                          [attr.aria-label]="
                            'View cities under ' + (group.desktopLabel ?? group.label)
                          "
                        >
                          <svg aria-hidden="true" viewBox="0 0 20 20" class="h-5 w-5">
                            <path
                              d="M7.5 5 12.5 10l-5 5"
                              fill="none"
                              stroke="currentColor"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="1.7"
                            />
                          </svg>
                        </button>
                      </div>
                    </section>
                  }
                </div>
              </div>

              <div
                class="absolute inset-0 min-h-0 bg-white transition-transform duration-300 ease-out"
                [class.translate-x-0]="activeLocationPanel() !== null"
                [class.translate-x-full]="activeLocationPanel() === null"
              >
                @if (activeLocationPanelOption(); as panel) {
                  <div class="flex h-full min-h-0 flex-col">
                    <div class="flex items-center gap-3 border-b border-[#EFEFEF] pb-4">
                      <button
                        type="button"
                        (click)="closeLocationCities()"
                        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F7F7F7] text-[#5B5B66] lg:h-11 lg:w-11"
                        aria-label="Back to locations"
                      >
                        <svg aria-hidden="true" viewBox="0 0 20 20" class="h-5 w-5">
                          <path
                            d="M12.5 5 7.5 10l5 5"
                            fill="none"
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.7"
                          />
                        </svg>
                      </button>

                      <div class="min-w-0">
                        <p
                          class="text-[16px] font-semibold leading-5 text-[#1A1B1D] lg:text-[18px] lg:leading-5"
                        >
                          {{ panel.desktopLabel ?? panel.label }}
                        </p>
                        <p class="mt-1 text-[13px] leading-4 text-[#777777]">Select a city</p>
                      </div>
                    </div>

                    <div class="no-scrollbar min-h-0 flex-1 overflow-y-auto pb-2 pr-1 pt-4 lg:pr-2">
                      <div class="flex flex-wrap gap-2 lg:gap-3">
                        @for (city of panel.cities; track city) {
                          <button
                            type="button"
                            (click)="selectLocationCity(panel.value, city)"
                            class="rounded-full px-4 py-2 text-[13px] font-medium leading-4 transition lg:px-5 lg:py-3 lg:text-[14px] lg:leading-4"
                            [class.bg-[#F3F1FF]]="
                              panel.value === selectedLocation() && city === selectedCity()
                            "
                            [class.text-[#6453D9]]="
                              panel.value === selectedLocation() && city === selectedCity()
                            "
                            [class.bg-[#F5F5F5]]="
                              !(panel.value === selectedLocation() && city === selectedCity())
                            "
                            [class.text-[#1A1B1D]]="
                              !(panel.value === selectedLocation() && city === selectedCity())
                            "
                          >
                            {{ city }}
                          </button>
                        }
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </section>
    }
  `,
  host: {
    class: 'block',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicHomeNavbarComponent {
  readonly locationChange = output<PublicHomeLocationSelection>();
  readonly showAppDownloadBanner = signal(true);
  readonly showMobileMenu = signal(false);
  readonly isLocationPickerOpen = signal(false);
  readonly activeLocationPanel = signal<PublicHomeLocationValue | null>(null);
  readonly selectedLocation = signal<PublicHomeLocationValue>('all-nigeria');
  readonly selectedCity = signal<string | null>(null);

  readonly locationGroups: readonly PublicHomeLocationGroup[] = [
    {
      value: 'all-nigeria',
      label: 'All Nigeria',
      desktopLabel: 'All of Nigeria',
      cities: ['Nationwide'],
    },
    { value: 'lagos', label: 'Lagos', cities: ['Ikeja', 'Lekki', 'Yaba', 'Surulere'] },
    { value: 'abuja', label: 'Abuja', cities: ['Maitama', 'Wuse', 'Gwarinpa', 'Asokoro'] },
    { value: 'rivers', label: 'Port Harcourt', cities: ['GRA', 'Rumuola', 'Ada George', 'Eliozu'] },
    { value: 'oyo', label: 'Oyo', cities: ['Ibadan', 'Ogbomoso', 'Oyo Town', 'Iseyin'] },
    {
      value: 'enugu',
      label: 'Enugu',
      cities: ['Independence Layout', 'New Haven', 'Uwani', 'Abakpa'],
    },
    { value: 'kaduna', label: 'Kaduna', cities: ['Barnawa', 'Kawo', 'Sabon Tasha', 'Zaria'] },
    { value: 'edo', label: 'Edo', cities: ['Benin City', 'Ekpoma', 'Uromi', 'Auchi'] },
    { value: 'kano', label: 'Kano', cities: ['Nasarawa', 'Fagge', 'Tarauni', 'Bompai'] },
    { value: 'ogun', label: 'Ogun', cities: ['Abeokuta', 'Ijebu Ode', 'Sagamu', 'Ota'] },
  ];

  readonly selectedLocationOption = computed(
    () =>
      this.locationGroups.find((option) => option.value === this.selectedLocation()) ??
      this.locationGroups[0],
  );

  readonly activeLocationPanelOption = computed(
    () => this.locationGroups.find((option) => option.value === this.activeLocationPanel()) ?? null,
  );

  readonly selectedLocationDisplay = computed(() => {
    const location = this.selectedLocationOption();
    if (location.value === 'all-nigeria' || this.selectedCity() === null) {
      return {
        mobile: location.label,
        desktop: location.desktopLabel ?? location.label,
      };
    }

    return {
      mobile: `${this.selectedCity()}, ${location.label}`,
      desktop: `${this.selectedCity()}, ${location.desktopLabel ?? location.label}`,
    };
  });

  dismissAppDownloadBanner(): void {
    this.showAppDownloadBanner.set(false);
  }

  toggleMobileMenu(): void {
    this.showMobileMenu.update((value) => !value);
  }

  closeMobileMenu(): void {
    this.showMobileMenu.set(false);
  }

  openLocationPicker(): void {
    this.isLocationPickerOpen.set(true);
  }

  closeLocationPicker(): void {
    this.isLocationPickerOpen.set(false);
    this.activeLocationPanel.set(null);
  }

  openLocationCities(location: PublicHomeLocationValue): void {
    this.activeLocationPanel.set(location);
  }

  closeLocationCities(): void {
    this.activeLocationPanel.set(null);
  }

  isLocationSelected(location: PublicHomeLocationValue): boolean {
    return this.selectedLocation() === location && this.selectedCity() === null;
  }

  selectLocationGroup(location: PublicHomeLocationValue): void {
    this.selectedLocation.set(location);
    this.selectedCity.set(null);
    this.closeLocationPicker();
    this.emitLocationChange();
  }

  selectLocationCity(location: PublicHomeLocationValue, city: string): void {
    this.selectedLocation.set(location);
    this.selectedCity.set(city);
    this.closeLocationPicker();
    this.emitLocationChange();
  }

  private emitLocationChange(): void {
    const location = this.selectedLocationOption();
    const city = this.selectedCity();
    const query =
      location.value === 'all-nigeria'
        ? 'All Nigeria'
        : city
          ? `${city}, ${location.label}`
          : location.label;

    this.locationChange.emit({
      location: this.selectedLocation(),
      city,
      query,
    });
  }
}
