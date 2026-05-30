import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';

type PublicHomeLocationValue =
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

          <div id="public-home-mobile-menu" class="relative mx-auto w-full max-w-[390px]">
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
  }

  selectLocationCity(location: PublicHomeLocationValue, city: string): void {
    this.selectedLocation.set(location);
    this.selectedCity.set(city);
    this.closeLocationPicker();
  }
}
