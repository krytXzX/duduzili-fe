import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type AdminUserDetailIdentityVerification = {
  status: string;
  label: string;
};

export type AdminUserDetailSubscription = {
  plan_name: string;
  active_until: string;
} | null;

export type AdminUserDetailChartPoint = {
  date: string;
  count: number;
};

export type AdminUserDetailMostViewedListing = {
  id: string | number;
  title: string;
  views_count: number;
  price: string;
  thumbnail: string | null;
  condition: string;
} | null;

export type AdminUserDetailDistribution = {
  total: number;
  available: number;
  sold: number;
  paused: number;
};

export type AdminUserDetailResponse = {
  id: number;
  full_name: string;
  email: string;
  avatar: string | null;
  phone_number: string | null;
  location: string | null;
  is_vendor: boolean;
  is_verified: boolean;
  is_active: boolean;
  is_banned?: boolean;
  created_at: string;
  last_login: string | null;
  identity_verification: AdminUserDetailIdentityVerification;
  subscription: AdminUserDetailSubscription;
  total_sold_items: number;
  sold_items_change_percent: number;
  sold_items_chart: AdminUserDetailChartPoint[];
  listing_distribution: AdminUserDetailDistribution;
  most_viewed_listing: AdminUserDetailMostViewedListing;
};

export type AdminUserListingRecord = {
  id: string;
  title: string;
  price: string;
  original_price: string | null;
  discount_percentage: number | null;
  condition: string;
  location: string;
  state: string | null;
  city: string | null;
  is_verified: boolean;
  is_promoted: boolean;
  thumbnail: string | null;
  vendor_name: string;
  is_saved: boolean;
  save_count: number;
  created_at: string;
  store_id: string;
  store_location: string;
  store_name: string;
  category: string;
  status: string;
};

export type AdminUserListingsResponse = {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results: AdminUserListingRecord[];
};

export type AdminUserStoreRecord = {
  id: string;
  user?: {
    id: number;
    username: string;
    avatar: string | null;
    is_verified: boolean;
    full_name?: string | null;
  };
  store_name: string;
  store_bio: string;
  cover_image: string | null;
  profile_photo: string | null;
  location: string;
  state: string | null;
  city: string | null;
  whatsapp_number: string | null;
  call_number: string | null;
  call_number_2: string | null;
  date_joined: string;
  followers_count: number;
  products_count: number;
  average_rating: number;
  is_followed?: boolean;
};

export type AdminUserStoresResponse = {
  count: number;
  results: AdminUserStoreRecord[];
};

export type AdminUserAdRecord = {
  id: number;
  title: string;
  image: string | null;
  video: string | null;
  link: string;
  ad_type: 'listing' | 'store' | 'banner' | string;
  promoted_listing_id: number | null;
  promoted_listing_title?: string | null;
  promoted_listing_price?: string | null;
  promoted_listing_category?: string | null;
  promoted_store_id: string | null;
  promoted_store_name: string | null;
  promoted_store_image: string | null;
  promoted_store_location?: string | null;
  promoted_store_is_verified?: boolean;
  status: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
  amount_paid: string;
  total_views: number;
  total_clicks: number;
  total_messages?: number;
  total_calls?: number;
  created_at: string;
};

export type AdminUserAdsSection = {
  counts: Record<string, number>;
  items: AdminUserAdRecord[];
};

export type AdminUserAdsResponse = {
  subscription: {
    plan_name: string;
    price: string;
    active_until: string;
    is_active: boolean;
  } | null;
  promoted_listings: AdminUserAdsSection;
  store_promotions: AdminUserAdsSection;
  banner_ads: AdminUserAdsSection;
  other_listings: {
    count: number;
    items: AdminUserListingRecord[];
  };
};

export type AdminUserTransactionRecord = {
  id: number;
  transaction_id: string;
  amount: string;
  transaction_type: string;
  status: string;
  date: string;
  description: string;
};

export type AdminUserTransactionsResponse = {
  wallet_balance: string;
  count?: number;
  next?: string | null;
  previous?: string | null;
  results: AdminUserTransactionRecord[];
};

export type AdminUserReviewTagSummary = {
  id: number;
  name: string;
  usage_count: number;
};

export type AdminUserReviewRecord = {
  id: number;
  vendor: string;
  reviewer: {
    id: number;
    username: string;
    avatar: string | null;
    is_verified: boolean;
    full_name?: string | null;
  };
  rating: number;
  comment: string;
  tags: Array<{ id: number; name: string; count?: number }>;
  photos: Array<{ id: number; image: string; order: number }>;
  created_at: string;
};

export type AdminUserReviewsResponse = {
  total: number;
  average_rating: number;
  star_breakdown: Record<string, { count: number; percent: number }>;
  tags_summary: AdminUserReviewTagSummary[];
  count?: number;
  next?: string | null;
  previous?: string | null;
  results: AdminUserReviewRecord[];
};

export type AdminUserReportRecord = {
  id: number;
  store: {
    id: string;
    name: string;
    logo: string | null;
  } | null;
  reported_by: {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
  };
  reason: string;
  description: string;
  status: string;
  created_at: string;
  listing?: {
    id: string | number;
    title: string;
    image: string | null;
    category_slug: string | null;
    category_name: string | null;
  } | null;
};

export type AdminUserReportsResponse = {
  type: 'profile' | 'listing' | string;
  count: number;
  results: AdminUserReportRecord[];
};

export type AdminUserActivityEvent = {
  id?: string | number;
  activity_type: string;
  label: string;
  description: string;
  actor_name: string | null;
  actor_avatar: string | null;
  timestamp: string;
};

export type AdminUserActivitiesResponse = {
  period: string;
  timeline: Array<{
    date: string;
    events: AdminUserActivityEvent[];
  }>;
};

export type AdminUserTransactionsQuery = {
  transactionType?: string;
  status?: string;
  date?: string;
};

export type AdminUserListingsQuery = {
  category?: string;
  store?: string;
  status?: string;
  search?: string;
};

@Injectable({ providedIn: 'root' })
export class AdminUserDetailsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl.replace(/\/+$/, '');

  getUser(userId: string): Observable<AdminUserDetailResponse> {
    return this.http.get<AdminUserDetailResponse>(`${this.apiUrl}/admin/users/${userId}/`);
  }

  getUserListings(
    userId: string,
    query: AdminUserListingsQuery = {},
  ): Observable<AdminUserListingsResponse> {
    let params = new HttpParams();

    if (query.category && query.category !== 'all') {
      params = params.set('category', query.category);
    }

    if (query.store && query.store !== 'all') {
      params = params.set('store', query.store);
    }

    if (query.status && query.status !== 'all') {
      params = params.set('status', query.status);
    }

    const search = query.search?.trim();
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<AdminUserListingsResponse>(
      `${this.apiUrl}/admin/users/${userId}/listings/`,
      { params },
    );
  }

  getUserStores(userId: string): Observable<AdminUserStoresResponse> {
    return this.http.get<AdminUserStoresResponse>(`${this.apiUrl}/admin/users/${userId}/stores/`);
  }

  getUserAds(userId: string): Observable<AdminUserAdsResponse> {
    return this.http.get<AdminUserAdsResponse>(`${this.apiUrl}/admin/users/${userId}/ads/`);
  }

  getUserTransactions(
    userId: string,
    query: AdminUserTransactionsQuery = {},
  ): Observable<AdminUserTransactionsResponse> {
    let params = new HttpParams();

    if (query.transactionType && query.transactionType !== 'all') {
      params = params.set('transaction_type', query.transactionType);
    }

    if (query.status && query.status !== 'all') {
      params = params.set('status', query.status);
    }

    if (query.date && query.date !== 'all') {
      params = params.set('date', query.date);
    }

    return this.http.get<AdminUserTransactionsResponse>(
      `${this.apiUrl}/admin/users/${userId}/transactions/`,
      { params },
    );
  }

  getUserReviews(
    userId: string,
    ordering: 'most_recent' | 'highest' = 'most_recent',
  ): Observable<AdminUserReviewsResponse> {
    const params = new HttpParams().set('ordering', ordering);
    return this.http.get<AdminUserReviewsResponse>(
      `${this.apiUrl}/admin/users/${userId}/reviews/`,
      { params },
    );
  }

  getUserReports(
    userId: string,
    type: 'profile' | 'listing',
    search = '',
  ): Observable<AdminUserReportsResponse> {
    let params = new HttpParams().set('type', type);
    const normalizedSearch = search.trim();
    if (normalizedSearch) {
      params = params.set('search', normalizedSearch);
    }
    return this.http.get<AdminUserReportsResponse>(
      `${this.apiUrl}/admin/users/${userId}/reports/`,
      { params },
    );
  }

  getUserActivities(
    userId: string,
    period: 'this_week' | 'this_month' | 'all' = 'all',
  ): Observable<AdminUserActivitiesResponse> {
    const params = new HttpParams().set('period', period);
    return this.http.get<AdminUserActivitiesResponse>(
      `${this.apiUrl}/admin/users/${userId}/activities/`,
      { params },
    );
  }

  suspendUser(userId: string): Observable<{ detail: string; is_active: boolean }> {
    return this.http.post<{ detail: string; is_active: boolean }>(
      `${this.apiUrl}/admin/users/${userId}/suspend/`,
      {},
    );
  }

  banUser(userId: string): Observable<{ detail: string; is_active: boolean; is_banned: boolean }> {
    return this.http.post<{ detail: string; is_active: boolean; is_banned: boolean }>(
      `${this.apiUrl}/admin/users/${userId}/ban/`,
      {},
    );
  }

  activateUser(userId: string): Observable<{ detail: string; is_active: boolean }> {
    return this.http.post<{ detail: string; is_active: boolean }>(
      `${this.apiUrl}/admin/users/${userId}/activate/`,
      {},
    );
  }

  downloadUserData(userId: string): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.apiUrl}/admin/users/${userId}/download/`, {
      observe: 'response',
      responseType: 'blob',
    });
  }
}
