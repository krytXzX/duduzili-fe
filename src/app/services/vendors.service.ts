import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type VendorFollowResponse = Record<string, unknown>;
export type VendorRecord = Record<string, unknown>;
export type VendorsFollowingResponse =
  | VendorRecord[]
  | {
      count?: number;
      results?: VendorRecord[];
      data?: VendorRecord[];
      vendors?: VendorRecord[];
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
}
