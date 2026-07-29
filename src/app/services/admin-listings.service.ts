import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type AdminListingsStatus = 'available' | 'sold' | 'paused' | 'suspended' | 'draft';
export type AdminListingsSummaryFilter = 'all' | AdminListingsStatus;

export type AdminListingRecordResponse = {
  id: string;
  title: string;
  price: string;
  status: string;
  is_promoted: boolean;
  thumbnail: string | null;
  store_name: string;
  store_avatar: string | null;
  category_label: string | null;
  category_slug: string | null;
  created_at: string;
};

export type AdminListingsFilterStore = {
  id: string;
  store_name: string;
};

export type AdminListingsFilterCategory = {
  slug: string;
  name: string;
};

export type AdminListingsResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminListingRecordResponse[];
  counts?: {
    all?: number;
    available?: number;
    sold?: number;
    paused?: number;
    suspended?: number;
    draft?: number;
  };
  stores?: AdminListingsFilterStore[];
  categories?: AdminListingsFilterCategory[];
};

export type AdminListingsQuery = {
  page?: number;
  search?: string;
  category?: string;
  store?: string;
  status?: 'all' | AdminListingsStatus;
};

@Injectable({ providedIn: 'root' })
export class AdminListingsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl.replace(/\/+$/, '');

  getListings(query: AdminListingsQuery): Observable<AdminListingsResponse> {
    let params = new HttpParams();

    if (query.page && query.page > 0) {
      params = params.set('page', String(query.page));
    }

    const search = query.search?.trim();
    if (search) {
      params = params.set('search', search);
    }

    if (query.category && query.category !== 'all') {
      params = params.set('category', query.category);
    }

    if (query.store && query.store !== 'all') {
      params = params.set('store', query.store);
    }

    if (query.status && query.status !== 'all') {
      params = params.set('status', query.status);
    }

    return this.http.get<AdminListingsResponse>(`${this.apiUrl}/admin/listings/`, { params });
  }
}
