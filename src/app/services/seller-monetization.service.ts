import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type WalletTransactionStatus = 'pending' | 'successful' | 'failed';
export type WalletTransactionNormalizedType =
  | 'wallet_funding'
  | 'subscription_payment'
  | 'ad_promotion'
  | 'other';

export type WalletTransactionRecord = {
  id: number;
  transaction_id: string;
  amount: string;
  transaction_type: string;
  normalized_type: WalletTransactionNormalizedType;
  status: WalletTransactionStatus;
  date: string;
  description: string;
};

export type WalletTransactionListResponse = {
  wallet_balance: string;
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: WalletTransactionRecord[];
};

export type FundWalletResponse = {
  account_number?: string;
  bank_name?: string;
  account_name?: string;
  source?: string;
  status?: boolean;
  data?: {
    authorization_url?: string;
    access_code?: string;
    reference?: string;
  };
  error?: string;
};

export type SubscriptionUsageBucket = {
  used: number;
  max: number;
};

export type SubscriptionStatusData = {
  plan_name: string;
  active_until: string | null;
  usage: {
    automobile: SubscriptionUsageBucket;
    property: SubscriptionUsageBucket;
    other: SubscriptionUsageBucket;
  };
};

export type SubscriptionStatusResponse = {
  subscriptions_enabled: boolean;
  status: SubscriptionStatusData | 'No active plan';
};

export type SubscriptionPlan = {
  id: number;
  plan_name: string;
  price: string;
  weekly_price: string;
  monthly_price: string;
  yearly_price: string;
  automobile_limit: number;
  property_limit: number;
  other_limit: number;
  unlimited_ads_views: boolean;
  image_banner_limit: number;
  video_banner_limit: number;
  store_promotion_limit: number;
  is_active: boolean;
  discount_percentage: string;
  vat_percentage: string;
  computed_price: string;
};

export type SellerAdRecord = {
  id: number;
  title: string;
  image: string | null;
  video?: string | null;
  link: string;
  ad_type: 'banner' | 'listing' | 'store';
  promoted_listing_id?: number | null;
  promoted_store_id?: string | null;
  promoted_store_name?: string | null;
  promoted_store_image?: string | null;
  status: 'active' | 'paused' | 'pending' | 'rejected' | 'expired';
  is_active: boolean;
  start_date: string;
  end_date: string;
  amount_paid: string;
  total_views: number;
  total_clicks: number;
  created_at: string;
};

export type SellerAdListResponse = {
  subscription: SubscriptionStatusData | null;
  count?: number;
  next?: string | null;
  previous?: string | null;
  counts?: Partial<
    Record<
      'banner' | 'listing' | 'store',
      Partial<Record<'active' | 'paused' | 'expired' | 'pending' | 'rejected', number>>
    >
  >;
  results: SellerAdRecord[];
};

export type CreateBannerAdRequest = {
  title: string;
  destinationUrl: string;
  bannerType: 'image' | 'video';
  mediaFile: File;
  vendorId?: string;
};

export type CreateStorePromotionRequest = {
  vendorId: string;
};

export type AdAnalyticsResponse = {
  summary: {
    total_views: number;
    total_clicks: number;
    ctr: string;
  };
  daily_stats: Record<string, { views: number; clicks: number }>;
};

@Injectable({ providedIn: 'root' })
export class SellerMonetizationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl.replace(/\/+$/, '');

  getWalletTransactions(params?: {
    type?: string;
    status?: string;
    page?: number;
  }): Observable<WalletTransactionListResponse> {
    let httpParams = new HttpParams();
    if (params?.type) {
      httpParams = httpParams.set('type', params.type);
    }
    if (params?.status) {
      httpParams = httpParams.set('status', params.status);
    }
    if (params?.page) {
      httpParams = httpParams.set('page', String(params.page));
    }
    return this.http.get<WalletTransactionListResponse>(`${this.apiUrl}/wallet/transactions/`, {
      params: httpParams,
    });
  }

  fundWallet(
    payload:
      | { mode: 'paystack'; amount: number; payment_type?: string }
      | { mode: 'virtual_account' },
  ): Observable<FundWalletResponse> {
    return this.http.post<FundWalletResponse>(`${this.apiUrl}/wallet/fund/`, payload);
  }

  getSubscriptionPlans(): Observable<{
    count: number;
    next: null;
    previous: null;
    results: SubscriptionPlan[];
  }> {
    return this.http.get<{
      count: number;
      next: null;
      previous: null;
      results: SubscriptionPlan[];
    }>(`${this.apiUrl}/subscription/plans/`);
  }

  getSubscriptionStatus(): Observable<SubscriptionStatusResponse> {
    return this.http.get<SubscriptionStatusResponse>(`${this.apiUrl}/subscription/status/`);
  }

  subscribeToPlan(
    planId: number,
    billingCycle: 'weekly' | 'monthly' | 'yearly' = 'monthly',
    confirmDeduction = true,
  ): Observable<{ message?: string; error?: string; confirm_required?: boolean }> {
    return this.http.post<{ message?: string; error?: string; confirm_required?: boolean }>(
      `${this.apiUrl}/subscription/buy/`,
      { plan_id: planId, billing_cycle: billingCycle, confirm_deduction: confirmDeduction },
    );
  }

  getMyAds(params?: {
    page?: number;
    adType?: 'banner' | 'listing' | 'store';
    status?: 'active' | 'paused' | 'expired' | 'pending' | 'rejected';
  }): Observable<SellerAdListResponse> {
    let httpParams = new HttpParams();
    if (params?.page) {
      httpParams = httpParams.set('page', String(params.page));
    }
    if (params?.adType) {
      httpParams = httpParams.set('ad_type', params.adType);
    }
    if (params?.status) {
      httpParams = httpParams.set('status', params.status);
    }
    return this.http.get<SellerAdListResponse>(`${this.apiUrl}/ads/my-ads/`, {
      params: httpParams,
    });
  }

  getMyAd(adId: number): Observable<SellerAdRecord> {
    return this.http.get<SellerAdRecord>(`${this.apiUrl}/ads/my-ads/${adId}/`);
  }

  updateMyAd(
    adId: number,
    payload: { status?: SellerAdRecord['status']; link?: string },
  ): Observable<SellerAdRecord> {
    return this.http.patch<SellerAdRecord>(`${this.apiUrl}/ads/my-ads/${adId}/`, payload);
  }

  getAdAnalytics(adId: number): Observable<AdAnalyticsResponse> {
    return this.http.get<AdAnalyticsResponse>(`${this.apiUrl}/ads/${adId}/analytics/`);
  }

  createBannerAd(payload: CreateBannerAdRequest): Observable<SellerAdRecord> {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('link', payload.destinationUrl);
    if (payload.vendorId) {
      formData.append('vendor_id', payload.vendorId);
    }
    if (payload.bannerType === 'video') {
      formData.append('video', payload.mediaFile);
    } else {
      formData.append('image', payload.mediaFile);
    }
    return this.http.post<SellerAdRecord>(`${this.apiUrl}/ads/banner/`, formData);
  }

  createStorePromotion(payload: CreateStorePromotionRequest): Observable<SellerAdRecord> {
    return this.http.post<SellerAdRecord>(`${this.apiUrl}/ads/store-promotions/`, {
      vendor_id: payload.vendorId,
    });
  }
}
