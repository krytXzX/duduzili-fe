import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type AdminHomeTodoItem = {
  id: string;
  title: string;
  sender: string;
  sender_initials: string;
  period: 'today' | 'yesterday';
  icon: 'banner' | 'kyc';
};

export type AdminHomeSubscriptionComparisonPoint = {
  month_label: string;
  month: string;
  current_year: number;
  previous_year: number;
};

export type AdminHomeSubscriptionEarnings = {
  total_earnings: number;
  earnings_change_percent: number;
  comparison_chart: AdminHomeSubscriptionComparisonPoint[];
};

export type AdminHomePayment = {
  id: string;
  name: string;
  plan: string;
  amount: number;
  date: string;
  initials: string;
};

export type AdminHomeActivity = {
  id: string;
  subject: string;
  actor: string;
  period: 'today' | 'previous';
  time_ago: string;
  icon: 'kyc' | 'signup' | 'listing' | 'review';
};

export type AdminHomeDashboardResponse = {
  admin_user: {
    display_name: string;
  };
  todo_items: AdminHomeTodoItem[];
  subscription_earnings: AdminHomeSubscriptionEarnings;
  payments: AdminHomePayment[];
  activities: AdminHomeActivity[];
};

@Injectable({ providedIn: 'root' })
export class AdminDashboardService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl.replace(/\/+$/, '');

  getHomeDashboard(): Observable<AdminHomeDashboardResponse> {
    return this.http.get<AdminHomeDashboardResponse>(`${this.apiUrl}/admin/home/`);
  }
}
