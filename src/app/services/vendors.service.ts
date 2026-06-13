import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type VendorFollowResponse = Record<string, unknown>;
export type VendorRecord = Record<string, unknown>;
export type VendorListingRecord = Record<string, unknown>;
export type VendorReviewRecord = Record<string, unknown>;
export type VendorReviewTagRecord = {
  id: number;
  name: string;
  count: number;
};
export type VendorAnalyticsRecord = Record<string, unknown>;
export type UpdateVendorPayload = {
  store_name?: string;
  store_bio?: string;
  location?: string;
  whatsapp_number?: string;
  call_number?: string;
  call_number_2?: string;
  profile_photo?: File;
  cover_image?: File;
};
export type CreateVendorReviewPayload = {
  vendor: string;
  rating: number;
  comment?: string;
  tag_ids?: number[];
  photo_files?: readonly File[];
};
export type VendorsFollowingResponse =
  | VendorRecord[]
  | {
      count?: number;
      results?: VendorRecord[];
      data?: VendorRecord[];
      vendors?: VendorRecord[];
    };
export type MyStoresResponse =
  | VendorRecord[]
  | {
      count?: number;
      results?: VendorRecord[];
      data?: VendorRecord[];
      stores?: VendorRecord[];
      vendors?: VendorRecord[];
    };
export type VendorListingsResponse =
  | VendorListingRecord[]
  | {
      count?: number;
      results?: VendorListingRecord[];
      data?: VendorListingRecord[];
      listings?: VendorListingRecord[];
    };
export type VendorReviewsResponse =
  | VendorReviewRecord[]
  | {
      count?: number;
      results?: VendorReviewRecord[];
      data?: VendorReviewRecord[];
      reviews?: VendorReviewRecord[];
    };

@Injectable({ providedIn: 'root' })
export class VendorsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getVendorDetails(id: string): Observable<VendorRecord> {
    return this.http.get<VendorRecord>(`${this.apiUrl}/vendors/${id}/`);
  }

  toggleFollow(id: string): Observable<VendorFollowResponse> {
    return this.http.post<VendorFollowResponse>(`${this.apiUrl}/vendors/${id}/follow/`, {});
  }

  getFollowing(): Observable<VendorsFollowingResponse> {
    return this.http.get<VendorsFollowingResponse>(`${this.apiUrl}/vendors/following/`);
  }

  getMyStores(): Observable<MyStoresResponse> {
    return this.http.get<MyStoresResponse>(`${this.apiUrl}/vendors/my-stores/`);
  }

  createStore(payload: FormData): Observable<VendorRecord> {
    return this.http.post<VendorRecord>(`${this.apiUrl}/vendors/`, payload);
  }

  updateStore(id: string, payload: UpdateVendorPayload): Observable<VendorRecord> {
    // If any file fields are present, send as FormData so the server can handle uploads
    if (payload.profile_photo || payload.cover_image) {
      const formData = new FormData();
      if (payload.store_name !== undefined) formData.append('store_name', payload.store_name);
      if (payload.store_bio !== undefined) formData.append('store_bio', payload.store_bio);
      if (payload.location !== undefined) formData.append('location', payload.location);
      if (payload.whatsapp_number !== undefined)
        formData.append('whatsapp_number', payload.whatsapp_number);
      if (payload.call_number !== undefined) formData.append('call_number', payload.call_number);
      if (payload.call_number_2 !== undefined)
        formData.append('call_number_2', payload.call_number_2);
      if (payload.profile_photo) formData.append('profile_photo', payload.profile_photo);
      if (payload.cover_image) formData.append('cover_image', payload.cover_image);
      return this.http.patch<VendorRecord>(`${this.apiUrl}/vendors/${id}/`, formData);
    }
    return this.http.patch<VendorRecord>(`${this.apiUrl}/vendors/${id}/`, payload);
  }

  getVendorListings(id: string): Observable<VendorListingsResponse> {
    return this.http.get<VendorListingsResponse>(`${this.apiUrl}/vendors/${id}/listings/`);
  }

  getVendorReviews(id: string): Observable<VendorReviewsResponse> {
    return this.http.get<VendorReviewsResponse>(`${this.apiUrl}/vendors/${id}/reviews/`);
  }

  getReviewTags(): Observable<readonly VendorReviewTagRecord[]> {
    return this.http.get<readonly VendorReviewTagRecord[]>(`${this.apiUrl}/review-tags/`);
  }

  createVendorReview(
    id: string,
    payload: CreateVendorReviewPayload,
  ): Observable<VendorReviewRecord> {
    const formData = new FormData();
    formData.append('vendor', payload.vendor);
    formData.append('rating', String(payload.rating));

    if (payload.comment?.trim()) {
      formData.append('comment', payload.comment.trim());
    }

    for (const tagId of payload.tag_ids ?? []) {
      formData.append('tag_ids', String(tagId));
    }

    for (const file of payload.photo_files ?? []) {
      formData.append('photo_files', file);
    }

    return this.http.post<VendorReviewRecord>(
      `${this.apiUrl}/vendors/${id}/reviews/create/`,
      formData,
    );
  }

  getVendorAnalytics(id: string): Observable<VendorAnalyticsRecord> {
    return this.http.get<VendorAnalyticsRecord>(`${this.apiUrl}/vendors/${id}/analytics/`);
  }
}
