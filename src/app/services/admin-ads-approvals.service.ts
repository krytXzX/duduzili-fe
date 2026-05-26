import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type AdminAdApprovalStatus = 'pending' | 'active' | 'rejected';

export type AdminAdApprovalRecordResponse = {
  id: number;
  title: string;
  image: string | null;
  video: string | null;
  link: string;
  status: AdminAdApprovalStatus;
  amount_paid: string;
  created_at: string;
  end_date: string | null;
  user_name: string;
  user_avatar: string | null;
  banner_type: string;
  plan: string;
  rejection_reason: string;
};

export type AdminAdApprovalListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminAdApprovalRecordResponse[];
  counts: {
    all: number;
    pending: number;
    approved: number;
    declined: number;
  };
};

export type AdminAdApprovalQuery = {
  page?: number;
  search?: string;
  status?: AdminAdApprovalStatus;
  vendor_name?: string;
  end_date?: string;
};

@Injectable({ providedIn: 'root' })
export class AdminAdsApprovalsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl.replace(/\/+$/, '');

  getApprovals(query: AdminAdApprovalQuery): Observable<AdminAdApprovalListResponse> {
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
    if (query.vendor_name?.trim()) {
      params = params.set('vendor_name', query.vendor_name.trim());
    }
    if (query.end_date?.trim()) {
      params = params.set('end_date', query.end_date.trim());
    }

    return this.http.get<AdminAdApprovalListResponse>(`${this.apiUrl}/admin/ads/approvals/`, { params });
  }

  approveAd(id: string): Observable<AdminAdApprovalRecordResponse> {
    return this.http.post<AdminAdApprovalRecordResponse>(`${this.apiUrl}/admin/ads/approvals/${id}/approve/`, {});
  }

  rejectAd(id: string, rejectionReason: string): Observable<AdminAdApprovalRecordResponse> {
    return this.http.post<AdminAdApprovalRecordResponse>(`${this.apiUrl}/admin/ads/approvals/${id}/reject/`, {
      rejection_reason: rejectionReason,
    });
  }
}
