import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type AdminSiteConfigurationResponse = {
  subscription_free: boolean;
  subscriptions_enabled: boolean;
  kyc_free: boolean;
  kyc_required: boolean;
};

export type AdminSiteConfigurationUpdateRequest = {
  kyc_required?: boolean;
  subscriptions_enabled?: boolean;
};

export type AdminLocationCity = {
  id: number;
  name: string;
  is_active: boolean;
};

export type AdminLocationState = {
  id: number;
  name: string;
  is_active: boolean;
  cities: readonly AdminLocationCity[];
};

export type AdminLocationStatePayload = {
  name: string;
  is_active?: boolean;
};

export type AdminLocationCityPayload = {
  name: string;
  is_active?: boolean;
};

@Injectable({ providedIn: 'root' })
export class AdminSettingsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl.replace(/\/+$/, '');

  getSiteConfiguration(): Observable<AdminSiteConfigurationResponse> {
    return this.http.get<AdminSiteConfigurationResponse>(
      `${this.apiUrl}/admin/settings/site-configuration/`,
    );
  }

  updateSiteConfiguration(
    payload: AdminSiteConfigurationUpdateRequest,
  ): Observable<AdminSiteConfigurationResponse> {
    return this.http.patch<AdminSiteConfigurationResponse>(
      `${this.apiUrl}/admin/settings/site-configuration/`,
      payload,
    );
  }

  getLocationStates(): Observable<readonly AdminLocationState[]> {
    return this.http.get<readonly AdminLocationState[]>(`${this.apiUrl}/admin/locations/states/`);
  }

  createLocationState(payload: AdminLocationStatePayload): Observable<AdminLocationState> {
    return this.http.post<AdminLocationState>(`${this.apiUrl}/admin/locations/states/`, payload);
  }

  updateLocationState(
    stateId: number,
    payload: Partial<AdminLocationStatePayload>,
  ): Observable<AdminLocationState> {
    return this.http.patch<AdminLocationState>(
      `${this.apiUrl}/admin/locations/states/${stateId}/`,
      payload,
    );
  }

  deleteLocationState(stateId: number): Observable<{ detail: string }> {
    return this.http.delete<{ detail: string }>(`${this.apiUrl}/admin/locations/states/${stateId}/`);
  }

  createLocationCity(
    stateId: number,
    payload: AdminLocationCityPayload,
  ): Observable<AdminLocationCity> {
    return this.http.post<AdminLocationCity>(
      `${this.apiUrl}/admin/locations/states/${stateId}/cities/`,
      payload,
    );
  }

  updateLocationCity(
    stateId: number,
    cityId: number,
    payload: Partial<AdminLocationCityPayload>,
  ): Observable<AdminLocationCity> {
    return this.http.patch<AdminLocationCity>(
      `${this.apiUrl}/admin/locations/states/${stateId}/cities/${cityId}/`,
      payload,
    );
  }

  deleteLocationCity(stateId: number, cityId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/locations/states/${stateId}/cities/${cityId}/`);
  }
}
