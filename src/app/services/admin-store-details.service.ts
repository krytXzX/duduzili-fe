import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type AdminStoreLinkedUserResponse = {
  id: number;
  name: string;
  avatar: string | null;
  initials: string;
};

export type AdminStoreReviewTagResponse = {
  id: number;
  name: string;
  count: number;
};

export type AdminStoreReviewPhotoResponse = {
  id: number;
  image: string;
  order: number;
};

export type AdminStoreReviewerResponse = {
  id?: number;
  username?: string;
  full_name?: string | null;
  avatar?: string | null;
};

export type AdminStoreReviewResponse = {
  id: number;
  vendor: string;
  reviewer: AdminStoreReviewerResponse | null;
  rating: number;
  comment: string;
  tags: AdminStoreReviewTagResponse[];
  photos: AdminStoreReviewPhotoResponse[];
  created_at: string;
};

export type AdminStoreListingResponse = {
  id: string;
  title: string;
  price: string;
  thumbnail: string | null;
  location: string;
  state?: string | null;
  city?: string | null;
  is_verified?: boolean;
  is_saved?: boolean;
  created_at?: string;
  category?: string | null;
};

export type AdminStoreDetailResponse = {
  store: {
    id: string;
    store_name: string;
    profile_photo: string | null;
    cover_image: string | null;
    store_bio: string;
    location: string;
    followers_count: number;
    listings_count: number;
    average_rating: number;
    date_joined: string;
    linked_user: AdminStoreLinkedUserResponse;
    is_promoted: boolean;
    is_suspended: boolean;
    suspension_reason: string | null;
  };
  listings: AdminStoreListingResponse[];
  reviews: AdminStoreReviewResponse[];
  rating_breakdown: {
    overall_rating: number;
    total_reviews: number;
    five_star_pct: number;
    four_star_pct: number;
    three_star_pct: number;
    two_star_pct: number;
    one_star_pct: number;
    tags: AdminStoreReviewTagResponse[];
  };
};

export type AdminStoreActionResponse = {
  detail: string;
  is_suspended: boolean;
  suspension_reason: string | null;
};

@Injectable({ providedIn: 'root' })
export class AdminStoreDetailsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl.replace(/\/+$/, '');

  getStore(id: string): Observable<AdminStoreDetailResponse> {
    return this.http.get<AdminStoreDetailResponse>(`${this.apiUrl}/admin/stores/${id}/`);
  }

  suspendStore(id: string, reason: string): Observable<AdminStoreActionResponse> {
    return this.http.post<AdminStoreActionResponse>(`${this.apiUrl}/admin/stores/${id}/suspend/`, {
      reason,
    });
  }

  liftSuspension(id: string): Observable<AdminStoreActionResponse> {
    return this.http.post<AdminStoreActionResponse>(`${this.apiUrl}/admin/stores/${id}/lift-suspension/`, {});
  }
}
