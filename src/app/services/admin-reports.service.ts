import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type AdminReportsTab = 'seller' | 'listing';

export type AdminSellerReportRecordResponse = {
  id: string;
  seller_id: string | number;
  seller_name: string;
  seller_email: string;
  seller_avatar: string | null;
  reported_by_id: string | number;
  reported_by_name: string;
  reported_by_email: string;
  reported_by_avatar: string | null;
  date_reported: string;
  reason: string;
  description: string;
  total_reports: number;
};

export type AdminListingReportRecordResponse = {
  id: string;
  listing_id: string | number;
  listing_title: string;
  listing_image: string | null;
  seller_id: string | number;
  seller_name: string;
  seller_email: string;
  seller_avatar: string | null;
  reported_by_id: string | number;
  reported_by_name: string;
  reported_by_email: string;
  reported_by_avatar: string | null;
  date_reported: string;
  description: string;
  total_reports: number;
};

export type AdminReportsResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  type: AdminReportsTab;
  counts?: {
    reported_sellers?: number;
    reported_listings?: number;
  };
  results: AdminSellerReportRecordResponse[] | AdminListingReportRecordResponse[];
};

export type AdminReportsQuery = {
  type: AdminReportsTab;
  page?: number;
  search?: string;
};

@Injectable({ providedIn: 'root' })
export class AdminReportsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl.replace(/\/+$/, '');

  getReports(query: AdminReportsQuery): Observable<AdminReportsResponse> {
    let params = new HttpParams().set('type', query.type);

    if (query.page && query.page > 0) {
      params = params.set('page', String(query.page));
    }

    const search = query.search?.trim();
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<AdminReportsResponse>(`${this.apiUrl}/admin/reports/`, { params });
  }
}
