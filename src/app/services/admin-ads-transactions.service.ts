import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type AdminAdsTransactionYearFilter = 'this-year' | 'last-year';

export type AdminAdsTransactionsQuery = {
  page?: number;
  year: AdminAdsTransactionYearFilter;
  search?: string;
  plan?: string;
  month?: string;
};

export type AdminAdsTransactionChartPoint = {
  label: string;
  amount: number;
};

export type AdminAdsTransactionRecordResponse = {
  id: string;
  transaction_id: string;
  user_name: string;
  email: string;
  avatar: string | null;
  plan: string;
  amount: number;
  date: string;
};

export type AdminAdsTransactionsResponse = {
  total_transactions: number;
  total_amount: number;
  chart: AdminAdsTransactionChartPoint[];
  filters: {
    plans: string[];
    months: Array<{ value: string; label: string }>;
  };
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminAdsTransactionRecordResponse[];
};

@Injectable({ providedIn: 'root' })
export class AdminAdsTransactionsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl.replace(/\/+$/, '');

  getTransactions(query: AdminAdsTransactionsQuery): Observable<AdminAdsTransactionsResponse> {
    let params = new HttpParams().set('year', query.year);

    if (query.page && query.page > 1) {
      params = params.set('page', String(query.page));
    }
    if (query.search?.trim()) {
      params = params.set('search', query.search.trim());
    }
    if (query.plan?.trim()) {
      params = params.set('plan', query.plan.trim());
    }
    if (query.month?.trim()) {
      params = params.set('month', query.month.trim());
    }

    return this.http.get<AdminAdsTransactionsResponse>(`${this.apiUrl}/admin/ads/transactions/`, { params });
  }
}
