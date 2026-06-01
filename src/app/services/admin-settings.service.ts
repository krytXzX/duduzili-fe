import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type AdminSiteConfigurationResponse = {
  subscription_free: boolean;
  kyc_free: boolean;
  kyc_required: boolean;
};

export type AdminSiteConfigurationUpdateRequest = {
  kyc_required?: boolean;
  subscription_free?: boolean;
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
}
