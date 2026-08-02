import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationService } from '../../services/location.service';

@Component({
  selector: 'app-location-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (locationService.isLocationPickerOpen()) {
      <section
        class="fixed inset-0 z-[200] flex items-end justify-center bg-[rgba(13,13,13,0.18)] md:items-center lg:items-center"
        aria-label="Choose location"
        role="dialog"
        aria-modal="true"
        style="overscroll-behavior: contain;"
      >
        <button
          type="button"
          class="absolute inset-0 cursor-default"
          style="touch-action: none;"
          aria-label="Close location picker"
          (click)="locationService.closeLocationPicker()"
        ></button>

        <div
          class="relative z-[1] flex max-h-[85vh] w-full flex-col rounded-t-[36px] bg-white pb-8 md:max-h-[80vh] md:w-[min(600px,calc(100vw-48px))] md:rounded-[36px] md:pb-10 lg:w-[min(760px,calc(100vw-64px))] lg:rounded-[36px] lg:pb-10"
        >
          <div class="relative h-6 w-full md:hidden lg:hidden">
            <div
              class="absolute left-1/2 top-[11px] h-1 w-[50px] -translate-x-1/2 rounded-[100px] bg-[#EBEBEB]"
            ></div>
          </div>

          <button
            type="button"
            (click)="locationService.closeLocationPicker()"
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
            class="relative flex min-h-0 flex-1 flex-col px-5 pt-8 lg:px-8 lg:pt-10"
            style="overflow: hidden;"
          >
            <h2
              class="text-[24px] font-semibold leading-8 tracking-[-0.03em] text-[#1A1B1D] lg:text-[32px] lg:leading-9"
            >
              Choose location
            </h2>

            <div
              class="relative mt-6 min-h-0 flex-1 lg:mt-8"
              style="overflow: hidden;"
            >
              <div
                class="absolute inset-0 no-scrollbar overflow-y-auto pr-1 transition-transform duration-300 ease-out lg:pr-2"
                style="touch-action: pan-y; -webkit-overflow-scrolling: touch;"
                [class.-translate-x-[8%]]="locationService.activeLocationPanel() !== null"
                [class.opacity-0]="locationService.activeLocationPanel() !== null"
                [class.pointer-events-none]="locationService.activeLocationPanel() !== null"
              >
                <div class="space-y-4 pb-2 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
                  @for (group of locationService.locationGroups(); track group.value) {
                    <section class="rounded-[24px] border border-[#EFEFEF] bg-white">
                      <div class="flex items-center gap-3 p-2 lg:p-3">
                        <button
                          type="button"
                          (click)="locationService.selectLocationGroup(group.value)"
                          class="flex min-w-0 flex-1 items-center rounded-[18px] px-4 py-4 text-left transition lg:px-5"
                          [class.bg-[#F3F1FF]]="locationService.isLocationSelected(group.value)"
                          [class.text-[#6453D9]]="locationService.isLocationSelected(group.value)"
                          [class.bg-transparent]="!locationService.isLocationSelected(group.value)"
                          [class.text-[#1A1B1D]]="!locationService.isLocationSelected(group.value)"
                        >
                          <span
                            class="text-[16px] font-semibold leading-5 lg:text-[18px] lg:leading-5"
                          >
                            {{ group.desktopLabel ?? group.label }}
                          </span>
                        </button>

                        @if (group.value !== 'all-nigeria') {
                          <button
                            type="button"
                            (click)="locationService.openLocationCities(group.value)"
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
                        }
                      </div>
                    </section>
                  }
                </div>
              </div>

              <div
                class="absolute inset-0 min-h-0 bg-white transition-transform duration-300 ease-out"
                [class.translate-x-0]="locationService.activeLocationPanel() !== null"
                [class.translate-x-full]="locationService.activeLocationPanel() === null"
              >
                @if (locationService.activeLocationPanelOption(); as panel) {
                  <div class="flex h-full min-h-0 flex-col">
                    <div class="flex items-center gap-3 border-b border-[#EFEFEF] pb-4">
                      <button
                        type="button"
                        (click)="locationService.closeLocationCities()"
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

                    <div
                      class="no-scrollbar min-h-0 flex-1 overflow-y-auto pb-2 pr-1 pt-4 lg:pr-2"
                      style="touch-action: pan-y; -webkit-overflow-scrolling: touch;"
                    >
                      <div class="flex flex-wrap gap-2 lg:gap-3">
                        @for (city of panel.cities; track city) {
                          <button
                            type="button"
                            (click)="locationService.selectLocationCity(panel.value, city)"
                            class="rounded-full px-4 py-2 text-[13px] font-medium leading-4 transition lg:px-5 lg:py-3 lg:text-[14px] lg:leading-4"
                            [class.bg-[#F3F1FF]]="
                              panel.value === locationService.selectedLocation() &&
                              city === locationService.selectedCity()
                            "
                            [class.text-[#6453D9]]="
                              panel.value === locationService.selectedLocation() &&
                              city === locationService.selectedCity()
                            "
                            [class.bg-[#F5F5F5]]="
                              !(
                                panel.value === locationService.selectedLocation() &&
                                city === locationService.selectedCity()
                              )
                            "
                            [class.text-[#1A1B1D]]="
                              !(
                                panel.value === locationService.selectedLocation() &&
                                city === locationService.selectedCity()
                              )
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationPickerComponent {
  readonly locationService = inject(LocationService);
}
