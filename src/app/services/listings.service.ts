import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type ListingsApiItem = Record<string, unknown>;
export type ToggleFavoriteResponse = Record<string, unknown> | null;
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

export interface WishlistResponse {
  today?: ListingsApiItem[];
  yesterday?: ListingsApiItem[];
  earlier?: ListingsApiItem[];
}

export interface CreateReportRequest {
  listing: string;
  details: string;
}

@Injectable({ providedIn: 'root' })
export class ListingsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getMyFavorites(): Observable<WishlistResponse> {
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

  createReport(payload: CreateReportRequest): Observable<Record<string, unknown>> {
    return this.http.post<Record<string, unknown>>(`${this.apiUrl}/reports/`, payload);
  }

  getListingDetails(id: string): Observable<ListingsApiItem> {
    return this.http.get<ListingsApiItem>(`${this.apiUrl}/listings/${id}/`);
  }

  toggleFavorite(id: string): Observable<ToggleFavoriteResponse> {
    return this.http.post<ToggleFavoriteResponse>(
      `${this.apiUrl}/listings/${id}/toggle_favorite/`,
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
