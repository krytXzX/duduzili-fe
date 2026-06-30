import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export type PublicHomeLocationValue = string;

export interface PublicHomeLocationGroup {
  readonly id: number | null;
  readonly value: PublicHomeLocationValue;
  readonly label: string;
  readonly desktopLabel?: string;
  readonly cities: readonly string[];
}

export interface PublicHomeLocationSelection {
  readonly location: PublicHomeLocationValue;
  readonly city: string | null;
  readonly query: string;
}

type PublicStateResponse = {
  readonly id: number;
  readonly name: string;
};

type PublicCityResponse = {
  readonly id: number;
  readonly name: string;
  readonly is_active?: boolean;
};

type PublicCityListObjectResponse = {
  readonly cities?: readonly PublicCityResponse[];
};

type PublicCityListResponse = readonly PublicCityResponse[] | PublicCityListObjectResponse;

const ALL_NIGERIA_LOCATION: PublicHomeLocationGroup = {
  id: null,
  value: 'all-nigeria',
  label: 'All Nigeria',
  desktopLabel: 'All of Nigeria',
  cities: ['Nationwide'],
};

@Injectable({ providedIn: 'root' })
export class LocationService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly http = inject(HttpClient);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly apiUrl = environment.apiUrl.replace(/\/+$/, '');
  private readonly configuredLocationGroups = signal<readonly PublicHomeLocationGroup[]>([]);

  readonly selectedLocation = signal<PublicHomeLocationValue>('all-nigeria');
  readonly selectedCity = signal<string | null>(null);
  readonly isLocationPickerOpen = signal(false);
  readonly activeLocationPanel = signal<PublicHomeLocationValue | null>(null);
  readonly isLoadingLocations = signal(false);

  readonly locationGroups = computed<readonly PublicHomeLocationGroup[]>(() => [
    ALL_NIGERIA_LOCATION,
    ...this.configuredLocationGroups(),
  ]);

  readonly selectedLocationOption = computed(
    () =>
      this.locationGroups().find((option) => option.value === this.selectedLocation()) ??
      ALL_NIGERIA_LOCATION,
  );

  readonly activeLocationPanelOption = computed(
    () => this.locationGroups().find((option) => option.value === this.activeLocationPanel()) ?? null,
  );

  readonly selectedLocationDisplay = computed(() => {
    const location = this.selectedLocationOption();
    const city = this.selectedCity();

    if (location.value === 'all-nigeria') {
      return {
        desktop: 'All of Nigeria',
        mobile: 'All Nigeria',
      };
    }

    if (city) {
      return {
        desktop: `${city}, ${location.label}`,
        mobile: city,
      };
    }

    return {
      desktop: location.label,
      mobile: location.label,
    };
  });

  readonly selectedLocationQuery = computed(() => {
    const location = this.selectedLocationOption();
    const city = this.selectedCity();

    return location.value === 'all-nigeria'
      ? 'All Nigeria'
      : city
        ? `${city}, ${location.label}`
        : location.label;
  });

  constructor() {
    this.restoreSelection();
    void this.loadConfiguredLocations();
  }

  async loadConfiguredLocations(): Promise<void> {
    if (this.isLoadingLocations()) {
      return;
    }

    this.isLoadingLocations.set(true);
    try {
      const states = await firstValueFrom(
        this.http.get<readonly PublicStateResponse[]>(`${this.apiUrl}/locations/states/`),
      );
      const groups = await Promise.all(
        states.map(async (state) => {
          const response = await firstValueFrom(
            this.http.get<PublicCityListResponse>(
              `${this.apiUrl}/locations/states/${state.id}/cities/`,
            ),
          );
          const cities = this.extractCities(response);

          return {
            id: state.id,
            value: this.stateValue(state.id),
            label: state.name,
            desktopLabel: state.name,
            cities: cities.map((city) => city.name).sort((a, b) => a.localeCompare(b)),
          } satisfies PublicHomeLocationGroup;
        }),
      );

      this.configuredLocationGroups.set(groups.sort((a, b) => a.label.localeCompare(b.label)));
      this.resetInvalidSavedSelection();
    } finally {
      this.isLoadingLocations.set(false);
    }
  }

  openLocationPicker(): void {
    this.isLocationPickerOpen.set(true);
    void this.loadConfiguredLocations();
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
    this.saveToStorage(location, null);
    this.closeLocationPicker();
  }

  selectLocationCity(location: PublicHomeLocationValue, city: string): void {
    this.selectedLocation.set(location);
    this.selectedCity.set(city);
    this.saveToStorage(location, city);
    this.closeLocationPicker();
  }

  private restoreSelection(): void {
    if (!this.isBrowser) {
      return;
    }

    const savedLoc = localStorage.getItem('duduzili.selected_location');
    const savedCity = localStorage.getItem('duduzili.selected_city');

    if (savedLoc) {
      this.selectedLocation.set(savedLoc);
    }
    if (savedCity) {
      this.selectedCity.set(savedCity);
    }
  }

  private resetInvalidSavedSelection(): void {
    const selectedLocation = this.selectedLocation();
    const selectedCity = this.selectedCity();
    const selectedGroup = this.locationGroups().find((group) => group.value === selectedLocation);

    if (!selectedGroup) {
      this.selectLocationGroup('all-nigeria');
      return;
    }

    if (selectedCity && !selectedGroup.cities.includes(selectedCity)) {
      this.selectLocationGroup(selectedLocation);
    }
  }

  private saveToStorage(location: PublicHomeLocationValue, city: string | null): void {
    if (this.isBrowser) {
      localStorage.setItem('duduzili.selected_location', location);
      if (city) {
        localStorage.setItem('duduzili.selected_city', city);
      } else {
        localStorage.removeItem('duduzili.selected_city');
      }
    }
  }

  private stateValue(stateId: number): string {
    return `state-${stateId}`;
  }

  private extractCities(response: PublicCityListResponse): readonly PublicCityResponse[] {
    if (Array.isArray(response)) {
      return response;
    }

    const cityList = response as PublicCityListObjectResponse;
    return cityList.cities ?? [];
  }
}
