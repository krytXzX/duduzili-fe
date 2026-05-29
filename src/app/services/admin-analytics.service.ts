import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type AdminAnalyticsRange = '7d' | '30d';

export type AdminOverviewChartPoint = {
  label: string;
  date: string;
  current_period: number;
  previous_period: number;
};

export type AdminOverviewPlatformHealth = {
  score: number;
  label: 'Bad' | 'Fair' | 'Good' | 'Great';
  summary: string;
};

export type AdminOverviewTopSubscribedPlan = {
  plan_name: string;
  subscriptions_count: number;
};

export type AdminOverviewListing = {
  id: string;
  title: string;
  image: string | null;
  views: number;
  price: string;
};

export type AdminOverviewAnalyticsResponse = {
  total_listings: number;
  total_views: number;
  total_saves: number;
  total_messages: number;
  total_sold_items: number;
  sold_items_change_percent: number;
  listings_distribution: {
    sold: number;
    available: number;
    paused: number;
  };
  most_viewed_listing: Partial<AdminOverviewListing>;
  monthly_sales_chart: Array<{
    month_label: string;
    month: string;
    count: number;
  }>;
  platform_health: AdminOverviewPlatformHealth;
  top_subscribed_plans: AdminOverviewTopSubscribedPlan[];
};

export type AdminSubscriptionEarningsResponse = {
  total_earnings: number;
  earnings_change_percent: number;
  comparison_chart: AdminOverviewChartPoint[];
};

export type AdminUsersAnalyticsResponse = {
  online_users: number;
  total_users: number;
  renewal_rate: number;
  churn_rate: number;
  new_signups: number;
  signups_change_percent: number;
  verified_vs_unverified: {
    verified: number;
    unverified: number;
  };
  top_regions: Array<{
    region: string;
    count: number;
  }>;
  signups_chart: Array<{
    date: string;
    count: number;
  }>;
};

export type AdminListingsAnalyticsResponse = {
  total_listings: number;
  average_listing_price: number;
  active_listings: number;
  price_change_percent: number;
  most_viewed_listings: Array<{
    id: string;
    title: string;
    image: string | null;
    views: number;
    price: string;
  }>;
  top_sellers: Array<{
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    sold_count: number;
  }>;
  listing_conversion_rate: number;
  conversion_rate_change: number;
  listings_posted_chart: Array<{
    date: string;
    count: number;
  }>;
};

@Injectable({ providedIn: 'root' })
export class AdminAnalyticsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl.replace(/\/+$/, '');

  getOverviewAnalytics(): Observable<AdminOverviewAnalyticsResponse> {
    return this.http.get<AdminOverviewAnalyticsResponse>(`${this.apiUrl}/admin/analytics/overview/`);
  }

  getSubscriptionEarnings(range: AdminAnalyticsRange): Observable<AdminSubscriptionEarningsResponse> {
    const params = new HttpParams().set('range', range);
    return this.http.get<AdminSubscriptionEarningsResponse>(`${this.apiUrl}/admin/analytics/subscription-earnings/`, {
      params,
    });
  }

  getUsersAnalytics(): Observable<AdminUsersAnalyticsResponse> {
    return this.http.get<AdminUsersAnalyticsResponse>(`${this.apiUrl}/admin/analytics/users/`);
  }

  getListingsAnalytics(): Observable<AdminListingsAnalyticsResponse> {
    return this.http.get<AdminListingsAnalyticsResponse>(`${this.apiUrl}/admin/analytics/listings/`);
  }
}
