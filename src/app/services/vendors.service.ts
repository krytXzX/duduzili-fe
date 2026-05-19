import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type VendorFollowResponse = Record<string, unknown>;
export type VendorRecord = Record<string, unknown>;
export type VendorListingRecord = Record<string, unknown>;
export type VendorReviewRecord = Record<string, unknown>;
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

  getVendorListings(id: string): Observable<VendorListingsResponse> {
    return this.http.get<VendorListingsResponse>(`${this.apiUrl}/vendors/${id}/listings/`);
  }

  getVendorReviews(id: string): Observable<VendorReviewsResponse> {
    return this.http.get<VendorReviewsResponse>(`${this.apiUrl}/vendors/${id}/reviews/`);
  }
}
