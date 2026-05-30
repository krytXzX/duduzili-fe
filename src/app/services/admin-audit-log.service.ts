import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type AdminAuditActivityType =
  | 'login'
  | 'logout'
  | 'signup'
  | 'password_reset'
  | 'profile_update';

export type AdminAuditLogRecordResponse = {
  id: number;
  user: number;
  user_email: string;
  user_name: string;
  user_avatar: string | null;
  activity_type: AdminAuditActivityType;
  activity_type_label: string;
  activity_description: string;
  ip_address: string | null;
  user_agent: string;
  timestamp: string;
};

export type AdminAuditLogResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminAuditLogRecordResponse[];
  filters?: {
    months?: Array<{
      value: string;
      label: string;
    }>;
  };
};

export type AdminAuditLogQuery = {
  page?: number;
  search?: string;
  activity_type?: AdminAuditActivityType;
  month?: string;
};

@Injectable({ providedIn: 'root' })
export class AdminAuditLogService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl.replace(/\/+$/, '');

  getAuditLogs(query: AdminAuditLogQuery): Observable<AdminAuditLogResponse> {
    let params = new HttpParams();

    if (query.page && query.page > 0) {
      params = params.set('page', String(query.page));
    }
    if (query.search?.trim()) {
      params = params.set('search', query.search.trim());
    }
    if (query.activity_type) {
      params = params.set('activity_type', query.activity_type);
    }
    if (query.month?.trim()) {
      params = params.set('month', query.month.trim());
    }

    return this.http.get<AdminAuditLogResponse>(`${this.apiUrl}/admin/audit-logs/`, { params });
  }
}
