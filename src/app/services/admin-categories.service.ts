import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type AdminCategoryParentOption = {
  id: number;
  name: string;
};

export type AdminManagedCategoryRecord = {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  icon_url: string | null;
  limit_type: 'automobile' | 'property' | 'other';
  parent: number | null;
  parent_name: string | null;
  listing_count: number;
  subcategory_count: number;
  subcategories: AdminManagedCategoryRecord[];
};

export type AdminCategoriesResponse = {
  results: AdminManagedCategoryRecord[];
  parent_options: AdminCategoryParentOption[];
  counts: {
    total: number;
    top_level: number;
    subcategories: number;
  };
};

export type AdminCategoryPayload = {
  name: string;
  slug?: string;
  limit_type: 'automobile' | 'property' | 'other';
  parent?: number | null;
  icon?: File | null;
};

export type AdminCategoryDeleteResponse = {
  detail: string;
  listing_count?: number;
  subcategory_count?: number;
};

@Injectable({ providedIn: 'root' })
export class AdminCategoriesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl.replace(/\/+$/, '');

  getCategories(search?: string): Observable<AdminCategoriesResponse> {
    const params = new URLSearchParams();
    const normalizedSearch = search?.trim();
    if (normalizedSearch) {
      params.set('search', normalizedSearch);
    }

    const queryString = params.toString();
    const url = queryString
      ? `${this.apiUrl}/admin/categories/?${queryString}`
      : `${this.apiUrl}/admin/categories/`;

    return this.http.get<AdminCategoriesResponse>(url);
  }

  createCategory(payload: AdminCategoryPayload): Observable<AdminManagedCategoryRecord> {
    return this.http.post<AdminManagedCategoryRecord>(
      `${this.apiUrl}/admin/categories/`,
      this.toFormData(payload),
    );
  }

  updateCategory(id: number, payload: Partial<AdminCategoryPayload>): Observable<AdminManagedCategoryRecord> {
    return this.http.patch<AdminManagedCategoryRecord>(
      `${this.apiUrl}/admin/categories/${id}/`,
      this.toFormData(payload),
    );
  }

  deleteCategory(id: number): Observable<AdminCategoryDeleteResponse> {
    return this.http.delete<AdminCategoryDeleteResponse>(`${this.apiUrl}/admin/categories/${id}/`);
  }

  private toFormData(payload: Partial<AdminCategoryPayload>): FormData {
    const formData = new FormData();

    if (payload.name !== undefined) {
      formData.set('name', payload.name);
    }

    if (payload.slug !== undefined) {
      formData.set('slug', payload.slug);
    }

    if (payload.limit_type !== undefined) {
      formData.set('limit_type', payload.limit_type);
    }

    if (payload.parent !== undefined) {
      formData.set('parent', payload.parent === null ? '' : String(payload.parent));
    }

    if (payload.icon !== undefined && payload.icon !== null) {
      formData.set('icon', payload.icon);
    }

    return formData;
  }
}
