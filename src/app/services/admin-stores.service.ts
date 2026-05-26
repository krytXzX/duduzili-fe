import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type AdminStoreRatingFilter = 'all' | 'highest' | 'lowest';

export type AdminStoreQuery = {
  page?: number;
  search?: string;
  rating?: AdminStoreRatingFilter;
};

export type AdminStoresRecord = {
  id: string;
  store_name: string;
  profile_photo: string | null;
  cover_image: string | null;
  location: string;
  linked_user: {
    id: number;
    name: string;
    avatar: string | null;
  };
  no_of_listings: number;
  average_rating: number;
  is_promoted: boolean;
  date_joined: string;
};

export type PaginatedAdminStoresResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminStoresRecord[];
};

@Injectable({ providedIn: 'root' })
export class AdminStoresService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl.replace(/\/+$/, '');

  getStores(query: AdminStoreQuery): Observable<PaginatedAdminStoresResponse> {
    const params = new URLSearchParams();

    if (query.page && query.page > 1) {
      params.set('page', String(query.page));
    }

    const search = query.search?.trim();
    if (search) {
      params.set('search', search);
    }

    if (query.rating === 'highest') {
      params.set('ordering', '-average_rating');
    } else if (query.rating === 'lowest') {
      params.set('ordering', 'average_rating');
    }

    const queryString = params.toString();
    const url = queryString ? `${this.apiUrl}/admin/stores/?${queryString}` : `${this.apiUrl}/admin/stores/`;
    return this.http.get<PaginatedAdminStoresResponse>(url);
  }
}
