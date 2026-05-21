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

export type AuthUser = {
  id: number;
  username: string;
  email: string;
  full_name?: string | null;
  avatar: string | null;
  phone_number?: string | null;
  whatsapp_number?: string | null;
  location?: string | null;
  state?: string | null;
  city?: string | null;
  is_vendor: boolean;
  is_verified: boolean;
  is_2fa_enabled?: boolean | null;
  vendor_profile_ids?: readonly (string | number)[];
  vendor_profile_id?: string | number | null;
  created_at: string;
  role?: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthResponse = {
  user?: AuthUser;
  csrfToken?: string;
  access?: string;
  refresh?: string;
  access_token?: string;
  refresh_token?: string;
  token?: string;
  [key: string]: unknown;
};

export type LoginResponse = AuthResponse;

export type SendOtpRequest = {
  email: string;
};

export type VerifyOtpRequest = {
  email: string;
  code: string;
};

export type VerifyProfileOtpRequest = {
  type: 'phone' | 'whatsapp' | 'email';
  otp_code: string;
};

export type RegisterRequest = {
  email: string;
  full_name: string;
  password: string;
  confirm_password: string;
};

export type UpdateProfileRequest = {
  email?: string;
  full_name?: string;
  phone_number?: string;
  whatsapp_number?: string;
};

export type SwitchModeRequest = {
  is_vendor: boolean;
};

export type RegisterResponse = AuthResponse;
export type ProfileResponse = AuthResponse | AuthUser | { user: AuthUser };
export type RefreshTokenResponse = {
  access?: string;
  refresh?: string;
  access_token?: string;
  refresh_token?: string;
  [key: string]: unknown;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl.replace(/\/+$/, '');

  checkEmail(payload: CheckEmailRequest): Observable<CheckEmailResponse> {
    return this.http.post<CheckEmailResponse>(`${this.apiUrl}/auth/login/check-email/`, payload);
  }

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login/`, payload);
  }

  sendOtp(payload: SendOtpRequest): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/auth/send-otp/`, payload);
  }

  verifyOtp(payload: VerifyOtpRequest): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/auth/verify-otp/`, payload);
  }

  verifyProfileOtp(payload: VerifyProfileOtpRequest): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/auth/profile/verify-otp/`, payload);
  }

  resendOtp(payload: SendOtpRequest): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/auth/resend-otp/`, payload);
  }

  register(payload: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/auth/register/`, payload);
  }

  getProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`${this.apiUrl}/auth/profile/`);
  }

  updateProfile(payload: UpdateProfileRequest): Observable<ProfileResponse> {
    return this.http.patch<ProfileResponse>(`${this.apiUrl}/auth/profile/`, payload);
  }

  switchMode(payload: SwitchModeRequest): Observable<ProfileResponse | AuthResponse | unknown> {
    return this.http.post<ProfileResponse | AuthResponse | unknown>(
      `${this.apiUrl}/auth/switch-mode/`,
      payload,
    );
  }

  refreshTokens(): Observable<RefreshTokenResponse> {
    return this.http.post<RefreshTokenResponse>(`${this.apiUrl}/auth/token/refresh/`, {});
  }

  logout(): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/auth/logout/`, {});
  }
}
