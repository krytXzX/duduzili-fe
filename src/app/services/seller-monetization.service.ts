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
  subscription_free: boolean;
  status: SubscriptionStatusData | 'No active plan';
};

export type SubscriptionPlan = {
  id: number;
  plan_name: string;
  price: string;
  automobile_limit: number;
  property_limit: number;
  other_limit: number;
  discount_percentage: string;
  vat_percentage: string;
  computed_price: string;
};

export type SellerAdRecord = {
  id: number;
  title: string;
  image: string | null;
  link: string;
  ad_type: 'banner' | 'listing';
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
  results: SellerAdRecord[];
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

  getWalletTransactions(params?: { type?: string; status?: string; page?: number }): Observable<WalletTransactionListResponse> {
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

  fundWallet(payload: { mode: 'paystack'; amount: number; payment_type?: string } | { mode: 'virtual_account' }): Observable<FundWalletResponse> {
    return this.http.post<FundWalletResponse>(`${this.apiUrl}/wallet/fund/`, payload);
  }

  getSubscriptionPlans(): Observable<SubscriptionPlan[]> {
    return this.http.get<SubscriptionPlan[]>(`${this.apiUrl}/subscription/plans/`);
  }

  getSubscriptionStatus(): Observable<SubscriptionStatusResponse> {
    return this.http.get<SubscriptionStatusResponse>(`${this.apiUrl}/subscription/status/`);
  }

  subscribeToPlan(planId: number, confirmDeduction = true): Observable<{ message?: string; error?: string; confirm_required?: boolean }> {
    return this.http.post<{ message?: string; error?: string; confirm_required?: boolean }>(
      `${this.apiUrl}/subscription/buy/`,
      { plan_id: planId, confirm_deduction: confirmDeduction },
    );
  }

  getMyAds(): Observable<SellerAdListResponse> {
    return this.http.get<SellerAdListResponse>(`${this.apiUrl}/ads/my-ads/`);
  }

  getMyAd(adId: number): Observable<SellerAdRecord> {
    return this.http.get<SellerAdRecord>(`${this.apiUrl}/ads/my-ads/${adId}/`);
  }

  updateMyAd(adId: number, payload: { status?: SellerAdRecord['status']; link?: string }): Observable<SellerAdRecord> {
    return this.http.patch<SellerAdRecord>(`${this.apiUrl}/ads/my-ads/${adId}/`, payload);
  }

  getAdAnalytics(adId: number): Observable<AdAnalyticsResponse> {
    return this.http.get<AdAnalyticsResponse>(`${this.apiUrl}/ads/${adId}/analytics/`);
  }
}
