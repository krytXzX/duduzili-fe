import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type SellerOfferRecord = Record<string, unknown>;
export type SellerCallbackRecord = Record<string, unknown>;

@Injectable({ providedIn: 'root' })
export class SellerRequestsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl.replace(/\/+$/, '');

  getReceivedOffers(): Observable<SellerOfferRecord[]> {
    return this.http.get<SellerOfferRecord[]>(`${this.apiUrl}/offers/received/`);
  }

  getReceivedCallbacks(): Observable<SellerCallbackRecord[]> {
    return this.http.get<SellerCallbackRecord[]>(`${this.apiUrl}/callback-requests/received/`);
  }
}
