import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type ListingsApiItem = Record<string, unknown>;
export type ToggleWishlistResponse = Record<string, unknown> | null;
export type ManageListingsCategory = {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  limit_type: string;
  subcategories: readonly ManageListingsCategory[];
};

export type ManageListingsStore = Record<string, unknown>;
export interface ManageListingsState {
  id: number;
  name: string;
}

export interface ManageListingsCity {
  id: number;
  name: string;
  state?: number;
}

export interface ManageListingsDeliveryOption {
  id: number;
  name: string;
}

export interface ManageListingsProductCondition {
  id: string;
  name: string;
}

export interface ManageListingsResponse {
  all?: ListingsApiItem[];
  stats?: Record<string, number>;
  stores?: ManageListingsStore[];
  categories?: ManageListingsCategory[];
  identity_verification?: Record<string, unknown>;
  states?: ManageListingsState[];
  cities?: ManageListingsCity[];
  delivery_options?: ManageListingsDeliveryOption[];
  product_conditions?: ManageListingsProductCondition[];
}
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
  page?: number;
  page_size?: number;
}

export type ListingsSearchResponse =
  | ListingsApiItem[]
  | {
      count?: number;
      next?: string | null;
      previous?: string | null;
      results?: ListingsApiItem[];
      data?: ListingsApiItem[];
      listings?: ListingsApiItem[];
    };

export interface RecentlyViewedResponse {
  today?: ListingsApiItem[];
  yesterday?: ListingsApiItem[];
  earlier?: ListingsApiItem[];
}

export type WishlistResponse =
  | {
      today?: ListingsApiItem[];
      yesterday?: ListingsApiItem[];
      earlier?: ListingsApiItem[];
    }
  | {
      count?: number;
      next?: string | null;
      previous?: string | null;
      results?: Array<Record<string, unknown>>;
    };

export interface CreateListingReportRequest {
  description: string;
}

export interface CreateSellerReportRequest {
  reason: string;
}

export interface CreateOfferRequest {
  listing: string;
  offer_amount: string;
  message?: string;
}

export interface CreateCallbackRequest {
  listing: string;
  phone_number: string;
  message?: string;
}

export interface PromotionPlanApiItem {
  id: number;
  name: string;
  duration_days: number;
  automobile_price: string;
  property_price: string;
  other_listing_price: string;
  image_banner_price: string;
  video_banner_price: string;
  store_promotion_price: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface PromoteListingsRequest {
  listing_ids: string[];
  plan_id: number;
  payment_method: 'wallet' | 'online';
  confirm_deduction?: boolean;
}

export type ListingOfferResponse = ListingsApiItem[];
export type ListingCallbackResponse = ListingsApiItem[];
export type ListingActivitiesResponse =
  | ListingsApiItem[]
  | {
      results?: ListingsApiItem[];
      timeline?: ListingsApiItem[];
    };

export interface UpdateListingRequest {
  title?: string;
  category?: number;
  condition?: string;
  store?: string;
  description?: string;
  youtube_link?: string | null;
  location?: string;
  price?: number;
  original_price?: number | null;
  accept_offers?: boolean;
  is_free?: boolean;
  delivery_option_ids?: number[];
  status?: string;
}

@Injectable({ providedIn: 'root' })
export class ListingsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getWishlist(): Observable<WishlistResponse> {
    return this.http.get<WishlistResponse>(`${this.apiUrl}/wishlist/`);
  }

  getRecentlyViewed(): Observable<RecentlyViewedResponse> {
    return this.http.get<RecentlyViewedResponse>(`${this.apiUrl}/listings/recently-viewed`);
  }

  getManageListings(): Observable<ManageListingsResponse> {
    return this.http.get<ManageListingsResponse>(`${this.apiUrl}/listings/manage_listings`);
  }

  createListing(payload: FormData): Observable<ListingsApiItem> {
    return this.http.post<ListingsApiItem>(`${this.apiUrl}/listings/`, payload);
  }

  saveListingDraft(payload: FormData): Observable<ListingsApiItem> {
    return this.http.post<ListingsApiItem>(`${this.apiUrl}/listings/save-draft/`, payload);
  }

  createListingReport(
    listingId: string,
    payload: CreateListingReportRequest,
  ): Observable<Record<string, unknown>> {
    return this.http.post<Record<string, unknown>>(
      `${this.apiUrl}/reports/${listingId}/report/`,
      payload,
      {
        params: { type: 'listing' },
      },
    );
  }

  createSellerReport(
    vendorId: string,
    payload: CreateSellerReportRequest,
  ): Observable<Record<string, unknown>> {
    return this.http.post<Record<string, unknown>>(
      `${this.apiUrl}/reports/${vendorId}/report/`,
      payload,
      {
        params: { type: 'vendor' },
      },
    );
  }

  createOffer(payload: CreateOfferRequest): Observable<Record<string, unknown>> {
    return this.http.post<Record<string, unknown>>(`${this.apiUrl}/offers/`, payload);
  }

  createCallbackRequest(payload: CreateCallbackRequest): Observable<Record<string, unknown>> {
    return this.http.post<Record<string, unknown>>(`${this.apiUrl}/callback-requests/`, payload);
  }

  getListingDetails(id: string): Observable<ListingsApiItem> {
    return this.http.get<ListingsApiItem>(`${this.apiUrl}/listings/${id}/`);
  }

  getListingOffers(id: string): Observable<ListingOfferResponse> {
    return this.http.get<ListingOfferResponse>(`${this.apiUrl}/listings/${id}/offers/`);
  }

  getListingCallbackRequests(id: string): Observable<ListingCallbackResponse> {
    return this.http.get<ListingCallbackResponse>(`${this.apiUrl}/listings/${id}/callback-requests/`);
  }

  getListingActivities(id: string): Observable<ListingActivitiesResponse> {
    return this.http.get<ListingActivitiesResponse>(`${this.apiUrl}/listings/${id}/activities/`);
  }

  getPromotionPlans(): Observable<PromotionPlanApiItem[]> {
    return this.http.get<PromotionPlanApiItem[]>(`${this.apiUrl}/promotion-plans/`);
  }

  promoteListings(payload: PromoteListingsRequest): Observable<Record<string, unknown>> {
    return this.http.post<Record<string, unknown>>(`${this.apiUrl}/ads/promote-listings/`, payload);
  }

  updateListing(id: string, payload: UpdateListingRequest | FormData): Observable<ListingsApiItem> {
    return this.http.patch<ListingsApiItem>(`${this.apiUrl}/listings/${id}/`, payload);
  }

  deleteListing(id: string): Observable<null> {
    return this.http.delete<null>(`${this.apiUrl}/listings/${id}/`);
  }

  toggleWishlist(id: string): Observable<ToggleWishlistResponse> {
    return this.http.post<ToggleWishlistResponse>(
      `${this.apiUrl}/wishlist/toggle/${id}/`,
      {},
    );
  }

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

      if (typeof value === 'number' && Number.isFinite(value)) {
        accumulator[key] = String(value);
      }

      return accumulator;
    }, {});
  }
}
