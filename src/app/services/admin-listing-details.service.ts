import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type AdminListingDetailStatus = 'Available' | 'Sold' | 'Paused' | 'Suspended' | 'Draft';

export type AdminListingDetailGalleryItem = {
  id: string;
  src: string | null;
  alt: string;
};

export type AdminListingDetailRowResponse = {
  label: string;
  value: string;
};

export type AdminListingDetailRequestResponse = {
  id: string;
  buyer: string;
  avatar_src: string | null;
  request_type: string;
  date_requested: string;
  time: string;
  action_type: 'message' | 'call';
};

export type AdminListingDetailReportResponse = {
  id: string;
  reporter_name: string;
  reporter_email: string;
  reporter_avatar_src: string | null;
  description: string;
  date_reported: string;
};

export type AdminListingDetailActivityResponse = {
  id: string;
  activity_type: string;
  title: string;
  description: string | null;
  actor_name: string;
  actor_avatar_src: string | null;
  timestamp: string;
  time: string;
};

export type AdminListingDetailResponse = {
  id: string;
  title: string;
  preview_image: string | null;
  updated_at: string;
  created_at: string;
  is_promoted: boolean;
  status: AdminListingDetailStatus;
  suspension_reason: string | null;
  location: string;
  messages_count: number;
  views_count: number;
  saves_count: number;
  price: string;
  description: string;
  gallery: AdminListingDetailGalleryItem[];
  store: {
    id: string;
    name: string;
    logo: string | null;
    verified: boolean;
  };
  details: AdminListingDetailRowResponse[];
  requests: AdminListingDetailRequestResponse[];
  reports: AdminListingDetailReportResponse[];
  activities: AdminListingDetailActivityResponse[];
};

export type AdminListingActionResponse = {
  detail: string;
  listing_id: string;
  status: AdminListingDetailStatus;
  suspension_reason: string | null;
};

@Injectable({ providedIn: 'root' })
export class AdminListingDetailsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl.replace(/\/+$/, '');

  getListing(id: string): Observable<AdminListingDetailResponse> {
    return this.http.get<AdminListingDetailResponse>(`${this.apiUrl}/admin/listings/${id}/`);
  }

  suspendListing(id: string, reason: string): Observable<AdminListingActionResponse> {
    return this.http.post<AdminListingActionResponse>(`${this.apiUrl}/admin/listings/${id}/suspend/`, {
      reason,
    });
  }

  liftSuspension(id: string): Observable<AdminListingActionResponse> {
    return this.http.post<AdminListingActionResponse>(
      `${this.apiUrl}/admin/listings/${id}/lift-suspension/`,
      {},
    );
  }
}
