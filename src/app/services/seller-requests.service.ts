import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type SellerOfferRecord = Record<string, unknown>;
export type SellerCallbackRecord = Record<string, unknown>;
export type SellerOffersResponse =
  | SellerOfferRecord[]
  | {
      count?: number;
      next?: string | null;
      previous?: string | null;
      results?: SellerOfferRecord[];
      data?: SellerOfferRecord[];
      offers?: SellerOfferRecord[];
    };
export type SellerCallbacksResponse =
  | SellerCallbackRecord[]
  | {
      count?: number;
      next?: string | null;
      previous?: string | null;
      results?: SellerCallbackRecord[];
      data?: SellerCallbackRecord[];
      callbacks?: SellerCallbackRecord[];
    };

@Injectable({ providedIn: 'root' })
export class SellerRequestsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl.replace(/\/+$/, '');

  getReceivedOffers(): Observable<SellerOffersResponse> {
    return this.http.get<SellerOffersResponse>(`${this.apiUrl}/offers/received/`);
  }

  getReceivedCallbacks(): Observable<SellerCallbacksResponse> {
    return this.http.get<SellerCallbacksResponse>(`${this.apiUrl}/callback-requests/received/`);
  }
}
