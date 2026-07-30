import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type HomeCategoryResponse = {
  id: number | string;
  name: string;
  icon?: string | null;
  slug?: string | null;
  parent?: number | string | null;
  limit_type?: string | null;
  subcategories?: HomeCategoryResponse[];
};

export type HomeListingResponse = Record<string, unknown>;
export type HomeStoreResponse = {
  id: number | string;
  user?: {
    id?: number | string;
    username?: string | null;
    avatar?: string | null;
    is_verified?: boolean | null;
  } | null;
  store_name?: string | null;
  store_bio?: string | null;
  cover_image?: string | null;
  profile_photo?: string | null;
  location?: string | null;
  state?: string | null;
  city?: string | null;
  whatsapp_number?: string | null;
  call_number?: string | null;
  date_joined?: string | null;
  followers_count?: number | string | null;
  products_count?: number | string | null;
  average_rating?: number | string | null;
  is_followed?: boolean | null;
} & Record<string, unknown>;

export type HomeAdvertisementResponse = {
  id: number | string;
  title?: string | null;
  image?: string | null;
  link?: string | null;
  start_date?: string | null;
  end_date?: string | null;
} & Record<string, unknown>;

export type HomeResponse = {
  categories?: HomeCategoryResponse[];
  sponsored_listings?: HomeListingResponse[];
  nearby_listings?: HomeListingResponse[];
  featured_stores?: HomeStoreResponse[];
  advertisements?: HomeAdvertisementResponse[];
  popular_searches?: string[];
  popular_search_terms?: string[];
  search_suggestions?: string[];
  trending_searches?: string[];
  subscriptions_enabled?: boolean;
};

@Injectable({ providedIn: 'root' })
export class HomeService {
  private readonly http = inject(HttpClient);
  readonly apiUrl = environment.apiUrl.replace(/\/+$/, '');

  getHome(location?: string): Observable<HomeResponse> {
    const params = location
      ? new HttpParams().set('location', location)
      : undefined;

    return this.http.get<HomeResponse>(`${this.apiUrl}/home/`, { params });
  }

  trackAd(adId: number | string, eventType: 'view' | 'click'): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/ads/${adId}/track/`, { type: eventType });
  }

  submitContactForm(data: { name: string; email: string; message: string }): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/contact-us/`, data);
  }
}
