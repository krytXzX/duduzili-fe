import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type AdminRunningAdsType = 'listing' | 'store' | 'banner';
export type AdminRunningAdsStatus = 'active' | 'paused';

export type AdminRunningAdsQuery = {
  page?: number;
  ad_type: AdminRunningAdsType;
  status?: AdminRunningAdsStatus;
  search?: string;
  vendor_name?: string;
  end_date?: string;
};

export type AdminRunningAdsRecord = {
  id: number;
  title: string;
  image: string | null;
  video: string | null;
  link: string;
  ad_type: AdminRunningAdsType;
  status: AdminRunningAdsStatus;
  is_active: boolean;
  start_date: string;
  end_date: string;
  amount_paid: string;
  total_views: number;
  total_clicks: number;
  created_at: string;
  vendor_name: string;
  vendor_avatar: string | null;
  vendor_location: string;
  vendor_product_count: number;
  promoted_listing_title: string | null;
  promoted_store_name: string | null;
  promoted_store_location: string | null;
  promoted_store_owner_name: string | null;
  promoted_store_owner_avatar: string | null;
  promoted_store_product_count: number;
};

export type AdminRunningAdsCounts = Record<
  AdminRunningAdsType,
  {
    all: number;
    active: number;
    paused: number;
  }
>;

export type AdminRunningAdsResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminRunningAdsRecord[];
  counts: AdminRunningAdsCounts;
};

@Injectable({ providedIn: 'root' })
export class AdminRunningAdsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl.replace(/\/+$/, '');

  getRunningAds(query: AdminRunningAdsQuery): Observable<AdminRunningAdsResponse> {
    let params = new HttpParams().set('ad_type', query.ad_type);

    if (query.page && query.page > 1) {
      params = params.set('page', String(query.page));
    }
    if (query.status) {
      params = params.set('status', query.status);
    }
    if (query.search?.trim()) {
      params = params.set('search', query.search.trim());
    }
    if (query.vendor_name?.trim()) {
      params = params.set('vendor_name', query.vendor_name.trim());
    }
    if (query.end_date?.trim()) {
      params = params.set('end_date', query.end_date.trim());
    }

    return this.http.get<AdminRunningAdsResponse>(`${this.apiUrl}/admin/ads/running/`, { params });
  }

  updateAdStatus(adId: number, action: 'pause' | 'resume' | 'stop'): Observable<{ status: string; detail: string }> {
    return this.http.post<{ status: string; detail: string }>(
      `${this.apiUrl}/admin/ads/running/${adId}/${action}/`,
      {},
    );
  }
}
