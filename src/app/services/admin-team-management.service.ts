import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type AdminTeamMemberStatus = 'active' | 'inactive' | 'pending_activation';

export type AdminTeamMemberRecord = {
  id: string;
  user: number;
  user_email: string;
  user_name: string;
  user_first_name: string;
  user_last_name: string;
  user_phone_number: string | null;
  user_avatar: string | null;
  role: string;
  role_name: string;
  status: AdminTeamMemberStatus;
  last_signed_in: string | null;
  added_by: number | null;
  added_by_name: string | null;
  added_at: string;
};

export type AdminTeamRoleRecord = {
  id: string;
  name: string;
  role_type: string;
  description: string;
  can_manage_users: boolean;
  can_manage_listings: boolean;
  can_manage_transactions: boolean;
  can_manage_kyc: boolean;
  can_manage_reports: boolean;
  can_view_analytics: boolean;
  can_manage_ads: boolean;
  can_manage_team: boolean;
  members_count: number;
  created_at: string;
  updated_at: string;
};

type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type AdminTeamQuery = {
  page?: number;
  search?: string;
};

export type CreateAdminTeamMemberPayload = {
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  role: string;
  status: AdminTeamMemberStatus;
};

export type UpdateAdminTeamMemberPayload = {
  role?: string;
  status?: AdminTeamMemberStatus;
};

export type CreateAdminRolePayload = {
  name: string;
  role_type: string;
  description: string;
  can_manage_users: boolean;
  can_manage_listings: boolean;
  can_manage_transactions: boolean;
  can_manage_kyc: boolean;
  can_manage_reports: boolean;
  can_view_analytics: boolean;
  can_manage_ads: boolean;
  can_manage_team: boolean;
};

@Injectable({ providedIn: 'root' })
export class AdminTeamManagementService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl.replace(/\/+$/, '');

  getTeamMembers(query: AdminTeamQuery): Observable<PaginatedResponse<AdminTeamMemberRecord>> {
    let params = new HttpParams();

    if (query.page && query.page > 0) {
      params = params.set('page', String(query.page));
    }

    const search = query.search?.trim();
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PaginatedResponse<AdminTeamMemberRecord>>(`${this.apiUrl}/admin/team/`, {
      params,
    });
  }

  addTeamMember(payload: CreateAdminTeamMemberPayload): Observable<AdminTeamMemberRecord> {
    return this.http.post<AdminTeamMemberRecord>(`${this.apiUrl}/admin/team/`, payload);
  }

  resendInvite(memberId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/admin/team/${memberId}/resend-invite/`,
      {},
    );
  }

  updateTeamMember(
    memberId: string,
    payload: UpdateAdminTeamMemberPayload,
  ): Observable<AdminTeamMemberRecord> {
    return this.http.patch<AdminTeamMemberRecord>(`${this.apiUrl}/admin/team/${memberId}/`, payload);
  }

  deleteTeamMember(memberId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/team/${memberId}/`);
  }

  getRoles(query: AdminTeamQuery): Observable<PaginatedResponse<AdminTeamRoleRecord>> {
    let params = new HttpParams();

    if (query.page && query.page > 0) {
      params = params.set('page', String(query.page));
    }

    const search = query.search?.trim();
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PaginatedResponse<AdminTeamRoleRecord>>(`${this.apiUrl}/admin/roles/`, {
      params,
    });
  }

  createRole(payload: CreateAdminRolePayload): Observable<AdminTeamRoleRecord> {
    return this.http.post<AdminTeamRoleRecord>(`${this.apiUrl}/admin/roles/`, payload);
  }
}
