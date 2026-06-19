import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

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

export interface PublicHomeLocationGroup {
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

export const LOCATION_GROUPS: readonly PublicHomeLocationGroup[] = [
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

@Injectable({ providedIn: 'root' })
export class LocationService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly selectedLocation = signal<PublicHomeLocationValue>('all-nigeria');
  readonly selectedCity = signal<string | null>(null);
  readonly isLocationPickerOpen = signal(false);
  readonly activeLocationPanel = signal<PublicHomeLocationValue | null>(null);

  readonly locationGroups = LOCATION_GROUPS;

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
    if (this.isBrowser) {
      const savedLoc = localStorage.getItem('duduzili.selected_location') as PublicHomeLocationValue | null;
      const savedCity = localStorage.getItem('duduzili.selected_city');

      if (savedLoc && this.locationGroups.some((g) => g.value === savedLoc)) {
        this.selectedLocation.set(savedLoc);
      }
      if (savedCity) {
        this.selectedCity.set(savedCity);
      }
    }
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
    this.saveToStorage(location, null);
    this.closeLocationPicker();
  }

  selectLocationCity(location: PublicHomeLocationValue, city: string): void {
    this.selectedLocation.set(location);
    this.selectedCity.set(city);
    this.saveToStorage(location, city);
    this.closeLocationPicker();
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
}
