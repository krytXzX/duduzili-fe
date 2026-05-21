import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type ListingsApiItem = Record<string, unknown>;
export type ToggleWishlistResponse = Record<string, unknown> | null;
export type ManageListingsCategory = {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  limit_type: string;
  subcategories: readonly ManageListingsCategory[];
};

export type ManageListingsStore = Record<string, unknown>;

export interface ManageListingsResponse {
  all?: ListingsApiItem[];
  stats?: Record<string, number>;
  stores?: ManageListingsStore[];
  categories?: ManageListingsCategory[];
}
export interface SearchListingsParams {
  search?: string;
  condition?: string;
  category?: string;
  is_sponsored?: 'true' | 'false';
  location?: string;
  min_price?: string;
  max_price?: string;
  ordering?: string;
  is_verified?: 'true' | 'false';
}

export type ListingsSearchResponse =
  | ListingsApiItem[]
  | {
      count?: number;
      results?: ListingsApiItem[];
      data?: ListingsApiItem[];
      listings?: ListingsApiItem[];
    };

export interface RecentlyViewedResponse {
  today?: ListingsApiItem[];
  yesterday?: ListingsApiItem[];
  earlier?: ListingsApiItem[];
}

export type WishlistResponse =
  | {
      today?: ListingsApiItem[];
      yesterday?: ListingsApiItem[];
      earlier?: ListingsApiItem[];
    }
  | {
      count?: number;
      next?: string | null;
      previous?: string | null;
      results?: Array<Record<string, unknown>>;
    };

export interface CreateListingReportRequest {
  description: string;
}

export interface CreateSellerReportRequest {
  reason: string;
}

@Injectable({ providedIn: 'root' })
export class ListingsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getWishlist(): Observable<WishlistResponse> {
    return this.http.get<WishlistResponse>(`${this.apiUrl}/wishlist/`);
  }

  getRecentlyViewed(): Observable<RecentlyViewedResponse> {
    return this.http.get<RecentlyViewedResponse>(`${this.apiUrl}/listings/recently-viewed`);
  }

  getManageListings(): Observable<ManageListingsResponse> {
    return this.http.get<ManageListingsResponse>(`${this.apiUrl}/listings/manage_listings`);
  }

  createListing(payload: FormData): Observable<ListingsApiItem> {
    return this.http.post<ListingsApiItem>(`${this.apiUrl}/listings/`, payload);
  }

  saveListingDraft(payload: FormData): Observable<ListingsApiItem> {
    return this.http.post<ListingsApiItem>(`${this.apiUrl}/listings/save-draft/`, payload);
  }

  createListingReport(
    listingId: string,
    payload: CreateListingReportRequest,
  ): Observable<Record<string, unknown>> {
    return this.http.post<Record<string, unknown>>(
      `${this.apiUrl}/reports/${listingId}/report/`,
      payload,
      {
        params: { type: 'listing' },
      },
    );
  }

  createSellerReport(
    vendorId: string,
    payload: CreateSellerReportRequest,
  ): Observable<Record<string, unknown>> {
    return this.http.post<Record<string, unknown>>(
      `${this.apiUrl}/reports/${vendorId}/report/`,
      payload,
      {
        params: { type: 'vendor' },
      },
    );
  }

  getListingDetails(id: string): Observable<ListingsApiItem> {
    return this.http.get<ListingsApiItem>(`${this.apiUrl}/listings/${id}/`);
  }

  toggleWishlist(id: string): Observable<ToggleWishlistResponse> {
    return this.http.post<ToggleWishlistResponse>(
      `${this.apiUrl}/wishlist/toggle/${id}/`,
      {},
    );
  }

  searchListings(params: SearchListingsParams): Observable<ListingsSearchResponse> {
    return this.http.get<ListingsSearchResponse>(`${this.apiUrl}/listings/`, {
      params: this.toHttpParams(params),
    });
  }

  getCategoryListings(category: string): Observable<ListingsSearchResponse> {
    return this.http.get<ListingsSearchResponse>(`${this.apiUrl}/listings/`, {
      params: this.toHttpParams({ category }),
    });
  }

  private toHttpParams(params: SearchListingsParams): Record<string, string> {
    return Object.entries(params).reduce<Record<string, string>>((accumulator, [key, value]) => {
      if (typeof value === 'string' && value.length > 0) {
        accumulator[key] = value;
      }

      return accumulator;
    }, {});
  }
}
