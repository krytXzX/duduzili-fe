import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type AdminSubscriptionPlanRecord = {
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

export type AdminSingleBoostingPlanRecord = {
  id: number;
  name: string;
  duration_days: number;
  automobile_price: string;
  property_price: string;
  other_listing_price: string;
  image_banner_price: string;
  video_banner_price: string;
  store_promotion_price: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
};

export type AdminAdsPlansResponse = {
  subscription_plans: AdminSubscriptionPlanRecord[];
  single_boosting_plans: AdminSingleBoostingPlanRecord[];
};

@Injectable({ providedIn: 'root' })
export class AdminAdsPlansService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl.replace(/\/+$/, '');

  getPlans(): Observable<AdminAdsPlansResponse> {
    return this.http.get<AdminAdsPlansResponse>(`${this.apiUrl}/admin/ads/plans/`);
  }

  updateSubscriptionPlan(id: number, payload: Partial<AdminSubscriptionPlanRecord>): Observable<AdminSubscriptionPlanRecord> {
    return this.http.patch<AdminSubscriptionPlanRecord>(`${this.apiUrl}/admin/ads/subscription-plans/${id}/`, payload);
  }

  updateSingleBoostingPlan(id: number, payload: Partial<AdminSingleBoostingPlanRecord>): Observable<AdminSingleBoostingPlanRecord> {
    return this.http.patch<AdminSingleBoostingPlanRecord>(`${this.apiUrl}/admin/ads/single-boosting-plans/${id}/`, payload);
  }
}
