import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type ListingsApiItem = Record<string, unknown>;
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

@Injectable({ providedIn: 'root' })
export class ListingsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

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
