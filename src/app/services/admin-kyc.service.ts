import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type AdminKycStatus = 'pending' | 'approved' | 'rejected';
export type AdminKycIdType = 'drivers_licence' | 'passport' | 'identity_card';

export type AdminKycRecordResponse = {
  id: number;
  user: number;
  user_email: string;
  user_name: string;
  user_avatar: string | null;
  country: string;
  id_type: AdminKycIdType;
  id_type_label: string;
  upload_method: string;
  upload_method_label: string;
  id_front: string;
  id_back: string | null;
  selfie: string;
  status: AdminKycStatus;
  rejection_reason: string;
  submitted_at: string;
  reviewed_at: string | null;
};

export type AdminKycListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminKycRecordResponse[];
  counts: {
    all: number;
    pending: number;
    approved: number;
    rejected: number;
  };
};

export type AdminKycQuery = {
  page?: number;
  search?: string;
  status?: AdminKycStatus;
  id_type?: AdminKycIdType;
  country?: string;
};

@Injectable({ providedIn: 'root' })
export class AdminKycService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl.replace(/\/+$/, '');

  getRequests(query: AdminKycQuery): Observable<AdminKycListResponse> {
    let params = new HttpParams();

    if (query.page && query.page > 0) {
      params = params.set('page', String(query.page));
    }
    if (query.search?.trim()) {
      params = params.set('search', query.search.trim());
    }
    if (query.status) {
      params = params.set('status', query.status);
    }
    if (query.id_type) {
      params = params.set('id_type', query.id_type);
    }
    if (query.country?.trim()) {
      params = params.set('country', query.country.trim());
    }

    return this.http.get<AdminKycListResponse>(`${this.apiUrl}/admin/kyc/`, { params });
  }

  approveRequest(id: string): Observable<AdminKycRecordResponse> {
    return this.http.post<AdminKycRecordResponse>(`${this.apiUrl}/admin/kyc/${id}/approve/`, {});
  }

  rejectRequest(id: string, rejectionReason: string): Observable<AdminKycRecordResponse> {
    return this.http.post<AdminKycRecordResponse>(`${this.apiUrl}/admin/kyc/${id}/reject/`, {
      status: 'rejected',
      rejection_reason: rejectionReason,
    });
  }
}
