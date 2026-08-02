import { ChangeDetectionStrategy, Component, computed, inject, output, signal, viewChildren, ElementRef } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroChevronLeft,
  heroChevronRight,
  heroXMark,
  heroMagnifyingGlass,
} from '@ng-icons/heroicons/outline';
import { LocationService, PublicHomeLocationValue } from '../../services/location.service';

export interface PickerOption {
  readonly value: string;
  readonly label: string;
  readonly subtitle?: string;
  readonly image?: string | null;
}

@Component({
  selector: 'app-location-picker',
  standalone: true,
  imports: [NgIcon],
  providers: [
    provideIcons({
      heroChevronLeft,
      heroChevronRight,
      heroXMark,
      heroMagnifyingGlass,
    }),
  ],
  template: `
    <button
      type="button"
      class="fixed inset-0 z-[70] bg-black/30"
      (click)="close.emit(); $event.stopPropagation()"
      aria-label="Close picker"
    ></button>

    <!-- Mobile view -->
    <section
      (click)="$event.stopPropagation()"
      class="fixed inset-x-0 bottom-0 z-[80] rounded-t-[28px] bg-white px-4 pb-6 pt-3 shadow-[0_-20px_50px_-30px_rgba(18,24,35,0.4)] md:hidden"
      role="dialog"
      aria-modal="true"
      [attr.aria-label]="pickerTitle()"
    >
      <div class="mx-auto h-1.5 w-14 rounded-full bg-[#E6E7EC]"></div>

      <div class="mt-2 flex items-center justify-between">
        <button
          type="button"
          (click)="isLocationCityPanelOpen() ? closeLocationCityPanel() : close.emit(); $event.stopPropagation()"
          class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F7F7FA] text-[#2A2D34]"
          [attr.aria-label]="isLocationCityPanelOpen() ? 'Back to states' : 'Close picker'"
        >
          <ng-icon [name]="isLocationCityPanelOpen() ? 'heroChevronLeft' : 'heroXMark'" class="text-[18px]"></ng-icon>
        </button>
        <h3 class="text-[16px] font-semibold text-[#202335]">{{ pickerTitle() }}</h3>
        <span class="h-10 w-10"></span>
      </div>

      <label class="mt-5 flex items-center gap-2 rounded-[14px] border border-[#E1E3E8] bg-white px-4 py-3">
        <ng-icon name="heroMagnifyingGlass" class="text-[16px] text-[#9BA0AA]"></ng-icon>
        <input
          type="search"
          [value]="pickerSearch()"
          (input)="pickerSearch.set($any($event.target).value)"
          [placeholder]="pickerSearchPlaceholder()"
          class="min-w-0 flex-1 bg-transparent text-[13px] font-medium text-[#202335] outline-none placeholder:text-[#B1B5BF]"
        />
      </label>

      <div #scrollContainer class="mt-4 max-h-[52vh] overflow-y-auto">
        @for (option of filteredPickerOptions(); track option.value) {
          <button
            type="button"
            (click)="selectPickerOption(option.value); $event.stopPropagation()"
            class="flex w-full items-center justify-between gap-3 rounded-[14px] px-2 py-3 text-left hover:bg-[#F8F8FB]"
          >
            <span class="flex min-w-0 items-center gap-3">
              <span class="min-w-0">
                <span class="block truncate text-[13px] font-medium text-[#202335]">{{ option.label }}</span>
              </span>
            </span>
            @if (!isLocationCityPanelOpen()) {
              <ng-icon name="heroChevronRight" class="text-[16px] text-[#9BA0AA]"></ng-icon>
            }
          </button>
        }
      </div>
    </section>

    <!-- Desktop view -->
    <section
      (click)="$event.stopPropagation()"
      class="fixed left-1/2 top-1/2 z-[80] hidden w-[min(540px,calc(100vw-48px))] -translate-x-1/2 -translate-y-1/2 rounded-[24px] border border-[#ECEEF4] bg-white p-6 shadow-[0_20px_80px_rgba(32,35,53,0.18)] md:block"
      role="dialog"
      aria-modal="true"
      [attr.aria-label]="pickerTitle()"
    >
      <div class="flex items-center justify-between gap-4">
        <div class="flex min-w-0 items-center gap-3">
          @if (isLocationCityPanelOpen()) {
            <button
              type="button"
              (click)="closeLocationCityPanel(); $event.stopPropagation()"
              class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F7F7FA] text-[#2A2D34]"
              aria-label="Back to states"
            >
              <ng-icon name="heroChevronLeft" class="text-[18px]"></ng-icon>
            </button>
          }
          <h3 class="truncate text-[20px] font-semibold text-[#1A1C21]">{{ pickerTitle() }}</h3>
        </div>
        <button
          type="button"
          (click)="close.emit(); $event.stopPropagation()"
          class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F7F7FA] text-[#2A2D34]"
          aria-label="Close picker"
        >
          <ng-icon name="heroXMark" class="text-[18px]"></ng-icon>
        </button>
      </div>

      <label class="mt-5 flex items-center gap-2 rounded-[14px] border border-[#E1E3E8] bg-white px-4 py-3">
        <ng-icon name="heroMagnifyingGlass" class="text-[16px] text-[#9BA0AA]"></ng-icon>
        <input
          type="search"
          [value]="pickerSearch()"
          (input)="pickerSearch.set($any($event.target).value)"
          [placeholder]="pickerSearchPlaceholder()"
          class="min-w-0 flex-1 bg-transparent text-[14px] font-medium text-[#202335] outline-none placeholder:text-[#B1B5BF]"
        />
      </label>

      <div #scrollContainer class="mt-5 max-h-[420px] overflow-y-auto">
        @for (option of filteredPickerOptions(); track option.value) {
          <button
            type="button"
            (click)="selectPickerOption(option.value); $event.stopPropagation()"
            class="flex w-full items-center justify-between gap-4 rounded-[14px] px-3 py-3 text-left hover:bg-[#F8F8FB]"
          >
            <span class="flex min-w-0 items-center gap-3">
              <span class="min-w-0">
                <span class="block truncate text-[14px] font-medium text-[#202335]">{{ option.label }}</span>
              </span>
            </span>
            @if (!isLocationCityPanelOpen()) {
              <ng-icon name="heroChevronRight" class="text-[16px] text-[#9BA0AA]"></ng-icon>
            }
          </button>
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationPickerComponent {
  readonly close = output<void>();
  readonly selectLocation = output<string>();
  readonly scrollContainers = viewChildren<ElementRef<HTMLElement>>('scrollContainer');

  private readonly locationService = inject(LocationService);

  protected readonly pickerSearch = signal<string>('');
  protected readonly activeLocationState = signal<PublicHomeLocationValue | null>(null);

  protected readonly locationStateOptions = computed<readonly PickerOption[]>(() =>
    this.locationService.locationGroups()
      .filter((group) => group.value !== 'all-nigeria')
      .map((group) => ({
        value: group.value,
        label: group.desktopLabel ?? group.label,
        subtitle: 'Select a city',
      }))
  );

  protected readonly locationCityOptions = computed<readonly PickerOption[]>(() => {
    const activeState = this.activeLocationState();
    const group = this.locationService.locationGroups().find((option) => option.value === activeState);
    if (!group || group.value === 'all-nigeria') {
      return [];
    }
    return group.cities.map((city) => ({
      value: `${city}, ${group.label}`,
      label: city,
      subtitle: group.desktopLabel ?? group.label,
    }));
  });

  protected readonly filteredPickerOptions = computed(() => {
    const query = this.pickerSearch().trim().toLowerCase();
    const options = this.activeLocationState()
      ? this.locationCityOptions()
      : this.locationStateOptions();

    if (!query) {
      return options;
    }

    return options.filter((option) => option.label.toLowerCase().includes(query));
  });

  protected isLocationCityPanelOpen(): boolean {
    return this.activeLocationState() !== null;
  }

  protected closeLocationCityPanel(): void {
    this.activeLocationState.set(null);
    this.pickerSearch.set('');
    this.scrollContainers().forEach(container => {
      container.nativeElement.scrollTop = 0;
    });
  }

  protected selectPickerOption(value: string): void {
    if (this.activeLocationState() === null) {
      this.activeLocationState.set(value as PublicHomeLocationValue);
      this.pickerSearch.set('');
      this.scrollContainers().forEach(container => {
        container.nativeElement.scrollTop = 0;
      });
    } else {
      this.selectLocation.emit(value);
      this.close.emit();
    }
  }

  protected pickerTitle(): string {
    if (this.isLocationCityPanelOpen()) {
      const activeState = this.activeLocationState();
      const stateLabel = this.locationService.locationGroups().find((option) => option.value === activeState)?.label ?? '';
      return `Select a city in ${stateLabel}`;
    }
    return 'Search states';
  }

  protected pickerSearchPlaceholder(): string {
    return this.activeLocationState() ? 'Search cities' : 'Search states';
  }
}
