import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type AdminUsersStatusFilter = 'all' | 'active' | 'suspended';
export type AdminUsersCategoryFilter = 'all' | 'buyers' | 'sellers';
export type AdminUsersStoreFilter = 'all' | 'with-store' | 'without-store';

export type AdminUsersIdentityVerification = {
  status: 'verified' | 'request_sent' | 'not_submitted' | 'rejected' | string;
  label: string;
};

export type AdminUsersRecord = {
  id: number;
  full_name: string;
  email: string;
  avatar: string | null;
  phone_number: string | null;
  has_store: boolean;
  identity_verification: AdminUsersIdentityVerification;
  last_login: string | null;
  created_at: string;
  is_active: boolean;
  is_active_user: boolean;
  is_verified: boolean;
  is_vendor: boolean;
};

export type AdminUsersResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminUsersRecord[];
  counts?: {
    all?: number;
    active?: number;
    suspended?: number;
  };
};

export type AdminUsersQuery = {
  page?: number;
  search?: string;
  status?: AdminUsersStatusFilter;
  category?: AdminUsersCategoryFilter;
  store?: AdminUsersStoreFilter;
};

@Injectable({ providedIn: 'root' })
export class AdminUsersService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl.replace(/\/+$/, '');

  getUsers(query: AdminUsersQuery): Observable<AdminUsersResponse> {
    let params = new HttpParams();

    if (query.page && query.page > 0) {
      params = params.set('page', String(query.page));
    }

    const search = query.search?.trim();
    if (search) {
      params = params.set('search', search);
    }

    if (query.status && query.status !== 'all') {
      params = params.set('status', query.status === 'suspended' ? 'suspended' : query.status);
    }

    if (query.category && query.category !== 'all') {
      params = params.set('user_type', query.category);
    }

    if (query.store && query.store !== 'all') {
      params = params.set(
        'store_presence',
        query.store === 'with-store' ? 'with_store' : 'without_store',
      );
    }

    return this.http.get<AdminUsersResponse>(`${this.apiUrl}/admin/users/`, { params });
  }
}
