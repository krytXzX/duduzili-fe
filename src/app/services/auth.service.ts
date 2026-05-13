import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type CheckEmailRequest = {
  email: string;
};

export type CheckEmailResponse = {
  username: string;
  avatar: string | null;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  user?: {
    id: number;
    username: string;
    email: string;
    full_name: string;
    avatar: string | null;
    phone_number: string | null;
    location: string | null;
    state: string | null;
    city: string | null;
    is_vendor: boolean;
    is_verified: boolean;
    is_2fa_enabled: boolean | null;
    vendor_profile_ids: readonly number[];
    created_at: string;
  };
  access?: string;
  refresh?: string;
  access_token?: string;
  refresh_token?: string;
  token?: string;
  [key: string]: unknown;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl.replace(/\/+$/, '');

  checkEmail(payload: CheckEmailRequest): Observable<CheckEmailResponse> {
    return this.http.post<CheckEmailResponse>(`${this.apiUrl}/auth/login/check-email/`, payload, {
      withCredentials: true,
    });
  }

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login/`, payload, {
      withCredentials: true,
    });
  }
}
